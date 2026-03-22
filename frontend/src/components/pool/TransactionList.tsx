"use client";

import { useQuery } from "@tanstack/react-query";
import { Market } from "@/lib/types/market";
import { formatDistanceToNow } from "date-fns";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import HistoryIcon from "@mui/icons-material/History";

interface Transaction {
  id: string;
  user_address: string;
  token_in_address: string;
  token_out_address: string;
  amount_in: number;
  amount_out: number;
  price_num: number;
  direction: "up" | "down" | "same";
  created_at: string;
}

export default function TransactionList({ market }: { market: Market }) {
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["transactions", market.id],
    queryFn: async () => {
      const res = await fetch(`/api/markets/${market.id}/transactions?limit=10`);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 mt-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden mt-8 transition-all hover:shadow-xl hover:shadow-primary/5">
      <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <HistoryIcon className="text-primary" />
          Latest Transactions
        </h2>
        <span className="text-xs font-mono text-muted-foreground bg-background px-2 py-1 rounded-md border border-border">
          {transactions.length} RECENT
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground bg-muted/50">
              <th className="px-6 py-4 font-black">Time</th>
              <th className="px-6 py-4 font-black">Type</th>
              <th className="px-6 py-4 font-black text-right">Amount In</th>
              <th className="px-6 py-4 font-black text-right">Amount Out</th>
              <th className="px-6 py-4 font-black text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-primary/[0.02] transition-colors group">
                <td className="px-6 py-4 text-xs font-medium text-muted-foreground whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-foreground/90">
                      {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                    </span>
                    <span className="text-[10px] opacity-50 font-bold uppercase tracking-tighter">
                      {new Intl.DateTimeFormat("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                        timeZone: "Asia/Kolkata",
                        timeZoneName: "short",
                      }).format(new Date(tx.created_at))}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ${
                      tx.token_in_address === market.mint_address_a
                        ? "bg-red-500/10 text-red-500 border border-red-500/20"
                        : "bg-green-500/10 text-green-500 border border-green-500/20"
                    }`}
                  >
                    {tx.token_in_address === market.mint_address_a ? "Sell A" : "Buy A"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-mono text-right whitespace-nowrap text-foreground/80">
                  {Number(tx.amount_in).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-sm font-mono text-right whitespace-nowrap text-foreground/80">
                  {Number(tx.amount_out).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm font-black font-mono">
                      {tx.price_num.toLocaleString(undefined, {
                        minimumFractionDigits: 6,
                        maximumFractionDigits: 6,
                      })}
                    </span>
                    <div className="w-4 h-4 flex items-center justify-center">
                      {tx.direction === "up" && (
                        <ArrowUpwardIcon
                          className="text-green-500 animate-bounce"
                          style={{ fontSize: "14px" }}
                        />
                      )}
                      {tx.direction === "down" && (
                        <ArrowDownwardIcon
                          className="text-red-500 animate-bounce"
                          style={{ fontSize: "14px" }}
                        />
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-4 opacity-40">
                    <div className="p-4 rounded-full bg-muted">
                      <HistoryIcon style={{ fontSize: "48px" }} />
                    </div>
                    <p className="font-medium tracking-tight">
                      No transactions recorded for this pool yet
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
