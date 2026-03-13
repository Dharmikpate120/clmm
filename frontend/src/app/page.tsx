'use client'

import { useState } from 'react'
import DashboardFeature from '@/features/dashboard/dashboard-feature'
import SubHeader from '@/components/home/SubHeader'
import SummaryCards from '@/components/home/SummaryCards'
import PoolList, { type PoolListFilters } from '@/components/home/PoolList'
import { useWalletUi } from '@wallet-ui/react'

export default function Home() {
  const { connected } = useWalletUi()
  return connected ? <ConnectedComponent /> : <DashboardFeature />
}

export const maxDuration = 200

const DEFAULT_FILTERS: PoolListFilters = {
  search: '',
  minPrice: '',
  maxPrice: '',
  minLiquidity: '',
  maxLiquidity: '',
  sort: 'liquidity',
  order: 'desc',
}

function ConnectedComponent() {
  const [filters, setFilters] = useState<PoolListFilters>(DEFAULT_FILTERS)

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <SubHeader filters={filters} onFiltersChange={setFilters} />
      <SummaryCards />
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
