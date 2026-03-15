"use client";

import { useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CloseIcon from "@mui/icons-material/Close";
import { SwapTokens } from "@/lib/types";
import swapTokens from "@/lib/actions/swapTokens";

// Initial state object
const INITIAL_SWAP_STATE: SwapTokens = {
  token_a_mint_account: "6rxGJAE7xLLSogfhLpnJNixbBoAAosNSn2KAVcuJKg8d",
  token_b_mint_account: "qvRjw3C5RsjYW1Nb1NNjnJ7pisNKRtdmHaKSjmcCMPT",
  
  swapper_token_a_account: "AXNfEoew1PRokiSCPzAAQunHJMP7jr1zSxPcFfi2zy8q",
  swapper_token_b_account: "FB3xxJSWHWu8rwb4kUbc8En9c33yfBF4VCxZrjMpUUa1",
  
  token_in_mint: "6rxGJAE7xLLSogfhLpnJNixbBoAAosNSn2KAVcuJKg8d",
  token_out_mint: "qvRjw3C5RsjYW1Nb1NNjnJ7pisNKRtdmHaKSjmcCMPT",
  
  max_amount_in: "1",
  minimum_amount_out: "20",
  swapper_account: "GK5uAKRv4Abn4szsDuhvcBDoYp8cwAcggkkynMjmSZf3",
};

import { Market } from "@/lib/types/market";

export default function SwapCard({ market }: { market: Market }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [swapFormData, setSwapFormData] = useState<SwapTokens>({
    token_a_mint_account: market.mint_address_a,
    token_b_mint_account: market.mint_address_b,
    swapper_token_a_account: "", 
    swapper_token_b_account: "",
    token_in_mint: market.mint_address_a,
    token_out_mint: market.mint_address_b,
    max_amount_in: "1",
    minimum_amount_out: "20",
    swapper_account: "",
  });

  // Handler for all input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof SwapTokens
  ) => {
    const { value } = e.target;
    setSwapFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await swapTokens(swapFormData);
    console.log("result:", result);
    // Handle form submission logic here
    // Reset form after submission
    // setSwapFormData(INITIAL_SWAP_STATE);
    setIsModalOpen(false);
  };

  // Handler to close modal and reset form
  const handleCloseModal = () => {
    setSwapFormData(INITIAL_SWAP_STATE);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <div className="flex bg-muted/50 rounded-lg p-1">
                    <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-background shadow-sm text-foreground cursor-pointer transition-colors">
                        Swap
                    </button>
                    <button className="px-4 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                        Limit
                    </button>
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer transition-colors">
                    <SettingsIcon fontSize="small" />
                </button>
            </div>

            <div className="space-y-4">
                <div className="bg-muted/30 rounded-xl p-4 border border-border">
                    <div className="flex justify-between mb-2">
                        <span className="text-xs text-muted-foreground">
                            You Pay
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            Balance: <span className="text-foreground">0.00</span>
                            <button className="text-primary text-[10px] font-bold uppercase cursor-pointer">
                                Max
                            </button>
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <input
                            className="bg-transparent text-2xl font-bold text-foreground focus:outline-none w-1/2 placeholder:text-muted-foreground/50"
                            placeholder="0.00"
                            type="text"
                        />
                        <button className="flex items-center gap-2 bg-background hover:bg-muted/50 border border-border rounded-lg px-3 py-1.5 transition-colors cursor-pointer">
                            <img
                                alt="SOL"
                                className="w-5 h-5 rounded-full"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrETAEdMSL3H499w94eluhcBFBsEKq6H4oIZhYfLaSHiYOMv81BQbHAy6PZ7aey9kD_UpolsmVdUdpfKoTz3OptcGWc4ijucd8WnhH0n2fJnwzYRwdZOUjdqrkbW_w7QXSsMIqFy5u2OM0Ff-_mT5HIVQ-bqlg1u_vzGWvOxSiLYr7Z816Y4IFIAHyZYDtNcIg1tciD8OEab2BjraEulEnwlk4s317vYzlPfis28uXg7B1CYqpILSnICDXLQr1DJmPF_rCEqc0OI0"
                            />
                            <span className="font-bold text-sm text-foreground">
                                SOL
                            </span>
                            <svg
                                className="w-3 h-3 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M19 9l-7 7-7-7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                ></path>
                            </svg>
                        </button>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">≈ $0.00</div>
                </div>

                <div className="flex justify-center -my-2 relative z-10">
                    <button className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors cursor-pointer shadow-sm">
                        <SwapVertIcon fontSize="small" />
                    </button>
                </div>

                <div className="bg-muted/30 rounded-xl p-4 border border-border">
                    <div className="flex justify-between mb-2">
                        <span className="text-xs text-muted-foreground">
                            You Receive
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Balance: <span className="text-foreground">0.00</span>
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <input
                            className="bg-transparent text-2xl font-bold text-foreground focus:outline-none w-1/2 placeholder:text-muted-foreground/50"
                            placeholder="0.00"
                            type="text"
                        />
                        <button className="flex items-center gap-2 bg-background hover:bg-muted/50 border border-border rounded-lg px-3 py-1.5 transition-colors cursor-pointer">
                            <img
                                alt="USDC"
                                className="w-5 h-5 rounded-full"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxwkXGm9PHXmlFjOlqHsxu0zI_SEniw76tPKnm4KkYgtuxAc2_9YpDOr2SSBo2jGKK8FG7h150SpojXCwqP2jDhl03QlyhhnOqDpw4tgW1ASM3YQF0nVqaspCyMSo6LrC6AEaP2cZBhijYn9Sj_6qwY8ptexThUX725a3IHt9Y3-kag9n0dT1TPehsMK4XHg-czD-ZfYjq5EH9R7p-sO-mjO5TkJop9rJFeemFhmz9kxjn8oi_QjvivQGYMkAw4WavVNdW081DlGM"
                            />
                            <span className="font-bold text-sm text-foreground">
                                USDC
                            </span>
                            <svg
                                className="w-3 h-3 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M19 9l-7 7-7-7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                ></path>
                            </svg>
                        </button>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">≈ $0.00</div>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-foreground hover:bg-foreground/90 text-background font-bold py-4 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                    <AccountBalanceWalletIcon fontSize="small" />
                    Connect Wallet
                </button>
            </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl border border-border shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-border sticky top-0 bg-card">
                <h2 className="text-xl font-bold text-foreground">
                  Swap Tokens
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* swapper_token_a_account */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Swapper Token A Account
                    </label>
                    <input
                      type="text"
                      value={swapFormData.swapper_token_a_account}
                      onChange={(e) =>
                        handleInputChange(e, "swapper_token_a_account")
                      }
                      placeholder="Enter token A account address"
                      className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* swapper_token_b_account */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Swapper Token B Account
                    </label>
                    <input
                      type="text"
                      value={swapFormData.swapper_token_b_account}
                      onChange={(e) =>
                        handleInputChange(e, "swapper_token_b_account")
                      }
                      placeholder="Enter token B account address"
                      className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* token_a_mint_account */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Token A Mint Account
                    </label>
                    <input
                      type="text"
                      value={swapFormData.token_a_mint_account}
                      onChange={(e) =>
                        handleInputChange(e, "token_a_mint_account")
                      }
                      placeholder="Enter token A mint address"
                      className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* token_b_mint_account */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Token B Mint Account
                    </label>
                    <input
                      type="text"
                      value={swapFormData.token_b_mint_account}
                      onChange={(e) =>
                        handleInputChange(e, "token_b_mint_account")
                      }
                      placeholder="Enter token B mint address"
                      className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* token_in_mint */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Token In Mint
                    </label>
                    <input
                      type="text"
                      value={swapFormData.token_in_mint}
                      onChange={(e) => handleInputChange(e, "token_in_mint")}
                      placeholder="Enter token in mint address"
                      className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* token_out_mint */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Token Out Mint
                    </label>
                    <input
                      type="text"
                      value={swapFormData.token_out_mint}
                      onChange={(e) => handleInputChange(e, "token_out_mint")}
                      placeholder="Enter token out mint address"
                      className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* max_amount_in */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Max Amount In
                    </label>
                    <input
                      type="text"
                      value={swapFormData.max_amount_in}
                      onChange={(e) => handleInputChange(e, "max_amount_in")}
                      placeholder="Enter maximum amount input"
                      className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* minimum_amount_out */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Minimum Amount Out
                    </label>
                    <input
                      type="text"
                      value={swapFormData.minimum_amount_out}
                      onChange={(e) =>
                        handleInputChange(e, "minimum_amount_out")
                      }
                      placeholder="Enter minimum amount output"
                      className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* swapper_account */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Swapper Account
                    </label>
                    <input
                      type="text"
                      value={swapFormData.swapper_account}
                      onChange={(e) =>
                        handleInputChange(e, "swapper_account")
                      }
                      placeholder="Enter swapper account address"
                      className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Modal Footer with Buttons */}
                <div className="flex gap-3 pt-6 border-t border-border">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted/30 transition-colors font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg bg-foreground hover:bg-foreground/90 text-background font-bold transition-all cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </>
  );
}
