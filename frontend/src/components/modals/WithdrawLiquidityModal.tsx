"use client";

import { useEffect, useState } from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import VerifiedIcon from "@mui/icons-material/Verified";
import { useWalletUi } from "@wallet-ui/react";
import type { AmmWithdrawLiquidity } from "@/lib/types";
import { Market } from "@/lib/types/market";
import { Position, TokenAccount } from "@/lib/types/position";
import withdrawLiquidity from "@/lib/actions/withdrawLiquidity";
import { ellipsify } from "@/lib/utils";

const TICK_BASE = 1.0001;

function tickToPrice(tick: number): number {
    return Math.pow(TICK_BASE, tick);
}

const initialWithdrawState: AmmWithdrawLiquidity = {
    token_a_mint_account: "",
    token_b_mint_account: "",
    amm_token_account: "",
    provider_token_a_account: "",
    provider_token_b_account: "",
    minimum_liquidity: "0",
    provider_account: "",
    nft_mint_account: "",
};

export default function WithdrawLiquidityModal({ market }: { market: Market }) {
    const [step, setStep] = useState(1);
    const { account } = useWalletUi();
    const [positions, setPositions] = useState<Position[]>([]);
    const [userTokenAccounts, setUserTokenAccounts] = useState<TokenAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
    const [withdrawPercent, setWithdrawPercent] = useState(50);
    const [withdrawalData, setWithdrawalData] = useState<AmmWithdrawLiquidity>({
        ...initialWithdrawState,
        token_a_mint_account: market.mint_address_a,
        token_b_mint_account: market.mint_address_b,
        amm_token_account: market.market_address,
        provider_account: account?.address || ""
    });

    useEffect(() => {
        if (!account?.address) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch Positions
                const posRes = await fetch(`/api/user/positions?user_address=${account?.address}&market_id=${market.id}`);
                const posData = await posRes.json();
                setPositions(posData.positions || []);

                // Fetch Token Accounts
                const tokenRes = await fetch(`/api/user/token-accounts?user_address=${account.address}`);
                const tokenData = await tokenRes.json();
                const accounts = tokenData.tokenAccounts || [];
                setUserTokenAccounts(accounts);

                // Auto-fill provider token accounts if possible
                const accA = accounts.find((a: TokenAccount) => a.token_mint_address === market.mint_address_a);
                const accB = accounts.find((a: TokenAccount) => a.token_mint_address === market.mint_address_b);

                setWithdrawalData(prev => ({
                    ...prev,
                    amm_token_account: market.market_address,
                    provider_token_a_account: accA?.token_address || "",
                    provider_token_b_account: accB?.token_address || "",
                    provider_account: account.address
                }));
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [account?.address, market.id, market.mint_address_a, market.mint_address_b]);

    useEffect(() => {
        if (selectedPosition && account?.address) {
            const amount = (selectedPosition.liquidity * (withdrawPercent / 100));
            const accA = userTokenAccounts.find((a: TokenAccount) => a.token_mint_address === market.mint_address_a);
            const accB = userTokenAccounts.find((a: TokenAccount) => a.token_mint_address === market.mint_address_b);

            setWithdrawalData({
                token_a_mint_account: market.mint_address_a,
                token_b_mint_account: market.mint_address_b,
                amm_token_account: market.market_address,
                provider_token_a_account: accA?.token_address || "",
                provider_token_b_account: accB?.token_address || "",
                minimum_liquidity: amount.toFixed(4),
                provider_account: account.address,
                nft_mint_account: selectedPosition.nft_address,
            });
        }
    }, [selectedPosition, withdrawPercent, account?.address, market, userTokenAccounts]);

    const handleLiquidityAmountChange = (val: string) => {
        if (!selectedPosition) return;
        const numVal = parseFloat(val) || 0;
        const clampedVal = Math.min(Math.max(numVal, 0), selectedPosition.liquidity);

        setWithdrawalData(prev => ({
            ...prev,
            minimum_liquidity: clampedVal.toString()
        }));

        if (selectedPosition.liquidity > 0) {
            setWithdrawPercent(Math.round((clampedVal / selectedPosition.liquidity) * 100));
        }
    };

    const adjustLiquidity = (delta: number) => {
        const current = parseFloat(withdrawalData.minimum_liquidity) || 0;
        handleLiquidityAmountChange((current + delta).toString());
    };

    const handleWithdrawalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setWithdrawalData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const submitWithdrawalState = async () => {
        const instruction = await withdrawLiquidity(withdrawalData);
        console.log(instruction);
        setWithdrawalData(initialWithdrawState);
    };

    // Step 1: Select Position
    if (step === 1) {
        return (
            <div className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-xl mb-4">
                    <input
                        className="w-full bg-transparent focus:outline-none text-foreground"
                        placeholder="Search by ID or Address..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        Your Positions ({positions.length})
                    </h4>

                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground animate-pulse">Loading positions...</div>
                    ) : positions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                            No active positions found in this market.
                        </div>
                    ) : (
                        positions
                            .filter(pos =>
                                pos.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                pos.position_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                pos.nft_address.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((pos) => {
                                const isInRange = market.current_tick >= pos.start_tick && market.current_tick <= pos.end_tick;
                                const minPrice = tickToPrice(pos.start_tick);
                                const maxPrice = tickToPrice(pos.end_tick);

                                return (
                                    <div
                                        key={pos.id}
                                        className={`border rounded-xl p-4 cursor-pointer transition-all ${selectedPosition?.id === pos.id
                                            ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm"
                                            : "border-border hover:border-input bg-card/50"
                                            }`}
                                        onClick={() => setSelectedPosition(pos)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-[10px] ${isInRange ? "bg-gradient-to-br from-primary to-secondary" : "bg-muted text-muted-foreground"}`}>
                                                    NFT
                                                </div>
                                                <div>
                                                    <div className="font-bold text-foreground text-sm">
                                                        {ellipsify(pos.position_address)}
                                                    </div>
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit mt-1 ${isInRange
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${isInRange ? "bg-green-500" : "bg-yellow-500"}`}></span>
                                                        {isInRange ? "In Range" : "Out of Range"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-foreground font-mono">
                                                    {pos.liquidity.toFixed(2)} Liq
                                                </div>
                                                <div className="text-[10px] text-muted-foreground font-mono">#{ellipsify(pos.id, 3)}</div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-[11px] text-gray-500 font-mono mt-3 pt-3 border-t border-border/50">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] uppercase font-bold text-muted-foreground/60 mb-0.5">Min Price</span>
                                                <span className="text-foreground">${minPrice.toFixed(3)}</span>
                                            </div>
                                            <div className="flex flex-col text-right">
                                                <span className="text-[9px] uppercase font-bold text-muted-foreground/60 mb-0.5">Max Price</span>
                                                <span className="text-foreground">${maxPrice.toFixed(3)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                    )}
                </div>

                <button
                    disabled={!selectedPosition}
                    onClick={() => setStep(2)}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${selectedPosition
                        ? "bg-primary hover:bg-primary/90 shadow-glow-primary cursor-pointer"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                        }`}
                >
                    Select Position <ArrowForwardIcon fontSize="small" />
                </button>
            </div>
        );
    }

    // Step 2: Confirm & Amount
    return (
        <div className="space-y-6">
            <div className="bg-muted/50 rounded-xl p-4 border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs">
                        NFT
                    </div>
                    <div>
                        <div className="font-bold text-foreground">
                            {ellipsify(selectedPosition?.position_address)}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                            Total Liq: <span className="text-foreground font-bold">{selectedPosition?.liquidity.toFixed(4)}</span>
                        </div>
                        <div className="text-[10px] text-gray-400">Min: ${tickToPrice(selectedPosition?.start_tick || 0).toFixed(2)} • Max: ${tickToPrice(selectedPosition?.end_tick || 0).toFixed(2)}</div>
                    </div>
                </div>
                <button
                    onClick={() => setStep(1)}
                    className="text-primary text-sm font-medium hover:underline cursor-pointer"
                >
                    Change
                </button>
            </div>

            <div className="bg-muted/30 rounded-xl p-6 border border-border space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-foreground uppercase tracking-wider">
                        Withdraw Amount
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground mr-2">{withdrawPercent}% of total</span>
                        <div className="flex items-center bg-card rounded-lg border border-border overflow-hidden">
                            <button
                                onClick={() => adjustLiquidity(-1)}
                                className="px-3 py-2 hover:bg-muted text-foreground transition-colors"
                            >
                                -
                            </button>
                            <input
                                type="text"
                                value={withdrawalData.minimum_liquidity}
                                onChange={(e) => handleLiquidityAmountChange(e.target.value)}
                                className="w-24 bg-transparent text-center font-mono font-bold text-foreground focus:outline-none border-x border-border"
                            />
                            <button
                                onClick={() => adjustLiquidity(1)}
                                className="px-3 py-2 hover:bg-muted text-foreground transition-colors"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={withdrawPercent}
                        onChange={(e) => setWithdrawPercent(Number(e.target.value))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-gray-400">
                        <button onClick={() => setWithdrawPercent(0)} className="hover:text-primary transition-colors">0%</button>
                        <button onClick={() => setWithdrawPercent(25)} className="hover:text-primary transition-colors">25%</button>
                        <button onClick={() => setWithdrawPercent(50)} className="hover:text-primary transition-colors">50%</button>
                        <button onClick={() => setWithdrawPercent(75)} className="hover:text-primary transition-colors">75%</button>
                        <button onClick={() => setWithdrawPercent(100)} className="hover:text-primary transition-colors uppercase">Max</button>
                    </div>
                </div>
            </div>

            <div className="bg-muted/30 rounded-xl p-4 border border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <VerifiedIcon className="text-primary" fontSize="inherit" />
                    <span>Transaction will be signed by your connected wallet</span>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground">
                    {ellipsify(account?.address, 4)}
                </div>
            </div>



            <button
                onClick={() => {
                    submitWithdrawalState();
                    // TODO: Add API call to confirm withdrawal here
                }}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-glow-primary transition-all text-lg cursor-pointer"
            >
                Confirm Withdrawal
            </button>
        </div>
    );
}
