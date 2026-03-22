"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import type { Market, MarketsResponse } from "@/lib/types/market";

// ---- helpers ----------------------------------------------------------------

function ellipsify(str: string, len = 4): string {
  if (str.length <= len * 2 + 2) return str;
  return `${str.slice(0, len)}..${str.slice(-len)}`;
}

/** Format a raw u128/2^64 float nicely */
function fmtPrice(n: number): string {
  if (n === 0) return "0";
  if (n < 0.0001) return n.toExponential(4);
  if (n < 1) return n.toFixed(6);
  if (n < 1_000_000) return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
  return n.toExponential(4);
}

function fmtLiquidity(n: number): string {
  if (n === 0) return "0";
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

// ---- types for props --------------------------------------------------------

export type PoolListFilters = {
  search: string;
  minPrice: string;
  maxPrice: string;
  minLiquidity: string;
  maxLiquidity: string;
  sort: "price" | "liquidity" | "fees";
  order: "asc" | "desc";
};

interface PoolListProps {
  filters: PoolListFilters;
}

// ---- component --------------------------------------------------------------

export default function PoolList({ filters }: PoolListProps) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const limit = 10;

  const fetchMarkets = useCallback(
    async (currentPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(limit),
          sort: filters.sort,
          order: filters.order,
        });
        if (filters.search) params.set("search", filters.search);
        if (filters.minPrice) params.set("min_price", filters.minPrice);
        if (filters.maxPrice) params.set("max_price", filters.maxPrice);
        if (filters.minLiquidity) params.set("min_liquidity", filters.minLiquidity);
        if (filters.maxLiquidity) params.set("max_liquidity", filters.maxLiquidity);

        const res = await fetch(`/api/markets?${params.toString()}`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data: MarketsResponse = await res.json();
        setMarkets(data.markets);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch markets");
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    fetchMarkets(page);
  }, [page, fetchMarkets]);

  // ---- pagination helpers ---------------------------------------------------
  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const pagesArray = (): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
    if (page >= totalPages - 3) return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  // ---- render ---------------------------------------------------------------

  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <div className="col-span-4 md:col-span-3 flex items-center">Pool</div>
        <div className="col-span-3 md:col-span-2 text-right flex items-center justify-end gap-1">
          Price <UnfoldMoreIcon fontSize="small" style={{ fontSize: "14px" }} />
        </div>
        <div className="hidden md:flex col-span-2 items-center justify-end gap-1">
          Liquidity <ArrowDownwardIcon fontSize="small" style={{ fontSize: "14px" }} />
        </div>
        <div className="col-span-3 md:col-span-2 text-right">Tick</div>
        <div className="col-span-2 md:col-span-2 text-right">Fees</div>
        <div className="hidden md:block col-span-1 text-right">Action</div>
      </div>

      {/* Body */}
      <div className="divide-y divide-border min-h-[200px]">
        {loading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
            <span className="animate-pulse">Loading markets…</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center justify-center py-16 text-destructive text-sm">
            {error}
          </div>
        )}

        {!loading && !error && markets.length === 0 && (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
            No markets found
          </div>
        )}

        {!loading &&
          !error &&
          markets.map((market) => (
            <Link
              key={market.id}
              href={`/pool/${market.market_address}`}
              className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-muted/50 transition-colors cursor-pointer group"
            >
              {/* Pool Name */}
              <div className="col-span-4 md:col-span-3 flex items-center gap-3">
                {/* Token pair icons placeholder */}
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-primary/60 to-primary z-10 flex items-center justify-center text-[9px] font-bold text-white">
                    A
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-secondary/60 to-secondary z-0 flex items-center justify-center text-[9px] font-bold text-white">
                    B
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground font-mono text-xs">
                      {ellipsify(market.mint_address_a, 4)}/{ellipsify(market.mint_address_b, 4)}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {ellipsify(market.market_address, 6)}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="col-span-3 md:col-span-2 text-right">
                <div className="font-mono text-sm font-medium text-foreground">
                  {fmtPrice(market.current_price)}
                </div>
                <div className="text-xs text-muted-foreground">sqrt price</div>
              </div>

              {/* Liquidity */}
              <div className="hidden md:block col-span-2 text-right">
                <div className="font-mono text-sm font-medium text-foreground">
                  {fmtLiquidity(market.active_liquidity)}
                </div>
                {market.token_amount_a && market.token_amount_b && (
                  <div className="text-[11px] text-muted-foreground font-mono">
                    {ellipsify(market.token_amount_a, 3)} / {ellipsify(market.token_amount_b, 3)}
                  </div>
                )}
              </div>

              {/* Tick */}
              <div className="col-span-3 md:col-span-2 text-right">
                <div className="font-mono text-sm font-medium text-foreground">
                  {market.current_tick.toLocaleString()}
                </div>
              </div>

              {/* Fees */}
              <div className="col-span-2 md:col-span-2 text-right">
                <div className="font-mono text-sm font-bold text-secondary">
                  {fmtLiquidity(market.fees)}
                </div>
              </div>

              {/* Action */}
              <div className="hidden md:block col-span-1 text-right">
                <button className="text-muted-foreground hover:text-primary-foreground hover:bg-primary border border-transparent hover:border-primary/30 p-2 rounded-lg transition-all cursor-pointer">
                  <SwapHorizIcon fontSize="small" />
                </button>
              </div>
            </Link>
          ))}
      </div>

      {/* Footer: stats + pagination */}
      <div className="px-6 py-4 border-t border-border bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {loading ? "" : `${total} market${total !== 1 ? "s" : ""} total`}
        </span>

        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1 || loading}
            onClick={() => goToPage(page - 1)}
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer px-2"
          >
            Previous
          </button>

          <div className="flex gap-1">
            {pagesArray().map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-muted-foreground text-sm">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p as number)}
                  className={`px-4 py-2.5 bg-background border border-input rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 cursor-pointer ${page === p
                    ? "bg-highlight text-white"
                    : "hover:bg-muted text-muted-foreground"
                    }`}
                >
                  {p}
                </button>
              ),
            )}
          </div>

          <button
            disabled={page >= totalPages || loading}
            onClick={() => goToPage(page + 1)}
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer px-2"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
