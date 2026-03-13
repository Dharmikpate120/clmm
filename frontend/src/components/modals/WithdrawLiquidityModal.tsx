"use client";

import { useState } from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import VerifiedIcon from "@mui/icons-material/Verified";
import type { AmmWithdrawLiquidity } from "@/lib/types";
import withdrawLiquidity from "@/lib/actions/withdrawLiquidity";

const initialWithdrawState: AmmWithdrawLiquidity = {
    token_a_mint_account: "6rxGJAE7xLLSogfhLpnJNixbBoAAosNSn2KAVcuJKg8d",
    token_b_mint_account: "FYAehxG1mMrVd5vftv72TdkKfjkj6VzwwmbfpCp6nxhY",
    provider_token_a_account: "AXNfEoew1PRokiSCPzAAQunHJMP7jr1zSxPcFfi2zy8q",
    provider_token_b_account: "Ds7GLgYzr2i3J4KFA4TPbFyJgFG2GwfSLvV1xYSbi96H",
    minimum_liquidity: "100",
    provider_account: "GK5uAKRv4Abn4szsDuhvcBDoYp8cwAcggkkynMjmSZf3",
    nft_mint_account: "86Mmzwup1gymUkSdF4P8FwAjwVASQsPeQzRRCZHHt5dM",
};

