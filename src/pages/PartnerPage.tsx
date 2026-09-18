import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  ChefHat,
  FlaskConical,
  Pencil,
  Plus,
  Power,
  Store,
  Timer,
  Trash2,
  TrendingUp,
  X,
  Receipt,
} from "lucide-react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { money, fmtEta, STATUS_META } from "../lib/data";
import { orderStatus, useSession } from "../lib/store";
import { useRestaurants } from "../lib/backend";
import { useToast } from "../components/Toaster";
import { api } from "../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

const EMOJI_CHOICES = ["🍔", "🍣", "🍜", "🌮", "🍕", "🥗", "🥐", "🌯", "🥙", "🍩"];
const ITEM_EMOJIS = ["🍔", "🍟", "🥤", "🍜", "🥟", "🍣", "🐠", "🥗", "🍡", "🌮", "🌽", "🍄", "🥓", "🥬", "🌶️"];
const TAG_CHOICES = ["bestseller", "veg", "spicy", "new"] as const;

export default function PartnerPage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <PartnerHome />
      </main>
      <Footer />
    </div>
  );
}

function PartnerHome() {
  const session = useSession();
  const navigate = useNavigate();
  const partner = useQuery(api.partners.getPartner, session ? { userId: session.id } : "skip");

  useEffect(() => {
    if (!session) navigate("/auth?returnTo=/partner", { replace: true });
  }, [session, navigate]);

  if (!session) return null;

  return (
    <>
      <Link
        to="/"
        className="inline-flex items-center gap-2 font-extrabold text-pulp-700 transition-colors hover:text-pepper-500"
      >
        <ArrowLeft className="h-4 w-4" /> Back home
      </Link>

      {partner === undefined ? (
        <div className="skeleton mt-6 h-80" />
      ) : partner === null ? (
        <RegisterKitchen userId={session.id} />
      ) : (
        <PartnerDashboard userId={session.id} restaurantId={partner.restaurantId} />
      )}
    </>
  );
}

/* ---------------- registration ---------------- */

