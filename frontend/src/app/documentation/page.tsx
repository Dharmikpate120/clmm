'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Workflow, 
  Code2, 
  Database, 
  Layout, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  RefreshCcw,
  Blocks,
  Network
} from 'lucide-react'

type TabType = 'overview' | 'contract' | 'indexer' | 'frontend'

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Workflow className="w-4 h-4" /> },
    { id: 'contract', label: 'Contract', icon: <Code2 className="w-4 h-4" /> },
    { id: 'indexer', label: 'Indexer', icon: <Database className="w-4 h-4" /> },
    { id: 'frontend', label: 'Frontend', icon: <Layout className="w-4 h-4" /> },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            System Documentation
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            A comprehensive guide to the SolFluence CLMM architecture, from on-chain logic to real-time indexing and trading interface.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 p-1 bg-muted/30 rounded-lg w-fit border border-border">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-6 py-2 h-auto rounded-md transition-all duration-200"
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'overview' && <OverviewSection />}
          {activeTab === 'contract' && <ContractSection />}
          {activeTab === 'indexer' && <IndexerSection />}
          {activeTab === 'frontend' && <FrontendSection />}
        </div>
      </div>
    </div>
  )
}

function OverviewSection() {
  return (
    <div className="flex flex-col gap-8">
      <Card className="border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Workflow className="text-primary" />
            End-to-End Workflow
          </CardTitle>
          <CardDescription>
            How the different components of the SolFluence ecosystem communicate and ensure data consistency.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-12">
          {/* Triangle Workflow Diagram */}
          <div className="relative py-12 md:py-20 bg-muted/20 rounded-2x border border-dashed border-border overflow-hidden">
            <div className="relative z-10 w-full max-w-2xl mx-auto h-[400px]">
              
              {/* Contract Node (Top Center) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 w-40">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-lg z-20 bg-background/80 backdrop-blur-sm">
                  <Cpu size={40} />
                </div>
                <div className="text-center">
                  <span className="font-bold">Solana Chain</span>
                  <p className="text-[10px] text-muted-foreground mt-1">CLMM Native Program</p>
                </div>
              </div>

              {/* Indexer Node (Bottom Right) */}
              <div className="absolute bottom-10 right-0 md:right-10 flex flex-col items-center gap-4 w-40">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner z-20 bg-background/80 backdrop-blur-sm">
                  <Database size={32} />
                </div>
                <div className="text-center">
                  <span className="font-bold">Rust Indexer</span>
                  <p className="text-[10px] text-muted-foreground mt-1">WebSocket Listener</p>
                </div>
                
                {/* DB Sub-node */}
                {/* <div className="mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                  <Blocks size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-600">PostgreSQL</span>
                </div> */}
              </div>

              {/* Frontend Node (Bottom Left) */}
              <div className="absolute bottom-10 left-0 md:left-10 flex flex-col items-center gap-4 w-40">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner z-20 bg-background/80 backdrop-blur-sm">
                  <Layout size={32} />
                </div>
                <div className="text-center">
                  <span className="font-bold">Next.js Frontend</span>
                  <p className="text-[10px] text-muted-foreground mt-1">Trading Interface</p>
                </div>
              </div>

              {/* Connecting Arrows (Desktop) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block" viewBox="0 0 600 400">
                <defs>
                  <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orientation="auto">
                    <path d="M0,0 L0,10 L10,5 Z" fill="currentColor" />
                  </marker>
                </defs>
                
                {/* Frontend -> Contract */}
                <path 
                  d="M140,290 L260,70" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeDasharray="4 4"
                  className="text-amber-500/30"
                  // markerEnd="url(#arrow)"
                />
                {/* <text x="140" y="190" className="text-[10px] fill-amber-600 font-medium -rotate-50">Sends Request</text> */}

                {/* Contract -> Indexer */}
                <path 
                  d="M340,70 L460,290" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeDasharray="4 4"
                  className="text-amber-500/30"
                  // markerEnd="url(#arrow)"
                />
                {/* <text x="400" y="190" className="text-[10px] fill-amber-600 font-medium rotate-50">Updates Indexer</text> */}

                {/* DB -> Frontend (Optional closure) */}
                <path 
                  d="M420,340 L180,340" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeDasharray="4 4"
                  className="text-amber-500/30"
                  // markerEnd="url(#arrow)"
                />
                {/* <text x="270" y="360" className="text-[10px] fill-emerald-600/40 font-medium text-center">State Queries</text> */}
              </svg>

            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl border border-border bg-card/50">
              <h3 className="font-bold text-primary mb-2">1. Execution</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Users initiate swaps or manage liquidity through the Next.js interface. The frontend constructs raw transactions using the <code>gill</code> library and submits them to the Solana cluster.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card/50">
              <h3 className="font-bold text-secondary mb-2">2. Indexing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A standalone Rust indexer listens to the CLMM program logs via WebSocket. When a transaction is detected, it fetches full data, parses instructions, and updates the PostgreSQL database.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card/50">
              <h3 className="font-bold text-amber-500 mb-2">3. Visibility</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The frontend queries the Postgres database via optimized API routes to provide real-time visibility into market prices, active liquidity, and user positions with high performance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ContractSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="text-primary w-8 h-8" />
            On-Chain Contract
          </h2>
          <p className="text-muted-foreground">
            A high-performance, native Solana program built from scratch using Rust, implementing the Concentrated Liquidity Market Maker (CLMM) protocol without Anchor framework abstractions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm">
          <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-muted/20">
            <div className="p-2 rounded-lg bg-primary/10 text-primary mt-1">
              <Blocks size={20} />
            </div>
            <div>
              <h4 className="font-bold mb-1">Tick Array Management</h4>
              <p className="text-muted-foreground leading-relaxed">
                Liquidity is tracked using fixed-size 88-tick arrays. High-performance <code>bytemuck</code> zero-copy casting allows for CU-efficient updates of net liquidity deltas during swap traversals.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-muted/20">
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary mt-1">
              <Zap size={20} />
            </div>
            <div>
              <h4 className="font-bold mb-1">Bitmap-Based Traversal</h4>
              <p className="text-muted-foreground leading-relaxed">
                Efficiently locates active ticks using bit-packed u8 account segments. This multi-level indexing eliminates the need for expensive linear searches across thousands of ticks.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-muted/20">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 mt-1">
              <Network size={20} />
            </div>
            <div>
              <h4 className="font-bold mb-1">Q64.64 Fixed-Point Math</h4>
              <p className="text-muted-foreground leading-relaxed">
                Precise decimal representation using integer arithmetic. All liquidity and price calculations use the <code>sqrt(price) × 2^64</code> format to maintain precision without floating-point errors.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="h-full">
        <CardHeader>
          <CardTitle>Industry-Level Solutions</CardTitle>
          <CardDescription>Challenges faced and technical implementations.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm leading-relaxed">
          <div className="p-4 rounded-lg bg-card border border-border">
            <h5 className="font-bold text-primary mb-2">Lexicographical Determinism</h5>
            <p className="text-muted-foreground">
              Solved the issue of non-deterministic PDA derivation by strictly enforcing lexicographical canonical ordering of token mints. This ensures a unique, consistent pool address for any given pair.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <h5 className="font-bold text-secondary mb-2">NFT-Backed Positions</h5>
            <p className="text-muted-foreground">
              Integrated Metaplex Core to represent liquidity positions as NFTs. This allows for seamlessly transferable ownership of complex liquidity positions between wallets, enabling a secondary market.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <h5 className="font-bold text-amber-500 mb-2">Custom Error Derivation</h5>
            <p className="text-muted-foreground">
              Implemented <code>spl_program_error</code> macros for deterministic, self-documenting error codes that provide clear context in transaction logs without bulky string storage.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function IndexerSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="h-fit">
        <CardHeader>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl w-fit mb-4">
            <RefreshCcw className="w-8 h-8 animate-spin-slow" />
          </div>
          <CardTitle className="text-2xl">Real-Time Data Pipeline</CardTitle>
          <CardDescription>High-performance Rust service for blockchain state indexing.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">Socket Management</span>
            <p className="text-sm leading-relaxed">
              The indexer maintains a persistent WebSocket connection to the Solana cluster. A specialized <strong>automatic reconnection loop</strong> detects dropouts via heartbeat monitoring and instantly re-establishes the subscription without data loss.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">Async Architecture</span>
            <p className="text-sm leading-relaxed">
              Leverages <strong>Tokio MPSC channels</strong> to decouple the blocking WebSocket listener from the async processing runtime. This &quot;Sync-to-Async Bridge&quot; prevents ingestion bottlenecks during periods of high network activity.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <Database className="text-amber-500 w-8 h-8" />
          Indexer Core Logic
        </h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="p-6 rounded-2xl bg-card border border-border flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-bold">Slot-Anchored Fetching</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When a transaction signature is received, the indexer fetches accounts using <code>min_context_slot</code>. This guarantees that the indexed data reflects the state *immediately after* the transaction, ensuring perfect consistency with the on-chain reality.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="font-bold">Instruction Dispatching</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The pipeline uses a shared <code>CLMMInstruction</code> enum to parse raw instruction bytes. Parallel workers (<code>tokio::task::spawn</code>) independently handle transaction decoding, database updates, and event logging.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-300" />
              <span className="font-bold">Compile-Time Safety</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All database operations use <code>sqlx</code> macros, verifying query validity against the live schema during compilation. This prevents runtime SQL errors and ensures type-safety between Rust and PostgreSQL.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FrontendSection() {
  return (
    <Card className="border-none bg-gradient-to-br from-card to-muted/20">
      <CardContent className="pt-8 pb-12 flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-4xl font-bold flex items-center gap-3">
              <Layout className="text-primary w-10 h-10" />
              Next.js 15 Interface
            </h2>
            <p className="text-lg text-muted-foreground">
              A premium trading experience built with React 19 and the Next.js App Router, prioritizing speed, responsiveness, and visual excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-background/50 border border-border backdrop-blur-sm">
              <h4 className="font-bold text-primary mb-2">High Visibility</h4>
              <p className="text-sm text-muted-foreground">
                Decodes raw Q64.64 on-chain values into human-readable prices and liquidity metrics for instant user clarity.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-background/50 border border-border backdrop-blur-sm">
              <h4 className="font-bold text-secondary mb-2">Server Action Integration</h4>
              <p className="text-sm text-muted-foreground">
                Complex transaction logic is encapsulated in type-safe Server Actions, ensuring secure and reliable interactions.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-background/50 border border-border backdrop-blur-sm">
              <h4 className="font-bold text-amber-500 mb-2">Interactive Visualization</h4>
              <p className="text-sm text-muted-foreground">
                Custom canvas-based liquidity charts with zoom and pan for granular market analysis.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-background/50 border border-border backdrop-blur-sm">
              <h4 className="font-bold text-emerald-500 mb-2">Gill Library</h4>
              <p className="text-sm text-muted-foreground">
                Leverages the <code>gill</code> library for state-of-the-art Solana transaction construction and wallet management.
              </p>
            </div>
          </div>
        </div>

        {/* Visual Element */}
        <div className="w-full md:w-1/3 aspect-square rounded-full border-[20px] border-primary/5 relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[1px] border-dashed border-primary/20 animate-spin-slow" />
          <div className="w-1/2 h-1/2 rounded-3xl bg-primary/20 flex items-center justify-center text-primary shadow-2xl shadow-primary/20 rotate-12 transition-transform hover:rotate-0 duration-500">
             <Layout size={64} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
