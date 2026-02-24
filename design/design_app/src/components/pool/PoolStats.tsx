"use client";

export default function PoolStats() {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                <div className="text-sm text-gray-500 mb-1">Total Value Locked</div>
                <div className="text-xl font-mono font-bold text-white">$85.2M</div>
            </div>
            <div className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                <div className="text-sm text-gray-500 mb-1">24h Volume</div>
                <div className="text-xl font-mono font-bold text-white">$24.1M</div>
            </div>
        </div>
    );
}
