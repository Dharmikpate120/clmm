import PoolHeader from "@/components/pool/PoolHeader";
import PriceChart from "@/components/pool/PriceChart";
import PoolStats from "@/components/pool/PoolStats";
import DensityChart from "@/components/pool/DensityChart";
import SwapCard from "@/components/pool/SwapCard";
import LiquiditySection from "@/components/LiquiditySection";
import MyPositions from "@/components/pool/MyPositions";
import { notFound } from "next/navigation";

async function getMarketData(id: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/markets/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
}

async function getTicksData(id: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/markets/${id}/ticks`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    console.log(data);
    return data.ticks || [];
}

export default async function PoolDetails({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const market = await getMarketData(id);

    if (!market) {
        notFound();
    }

    const ticks = await getTicksData(id);

    return (
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <PoolHeader market={market} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="col-span-1 lg:col-span-8 space-y-8">
                    <PriceChart />
                    <PoolStats />
                    <DensityChart market={market} ticks={ticks} />
                </div>

                <div className="col-span-1 lg:col-span-4 space-y-6">
                    <LiquiditySection market={market} />
                    <SwapCard market={market} />
                </div>
            </div>

            <MyPositions market={market} />
        </main>
    );
}
