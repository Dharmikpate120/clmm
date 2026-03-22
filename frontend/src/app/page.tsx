'use client'
import { useState } from 'react'
import SubHeader from '@/components/home/SubHeader'
import PoolList, { type PoolListFilters } from '@/components/home/PoolList'
import { useWalletUi } from '@wallet-ui/react'

const DEFAULT_FILTERS: PoolListFilters = {
  search: '',
  minPrice: '',
  maxPrice: '',
  minLiquidity: '',
  maxLiquidity: '',
  sort: 'liquidity',
  order: 'desc',
}

export default function Home() {
  const [filters, setFilters] = useState<PoolListFilters>(DEFAULT_FILTERS)

  const { connected } = useWalletUi()
  // return connected ? <ConnectedComponent /> : <DashboardFeature />
  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {!connected && (
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">CLMM Pools</h1>
          <p className="text-muted-foreground max-w-2xl">
            Provide concentrated liquidity to earn higher fees. View analytics and manage your positions across the
            Solana ecosystem.
          </p>
        </div>
      )}
      {connected && <SubHeader filters={filters} onFiltersChange={setFilters} />}
      {/* <SummaryCards /> */}
      <PoolList filters={filters} />
      <div className="mt-8 flex justify-center">
        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          <span>Live from on-chain indexer</span>
        </div>
      </div>
    </main>
  )
}
