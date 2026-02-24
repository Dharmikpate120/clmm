"use client";

export default function DensityChart() {
    return (
        <div className="mb-6">
            <div className="flex justify-between items-end mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Liquidity Density (Tick Status)
                </h3>
                <span className="text-xs text-gray-500">
                    Active Tick: <span className="font-mono text-secondary">28391</span>
                </span>
            </div>
            <div className="h-16 w-full bg-surface-dark rounded-lg border border-gray-800 flex overflow-hidden relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white z-10 shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                <div className="flex-1 flex items-end gap-0.5 px-1 opacity-40">
                    <div className="w-full bg-secondary/10 h-[20%]"></div>
                    <div className="w-full bg-secondary/10 h-[30%]"></div>
                    <div className="w-full bg-secondary/20 h-[15%]"></div>
                    <div className="w-full bg-secondary/10 h-[25%]"></div>
                    <div className="w-full bg-secondary/5 h-[10%]"></div>
                    <div className="w-full bg-secondary/20 h-[40%]"></div>
                    <div className="w-full bg-secondary/30 h-[60%]"></div>
                    <div className="w-full bg-secondary/40 h-[50%]"></div>
                    <div className="w-full bg-secondary/20 h-[30%]"></div>
                    <div className="w-full bg-secondary/10 h-[20%]"></div>
                </div>
                <div className="flex-1 flex items-end gap-0.5 justify-center">
                    <div className="w-full bg-secondary/40 h-[50%]"></div>
                    <div className="w-full bg-secondary/60 h-[70%]"></div>
                    <div className="w-full bg-secondary/80 h-[85%]"></div>
                    <div className="w-full bg-secondary h-[95%] shadow-[0_0_15px_rgba(20,241,149,0.5)]"></div>
                    <div className="w-full bg-secondary/80 h-[90%]"></div>
                    <div className="w-full bg-secondary/60 h-[75%]"></div>
                    <div className="w-full bg-secondary/40 h-[55%]"></div>
                </div>
                <div className="flex-1 flex items-end gap-0.5 px-1 opacity-40">
                    <div className="w-full bg-secondary/20 h-[35%]"></div>
                    <div className="w-full bg-secondary/10 h-[25%]"></div>
                    <div className="w-full bg-secondary/5 h-[15%]"></div>
                    <div className="w-full bg-secondary/10 h-[20%]"></div>
                    <div className="w-full bg-secondary/5 h-[10%]"></div>
                    <div className="w-full bg-secondary/5 h-[5%]"></div>
                    <div className="w-full bg-secondary/5 h-[5%]"></div>
                    <div className="w-full bg-transparent h-[0%]"></div>
                    <div className="w-full bg-transparent h-[0%]"></div>
                    <div className="w-full bg-transparent h-[0%]"></div>
                </div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-500 mt-1 font-mono">
                <span>$138.00</span>
                <span>$143.25</span>
                <span>$148.50</span>
            </div>
        </div>
    );
}
