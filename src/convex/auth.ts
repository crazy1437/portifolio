import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

/* ---------------- constants ---------------- */

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAX_ATTEMPTS = 5;
const RESEND_FROM = "JuicyBruh <onboarding@resend.dev>";
const MAX_CODES_PER_EMAIL_PER_HOUR = 5;

/* ---------------- helpers ---------------- */

/** SHA-256 hash the code so a DB read alone never reveals a usable login. */
async function hash(code: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

function newToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ---------------- send OTP email ---------------- */

export const requestOtp = action({
  args: { email: v.string() },
  returns: v.object({
    sent: v.boolean(),
    /** Returned only when RESEND_API_KEY is missing so the demo still works. */
    devCode: v.optional(v.string()),
  }),
  handler: async (ctx, { email: rawEmail }) => {
    const email = normalizeEmail(rawEmail);
    if (!validEmail(email)) throw new Error("That email looks undercooked — try again.");

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const now = Date.now();
    const codeHash = await hash(code);

    // store the code (mutation also throttles per-email request volume)
    await ctx.runMutation(api.auth.storeCode, { email, codeHash, now });

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // Demo mode: no key configured. Return the code so the UI can show it.
      return { sent: false, devCode: code };
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: email,
        subject: `${code} is your JuicyBruh login code`,
        text: `Your JuicyBruh login code is ${code}. It expires in 10 minutes.`,
        html: `<div style="font-family:sans-serif;max-width:480px">
  <p>Hey hungry human,</p>
  <p>Your JuicyBruh login code is:</p>
  <p style="font-size:32px;font-weight:800;letter-spacing:8px;margin:16px 0">${code}</p>
  <p>This code expires in 10 minutes. If you didn't request it, ignore this email.</p>
  <p>— JuicyBruh 🛵</p>
</div>`,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Email delivery failed (${res.status}). ${body.slice(0, 200)}`);
    }

    return { sent: true };
  },
});

/* ---------------- code storage + throttle ---------------- */

export const storeCode = mutation({
  args: { email: v.string(), codeHash: v.string(), now: v.number() },
  returns: v.null(),
  handler: async (ctx, { email, codeHash, now }) => {
    const existing = await ctx.db
      .query("authCodes")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();

    // throttle: at most MAX_CODES_PER_EMAIL_PER_HOUR codes per email
    const recentCount = existing.filter((c) => c.createdAt > now - 60 * 60 * 1000).length;
    if (recentCount >= MAX_CODES_PER_EMAIL_PER_HOUR) {
      throw new Error("Too many codes requested. Wait a bit and try again.");
    }

    for (const c of existing) {
      // only the newest code counts — consume all previous ones
      if (!c.consumed) await ctx.db.patch(c._id, { consumed: true });
      // opportunistic cleanup of ancient rows
      if (c.expiresAt < now - 24 * 60 * 60 * 1000) await ctx.db.delete(c._id);
    }

    await ctx.db.insert("authCodes", {
      email,
      codeHash,
      attempts: 0,
      consumed: false,
      createdAt: now,
      expiresAt: now + CODE_TTL_MS,
    });
    return null;
  },
});

/* ---------------- verify OTP → session token ---------------- */

const verifyResult = v.union(
  v.object({
    ok: v.literal(true),
    token: v.string(),
    user: v.object({ id: v.id("users"), email: v.string(), name: v.string() }),
  }),
  v.object({
    ok: v.literal(false),
    message: v.string(),
    attemptsLeft: v.optional(v.number()),
    locked: v.optional(v.boolean()),
  }),
);

/**
 * Expected auth failures return { ok: false } instead of throwing: Convex
 * mutations are transactional, so a thrown error would roll back the very
 * attempt-counter writes that make brute-force protection stick.
 */
export const verifyOtp = mutation({
  args: { email: v.string(), code: v.string() },
  returns: verifyResult,
  handler: async (ctx, { email: rawEmail, code }) => {
    const email = normalizeEmail(rawEmail);
    const normalizedCode = code.replace(/\D/g, "");
    if (normalizedCode.length !== 6) {
      return { ok: false as const, message: "Enter the 6-digit code from your email." };
    }

    const now = Date.now();
    const codeHash = await hash(normalizedCode);

    const candidates = await ctx.db
      .query("authCodes")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();

    const match = candidates.find(
      (c) => !c.consumed && c.expiresAt > now && c.attempts < MAX_ATTEMPTS && c.codeHash === codeHash,
    );
    if (!match) {
      // count a failed attempt against the newest live code to prevent brute force
      const live = candidates
        .filter((c) => !c.consumed && c.expiresAt > now)
        .sort((a, b) => b.createdAt - a.createdAt)[0];
      if (live) {
        const attempts = live.attempts + 1;
        if (attempts >= MAX_ATTEMPTS) {
          await ctx.db.patch(live._id, { attempts, consumed: true });
          return {
            ok: false as const,
            message: "Too many wrong attempts. Request a new code.",
            locked: true,
          };
        }
        await ctx.db.patch(live._id, { attempts });
        const left = MAX_ATTEMPTS - attempts;
        return {
          ok: false as const,
          message: `Wrong code. ${left} attempt${left === 1 ? "" : "s"} left.`,
          attemptsLeft: left,
        };
      }
      return { ok: false as const, message: "That code is no longer valid. Request a new one." };
    }

    // consume the code
    await ctx.db.patch(match._id, { consumed: true });

    // upsert user
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    let userId: Id<"users">;
    let name: string;
    if (existing) {
      userId = existing._id;
      name = existing.name;
      await ctx.db.patch(existing._id, { lastLoginAt: now });
    } else {
      const niceName = email
        .split("@")[0]
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      userId = await ctx.db.insert("users", { email, name: niceName, createdAt: now, lastLoginAt: now });
      name = niceName;
    }

    const token = newToken();
    await ctx.db.insert("sessions", {
      userId,
      token,
      createdAt: now,
      expiresAt: now + SESSION_TTL_MS,
    });

    return { ok: true as const, token, user: { id: userId, email, name } };
  },
});

/* ---------------- session helpers ---------------- */

export const me = query({
  args: { token: v.string() },
  returns: v.union(
    v.object({ id: v.id("users"), email: v.string(), name: v.string() }),
    v.null(),
  ),
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    if (!session || session.expiresAt < Date.now()) return null;
    const user = await ctx.db.get(session.userId);
    if (!user) return null;
    return { id: user._id, email: user.email, name: user.name };
  },
});

export const signOutSession = mutation({
  args: { token: v.string() },
  returns: v.null(),
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    if (session) await ctx.db.delete(session._id);
    return null;
  },
});
