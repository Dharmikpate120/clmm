"use client";

import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Modal from "@/components/Modal";
import AddLiquidityModal from "@/components/modals/AddLiquidityModal";
import WithdrawLiquidityModal from "@/components/modals/WithdrawLiquidityModal";
import { Market } from "@/lib/types/market";

const mockMarket: Market = {
    id: "sol-usdc",
    market_address: "GQFLMUdzy8sCjfg63W9JQWY1fP91sLvprwvZ7nuwriTh",
    mint_address_a: "GQFLMUdzy8sCjfg63W9JQWY1fP91sLvprwvZ7nuwriTh",
    mint_address_b: "DXtGjeqJN8QJCZfsSemZJPGbr2B3EM1katBWhGmGRro6",
    current_price: 143.25,
    current_tick: 49652,
    fees: 0,
    active_liquidity: 0,
    pool_address_a: "FvwCPiRmfHoRWmQ4nX6ywRa3x2g7PgisbGwyY33xE6uU",
    pool_address_b: "3UaV9LNXeC2bgxUdKj1jEbuDUYgMADzKDPB3YZ3ZeNWv",
    token_amount_a: "0",
    token_amount_b: "0",
};

export default function LiquiditySection() {
    const [activeModal, setActiveModal] = useState<"add" | "withdraw" | null>(null);

    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setActiveModal("add")}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-glow-primary hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                    <AddIcon />
                    Add Liquidity
                </button>
                <button
                    onClick={() => setActiveModal("withdraw")}
                    className="flex items-center justify-center gap-2 bg-surface-dark hover:bg-surface-darker border border-gray-700 hover:border-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                    <RemoveIcon />
                    Withdraw
                </button>
            </div>

            <Modal
                isOpen={activeModal === "add"}
                onClose={() => setActiveModal(null)}
                title="Add Liquidity"
            >
                <AddLiquidityModal market={mockMarket} />
            </Modal>

            <Modal
                isOpen={activeModal === "withdraw"}
                onClose={() => setActiveModal(null)}
                title="Withdraw Liquidity"
            >
                <WithdrawLiquidityModal market={mockMarket} />
            </Modal>
        </>
    );
}
