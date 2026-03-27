'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import { Market } from '@/lib/types/market'
import { format } from 'date-fns'

interface PriceHistoryPoint {
  time: string
  price: number
}

const RANGES = [
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: '1Y', value: '1Y' },
]

export default function PriceChart({ market }: { market: Market }) {
  const [range, setRange] = useState('1Y')

  const { data: history = [], isLoading } = useQuery<PriceHistoryPoint[]>({
    queryKey: ['price-history', market.id, range],
    queryFn: async () => {
      const res = await fetch(`/api/markets/${market.id}/price-history?range=${range}`)
      if (!res.ok) throw new Error('Failed to fetch price history')
      return res.json()
    },
  })

  const formatXAxis = (tickItem: string) => {
    try {
      const date = new Date(tickItem)
      if (range === '1D') return format(date, 'HH:mm')
      if (range === '1W') return format(date, 'MMM dd')
      if (range === '1M') return format(date, 'MMM dd')
      return format(date, 'MMM dd')
    } catch {
      return tickItem
    }
  }

  interface TooltipPayload {
    value: number
    payload: {
      time: string
      price: number
    }
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
    if (active && payload && payload.length) {
      const date = new Date(payload[0].payload.time)
      const localTimeStr = new Intl.DateTimeFormat('en-IN', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
        timeZoneName: 'short',
      }).format(date)

      return (
        <div className="bg-background border border-border p-3 rounded-xl shadow-2xl backdrop-blur-md bg-opacity-80">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-bold">{localTimeStr}</p>
          <p className="text-lg font-black text-primary">
            ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6 h-[500px] flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <ShowChartIcon className="text-9xl text-primary" style={{ fontSize: '128px' }} />
      </div>

      <div className="flex justify-between items-center mb-6 z-10">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Price History
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Real-time market performance</p>
        </div>
        <div className="flex bg-muted/50 rounded-xl p-1 border border-border/50">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                range === r.value
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow w-full relative min-h-0">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-primary/20"></div>
              <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin absolute top-0 left-0"></div>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9945FF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#9945FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="time"
                tickFormatter={formatXAxis}
                tick={{ fontSize: 10, fontWeight: 600 }}
                stroke="hsl(var(--muted-foreground))"
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: '#9945FF', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#9945FF"
                fillOpacity={1}
                fill="url(#colorPrice)"
                strokeWidth={3}
                animationDuration={1500}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
