"use client";

import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";

export default function SubHeader() {
    return (
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    CLMM Pools
                </h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
                    Provide concentrated liquidity to earn higher fees. View analytics and
                    manage your positions across the Solana ecosystem.
                </p>
            </div>
            <div className="flex gap-3">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="text-gray-400 group-focus-within:text-primary" />
                    </div>
                    <input
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg leading-5 bg-white dark:bg-surface-dark text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-shadow shadow-sm"
                        placeholder="Search tokens or pools..."
                        type="text"
                    />
                </div>
                <button className="px-4 py-2.5 bg-white dark:bg-surface-dark border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer">
                    <FilterListIcon fontSize="small" />
                    Filter
                </button>
                <button className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-glow-primary transition-all flex items-center gap-2 cursor-pointer">
                    <AddIcon fontSize="small" />
                    Create Pool
                </button>
            </div>
        </div>
    );
}
