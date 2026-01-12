"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, CreditCard, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Ledger", href: "/ledger", icon: CreditCard },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col bg-custom-dark text-white">
            <div className="flex h-16 items-center justify-center border-b border-custom-slate px-4">
                <h1 className="text-xl font-bold text-custom-cream">MCP Calendar</h1>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-custom-slate text-custom-cream"
                                    : "text-gray-300 hover:bg-custom-slate/50 hover:text-white"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "mr-3 h-6 w-6 flex-shrink-0",
                                    isActive ? "text-custom-cream" : "text-gray-400 group-hover:text-white"
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
