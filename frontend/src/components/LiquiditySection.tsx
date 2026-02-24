"use client";

import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Modal from "@/components/Modal";
import AddLiquidityModal from "@/components/modals/AddLiquidityModal";
import WithdrawLiquidityModal from "@/components/modals/WithdrawLiquidityModal";

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
                    className="flex items-center justify-center gap-2 bg-card hover:bg-muted/50 border border-border text-foreground font-bold py-4 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
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
                <AddLiquidityModal />
            </Modal>

            <Modal
                isOpen={activeModal === "withdraw"}
                onClose={() => setActiveModal(null)}
                title="Withdraw Liquidity"
            >
                <WithdrawLiquidityModal />
            </Modal>
        </>
    );
}
