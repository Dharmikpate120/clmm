"use client";

import SettingsIcon from "@mui/icons-material/Settings";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

export default function SwapCard() {
    return (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <div className="flex bg-muted/50 rounded-lg p-1">
                    <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-background shadow-sm text-foreground cursor-pointer transition-colors">
                        Swap
                    </button>
                    <button className="px-4 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                        Limit
                    </button>
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer transition-colors">
                    <SettingsIcon fontSize="small" />
                </button>
            </div>

            <div className="space-y-4">
                <div className="bg-muted/30 rounded-xl p-4 border border-border">
                    <div className="flex justify-between mb-2">
                        <span className="text-xs text-muted-foreground">
                            You Pay
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            Balance: <span className="text-foreground">0.00</span>
                            <button className="text-primary text-[10px] font-bold uppercase cursor-pointer">
                                Max
                            </button>
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <input
                            className="bg-transparent text-2xl font-bold text-foreground focus:outline-none w-1/2 placeholder:text-muted-foreground/50"
                            placeholder="0.00"
                            type="text"
                        />
                        <button className="flex items-center gap-2 bg-background hover:bg-muted/50 border border-border rounded-lg px-3 py-1.5 transition-colors cursor-pointer">
                            <img
                                alt="SOL"
                                className="w-5 h-5 rounded-full"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrETAEdMSL3H499w94eluhcBFBsEKq6H4oIZhYfLaSHiYOMv81BQbHAy6PZ7aey9kD_UpolsmVdUdpfKoTz3OptcGWc4ijucd8WnhH0n2fJnwzYRwdZOUjdqrkbW_w7QXSsMIqFy5u2OM0Ff-_mT5HIVQ-bqlg1u_vzGWvOxSiLYr7Z816Y4IFIAHyZYDtNcIg1tciD8OEab2BjraEulEnwlk4s317vYzlPfis28uXg7B1CYqpILSnICDXLQr1DJmPF_rCEqc0OI0"
                            />
                            <span className="font-bold text-sm text-foreground">
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
                    <button className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors cursor-pointer shadow-sm">
                        <SwapVertIcon fontSize="small" />
                    </button>
                </div>

                <div className="bg-muted/30 rounded-xl p-4 border border-border">
                    <div className="flex justify-between mb-2">
                        <span className="text-xs text-muted-foreground">
                            You Receive
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Balance: <span className="text-foreground">0.00</span>
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <input
                            className="bg-transparent text-2xl font-bold text-foreground focus:outline-none w-1/2 placeholder:text-muted-foreground/50"
                            placeholder="0.00"
                            type="text"
                        />
                        <button className="flex items-center gap-2 bg-background hover:bg-muted/50 border border-border rounded-lg px-3 py-1.5 transition-colors cursor-pointer">
                            <img
                                alt="USDC"
                                className="w-5 h-5 rounded-full"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxwkXGm9PHXmlFjOlqHsxu0zI_SEniw76tPKnm4KkYgtuxAc2_9YpDOr2SSBo2jGKK8FG7h150SpojXCwqP2jDhl03QlyhhnOqDpw4tgW1ASM3YQF0nVqaspCyMSo6LrC6AEaP2cZBhijYn9Sj_6qwY8ptexThUX725a3IHt9Y3-kag9n0dT1TPehsMK4XHg-czD-ZfYjq5EH9R7p-sO-mjO5TkJop9rJFeemFhmz9kxjn8oi_QjvivQGYMkAw4WavVNdW081DlGM"
                            />
                            <span className="font-bold text-sm text-foreground">
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

                <button className="w-full bg-foreground hover:bg-foreground/90 text-background font-bold py-4 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer">
                    <AccountBalanceWalletIcon fontSize="small" />
                    Connect Wallet
                </button>
            </div>
        </div>
    );
}