export default function WithdrawLiquidityModal() {
    const [step, setStep] = useState(2);
    const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
    const [withdrawPercent, setWithdrawPercent] = useState(50);
    const [withdrawalData, setWithdrawalData] = useState<AmmWithdrawLiquidity>(initialWithdrawState);

    const handleWithdrawalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setWithdrawalData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const submitWithdrawalState =async () => {
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
                        placeholder="Search by ID..."
                        type="text"
                    />
                </div>
                <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        Your Positions (2)
                    </h4>
                    <div
                        className={`border rounded-xl p-4 cursor-pointer transition-all ${selectedPosition === "291"
                            ? "border-primary bg-primary/5 dark:bg-primary/10"
                            : "border-border hover:border-input"
                            }`}
                        onClick={() => setSelectedPosition("291")}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs">
                                    #291
                                </div>
                                <span className="font-bold text-foreground">
                                    SOL-USDC
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    In Range
                                </span>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-foreground">
                                    $1,248.52
                                </div>
                                <div className="text-xs text-secondary">+$12.48 Fees</div>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 font-mono">
                            <span>Min: $138.2</span>
                            <span>Max: $148.5</span>
                        </div>
                    </div>

                    <div
                        className={`border rounded-xl p-4 cursor-pointer transition-all ${selectedPosition === "184"
                            ? "border-primary bg-primary/5 dark:bg-primary/10"
                            : "border-border hover:border-input"
                            }`}
                        onClick={() => setSelectedPosition("184")}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs">
                                    #184
                                </div>
                                <span className="font-bold text-foreground">
                                    SOL-USDC
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                    Out of Range
                                </span>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-foreground">
                                    $542.10
                                </div>
                                <div className="text-xs text-secondary">+$4.20 Fees</div>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 font-mono">
                            <span>Min: $120.0</span>
                            <span>Max: $135.0</span>
                        </div>
                    </div>
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
            {/* <div className="bg-muted/50 rounded-xl p-4 border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                        #{selectedPosition}
                    </div>
                    <div>
                        <div className="font-bold text-foreground">
                            SOL-USDC Position
                        </div>
                        <div className="text-xs text-gray-500">Min: $138.2 • Max: $148.5</div>
                    </div>
                </div>
                <button
                    onClick={() => setStep(1)}
                    className="text-primary text-sm font-medium hover:underline cursor-pointer"
                >
                    Change
                </button>
            </div> */}

            {/* <div className="space-y-2">
                <div className="flex justify-between">
                    <label className="text-sm font-bold text-foreground">
                        Withdraw Amount
                    </label>
                    <span className="text-sm font-bold text-primary">{withdrawPercent}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={withdrawPercent}
                    onChange={(e) => setWithdrawPercent(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-500">
                    <button onClick={() => setWithdrawPercent(25)} className="hover:text-primary cursor-pointer">25%</button>
                    <button onClick={() => setWithdrawPercent(50)} className="hover:text-primary cursor-pointer">50%</button>
                    <button onClick={() => setWithdrawPercent(75)} className="hover:text-primary cursor-pointer">75%</button>
                    <button onClick={() => setWithdrawPercent(100)} className="hover:text-primary cursor-pointer">Max</button>
                </div>
            </div> */}

            {/* <div className="bg-muted/50 rounded-xl p-4 border border-border space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    You Receive
                </h4>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img
                            alt="SOL"
                            className="w-6 h-6 rounded-full"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrETAEdMSL3H499w94eluhcBFBsEKq6H4oIZhYfLaSHiYOMv81BQbHAy6PZ7aey9kD_UpolsmVdUdpfKoTz3OptcGWc4ijucd8WnhH0n2fJnwzYRwdZOUjdqrkbW_w7QXSsMIqFy5u2OM0Ff-_mT5HIVQ-bqlg1u_vzGWvOxSiLYr7Z816Y4IFIAHyZYDtNcIg1tciD8OEab2BjraEulEnwlk4s317vYzlPfis28uXg7B1CYqpILSnICDXLQr1DJmPF_rCEqc0OI0"
                        />
                        <span className="font-bold text-foreground">
                            1.20 SOL
                        </span>
                    </div>
                    <div className="font-mono text-gray-500">~$171.60</div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img
                            alt="USDC"
                            className="w-6 h-6 rounded-full"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxwkXGm9PHXmlFjOlqHsxu0zI_SEniw76tPKnm4KkYgtuxAc2_9YpDOr2SSBo2jGKK8FG7h150SpojXCwqP2jDhl03QlyhhnOqDpw4tgW1ASM3YQF0nVqaspCyMSo6LrC6AEaP2cZBhijYn9Sj_6qwY8ptexThUX725a3IHt9Y3-kag9n0dT1TPehsMK4XHg-czD-ZfYjq5EH9R7p-sO-mjO5TkJop9rJFeemFhmz9kxjn8oi_QjvivQGYMkAw4WavVNdW081DlGM"
                        />
                        <span className="font-bold text-foreground">
                            521.40 USDC
                        </span>
                    </div>
                    <div className="font-mono text-gray-500">~$521.40</div>
                </div>
                <div className="pt-3 border-t border-border flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-secondary text-sm font-bold">Unclaimed Fees</span>
                    </div>
                    <div className="font-mono text-foreground font-bold">~$6.24</div>
                </div>
            </div> */}

            <div className="space-y-4 bg-muted/30 rounded-xl p-4 border border-border">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Withdrawal Details
                </h4>
                
                <div>
                    <label className="text-sm font-bold text-foreground block mb-2">
                        Token A Mint Account
                    </label>
                    <input
                        type="text"
                        name="token_a_mint_account"
                        value={withdrawalData.token_a_mint_account}
                        onChange={handleWithdrawalInputChange}
                        placeholder="Enter token A mint account"
                        className="w-full bg-muted/50 text-foreground placeholder-gray-500 border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                    />
                </div>

                <div>
                    <label className="text-sm font-bold text-foreground block mb-2">
                        Token B Mint Account
                    </label>
                    <input
                        type="text"
                        name="token_b_mint_account"
                        value={withdrawalData.token_b_mint_account}
                        onChange={handleWithdrawalInputChange}
                        placeholder="Enter token B mint account"
                        className="w-full bg-muted/50 text-foreground placeholder-gray-500 border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                    />
                </div>

                <div>
                    <label className="text-sm font-bold text-foreground block mb-2">
                        Provider Token A Account
                    </label>
                    <input
                        type="text"
                        name="provider_token_a_account"
                        value={withdrawalData.provider_token_a_account}
                        onChange={handleWithdrawalInputChange}
                        placeholder="Enter provider token A account"
                        className="w-full bg-muted/50 text-foreground placeholder-gray-500 border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                    />
                </div>

                <div>
                    <label className="text-sm font-bold text-foreground block mb-2">
                        Provider Token B Account
                    </label>
                    <input
                        type="text"
                        name="provider_token_b_account"
                        value={withdrawalData.provider_token_b_account}
                        onChange={handleWithdrawalInputChange}
                        placeholder="Enter provider token B account"
                        className="w-full bg-muted/50 text-foreground placeholder-gray-500 border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                    />
                </div>

                <div>
                    <label className="text-sm font-bold text-foreground block mb-2">
                        Minimum Liquidity
                    </label>
                    <input
                        type="text"
                        name="minimum_liquidity"
                        value={withdrawalData.minimum_liquidity}
                        onChange={handleWithdrawalInputChange}
                        placeholder="Enter minimum liquidity"
                        className="w-full bg-muted/50 text-foreground placeholder-gray-500 border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                    />
                </div>

                <div>
                    <label className="text-sm font-bold text-foreground block mb-2">
                        Provider Account
                    </label>
                    <input
                        type="text"
                        name="provider_account"
                        value={withdrawalData.provider_account}
                        onChange={handleWithdrawalInputChange}
                        placeholder="Enter provider account"
                        className="w-full bg-muted/50 text-foreground placeholder-gray-500 border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                    />
                </div>

                <div>
                    <label className="text-sm font-bold text-foreground block mb-2">
                        NFT Mint Account
                    </label>
                    <input
                        type="text"
                        name="nft_mint_account"
                        value={withdrawalData.nft_mint_account}
                        onChange={handleWithdrawalInputChange}
                        placeholder="Enter NFT mint account"
                        className="w-full bg-muted/50 text-foreground placeholder-gray-500 border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                    />
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
