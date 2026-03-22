"use client";

import { useWalletUi } from "@wallet-ui/react";
import { WalletDropdown } from "@/components/wallet-dropdown";
import LiquiditySection from "@/components/LiquiditySection";
import SwapCard from "@/components/pool/SwapCard";
import MyPositions from "@/components/pool/MyPositions";
import { Market } from "@/lib/types/market";
import { TickData } from "@/lib/types";

interface WalletDependentContentProps {
    market: Market;
    ticks: TickData[];
    section: "sidebar" | "bottom";
}

export default function WalletDependentContent({ market, ticks, section }: WalletDependentContentProps) {
    const { connected } = useWalletUi();

    if (!connected) {
        if (section === "bottom") return null; // Only show one CTA in the sidebar, or hide bottom entirely

        return (
            <div className="bg-card rounded-2xl border border-dashed border-border p-8 flex flex-col items-center justify-center text-center shadow-sm min-h-[400px]">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Connect Wallet</h3>
                <p className="text-muted-foreground text-sm max-w-[240px] mb-6">
                    Connect your wallet to swap, add liquidity, and view your positions.
                </p>
                <WalletDropdown />
            </div>
        );
    }

    if (section === "sidebar") {
        return (
            <div className="space-y-6">
                <LiquiditySection market={market} />
                <SwapCard market={market} ticks={ticks} />
            </div>
        );
    }

    return <MyPositions market={market} />;
}


