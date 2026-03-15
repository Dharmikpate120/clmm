"use client";

import { Market } from "@/lib/types/market";
import { useState, useRef, useEffect } from "react";

type TickData = {
    tick: number;
    liquidity: number;
};

export default function DensityChart({ market, ticks }: { market: Market, ticks: TickData[] }) {
    // Zoom state
    const [zoom, setZoom] = useState(1);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Use a native listener to reliably prevent parent page scroll (non-passive)
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleNativeWheel = (e: globalThis.WheelEvent) => {
            if (e.deltaY !== 0) {
                // This reliably prevents the page from scrolling
                e.preventDefault();
                e.stopPropagation();

                if (e.shiftKey) {
                    // Pan horizontally
                    container.scrollLeft += e.deltaY;
                } else {
                    // Handle zoom
                    const zoomSpeed = 0.1;
                    setZoom(prev => Math.min(Math.max(0.1, prev - (e.deltaY > 0 ? zoomSpeed : -zoomSpeed)), 10));
                }
            }
        };

        container.addEventListener("wheel", handleNativeWheel, { passive: false });
        return () => container.removeEventListener("wheel", handleNativeWheel);
    }, []);

    // Current price and tick for centering
    const currentTick = market.current_tick;
    
    // Sort ticks by position
    const sortedTicks = [...ticks].sort((a, b) => a.tick - b.tick);
    
    // Base configuration
    const bucketSize = 100;
    const baseNumBars = 100; 
    
    // Efficiently group ticks into buckets
    const bucketMap: Record<number, number> = {};
    sortedTicks.forEach(t => {
        const bucketId = Math.floor(t.tick / bucketSize);
        bucketMap[bucketId] = (bucketMap[bucketId] || 0) + t.liquidity;
    });

    // Calculate how many bars to show based on zoom
    const numBars = Math.round(baseNumBars * (zoom > 1 ? zoom : 1));
    const currentBucketId = Math.floor(currentTick / bucketSize);

    const bars = [];
    for (let i = -numBars; i <= numBars; i++) {
        const bucketId = currentBucketId + i;
        const liquidity = bucketMap[bucketId] || 0;
        bars.push({ 
            tick: bucketId * bucketSize + bucketSize / 2, 
            liquidity: liquidity,
            bucketId 
        });
    }

    const maxLiquidity = Math.max(...bars.map(b => b.liquidity), 1);

    return (
        <div className="mb-6 select-none">
            <div className="flex justify-between items-end mb-2">
                <div className="flex flex-col">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Liquidity Spread (Ticks)
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                        Scroll to Zoom • Shift + Scroll to Pan
                    </p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500">
                        Current Tick: <span className="font-mono text-secondary">{currentTick}</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        Zoom: {zoom.toFixed(1)}x
                    </span>
                </div>
            </div>
            
            <div 
                className="group relative h-28 w-full bg-card/50 rounded-xl border border-border overflow-x-auto scrollbar-none"
                ref={scrollContainerRef}
            >
                <div className="flex items-end gap-[1px] h-full min-w-max px-4 pb-1 pt-4">
                    {bars.map((bar, i) => {
                        const isCurrent = bar.bucketId === currentBucketId;
                        const hasLiquidity = bar.liquidity > 0;
                        
                        return (
                            <div 
                                key={i} 
                                className={`min-w-[4px] transition-all duration-300 relative ${
                                    isCurrent ? 'bg-primary scale-x-125 z-10' : 
                                    hasLiquidity ? 'bg-green-500' : 'bg-white/20'
                                } hover:opacity-100 opacity-80`}
                                style={{ 
                                    height: `${Math.max(4, (bar.liquidity / maxLiquidity) * 100)}%`,
                                    borderRadius: '1px 1px 0 0',
                                    width: `${Math.max(2, 10 / zoom)}px`
                                }}
                            >
                                {isCurrent && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-full bg-primary/50 pointer-events-none"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-between text-[10px] text-muted-foreground mt-2 font-mono px-1">
                <span>{(market.current_price * (1 - 0.1 / zoom)).toFixed(4)}</span>
                <span className="text-foreground font-bold">${market.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                <span>{(market.current_price * (1 + 0.1 / zoom)).toFixed(4)}</span>
            </div>
        </div>
    );
}

