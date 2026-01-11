'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Dashboard' },
  { href: '/resources', label: 'Resources' }
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-900"
        >
          Employee HQ
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));

            const baseClasses =
              'rounded-full px-4 py-1 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900';
            const activeClasses = 'bg-slate-900 text-white shadow-sm';
            const inactiveClasses = 'text-slate-600 hover:text-slate-900 hover:bg-slate-50';

            return (
              <Link
                key={href}
                href={href}
                className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
