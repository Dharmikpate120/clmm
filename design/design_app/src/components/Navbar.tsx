"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SettingsIcon from "@mui/icons-material/Settings";

export default function Navbar() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path ? "text-primary bg-primary/10 dark:text-secondary dark:bg-secondary/10" : "text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-secondary";
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-surface-light/80 dark:bg-surface-darker/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-white font-bold">
                                S
                            </div>
                            <span className="font-bold text-lg tracking-tight dark:text-white">SolFluence</span>
                        </Link>
                        <div className="hidden md:block">
                            <div className="flex items-baseline space-x-4">
                                <Link
                                    href="#"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/swap')}`}
                                >
                                    Swap
                                </Link>
                                <Link
                                    href="/"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/' || pathname.startsWith('/pool') ? "text-primary bg-primary/10 dark:text-secondary dark:bg-secondary/10" : "text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-secondary"}`}
                                >
                                    Pools
                                </Link>
                                <Link
                                    href="#"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard')}`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="#"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/analytics')}`}
                                >
                                    Analytics
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-gray-100 dark:bg-surface-dark rounded-full px-3 py-1 border border-gray-200 dark:border-gray-700">
                            <span className="w-2 h-2 rounded-full bg-secondary mr-2 animate-pulse"></span>
                            <span className="text-xs font-mono font-medium text-gray-600 dark:text-gray-300">
                                Solana Mainnet
                            </span>
                        </div>
                        <button className="bg-gray-900 hover:bg-gray-800 dark:bg-surface-dark dark:hover:bg-gray-700 dark:border dark:border-primary/50 text-white dark:text-primary px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg hover:shadow-primary/20 flex items-center gap-2 cursor-pointer">
                            <AccountBalanceWalletIcon fontSize="small" />
                            <span>Connect Wallet</span>
                        </button>
                        <button className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer">
                            <SettingsIcon fontSize="small" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
