import PoolHeader from "@/components/pool/PoolHeader";
import PriceChart from "@/components/pool/PriceChart";
import PoolStats from "@/components/pool/PoolStats";
import DensityChart from "@/components/pool/DensityChart";
import SwapCard from "@/components/pool/SwapCard";
import LiquiditySection from "@/components/LiquiditySection";
import MyPositions from "@/components/pool/MyPositions";

export default async function PoolDetails({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <PoolHeader />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="col-span-1 lg:col-span-8 space-y-8">
                    <PriceChart />
                    <PoolStats />
                    <DensityChart />
                </div>

                <div className="col-span-1 lg:col-span-4 space-y-6">
                    <LiquiditySection />
                    <SwapCard />
                </div>
            </div>

            <MyPositions />
        </main>
    );
}
