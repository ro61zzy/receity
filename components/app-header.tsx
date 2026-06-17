"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, Package, ReceiptText, Users } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Receipts", icon: ReceiptText },
  { href: "/history", label: "History", icon: History },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/inventory", label: "Inventory", icon: Package },
] as const;

export function AppHeader() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/80 bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-[3.25rem] max-w-7xl items-center justify-between px-3 sm:px-6">
          <Link
            href="/"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-[1.02]">
              <ReceiptText className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Receity <span aria-hidden="true">✨</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <ThemeToggle />
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-card/95 backdrop-blur-md pb-[env(safe-area-inset-bottom,0px)] md:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-4 px-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex h-[3.25rem] flex-col items-center justify-center gap-0.5 text-[0.65rem] font-medium transition-colors duration-200",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {active && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />
                )}
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    active && "scale-105",
                  )}
                />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
