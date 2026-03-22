"use client";


export default function MyPositions() {
    return (
        <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                My Positions
            </h2>
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-surface-darker/50 grid grid-cols-12 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="col-span-4">Position ID</div>
                    <div className="col-span-3 text-right">Liquidity</div>
                    <div className="col-span-3 text-right">Unclaimed Fees</div>
                    <div className="col-span-2 text-right">Status</div>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    <div className="p-4 grid grid-cols-12 items-center hover:bg-gray-50 dark:hover:bg-surface-darker transition-colors cursor-pointer">
                        <div className="col-span-4 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs">
                                #291
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                    Range
                                </div>
                                <div className="text-xs text-gray-500">
                                    Min: <span className="text-gray-900 dark:text-white font-mono">$138.2</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-3 text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                $1,248.52
                            </div>
                            <div className="text-xs text-gray-500">2.4 SOL</div>
                        </div>
                        <div className="col-span-3 text-right">
                            <div className="text-sm font-bold text-secondary">
                                $12.48
                            </div>
                        </div>
                        <div className="col-span-2 text-right">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                                In Range
                            </span>
                        </div>
                    </div>
                    <div className="p-4 grid grid-cols-12 items-center hover:bg-gray-50 dark:hover:bg-surface-darker transition-colors cursor-pointer">
                        <div className="col-span-4 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-xs">
                                #184
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                    Range
                                </div>
                                <div className="text-xs text-gray-500">
                                    Min: <span className="text-gray-900 dark:text-white font-mono">$120.0</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-3 text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                $542.10
                            </div>
                            <div className="text-xs text-gray-500">1.1 SOL</div>
                        </div>
                        <div className="col-span-3 text-right">
                            <div className="text-sm font-bold text-secondary">
                                $4.20
                            </div>
                        </div>
                        <div className="col-span-2 text-right">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1.5"></span>
                                Out of Range
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
