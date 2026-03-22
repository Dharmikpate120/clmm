"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useWalletUi, useWalletUiSigner } from "@wallet-ui/react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import addLiquidity from "@/lib/actions/addLiquidity";
import { AmmAddLiquidity } from "@/lib/types";
import { Market } from "@/lib/types/market";
import { TokenAccount } from "@/lib/types/position";
import { useWalletUiSignAndSend } from "@wallet-ui/react-gill";

/* 
const initial_state = {
    token_a_mint_account: "6rxGJAE7xLLSogfhLpnJNixbBoAAosNSn2KAVcuJKg8d",
    token_b_mint_account: "FYAehxG1mMrVd5vftv72TdkKfjkj6VzwwmbfpCp6nxhY",
    provider_token_a_account: "AXNfEoew1PRokiSCPzAAQunHJMP7jr1zSxPcFfi2zy8q",
    provider_token_b_account: "Ds7GLgYzr2i3J4KFA4TPbFyJgFG2GwfSLvV1xYSbi96H",
    liquidity: "1000",
    start_tick: "20000",
    end_tick: "40000",
    provider_account: "GK5uAKRv4Abn4szsDuhvcBDoYp8cwAcggkkynMjmSZf3"
    }
*/

type TickData = {
    tick: number;
    liquidity: number;
};

// Constant for tick - price conversion basics
const TICK_BASE = 1.0001;
const MIN_TICK = -443636;
const MAX_TICK = 443636;

const tickToPrice = (tick: number): number => {
    return Math.pow(TICK_BASE, tick);
}

const priceToTick = (price: number): number => {
    if (price <= 0) return MIN_TICK;
    return Math.round(Math.log(price) / Math.log(TICK_BASE));
}

