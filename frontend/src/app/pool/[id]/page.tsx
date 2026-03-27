import PoolHeader from '@/components/pool/PoolHeader'
import PriceChart from '@/components/pool/PriceChart'
import TransactionList from '@/components/pool/TransactionList'
import WalletDependentContent from '@/components/pool/WalletDependentContent'

async function getMarketData(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/markets/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
}

async function getTicksData(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/markets/${id}/ticks`, {
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.ticks || []
}

export default async function PoolDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const market = await getMarketData(id)
  const ticks = await getTicksData(id)

  if (!market) {
    return <div className="p-8 text-center text-red-500">Market not found</div>
  }

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <PoolHeader market={market} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="col-span-1 lg:col-span-8 space-y-8">
          <PriceChart market={market} />
          {/* <PoolStats /> */}
          {/* <DensityChart market={market} ticks={ticks} /> */}
          <TransactionList market={market} />
        </div>

        <div className="col-span-1 lg:col-span-4">
          <WalletDependentContent market={market} ticks={ticks} section="sidebar" />
        </div>
      </div>

      <div className="mt-8">
        <WalletDependentContent market={market} ticks={ticks} section="bottom" />
      </div>
    </main>
  )
}
