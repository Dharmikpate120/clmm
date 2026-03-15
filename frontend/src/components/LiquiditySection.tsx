"use client";

import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Modal from "@/components/Modal";
import AddLiquidityModal from "@/components/modals/AddLiquidityModal";
import WithdrawLiquidityModal from "@/components/modals/WithdrawLiquidityModal";
import { Market } from "@/lib/types/market";

export default function LiquiditySection({ market }: { market: Market }) {
    const [activeModal, setActiveModal] = useState<"add" | "withdraw" | null>(null);

    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setActiveModal("add")}
                    className="px-4 py-2.5 bg-background border border-input rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 cursor-pointer"
                >
                    <AddIcon />
                    Add Liquidity
                </button>
                <button
                    onClick={() => setActiveModal("withdraw")}
                    className="px-4 py-2.5 bg-background border border-input rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 cursor-pointer"
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
                <AddLiquidityModal market={market} />
            </Modal>

            <Modal
                isOpen={activeModal === "withdraw"}
                onClose={() => setActiveModal(null)}
                title="Withdraw Liquidity"
            >
                <WithdrawLiquidityModal market={market} />
            </Modal>
        </>
    );
}