export default function AddLiquidityModal({ market }: { market: Market }) {
    const { account } = useWalletUi();
    const signer = useWalletUiSigner({ account: account! })
    const sender = useWalletUiSignAndSend()
    const [userTokenAccounts, setUserTokenAccounts] = useState<TokenAccount[]>([]);
    const [ticks, setTicks] = useState<TickData[]>([]);

    // Histogram scale state
    const [tickStep, setTickStep] = useState(50);
    const numBars = 40; // Total 81 bars
    const histogramRef = useRef<HTMLDivElement>(null);

    // AmmAddLiquidity form fields
    const [formData, setFormData] = useState<AmmAddLiquidity>({
        token_a_mint_account: market.mint_address_a,
        token_b_mint_account: market.mint_address_b,
        provider_token_a_account: "",
        provider_token_b_account: "",
        liquidity: "1000",
        start_tick: (market.current_tick - 1000).toString(),
        end_tick: (market.current_tick + 1000).toString(),
        provider_account: account?.address || ""
    });

    // Initialize with ±1000 ticks, respecting the 0-minimum constraint
    const defaultMinTick = Math.max(market.current_tick - 1000, 0);
    const defaultMaxTick = Math.max(market.current_tick + 1000, 1);

    const [minPrice, setMinPrice] = useState(tickToPrice(defaultMinTick).toFixed(3));
    const [maxPrice, setMaxPrice] = useState(tickToPrice(defaultMaxTick).toFixed(3));
    const currentPrice = market.current_price;

    const [dragging, setDragging] = useState<'min' | 'max' | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch User Token Accounts
                const resAcc = await fetch(`/api/user/token-accounts?user_address=${account?.address}`);
                const dataAcc = await resAcc.json();
                const accounts = dataAcc.tokenAccounts || [];
                setUserTokenAccounts(accounts);

                // Auto-fill provider token accounts
                const accA = accounts.find((a: TokenAccount) => a.token_mint_address === market.mint_address_a);
                const accB = accounts.find((a: TokenAccount) => a.token_mint_address === market.mint_address_b);

                setFormData(prev => ({
                    ...prev,
                    provider_token_a_account: accA?.token_address || "",
                    provider_token_b_account: accB?.token_address || "",
                    provider_account: account?.address || ""
                }));

                const resTicks = await fetch(`/api/markets/${market.id}/ticks`);
                const dataTicks = await resTicks.json();
                setTicks(dataTicks.ticks || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        if (account?.address) fetchData();
    }, [account?.address, market.id, market.mint_address_a, market.mint_address_b]);

    // Range Selection Logic
    const minTickRaw = priceToTick(parseFloat(minPrice));
    const minTick = Math.max(minTickRaw, 0); // Enforce 0 minimum
    const maxTickRaw = priceToTick(parseFloat(maxPrice));
    const maxTick = Math.max(maxTickRaw, minTick + 1); // Enforce 0 minimum and > minTick

    // Sync ticks to formData whenever they change via handles or buttons
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            start_tick: minTick.toString(),
            end_tick: maxTick.toString()
        }));
    }, [minTick, maxTick]);

    const handleAddLiquidity = async () => {
        const instruction = await addLiquidity(formData);

        const result = await sender(instruction!, signer);
        console.log("Add Liquidity instruction:", instruction, result);
    };

    const isInRange = currentPrice >= parseFloat(minPrice) && currentPrice <= parseFloat(maxPrice);
    const isBelowRange = currentPrice < parseFloat(minPrice);
    const isAboveRange = currentPrice > parseFloat(maxPrice);

    // Histogram Logic
    const currentTick = market.current_tick;
    const sortedTicks = [...ticks].sort((a, b) => a.tick - b.tick);

    const bars = [];
    for (let i = -numBars; i <= numBars; i++) {
        const centerTick = currentTick + i * tickStep;
        const tickInRange = sortedTicks.find(t => Math.abs(t.tick - centerTick) < tickStep / 2);
        const liquidity = tickInRange ? tickInRange.liquidity : 0;
        bars.push({ tick: centerTick, liquidity });
    }
    const maxLiquidity = Math.max(...bars.map(b => b.liquidity), 1);


    const getXForTick = (tick: number) => {
        const offset = tick - currentTick;
        const totalRange = numBars * tickStep * 2;
        const percent = ((offset + (numBars * tickStep)) / totalRange) * 100;
        return Math.min(Math.max(percent, 0), 100);
    };

    const getTickForX = (x: number) => {
        const totalRange = numBars * tickStep * 2;
        const offset = (x / 100) * totalRange - (numBars * tickStep);
        return Math.floor(currentTick + offset);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragging || !histogramRef.current) return;

        const rect = histogramRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const tick = Math.min(Math.max(getTickForX(x), 0), MAX_TICK); // Enforce 0 minimum

        if (dragging === 'min') {
            if (tick < maxTick) {
                setMinPrice(tickToPrice(tick).toFixed(3));
                // Zoom out if dragging near left edge
                if (x < 5 && tick > 0) setTickStep(prev => prev * 1.1);
                // Zoom in if both handles are within the central 30-70% range
                const maxPercent = getXForTick(maxTick);
                if (x > 30 && maxPercent < 70) setTickStep(prev => Math.max(prev / 1.1, 1));
            }
        } else if (dragging === 'max') {
            if (tick > minTick) {
                setMaxPrice(tickToPrice(tick).toFixed(3));
                // Zoom out if dragging near right edge
                if (x > 95 && tick < MAX_TICK) setTickStep(prev => prev * 1.1);
                // Zoom in if both handles are within the central 30-70% range
                const minPercent = getXForTick(minTick);
                if (x < 70 && minPercent > 30) setTickStep(prev => Math.max(prev / 1.1, 1));
            }
        }
    }, [dragging, minTick, maxTick, getXForTick, getTickForX]);

    const handleMouseUp = useCallback(() => {
        setDragging(null);
    }, []);

    useEffect(() => {
        if (dragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging, handleMouseMove, handleMouseUp]);

    return (
        <div className="space-y-6">
            {/* 1. Select Pair & Fee Tier */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">1</span>
                        Pool Configuration
                    </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-xl p-4 border border-border flex items-center justify-between group hover:border-primary transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full border-2 border-background bg-black relative overflow-hidden shrink-0">
                                <Image
                                    alt="Token A"
                                    fill
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrETAEdMSL3H499w94eluhcBFBsEKq6H4oIZhYfLaSHiYOMv81BQbHAy6PZ7aey9kD_UpolsmVdUdpfKoTz3OptcGWc4ijucd8WnhH0n2fJnwzYRwdZOUjdqrkbW_w7QXSsMIjFy5u2OM0Ff-_mT5HIVQ-bqlg1u_vzGWvOxSiLYr7Z816Y4IFIAHyZYDtNcIg1tciD8OEab2BjraEulEnwlk4s317vYzlPfis28uXg7B1CYqpILSnICDXLQr1DJmPF_rCEqc0OI0"
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-foreground text-xs">Token A</span>
                                <span className="text-[9px] font-mono text-muted-foreground truncate max-w-[120px]">{market.mint_address_a}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4 border border-border flex items-center justify-between group hover:border-primary transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full border-2 border-background bg-white relative overflow-hidden shrink-0">
                                <Image
                                    alt="Token B"
                                    fill
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxwkXGm9PHXmlFjOlqHsxu0zI_SEniw76tPKnm4KkYgtuxAc2_9YpDOr2SSBo2jGKK8FG7h150SpojXCwqP2jDhl03QlyhhnOqDpw4tgW1ASM3YQF0nVqaspCyMSo6LrC6AEaP2cZBhijYn9Sj_6qwY8ptexThUX725a3IHt9Y3-kag9n0dT1TPehsMK4XHg-czD-ZfYjq5EH9R7p-sO-mjO5TkJop9rJFeemFhmz9kxjn8oi_QjvivQGYMkAw4WavVNdW081DlGM"
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-foreground text-xs">Token B</span>
                                <span className="text-[9px] font-mono text-muted-foreground truncate max-w-[120px]">{market.mint_address_b}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Set Price Range (Interactive Histogram) */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">2</span>
                        Set Price Range
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                        Current Price: <span className="text-foreground font-mono">{currentPrice.toFixed(4)}</span>
                    </div>
                </div>

                <div
                    ref={histogramRef}
                    className="h-44 w-full bg-muted/10 rounded-xl border border-border flex flex-col relative cursor-crosshair select-none pt-4"
                >
                    {/* Bars and Labels */}
                    <div className="flex-1 flex w-full items-end gap-[1px] pb-6 px-1 relative">
                        {bars.map((bar, i) => (
                            <div
                                key={i}
                                className="flex-1 flex flex-col items-center justify-end h-full group"
                            >
                                <div
                                    className={`w-full transition-all duration-300 ${bar.tick < currentTick ? 'bg-secondary/15' : 'bg-primary/15'}`}
                                    style={{
                                        height: `${Math.max(4, (bar.liquidity / maxLiquidity) * 80)}%`,
                                        borderRadius: '1px 1px 0 0'
                                    }}
                                ></div>
                                {/* Periodic Tick Labels */}
                                {i % 20 === 0 && (
                                    <div className="absolute bottom-[-16px] text-[8px] font-mono text-muted-foreground whitespace-nowrap">
                                        {Math.round(bar.tick)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Current Price Marker */}
                    <div className="absolute top-0 bottom-6 w-px bg-primary/30 z-10" style={{ left: '50%' }}>
                        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-primary rounded-full shadow-glow-primary"></div>
                    </div>

                    {/* Range Overlay */}
                    <div
                        className="absolute top-0 bottom-6 bg-primary/10 z-0 pointer-events-none border-x border-primary/20"
                        style={{
                            left: `${getXForTick(minTick)}%`,
                            width: `${getXForTick(maxTick) - getXForTick(minTick)}%`
                        }}
                    ></div>

                    {/* Min Handle (Green) */}
                    <div
                        className="absolute top-0 bottom-6 w-2 cursor-ew-resize z-40 group -ml-1"
                        style={{ left: `${getXForTick(minTick)}%` }}
                        onMouseDown={() => setDragging('min')}
                    >
                        <div className="h-full w-0.5 mx-auto bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-green-500 border-2 border-background scale-50 group-hover:scale-100 transition-transform"></div>
                    </div>

                    {/* Max Handle (Red) */}
                    <div
                        className="absolute top-0 bottom-6 w-2 cursor-ew-resize z-40 group -ml-1"
                        style={{ left: `${getXForTick(maxTick)}%` }}
                        onMouseDown={() => setDragging('max')}
                    >
                        <div className="h-full w-0.5 mx-auto bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 border-2 border-background scale-50 group-hover:scale-100 transition-transform"></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-xl p-4 border border-border group hover:border-green-500/30 transition-colors">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Min Price (SOL per USDC)</div>
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => {
                                    const newTick = Math.max(minTick - 1, 0);
                                    setMinPrice(tickToPrice(newTick).toFixed(3));
                                }}
                                className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-muted"
                            >
                                <RemoveIcon fontSize="small" />
                            </button>
                            <input className="bg-transparent text-center font-mono font-bold text-lg w-full focus:outline-none" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                            <button
                                onClick={() => {
                                    const newTick = Math.min(minTick + 1, maxTick - 1);
                                    setMinPrice(tickToPrice(newTick).toFixed(3));
                                }}
                                className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-muted"
                            >
                                <AddIcon fontSize="small" />
                            </button>
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground mt-2 flex justify-center">
                            Tick: {minTick}
                        </div>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4 border border-border group hover:border-red-500/30 transition-colors">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Max Price (SOL per USDC)</div>
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => {
                                    const newTick = Math.max(maxTick - 1, minTick + 1);
                                    setMaxPrice(tickToPrice(newTick).toFixed(3));
                                }}
                                className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-muted"
                            >
                                <RemoveIcon fontSize="small" />
                            </button>
                            <input className="bg-transparent text-center font-mono font-bold text-lg w-full focus:outline-none" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                            <button
                                onClick={() => {
                                    const newTick = Math.min(maxTick + 1, MAX_TICK);
                                    setMaxPrice(tickToPrice(newTick).toFixed(3));
                                }}
                                className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-muted"
                            >
                                <AddIcon fontSize="small" />
                            </button>
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground mt-2 flex justify-center">
                            Tick: {maxTick}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Deposit Amount & Liquidity */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">3</span>
                    Deposit Amount
                </h4>

                <div className="bg-muted/30 rounded-xl p-4 border border-border/50 group focus-within:border-primary transition-colors">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Liquidity Amount (L)</div>
                    <input
                        className="bg-transparent font-mono font-bold text-xl w-full focus:outline-none"
                        placeholder="Enter liquidity amount..."
                        value={formData.liquidity}
                        onChange={e => setFormData(prev => ({ ...prev, liquidity: e.target.value }))}
                    />
                    <div className="text-[9px] text-muted-foreground mt-1 italic">Determines the required token amounts below</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`bg-card p-4 rounded-xl border transition-all ${isAboveRange ? 'opacity-40 grayscale-[0.5]' : 'border-border shadow-sm'}`}>
                        <div className="flex justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full shadow-sm relative overflow-hidden">
                                    <Image fill src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrETAEdMSL3H499w94eluhcBFBsEKq6H4oIZhYfLaSHiYOMv81BQbHAy6PZ7aey9kD_UpolsmVdUdpfKoTz3OptcGWc4ijucd8WnhH0n2fJnwzYRwdZOUjdqrkbW_w7QXSsMIjFy5u2OM0Ff-_mT5HIVQ-bqlg1u_vzGWvOxSiLYr7Z816Y4IFIAHyZYDtNcIg1tciD8OEab2BjraEulEnwlk4s317vYzlPfis28uXg7B1CYqpILSnICDXLQr1DJmPF_rCEqc0OI0" alt="SOL" className="object-cover" />
                                </div>
                                <span className="font-bold text-sm">SOL</span>
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Bal: {userTokenAccounts.find(a => a.token_mint_address === market.mint_address_a)?.balance || "0.00"}</span>
                        </div>
                        <div className="text-2xl font-mono font-bold text-foreground">
                            {(() => {
                                if (isAboveRange) return "0.000";
                                const L = parseFloat(formData.liquidity) || 0;
                                const pMin = Math.max(parseFloat(minPrice), 0.00000001);
                                const pMax = Math.max(parseFloat(maxPrice), pMin + 0.00000001);
                                const pCurr = currentPrice;

                                let amount;
                                if (pCurr < pMin) {
                                    amount = L * (1 / Math.sqrt(pMin) - 1 / Math.sqrt(pMax));
                                } else {
                                    amount = L * (1 / Math.sqrt(pCurr) - 1 / Math.sqrt(pMax));
                                }
                                return amount.toFixed(4);
                            })()}
                        </div>
                    </div>
                    <div className={`bg-card p-4 rounded-xl border transition-all ${isBelowRange ? 'opacity-40 grayscale-[0.5]' : 'border-border shadow-sm'}`}>
                        <div className="flex justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full shadow-sm relative overflow-hidden">
                                    <Image fill src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxwkXGm9PHXmlFjOlqHsxu0zI_SEniw76tPKnm4KkYgtuxAc2_9YpDOr2SSBo2jGKK8FG7h150SpojXCwqP2jDhl03QlyhhnOqDpw4tgW1ASM3YQF0nVqaspCyMSo6LrC6AEaP2cZBhijYn9Sj_6qwY8ptexThUX725a3IHt9Y3-kag9n0dT1TPehsMK4XHg-czD-ZfYjq5EH9R7p-sO-mjO5TkJop9rJFeemFhmz9kxjn8oi_QjvivQGYMkAw4WavVNdW081DlGM" alt="USDC" className="object-cover" />
                                </div>
                                <span className="font-bold text-sm">USDC</span>
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Bal: {userTokenAccounts.find(a => a.token_mint_address === market.mint_address_b)?.balance || "0.00"}</span>
                        </div>
                        <div className="text-2xl font-mono font-bold text-foreground">
                            {(() => {
                                if (isBelowRange) return "0.000";
                                const L = parseFloat(formData.liquidity) || 0;
                                const pMin = Math.max(parseFloat(minPrice), 0.00000001);
                                const pMax = Math.max(parseFloat(maxPrice), pMin + 0.00000001);
                                const pCurr = currentPrice;

                                let amount;
                                if (pCurr > pMax) {
                                    amount = L * (Math.sqrt(pMax) - Math.sqrt(pMin));
                                } else {
                                    amount = L * (Math.sqrt(pCurr) - Math.sqrt(pMin));
                                }
                                return amount.toFixed(4);
                            })()}
                        </div>
                    </div>
                </div>
                {(isBelowRange || isAboveRange) && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-[10px] font-medium text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                        <HelpOutlineIcon fontSize="inherit" />
                        {isBelowRange ? "Price is below range. Only SOL required." : "Price is above range. Only USDC required."}
                    </div>
                )}
            </div>

            <button
                onClick={handleAddLiquidity}
                disabled={!account?.address}
                className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all text-lg tracking-tight ${account?.address ? "bg-primary hover:bg-primary/90 text-white shadow-glow-primary active:scale-[0.98]" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
            >
                {account?.address ? "Add Liquidity" : "Connect Wallet"}
            </button>
        </div>
    );
}
