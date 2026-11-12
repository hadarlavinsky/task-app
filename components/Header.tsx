"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, LogOut, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

// The bar at the top of every page. It has a white background and dark text,
// so it stays readable whatever the page behind it looks like.
const Header = () => {
  const { isLoggedIn, user, signOut } = useAuth();
  const pathname = usePathname();

  const navLink = (href: string, label: string, Icon: typeof UserCircle) => (
    <Link
      href={href}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-100 ${
        pathname === href ? "bg-gray-100 text-gray-900" : "text-gray-600"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link
          href={isLoggedIn ? "/dashboard" : "/"}
          className="text-xl font-bold text-gray-900"
        >
          Task App
        </Link>

        {isLoggedIn && (
          <nav className="flex items-center gap-1 sm:gap-2">
            {navLink("/dashboard", "My Tasks", ClipboardList)}
            {navLink("/profile", "Profile & Subscription", UserCircle)}
            {user && (
              <Link
                href="/profile"
                title="Your plan"
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                  user.subscription_plan === "premium"
                    ? "bg-violet-100 text-violet-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {user.subscription_plan ?? "free"}
              </Link>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="ml-1"
            >
              <LogOut className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
