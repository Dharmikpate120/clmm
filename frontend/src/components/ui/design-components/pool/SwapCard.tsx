"use client";
import Image from "next/image";

import SettingsIcon from "@mui/icons-material/Settings";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

export default function SwapCard() {
    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <div className="flex bg-gray-100 dark:bg-surface-darker rounded-lg p-1">
                    <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white cursor-pointer transition-colors">
                        Swap
                    </button>
                    <button className="px-4 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer transition-colors">
                        Limit
                    </button>
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer transition-colors">
                    <SettingsIcon fontSize="small" />
                </button>
            </div>

            <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-surface-darker rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                    <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            You Pay
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            Balance: <span className="text-gray-900 dark:text-white">0.00</span>
                            <button className="text-primary text-[10px] font-bold uppercase cursor-pointer">
                                Max
                            </button>
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <input
                            className="bg-transparent text-2xl font-bold text-gray-900 dark:text-white focus:outline-none w-1/2 placeholder-gray-300 dark:placeholder-gray-700"
                            placeholder="0.00"
                            type="text"
                        />
                        <button className="flex items-center gap-2 bg-white dark:bg-surface-card hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 transition-colors cursor-pointer">
                            <div className="w-5 h-5 rounded-full relative overflow-hidden shrink-0">
                                <Image
                                    alt="SOL"
                                    fill
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrETAEdMSL3H499w94eluhcBFBsEKq6H4oIZhYfLaSHiYOMv81BQbHAy6PZ7aey9kD_UpolsmVdUdpfKoTz3OptcGWc4ijucd8WnhH0n2fJnwzYRwdZOUjdqrkbW_w7QXSsMIqFy5u2OM0Ff-_mT5HIVQ-bqlg1u_vzGWvOxSiLYr7Z816Y4IFIAHyZYDtNcIg1tciD8OEab2BjraEulEnwlk4s317vYzlPfis28uXg7B1CYqpILSnICDXLQr1DJmPF_rCEqc0OI0"
                                    className="object-cover"
                                />
                            </div>
                            <span className="font-bold text-sm text-gray-900 dark:text-white">
                                SOL
                            </span>
                            <svg
                                className="w-3 h-3 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M19 9l-7 7-7-7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                ></path>
                            </svg>
                        </button>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">≈ $0.00</div>
                </div>

                <div className="flex justify-center -my-2 relative z-10">
                    <button className="w-8 h-8 rounded-full bg-white dark:bg-surface-card border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-primary transition-colors cursor-pointer shadow-sm">
                        <SwapVertIcon fontSize="small" />
                    </button>
                </div>

                <div className="bg-gray-50 dark:bg-surface-darker rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                    <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            You Receive
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Balance: <span className="text-gray-900 dark:text-white">0.00</span>
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <input
                            className="bg-transparent text-2xl font-bold text-gray-900 dark:text-white focus:outline-none w-1/2 placeholder-gray-300 dark:placeholder-gray-700"
                            placeholder="0.00"
                            type="text"
                        />
                        <button className="flex items-center gap-2 bg-white dark:bg-surface-card hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 transition-colors cursor-pointer">
                            <div className="w-5 h-5 rounded-full relative overflow-hidden shrink-0">
                                <Image
                                    alt="USDC"
                                    fill
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxwkXGm9PHXmlFjOlqHsxu0zI_SEniw76tPKnm4KkYgtuxAc2_9YpDOr2SSBo2jGKK8FG7h150SpojXCwqP2jDhl03QlyhhnOqDpw4tgW1ASM3YQF0nVqaspCyMSo6LrC6AEaP2cZBhijYn9Sj_6qwY8ptexThUX725a3IHt9Y3-kag9n0dT1TPehsMK4XHg-czD-ZfYjq5EH9R7p-sO-mjO5TkJop9rJFeemFhmz9kxjn8oi_QjvivQGYMkAw4WavVNdW081DlGM"
                                    className="object-cover"
                                />
                            </div>
                            <span className="font-bold text-sm text-gray-900 dark:text-white">
                                USDC
                            </span>
                            <svg
                                className="w-3 h-3 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M19 9l-7 7-7-7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                ></path>
                            </svg>
                        </button>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">≈ $0.00</div>
                </div>

                <button className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-surface-darker dark:hover:bg-gray-800 dark:border dark:border-primary/30 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer">
                    <AccountBalanceWalletIcon fontSize="small" />
                    Connect Wallet
                </button>
            </div>
        </div>
    );
}
