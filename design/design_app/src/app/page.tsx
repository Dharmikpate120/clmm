import SubHeader from "@/components/home/SubHeader";
import SummaryCards from "@/components/home/SummaryCards";
import PoolList from "@/components/home/PoolList";

export default function Home() {
  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <SubHeader />
      <SummaryCards />
      <PoolList />
      <div className="mt-8 flex justify-center">
        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          <span>Prices updated: </span>
          <span className="font-mono">14s ago</span>
        </div>
      </div>
    </main>
  );
}
