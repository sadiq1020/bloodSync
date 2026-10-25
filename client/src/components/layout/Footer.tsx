import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

/**
 * Footer (Server Component)
 * Clean clinical footer with links, attribution, and safety disclaimer.
 */
export function Footer() {
  return (
    <footer className="w-full border-t border-line bg-surface py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12">
          {/* Col 1: Brand & short description */}
          <div className="md:col-span-6">
            <Link
              href="/"
              aria-label="BloodSync Home"
              className="inline-flex items-center"
            >
              <Logo variant="compact" size="sm" />
            </Link>
            <p className="text-fg-muted mt-3 max-w-md font-sans text-sm leading-relaxed">
              Targeted blood donation matching across 64 districts in Bangladesh.
              Connecting patient families directly with compatible local donors.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3">
            <h3 className="text-fg-dim font-mono text-xs uppercase tracking-widest">
              Navigation
            </h3>
            <ul className="mt-3 flex flex-col gap-2.5">
              <li>
                <Link
                  href="/compatibility"
                  className="font-sans text-sm text-fg-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-blood"
                >
                  Compatibility
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="font-sans text-sm text-fg-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-blood"
                >
                  Log in
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="font-sans text-sm text-fg-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-blood"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Attribution */}
          <div className="md:col-span-3">
            <h3 className="text-fg-dim font-mono text-xs uppercase tracking-widest">
              Credit
            </h3>
            <p className="mt-3 font-sans text-sm text-fg-muted">
              Built by{" "}
              <a
                href="https://github.com/sadiq1020"
                target="_blank"
                rel="noopener noreferrer"
                className="text-fg underline decoration-line hover:text-blood hover:decoration-blood focus-visible:outline-2 focus-visible:outline-blood"
              >
                Md. Sadiq Ibn Masud
              </a>
            </p>
          </div>
        </div>

        {/* Safety Note & Copyright */}
        <div className="mt-10 border-t border-line pt-6">
          <p className="text-fg-dim font-mono text-xs leading-relaxed">
            BloodSync connects people. It does not verify donors or give medical advice. Always confirm with the hospital.
          </p>
          <p className="text-fg-dim mt-2 font-mono text-[11px]">
            &copy; 2026 BloodSync. Open humanitarian platform.
          </p>
        </div>
      </div>
    </footer>
  );
}
