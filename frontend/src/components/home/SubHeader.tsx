"use client";

import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";

export default function SubHeader() {
    return (
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    CLMM Pools
                </h1>
                <p className="text-muted-foreground max-w-2xl">
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
                        className="block w-full pl-10 pr-3 py-2.5 border border-input rounded-lg leading-5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-shadow shadow-sm"
                        placeholder="Search tokens or pools..."
                        type="text"
                    />
                </div>
                <button className="px-4 py-2.5 bg-background border border-input rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 cursor-pointer">
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
