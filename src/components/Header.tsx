"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Dịch vụ", href: "#dich-vu" },
  { label: "Quy trình", href: "#quy-trinh" },
  { label: "Về chúng tôi", href: "#ve-chung-toi" },
  { label: "Liên hệ", href: "#lien-he" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#" className="text-lg font-bold tracking-tight text-foreground">
          DNK <span className="text-accent">House</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <a
            href="#lien-he"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Liên hệ tư vấn
          </a>
        </div>

        <button
          type="button"
          className="p-2 text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Mở menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#lien-he"
              className="mt-2 rounded-full bg-accent px-5 py-2.5 text-center text-sm font-medium text-accent-foreground"
              onClick={() => setOpen(false)}
            >
              Liên hệ tư vấn
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
