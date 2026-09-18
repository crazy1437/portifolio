import { Link } from "react-router-dom";
import { Instagram, Twitter, Youtube } from "lucide-react";
import { LogoLockup } from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t-2 border-pulp-950 bg-pulp-950 text-cream-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <LogoLockup dark className="text-cream-100" />
          <p className="mt-4 max-w-sm font-semibold text-cream-300">
            Juicy food, ridiculous speed. Delivered by the hardest-working scooters in the city.
          </p>
          <div className="mt-6 flex gap-3">
            {[Instagram, Twitter, Youtube].map((Icon, i) => (
              <span
                key={i}
                className="grid h-11 w-11 cursor-pointer place-items-center rounded-2xl border-2 border-cream-100/30 transition-colors hover:border-mango-300 hover:text-mango-300"
              >
                <Icon className="h-5 w-5" />
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display text-lg font-black text-mango-300">Ride</h4>
          <ul className="mt-3 space-y-2 font-semibold text-cream-300">
            <li><Link to="/order" className="hover:text-cream-50">Order now</Link></li>
            <li><Link to="/track" className="hover:text-cream-50">Track an order</Link></li>
            <li><Link to="/partner" className="hover:text-cream-50">For kitchens</Link></li>
            <li><Link to="/auth" className="hover:text-cream-50">Sign in</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg font-black text-mango-300">Kitchens</h4>
          <ul className="mt-3 space-y-2 font-semibold text-cream-300">
            <li>Big Bun Society</li>
            <li>Poke Pop Lab</li>
            <li>Noodle Nirvana</li>
            <li>Taco Turbo</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream-100/15 px-4 py-5 text-center text-sm font-semibold text-cream-300">
        © {new Date().getFullYear()} JuicyBruh — built juicy. Not a real delivery service (yet).
      </div>
    </footer>
  );
}
