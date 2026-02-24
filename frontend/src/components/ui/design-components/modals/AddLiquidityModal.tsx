"use client";

import { useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

export default function AddLiquidityModal() {
    const [minPrice, setMinPrice] = useState("138.50");
    const [maxPrice, setMaxPrice] = useState("148.50");
    const [currentPrice] = useState(143.25);

    return (
        <div className="space-y-6">
            {/* 1. Select Pair & Fee Tier */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">
                        1
                    </span>
                    Select Pair & Fee Tier
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-surface-darker/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-between cursor-pointer hover:border-primary transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                <img
                                    alt="SOL"
                                    className="w-8 h-8 rounded-full border-2 border-white dark:border-surface-dark bg-black z-10"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrETAEdMSL3H499w94eluhcBFBsEKq6H4oIZhYfLaSHiYOMv81BQbHAy6PZ7aey9kD_UpolsmVdUdpfKoTz3OptcGWc4ijucd8WnhH0n2fJnwzYRwdZOUjdqrkbW_w7QXSsMIqFy5u2OM0Ff-_mT5HIVQ-bqlg1u_vzGWvOxSiLYr7Z816Y4IFIAHyZYDtNcIg1tciD8OEab2BjraEulEnwlk4s317vYzlPfis28uXg7B1CYqpILSnICDXLQr1DJmPF_rCEqc0OI0"
                                />
                                <img
                                    alt="USDC"
                                    className="w-8 h-8 rounded-full border-2 border-white dark:border-surface-dark bg-white z-0"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxwkXGm9PHXmlFjOlqHsxu0zI_SEniw76tPKnm4KkYgtuxAc2_9YpDOr2SSBo2jGKK8FG7h150SpojXCwqP2jDhl03QlyhhnOqDpw4tgW1ASM3YQF0nVqaspCyMSo6LrC6AEaP2cZBhijYn9Sj_6qwY8ptexThUX725a3IHt9Y3-kag9n0dT1TPehsMK4XHg-czD-ZfYjq5EH9R7p-sO-mjO5TkJop9rJFeemFhmz9kxjn8oi_QjvivQGYMkAw4WavVNdW081DlGM"
                                />
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white">
                                SOL-USDC
                            </span>
                        </div>
                        <span className="material-icons-round text-gray-400">
                            expand_more
                        </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-surface-darker/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-between cursor-pointer hover:border-primary transition-colors">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 dark:text-white">
                                    0.05%
                                </span>
                                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">
                                    Best for Stable
                                </span>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <SettingsIcon fontSize="small" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Set Price Range */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">
                            2
                        </span>
                        Set Price Range
                    </h4>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500">Current Price:</span>
                        <span className="font-mono font-bold text-gray-900 dark:text-white">
                            {currentPrice.toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="h-24 bg-surface-darker/30 rounded-xl border border-gray-200 dark:border-gray-700 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-x-0 bottom-0 h-16 opacity-30 flex items-end gap-1 px-4">
                        {[40, 60, 45, 70, 50, 60, 30, 80, 55, 40].map((h, i) => (
                            <div key={i} className="flex-1 bg-primary" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                    <div className="text-sm text-gray-400 z-10">Chart Visualization Placeholder</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-surface-darker/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center hover:border-gray-400 transition-colors cursor-text group">
                        <div className="text-xs text-gray-500 mb-2">Min Price</div>
                        <div className="flex items-center justify-center gap-2">
                            <button
                                className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                                onClick={() =>
                                    setMinPrice((Number(minPrice) - 0.1).toFixed(2))
                                }
                            >
                                <RemoveIcon fontSize="small" style={{ fontSize: 16 }} />
                            </button>
                            <input
                                className="bg-transparent text-center font-mono font-bold text-lg w-20 focus:outline-none dark:text-white group-hover:text-primary transition-colors"
                                type="text"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                            <button
                                className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                                onClick={() =>
                                    setMinPrice((Number(minPrice) + 0.1).toFixed(2))
                                }
                            >
                                <AddIcon fontSize="small" style={{ fontSize: 16 }} />
                            </button>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">USDC per SOL</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-surface-darker/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center hover:border-gray-400 transition-colors cursor-text group">
                        <div className="text-xs text-gray-500 mb-2">Max Price</div>
                        <div className="flex items-center justify-center gap-2">
                            <button
                                className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                                onClick={() =>
                                    setMaxPrice((Number(maxPrice) - 0.1).toFixed(2))
                                }
                            >
                                <RemoveIcon fontSize="small" style={{ fontSize: 16 }} />
                            </button>
                            <input
                                className="bg-transparent text-center font-mono font-bold text-lg w-20 focus:outline-none dark:text-white group-hover:text-primary transition-colors"
                                type="text"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                            <button
                                className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                                onClick={() =>
                                    setMaxPrice((Number(maxPrice) + 0.1).toFixed(2))
                                }
                            >
                                <AddIcon fontSize="small" style={{ fontSize: 16 }} />
                            </button>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">USDC per SOL</div>
                    </div>
                </div>
            </div>

            {/* 3. Deposit Amount */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">
                        3
                    </span>
                    Deposit Amount
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-surface-darker/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-primary transition-colors">
                        <div className="flex justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <img
                                    alt="SOL"
                                    className="w-5 h-5 rounded-full"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrETAEdMSL3H499w94eluhcBFBsEKq6H4oIZhYfLaSHiYOMv81BQbHAy6PZ7aey9kD_UpolsmVdUdpfKoTz3OptcGWc4ijucd8WnhH0n2fJnwzYRwdZOUjdqrkbW_w7QXSsMIqFy5u2OM0Ff-_mT5HIVQ-bqlg1u_vzGWvOxSiLYr7Z816Y4IFIAHyZYDtNcIg1tciD8OEab2BjraEulEnwlk4s317vYzlPfis28uXg7B1CYqpILSnICDXLQr1DJmPF_rCEqc0OI0"
                                />
                                <span className="font-bold text-sm text-gray-900 dark:text-white">
                                    SOL
                                </span>
                            </div>
                            <span className="text-xs text-gray-500">
                                Bal: <span className="text-gray-900 dark:text-white">12.5</span>
                            </span>
                        </div>
                        <input
                            className="w-full bg-transparent text-xl font-mono font-bold focus:outline-none dark:text-white"
                            placeholder="0.00"
                            type="text"
                        />
                        <div className="text-right text-xs text-gray-400 mt-1">
                            $0.00
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-surface-darker/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-primary transition-colors">
                        <div className="flex justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <img
                                    alt="USDC"
                                    className="w-5 h-5 rounded-full"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxwkXGm9PHXmlFjOlqHsxu0zI_SEniw76tPKnm4KkYgtuxAc2_9YpDOr2SSBo2jGKK8FG7h150SpojXCwqP2jDhl03QlyhhnOqDpw4tgW1ASM3YQF0nVqaspCyMSo6LrC6AEaP2cZBhijYn9Sj_6qwY8ptexThUX725a3IHt9Y3-kag9n0dT1TPehsMK4XHg-czD-ZfYjq5EH9R7p-sO-mjO5TkJop9rJFeemFhmz9kxjn8oi_QjvivQGYMkAw4WavVNdW081DlGM"
                                />
                                <span className="font-bold text-sm text-gray-900 dark:text-white">
                                    USDC
                                </span>
                            </div>
                            <span className="text-xs text-gray-500">
                                Bal: <span className="text-gray-900 dark:text-white">1,400.0</span>
                            </span>
                        </div>
                        <input
                            className="w-full bg-transparent text-xl font-mono font-bold focus:outline-none dark:text-white"
                            placeholder="0.00"
                            type="text"
                        />
                        <div className="text-right text-xs text-gray-400 mt-1">
                            $0.00
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl flex gap-3 text-xs text-blue-700 dark:text-blue-300">
                <HelpOutlineIcon fontSize="small" className="shrink-0" />
                <p>
                    By adding liquidity, you will earn 0.05% of all trades on this pair
                    proportional to your share of the pool. Fees are added to the pool,
                    accruing in real time and can be claimed by withdrawing your
                    liquidity.
                </p>
            </div>

            <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-glow-primary transition-all text-lg cursor-pointer">
                Add Liquidity
            </button>
        </div>
    );
}
