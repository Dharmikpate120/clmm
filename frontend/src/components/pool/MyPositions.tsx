"use client";

import { useEffect, useState } from "react";
import { Market } from "@/lib/types/market";
import { Position } from "@/lib/types/position";
import { ellipsify } from "@/lib/utils";
import { useWalletUi } from "@wallet-ui/react";

export default function MyPositions({ market }: { market: Market }) {
    const { account } = useWalletUi();
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!account?.address) {
            setLoading(false);
            return;
        }

        const fetchPositions = async () => {
            try {
                const res = await fetch(`/api/user/positions?user_address=${account?.address}&market_id=${market.id}`);
                const data = await res.json();
                setPositions(data.positions || []);
            } catch (error) {
                console.error("Error fetching positions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPositions();
    }, [account?.address, market.id]);

    if (!account?.address) {
        return (
            <div className="mt-8 text-center p-8 bg-card rounded-xl border border-border">
                <p className="text-muted-foreground">Connect your wallet to see your positions</p>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <h2 className="text-lg font-bold text-foreground mb-4">
                My Positions
            </h2>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/50 grid grid-cols-12 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <div className="col-span-5">Position Address</div>
                    <div className="col-span-3 text-right">Liquidity</div>
                    <div className="col-span-2 text-right">Range</div>
                    <div className="col-span-2 text-right">Status</div>
                </div>
                <div className="divide-y divide-border">
                    {loading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading positions...</div>
                    ) : positions.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No positions found for this market</div>
                    ) : (
                        positions.map((pos) => (
                            <div key={pos.id} className="p-4 grid grid-cols-12 items-center hover:bg-muted/50 transition-colors cursor-pointer">
                                <div className="col-span-5 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-[10px]">
                                        NFT
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-foreground">
                                            {ellipsify(pos.position_address)}
                                        </div>
                                        <div className="text-[10px] text-gray-500 font-mono">
                                            NFT: {ellipsify(pos.nft_address)}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-3 text-right">
                                    <div className="text-sm font-medium text-foreground font-mono">
                                        {pos.liquidity.toFixed(2)}
                                    </div>
                                </div>
                                <div className="col-span-2 text-right">
                                    <div className="text-xs text-foreground font-mono">
                                        [{pos.start_tick}, {pos.end_tick}]
                                    </div>
                                </div>
                                <div className="col-span-2 text-right">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${market.current_tick >= pos.start_tick && market.current_tick <= pos.end_tick
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                        }`}>
                                        {market.current_tick >= pos.start_tick && market.current_tick <= pos.end_tick ? "In Range" : "Out of Range"}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