function RegisterKitchen({ userId }: { userId: string }) {
  const register = useMutation(api.partners.registerKitchen);
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [emoji, setEmoji] = useState("🍔");
  const [etaMin, setEtaMin] = useState(20);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fillDemo = () => {
    setName("Bao Down Express");
    setCuisine("Steamed baos & dumplings");
    setEmoji("🍜");
    setEtaMin(22);
    setDeliveryFee(1.5);
    toast("Demo details filled — hit register!", "success");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const { restaurantId } = await register({ userId, name, cuisine, emoji, etaMin, deliveryFee });
      toast("Kitchen registered! Welcome aboard 🎉", "success");
      navigate("/partner", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
      toast(message, "error");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-6 max-w-2xl">
      <div className="text-center">
        <div className="eyebrow bg-guac-300">
          <Store className="h-3.5 w-3.5" /> Partner program
        </div>
        <h1 className="mt-4 font-display text-4xl font-black sm:text-5xl">
          Put your kitchen <span className="text-pepper-500">on wheels</span>
        </h1>
        <p className="mx-auto mt-3 max-w-md font-bold text-pulp-700">
          Register your kitchen, build your menu, and start receiving live orders with 3D-tracked delivery.
        </p>
      </div>

      <form onSubmit={submit} className="card-pop mt-8 space-y-5 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-black uppercase tracking-wider text-pulp-700">Kitchen setup</span>
          <button
            type="button"
            onClick={fillDemo}
            className="btn-cream btn-cream-hover !px-3 !py-1.5 text-xs"
          >
            <FlaskConical className="h-3.5 w-3.5" /> Fill demo data
          </button>
        </div>

        <div>
          <label htmlFor="k-name" className="text-sm font-black uppercase tracking-wider text-pulp-700">
            Kitchen name
          </label>
          <input
            id="k-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bao Down Express"
            maxLength={40}
            className="mt-1.5 w-full rounded-2xl border-2 border-pulp-950 bg-white px-4 py-3 font-bold shadow-chunky-sm outline-none placeholder:text-pulp-700/40"
          />
        </div>

        <div>
          <label htmlFor="k-cuisine" className="text-sm font-black uppercase tracking-wider text-pulp-700">
            What do you cook?
          </label>
          <input
            id="k-cuisine"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            placeholder="Steamed baos & dumplings"
            maxLength={60}
            className="mt-1.5 w-full rounded-2xl border-2 border-pulp-950 bg-white px-4 py-3 font-bold shadow-chunky-sm outline-none placeholder:text-pulp-700/40"
          />
        </div>

        <div>
          <span className="text-sm font-black uppercase tracking-wider text-pulp-700">Kitchen icon</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {EMOJI_CHOICES.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                aria-pressed={emoji === e}
                className={`grid h-12 w-12 place-items-center rounded-2xl border-2 border-pulp-950 text-2xl transition-all ${
                  emoji === e ? "bg-mango-300 shadow-chunky-sm" : "bg-white hover:-translate-y-0.5"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="k-eta" className="flex items-center gap-1.5 text-sm font-black uppercase tracking-wider text-pulp-700">
              <Timer className="h-4 w-4" /> Prep time (min)
            </label>
            <input
              id="k-eta"
              type="number"
              min={5}
              max={90}
              value={etaMin}
              onChange={(e) => setEtaMin(Number(e.target.value))}
              className="mt-1.5 w-full rounded-2xl border-2 border-pulp-950 bg-white px-4 py-3 font-bold shadow-chunky-sm outline-none"
            />
          </div>
          <div>
            <label htmlFor="k-fee" className="flex items-center gap-1.5 text-sm font-black uppercase tracking-wider text-pulp-700">
              Delivery fee ($)
            </label>
            <input
              id="k-fee"
              type="number"
              min={0}
              max={10}
              step={0.5}
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(Number(e.target.value))}
              className="mt-1.5 w-full rounded-2xl border-2 border-pulp-950 bg-white px-4 py-3 font-bold shadow-chunky-sm outline-none"
            />
            {deliveryFee === 0 && (
              <p className="mt-1 text-xs font-bold text-guac-500">Free delivery converts better 📈</p>
            )}
          </div>
        </div>

        {error && (
          <p className="rounded-xl border-2 border-berry-500 bg-berry-400/10 px-4 py-2.5 text-sm font-bold text-berry-500">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn-pepper btn-pepper-hover w-full text-lg disabled:opacity-70">
          {submitting ? "Firing up…" : (
            <>
              <ChefHat className="h-5 w-5" /> Register my kitchen
            </>
          )}
        </button>
        <p className="text-center text-xs font-bold text-pulp-700/70">
          Demo onboarding — your kitchen goes live instantly, no contract required.
        </p>
      </form>
    </div>
  );
}

/* ---------------- dashboard ---------------- */

function PartnerDashboard({ userId, restaurantId }: { userId: string; restaurantId: string }) {
  const restaurants = useRestaurants();
  const restaurant = restaurants?.find((r) => r.id === restaurantId);

  if (!restaurant) {
    return <div className="skeleton mt-6 h-80" />;
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <motion.span
            className="text-6xl"
            animate={{ rotate: [0, -6, 6, 0] }}
            transition={{ repeat: Infinity, duration: 6 }}
          >
            {restaurant.emoji}
          </motion.span>
          <div>
            <div className="eyebrow bg-guac-300">Partner dashboard</div>
            <h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">{restaurant.name}</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to={`/order/${restaurant.id}`} className="btn-cream btn-cream-hover">
            View public page →
          </Link>
          <Link to="/track" className="btn-pepper btn-pepper-hover">
            Open live tracking →
          </Link>
        </div>
      </div>

      {/* stats strip */}
      <StatsStrip restaurantId={restaurantId} />

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <MenuManager userId={userId} restaurantId={restaurantId} />
        </div>
        <div className="space-y-6 lg:col-span-2">
          <ProfileEditor restaurant={restaurant} userId={userId} restaurantId={restaurantId} />
          <OnboardingChecklist restaurantId={restaurantId} />
          <LiveOrders restaurantId={restaurantId} />
          <DemoCenter userId={userId} restaurantId={restaurantId} />
        </div>
      </div>
    </div>
  );
}

/* ---------------- stats strip ---------------- */

function StatsStrip({ restaurantId }: { restaurantId: string }) {
  const orders = useQuery(api.orders.listKitchenOrders, { restaurantId });
  const items = useQuery(api.orders.getOwnerMenu, { restaurantId });

  const stats = useMemo(() => {
    if (!orders || !items) return null;
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const today = orders.filter((o) => o.createdAt >= dayAgo);
    const live = orders.filter((o) => orderStatus(o) !== "delivered");
    return {
      todayCount: today.length,
      todayRevenue: today.reduce((n, o) => n + o.total, 0),
      liveCount: live.length,
      menuLive: items.filter((i) => i.available !== false).length,
      menuTotal: items.length,
      avgOrder: today.length ? today.reduce((n, o) => n + o.total, 0) / today.length : 0,
    };
  }, [orders, items]);

  if (!stats) {
    return <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-24" />)}</div>;
  }

  const tiles = [
    { label: "Orders / 24h", value: String(stats.todayCount), bg: "bg-mango-300/60", emoji: "🧾" },
    { label: "Revenue / 24h", value: money(stats.todayRevenue), bg: "bg-zest-300/60", emoji: "💰" },
    { label: "Rides in flight", value: String(stats.liveCount), bg: "bg-pepper-300/50", emoji: "🛵" },
    { label: "Avg order", value: money(stats.avgOrder), bg: "bg-guac-300/50", emoji: "📈" },
  ];

  return (
    <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className={`rounded-3xl border-2 border-pulp-950 p-4 shadow-chunky-sm ${t.bg}`}>
          <div className="flex items-center justify-between">
            <span className="text-2xl">{t.emoji}</span>
            <span className="text-[10px] font-black uppercase tracking-wider text-pulp-700">{t.label}</span>
          </div>
          <div className="mt-1 font-display text-3xl font-black">{t.value}</div>
        </div>
      ))}
      <p className="col-span-2 text-xs font-bold text-pulp-700 lg:col-span-4">
        {stats.menuLive}/{stats.menuTotal} dishes live · menu changes appear instantly on your public page
      </p>
    </div>
  );
}

/* ---------------- onboarding checklist ---------------- */

function OnboardingChecklist({ restaurantId }: { restaurantId: string }) {
  const items = useQuery(api.orders.getOwnerMenu, { restaurantId });
  const orders = useQuery(api.orders.listKitchenOrders, { restaurantId });
  const restaurants = useRestaurants();
  const restaurant = restaurants?.find((r) => r.id === restaurantId);

  if (items === undefined || orders === undefined || !restaurant) return <div className="skeleton h-48" />;

  const steps = [
    { label: "Kitchen registered", done: true, hint: "You're official." },
    { label: "Profile polished", done: restaurant.cuisine.length > 8, hint: "Describe your cuisine vividly." },
    { label: "3+ dishes on the menu", done: items.length >= 3, hint: "Add more dishes to tempt customers." },
    { label: "First order received", done: orders.length > 0, hint: "Share your public page to get orders." },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="card-pop p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-xl font-black">
          <BadgeCheck className="h-5 w-5 text-guac-500" /> Setup
        </h2>
        <span className="rounded-xl border-2 border-pulp-950 bg-mango-300 px-2.5 py-1 text-xs font-black">
          {doneCount}/{steps.length}
        </span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full border-2 border-pulp-950 bg-cream-200">
        <motion.div
          animate={{ width: `${(doneCount / steps.length) * 100}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-gradient-to-r from-mango-400 to-guac-400"
        />
      </div>
      <ul className="mt-4 space-y-2">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-3 text-sm">
            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 border-pulp-950 ${s.done ? "bg-guac-400" : "bg-white"}`}>
              {s.done ? <Check className="h-3.5 w-3.5" /> : <span className="h-2 w-2 rounded-full bg-pulp-950/30" />}
            </span>
            <span className={`font-bold ${s.done ? "text-pulp-950" : "text-pulp-700"}`}>{s.label}</span>
            {!s.done && <span className="ml-auto hidden text-xs font-semibold text-pulp-700/60 sm:block">{s.hint}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- profile editor ---------------- */

function ProfileEditor({
  restaurant,
  userId,
  restaurantId,
}: {
  restaurant: NonNullable<ReturnType<typeof useRestaurants>>[number];
  userId: string;
  restaurantId: string;
}) {
  const update = useMutation(api.partners.updateKitchen);
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [cuisine, setCuisine] = useState(restaurant.cuisine);
  const [emoji, setEmoji] = useState(restaurant.emoji);
  const [etaMin, setEtaMin] = useState(restaurant.etaMin);
  const [deliveryFee, setDeliveryFee] = useState(restaurant.deliveryFee);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await update({ userId, restaurantId, name, cuisine, emoji, etaMin, deliveryFee });
      toast("Profile updated", "success");
      setEditing(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const demoEdit = () => {
    setEditing(true);
    setCuisine(`${restaurant.cuisine} (demo edit)`.slice(0, 60));
    toast("Try changing anything, then Save profile", "success");
  };

  return (
    <div className="card-pop p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-xl font-black">Kitchen profile</h2>
        <div className="flex gap-2">
          {!editing && (
            <button onClick={demoEdit} className="btn-cream btn-cream-hover !px-3 !py-1.5 text-xs">
              <FlaskConical className="h-3.5 w-3.5" /> Demo
            </button>
          )}
          <button
            onClick={() => setEditing((e) => !e)}
            className="grid h-9 w-9 place-items-center rounded-xl border-2 border-pulp-950 bg-white shadow-chunky-sm active:translate-y-0.5 active:shadow-none"
            aria-label={editing ? "Cancel editing" : "Edit profile"}
          >
            {editing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {!editing ? (
        <ul className="mt-4 space-y-2.5 text-sm font-bold">
          <li className="flex justify-between gap-2"><span className="text-pulp-700">Name</span><span className="truncate">{restaurant.name}</span></li>
          <li className="flex justify-between gap-2"><span className="text-pulp-700">Cuisine</span><span className="truncate">{restaurant.cuisine}</span></li>
          <li className="flex justify-between"><span className="text-pulp-700">Prep time</span><span>{restaurant.etaMin} min</span></li>
          <li className="flex justify-between">
            <span className="text-pulp-700">Delivery</span>
            <span>{restaurant.deliveryFee === 0 ? "FREE" : money(restaurant.deliveryFee)}</span>
          </li>
        </ul>
      ) : (
        <div className="mt-4 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border-2 border-pulp-950 bg-white px-3 py-2 text-sm font-bold outline-none"
            aria-label="Kitchen name"
          />
          <input
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="w-full rounded-xl border-2 border-pulp-950 bg-white px-3 py-2 text-sm font-bold outline-none"
            aria-label="Cuisine"
          />
          <div className="flex flex-wrap gap-1.5">
            {EMOJI_CHOICES.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                aria-pressed={emoji === e}
                className={`grid h-9 w-9 place-items-center rounded-lg border-2 border-pulp-950 text-lg ${emoji === e ? "bg-mango-300" : "bg-white"}`}
              >
                {e}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-black uppercase tracking-wider text-pulp-700">
              Prep min
              <input
                type="number"
                min={5}
                max={90}
                value={etaMin}
                onChange={(e) => setEtaMin(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border-2 border-pulp-950 bg-white px-3 py-2 text-sm font-bold outline-none"
              />
            </label>
            <label className="text-xs font-black uppercase tracking-wider text-pulp-700">
              Fee $
              <input
                type="number"
                min={0}
                max={10}
                step={0.5}
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border-2 border-pulp-950 bg-white px-3 py-2 text-sm font-bold outline-none"
              />
            </label>
          </div>
          <button onClick={save} disabled={saving} className="btn-pepper btn-pepper-hover w-full !py-2 text-sm disabled:opacity-70">
            <Check className="h-4 w-4" /> {saving ? "Saving…" : "Save profile"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- menu manager ---------------- */

type Draft = { name: string; description: string; price: number; emoji: string; juice: number; tags: string[] };

const DEMO_DISHES: Draft[] = [
  { name: "Crispy Chicken Bao", description: "Buttermilk-fried thigh, shaved cabbage, bang-bang sauce.", price: 7.5, emoji: "🥟", juice: 94, tags: ["bestseller"] },
  { name: "Silken Tofu Bao", description: "Chilled silken tofu, scallion oil, crispy shallots.", price: 6.5, emoji: "🥗", juice: 88, tags: ["veg", "new"] },
  { name: "Fistful of Fries", description: "Double-fried, dusted in house salt, side of mayo.", price: 4, emoji: "🍟", juice: 86, tags: [] },
];

function MenuManager({ userId, restaurantId }: { userId: string; restaurantId: string }) {
  const items = useQuery(api.orders.getOwnerMenu, { restaurantId }) ?? [];
  const addItem = useMutation(api.partners.addMenuItem);
  const updateItem = useMutation(api.partners.updateMenuItem);
  const deleteItem = useMutation(api.partners.deleteMenuItem);
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<Draft>({ name: "", description: "", price: 8, emoji: "🍔", juice: 90, tags: [] });
  const [demoIdx, setDemoIdx] = useState(0);

  const submitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addItem({ userId, restaurantId, ...draft });
      toast(`${draft.emoji} ${draft.name.trim()} added to menu`, "success");
      setDraft({ name: "", description: "", price: 8, emoji: "🍔", juice: 90, tags: [] });
      setShowForm(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't add dish", "error");
    }
  };

  const addDemoDish = async () => {
    const dish = DEMO_DISHES[demoIdx % DEMO_DISHES.length];
    setDemoIdx((i) => i + 1);
    try {
      await addItem({ userId, restaurantId, ...dish });
      toast(`${dish.emoji} ${dish.name} added (demo)`, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Demo add failed", "error");
    }
  };

  const toggleAvailability = async (itemId: string, itemName: string, available: boolean) => {
    try {
      await updateItem({ userId, restaurantId, itemId, available });
      toast(available ? `${itemName} is back on the menu` : `${itemName} sold out`, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Update failed", "error");
    }
  };

  const removeItem = async (itemId: string, itemName: string) => {
    try {
      await deleteItem({ userId, restaurantId, itemId });
      toast(`${itemName} removed`, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Delete failed", "error");
    }
  };

  return (
    <div className="card-pop p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-black">Your menu ({items.length})</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={addDemoDish} className="btn-cream btn-cream-hover !px-3 !py-2 text-xs">
            <FlaskConical className="h-3.5 w-3.5" /> Add demo dish
          </button>
          <button
            onClick={() => setShowForm((s) => !s)}
            className={showForm ? "btn-cream btn-cream-hover !px-4 !py-2 text-sm" : "btn-mango btn-mango-hover !px-4 !py-2 text-sm"}
          >
            {showForm ? <><X className="h-4 w-4" /> Cancel</> : <><Plus className="h-4 w-4" /> Add dish</>}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={submitItem}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3 rounded-2xl border-2 border-dashed border-pulp-950/40 bg-cream-100 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="Dish name"
                  className="rounded-xl border-2 border-pulp-950 bg-white px-3 py-2 text-sm font-bold outline-none"
                />
                <input
                  type="number"
                  min={0.5}
                  max={100}
                  step={0.5}
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                  placeholder="Price"
                  className="rounded-xl border-2 border-pulp-950 bg-white px-3 py-2 text-sm font-bold outline-none"
                  aria-label="Price"
                />
              </div>
              <textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="Description — what makes it juicy? (min 10 chars)"
                rows={2}
                className="w-full rounded-xl border-2 border-pulp-950 bg-white px-3 py-2 text-sm font-bold outline-none"
              />
              <div className="flex flex-wrap gap-1.5">
                {ITEM_EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setDraft({ ...draft, emoji: e })}
                    aria-pressed={draft.emoji === e}
                    className={`grid h-9 w-9 place-items-center rounded-lg border-2 border-pulp-950 text-lg ${draft.emoji === e ? "bg-mango-300" : "bg-white"}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex flex-1 items-center gap-2 text-xs font-black uppercase tracking-wider text-pulp-700">
                  Juice {draft.juice}%
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={draft.juice}
                    onChange={(e) => setDraft({ ...draft, juice: Number(e.target.value) })}
                    className="flex-1 accent-pepper-500"
                  />
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TAG_CHOICES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          tags: d.tags.includes(t) ? d.tags.filter((x) => x !== t) : [...d.tags, t],
                        }))
                      }
                      aria-pressed={draft.tags.includes(t)}
                      className={`rounded-full border-2 border-pulp-950 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                        draft.tags.includes(t) ? "bg-pepper-500 text-cream-50" : "bg-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-pepper btn-pepper-hover w-full !py-2 text-sm">
                <Plus className="h-4 w-4" /> Add to menu
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <ul className="mt-4 space-y-3">
        {items.length === 0 && (
          <li className="rounded-2xl border-2 border-dashed border-pulp-950/30 p-8 text-center">
            <div className="text-5xl">🍽️</div>
            <p className="mt-2 font-display text-lg font-black">Menu's empty</p>
            <p className="text-sm font-semibold text-pulp-700">
              Add a dish manually — or tap “Add demo dish” to try it instantly.
            </p>
          </li>
        )}
        {items.map((item) => (
          <motion.li
            key={item._id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-3 rounded-2xl border-2 border-pulp-950 p-3 shadow-chunky-sm ${
              item.available === false ? "bg-cream-200 opacity-70" : "bg-white"
            }`}
          >
            <span className="text-3xl">{item.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate font-extrabold">
                {item.name}
                {item.available === false && (
                  <span className="shrink-0 rounded-md bg-pepper-400 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                    sold out
                  </span>
                )}
              </p>
              <p className="truncate text-xs font-bold text-pulp-700">{item.description}</p>
            </div>
            <span className="shrink-0 font-display text-lg font-black">{money(item.price)}</span>
            <div className="flex shrink-0 gap-1.5">
              <button
                onClick={() => toggleAvailability(item.id, item.name, item.available === false)}
                className={`grid h-9 w-9 place-items-center rounded-xl border-2 border-pulp-950 shadow-chunky-sm active:translate-y-0.5 active:shadow-none ${
                  item.available === false ? "bg-mango-300" : "bg-zest-400"
                }`}
                title={item.available === false ? "Put back on menu" : "Mark sold out"}
                aria-label={item.available === false ? `Restore ${item.name}` : `Mark ${item.name} sold out`}
              >
                <Power className="h-4 w-4" />
              </button>
              <button
                onClick={() => removeItem(item.id, item.name)}
                className="grid h-9 w-9 place-items-center rounded-xl border-2 border-pulp-950 bg-white text-berry-500 shadow-chunky-sm active:translate-y-0.5 active:shadow-none"
                aria-label={`Delete ${item.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- live orders ---------------- */

function LiveOrders({ restaurantId }: { restaurantId: string }) {
  const orders = useQuery(api.orders.listKitchenOrders, { restaurantId });
  const [, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="card-pop p-6">
      <h2 className="flex items-center gap-2 font-display text-xl font-black">
        <Receipt className="h-5 w-5 text-pepper-500" /> Live orders
      </h2>

      <ul className="mt-4 space-y-2">
        {orders === undefined && <li className="skeleton h-20" />}
        {orders?.length === 0 && (
          <li className="rounded-2xl border-2 border-dashed border-pulp-950/30 p-6 text-center text-sm font-bold text-pulp-700">
            No orders yet. Place one from your public page — it lands here instantly.
          </li>
        )}
        {orders?.slice(0, 10).map((o) => {
          const status = orderStatus(o);
          const progress = Math.min(1, (Date.now() - o.createdAt) / o.durationMs);
          return (
            <li key={o._id} className="rounded-2xl border-2 border-pulp-950/20 bg-cream-100 p-3">
              <div className="flex items-center justify-between gap-2 text-sm font-extrabold">
                <span className="min-w-0 truncate">
                  {STATUS_META[status].emoji} {o.lines.map((l) => `${l.qty}× ${l.name}`).join(", ")}
                </span>
                <span className="shrink-0">{money(o.total)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 text-xs font-bold text-pulp-700">
                <span className="truncate">📍 {o.address}</span>
                <span className="shrink-0">
                  {status === "delivered" ? "done" : `${fmtEta(Math.max(0, o.createdAt + o.durationMs - Date.now()))} left`}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full border border-pulp-950/30 bg-cream-200">
                <div
                  className={`h-full transition-[width] duration-1000 ease-linear ${status === "delivered" ? "bg-guac-400" : "bg-pepper-400"}`}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------------- demo center ---------------- */

function DemoCenter({ userId, restaurantId }: { userId: string; restaurantId: string }) {
  const toast = useToast();
  const updateItem = useMutation(api.partners.updateMenuItem);
  const placeDemoOrder = useMutation(api.orders.placeOrder);
  const items = useQuery(api.orders.getOwnerMenu, { restaurantId }) ?? [];
  const [running, setRunning] = useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<void>) => {
    if (running) return;
    setRunning(key);
    try {
      await fn();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Demo failed", "error");
    } finally {
      setRunning(null);
    }
  };

  const demoSellOutFirst = () =>
    run("sellout", async () => {
      const target = items.find((i) => i.available !== false);
      if (!target) throw new Error("Add a dish first (demo button in menu)");
      await updateItem({ userId, restaurantId, itemId: target.id, available: false });
      toast(`${target.emoji} ${target.name} marked sold out — check the menu list`, "success");
    });

  const demoPlaceOrder = () =>
    run("order", async () => {
      const available = items.filter((i) => i.available !== false);
      if (available.length === 0) throw new Error("Add a dish first (demo button in menu)");
      const pick = available[Math.floor(Math.random() * available.length)];
      await placeDemoOrder({
        userId: `demo-${Math.random().toString(36).slice(2, 8)}`,
        restaurantId,
        lines: [{ itemId: pick.id, name: pick.name, emoji: pick.emoji, price: pick.price, qty: 1 + Math.floor(Math.random() * 2) }],
        address: "128 Demo Drive",
      });
      toast("Demo order placed — watch Live orders & /track", "success");
    });

  const demos = [
    { key: "sellout", label: "Demo: sold out flow", desc: "Flips your first live dish off the menu", fn: demoSellOutFirst, icon: <Power className="h-4 w-4" /> },
    { key: "order", label: "Demo: receive an order", desc: "Places a real order into your feed + /track", fn: demoPlaceOrder, icon: <TrendingUp className="h-4 w-4" /> },
  ];

  return (
    <div className="card-pop p-6">
      <h2 className="flex items-center gap-2 font-display text-xl font-black">
        <FlaskConical className="h-5 w-5 text-berry-500" /> Try it now
      </h2>
      <p className="mt-1 text-xs font-bold text-pulp-700">
        Every partner action, one tap away. Results are real Convex writes.
      </p>
      <div className="mt-4 space-y-2.5">
        {demos.map((d) => (
          <button
            key={d.key}
            onClick={d.fn}
            disabled={running !== null}
            className="flex w-full items-center gap-3 rounded-2xl border-2 border-pulp-950 bg-white p-3 text-left shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky active:translate-y-0 active:shadow-none disabled:opacity-60"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-pulp-950 bg-mango-300">
              {running === d.key ? (
                <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>
                  <Timer className="h-5 w-5" />
                </motion.span>
              ) : (
                d.icon
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold">{d.label}</span>
              <span className="block truncate text-xs font-bold text-pulp-700">{d.desc}</span>
            </span>
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border-2 border-dashed border-pulp-950/30 bg-cream-100 p-3 text-xs font-bold text-pulp-700">
        <p className="font-black uppercase tracking-wider text-pulp-950">Customer-side demos</p>
        <ul className="mt-1.5 space-y-1">
          <li>🛒 Add to cart & checkout — from your public page</li>
          <li>🛵 Watch 3D tracking — “Open live tracking” above</li>
          <li>⭐ Filter menus (bestseller/garden/spicy) — kitchen page</li>
        </ul>
      </div>
    </div>
  );
}
