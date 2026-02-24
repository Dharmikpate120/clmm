"use client";

import Link from "next/link";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

export default function PoolList() {
    const pools = [
        {
            id: "sol-usdc",
            name: "SOL-USDC",
            fee: "0.05%",
            type: "Concentrated",
            price: "$143.25",
            priceChange: "+2.15%",
            tvl: "$85.2M",
            vol24h: "$24.1M",
            fees24h: "$12.4k",
            apr: "48.2%",
            aprLabel: "Rewards",
            tokenA: "SOL",
            tokenB: "USDC",
            tokenAImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuDrETAEdMSL3H499w94eluhcBFBsEKq6H4oIZhYfLaSHiYOMv81BQbHAy6PZ7aey9kD_UpolsmVdUdpfKoTz3OptcGWc4ijucd8WnhH0n2fJnwzYRwdZOUjdqrkbW_w7QXSsMIqFy5u2OM0Ff-_mT5HIVQ-bqlg1u_vzGWvOxSiLYr7Z816Y4IFIAHyZYDtNcIg1tciD8OEab2BjraEulEnwlk4s317vYzlPfis28uXg7B1CYqpILSnICDXLQr1DJmPF_rCEqc0OI0",
            tokenBImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxwkXGm9PHXmlFjOlqHsxu0zI_SEniw76tPKnm4KkYgtuxAc2_9YpDOr2SSBo2jGKK8FG7h150SpojXCwqP2jDhl03QlyhhnOqDpw4tgW1ASM3YQF0nVqaspCyMSo6LrC6AEaP2cZBhijYn9Sj_6qwY8ptexThUX725a3IHt9Y3-kag9n0dT1TPehsMK4XHg-czD-ZfYjq5EH9R7p-sO-mjO5TkJop9rJFeemFhmz9kxjn8oi_QjvivQGYMkAw4WavVNdW081DlGM",
        },
        {
            id: "bonk-sol",
            name: "BONK-SOL",
            fee: "1.00%",
            type: "Volatile",
            price: "0.000021",
            priceChange: "-4.32%",
            priceChangeColor: "text-red-400",
            tvl: "$12.4M",
            vol24h: "$8.2M",
            fees24h: "$82.1k",
            apr: "124.5%",
            aprLabel: "Hyper",
            tokenA: "BONK",
            tokenB: "SOL",
            tokenAImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuDAb2RZatGFJGz7I8rI2lLxdmGCavCJT-gNFOe8sSkS71svR5z-bVa5PnXo-gCJroWs2t3seM0x8dQxk2mNNFrv5lBzseHh2TDh3Vt0S6U3iWhqrReQHFk7CGwmCQspHxyqKDzfb2RytXrwB0SN6GyjsUilwFbP0ECUtMLNwY_6SJWdtYcLr8Xb4gpQ0i3SgntXYwL5wG10f8mwcThRXB-O2BOJU5vEZkn6uZZV9GMFlxV91AM4lZF1AKcDWZz_2ZRSRZFAmrfM3LA",
            tokenBImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuByVkQiDq-Niorggsp0GSSt4h09cWzwK8KS2vo1SS3utXEPTtRaGc-hbvs99MPZ8cRXW_dvDbpudnrnic0-ETz2ZD766iG3Jqk3UzrOl8pd17xtR0_79fapNmSWue2elIagDdi-AEm0L3usCIHU0-6m8LBxX_soaLYYrhQ74YH0iXRpO6yd9CPtw4NzT4IohoTWOGD_5eAXFTyi50sq22r1mEcNxVC2Ic-DujwXsJ7OeXXdWIznzpHvlo8N338tNnsTpKMs3CbuzPI",
        },
        {
            id: "eth-usdc",
            name: "ETH-USDC",
            fee: "0.05%",
            type: "Wormhole",
            price: "$2,241.12",
            priceChange: "+0.8%",
            tvl: "$45.1M",
            vol24h: "$12.8M",
            fees24h: "$6.4k",
            apr: "22.4%",
            tokenA: "ETH",
            tokenB: "USDC",
            tokenAImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7F2oJBJeDpuhe0w7FscGy_QsrZC0Qoe_mG2MK4672o9xlu_PpReJk2ZTG9llmuNq3Iq01qem2X0J-lJA8z2QHI2sL8wTNIDyTxfj8rIIuoQVXMsGA1TfUMINRZu_2zosw6STxLQKqFJL28EA_UpgSAhBzzCGpWv_Bqc1moWEGtaWDUjDQgbTKvXrz6QGep4P7kWLLKWIGi_6oQgHYYEL4IU_gPsql8_DTV_YDjqFqXlyBHdMetqkIXpN_9N26ipbsGSC1XI9aZXM",
            tokenBImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuAozFcaA2P4z5-tetzYIBND5Op96vsxE4pZtW7R1APf8JYor9wE9QsKfLnaG-UhGfocA5YQKlIW4IGvJ462iZQm2cKkFJ7ptHICn69mu5J9VQVqkFgfNSg07SMbTQyCJyyj0XiRrqotuZUWoLUHnFH1qXBINZRqEQnR1_xpMP-yVYiJS_RFQ_MJlsngPGgENXJQ4SnAKanbENtPvgccsd6gxIvbLJnED09IuB8Voyh7xRo8XgvnMPo1VR6gH_jN8ZMhjwQnri_8u9Y",
        },
        {
            id: "jup-sol",
            name: "JUP-SOL",
            fee: "0.30%",
            type: "Stable",
            price: "0.0042",
            priceChange: "+5.6%",
            tvl: "$32.6M",
            vol24h: "$18.9M",
            fees24h: "$56.7k",
            apr: "64.1%",
            aprLabel: "Eco",
            feeColor: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
            tokenA: "JUP",
            tokenB: "SOL",
            tokenAImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJlNqrBjPVk-Y9KV9wRuY93zyhfrBYAAahXajca4lq-12e1VD9gBnFyMUoap4Ic-3U1oPxwp-uzXmd9GnG_2rDrdVu7aco5l7ZiolZNVOn45JLEHlpfnKRbUKX3ZBvBTLkhV2t0zQ8aS_TRRLzOyM96L08PoFtPKeVqUv7o33cp44zEbD0vD-eHUOBRUbh87I3Gh7RKRFZsrO2JWor4LkA0YEx9rPevvWnO7AfskK-EM7booAmhimPXFgptwomBmJbZKisYyN6Cfs",
            tokenBImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuBIpS5PM0H3r8QpJzB3vowsRL6vZbhNer_KsOIYbD-0Ke349Zaoxd_kXFALed8Tg_exkiJ1lYf1KDButezFhh_29rXRaX9TqTCTMDYZaECYEKcZPUr3_xAioZl9eeOIc6FEEoDbgyMM-T5S6d_usKMVVwYU6AHJ52Bgk_yTdpg8K3Ix6KghSYoL6JsOjP1WiqkBxmaT7DOFv_C3vaKz8_5yF_jub_biPoc59niW9WBB6utmHrymlOf1meqK_T0c4tDvEU-7sohU3T0",
        },
        {
            id: "usdt-usdc",
            name: "USDT-USDC",
            fee: "0.01%",
            type: "Stableswap",
            price: "$1.0002",
            priceChange: "0.00%",
            priceChangeColor: "text-gray-500",
            tvl: "$142.1M",
            vol24h: "$12.4M",
            fees24h: "$1.2k",
            apr: "4.2%",
            feeColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
            tokenA: "USDT",
            tokenB: "USDC",
            tokenAImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuC6Nr2QFx9CCb_uxrOR0OJWFm9e2JpLTGWEsrBhP2jMrzyr1PGBS9-mmuM6udMsVX1dv0l1fSHpbGoJnDQ3WCnvm6Eo7dCyY6F9s367b0yRMqM9AFLJWvVFVl8T8lTTXpNmwqNF0cu0tAWrHlbu2vyMXS3zkCW3GK139k80hfArzf3Qh55iwygrJMu7dXqsX_2_XjaNpUFxWzCuiCrZTIYT-xDIo9e4M9J8EnPdq5Ir6iyP5tloIUXQsS7aBhbfLNqGTTdjMebmTQ8",
            tokenBImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuDziNG-m_8NyXoqeyAYYNxxq9QpEvPQQydTJfHMF5FjjTHNCqDAXBuNG-IXO0NDXwx8jerIlXHD_oO2KbYUOcJAtijRT1KYVrKdXyWV6-VKRzEckLt8H8FzxjrnrpiiPIDdvaWCVkFGEQkdFqDde3WmZwu5CH6jXtFQz4rJJThvRu8Fvd1SBuQD5D1P6ATFtgKnBAgKpw-kIBM0MFj8bUIHR3lQN3dOGAF4SeIrmgmq1-XEgTEM-cdYGVqUtduib6EN9kmVITRhFxo",
        },
    ];

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-surface-darker/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="col-span-4 md:col-span-3 flex items-center">Pool Name</div>
                <div className="col-span-3 md:col-span-2 text-right cursor-pointer hover:text-primary flex items-center justify-end gap-1">
                    Price <UnfoldMoreIcon fontSize="small" style={{ fontSize: '14px' }} />
                </div>
                <div className="hidden md:block col-span-2 text-right cursor-pointer hover:text-primary">
                    TVL
                </div>
                <div className="col-span-3 md:col-span-2 text-right cursor-pointer hover:text-primary flex items-center justify-end gap-1">
                    Vol 24H <ArrowDownwardIcon fontSize="small" style={{ fontSize: '14px' }} />
                </div>
                <div className="col-span-2 md:col-span-2 text-right">APR (24h)</div>
                <div className="hidden md:block col-span-1 text-right">Action</div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {pools.map((pool) => (
                    <Link
                        key={pool.id}
                        href={`/pool/${pool.id}`}
                        className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-gray-50 dark:hover:bg-surface-darker transition-colors cursor-pointer group"
                    >
                        <div className="col-span-4 md:col-span-3 flex items-center">
                            <div className="flex -space-x-2 mr-3 relative">
                                <img
                                    alt={pool.tokenA}
                                    className="w-8 h-8 rounded-full border-2 border-white dark:border-surface-dark bg-black z-10"
                                    src={pool.tokenAImg}
                                />
                                <img
                                    alt={pool.tokenB}
                                    className="w-8 h-8 rounded-full border-2 border-white dark:border-surface-dark bg-white z-0"
                                    src={pool.tokenBImg}
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {pool.name}
                                    </span>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${pool.feeColor || "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}>
                                        {pool.fee}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {pool.type}
                                </span>
                            </div>
                        </div>
                        <div className="col-span-3 md:col-span-2 text-right">
                            <div className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                                {pool.price}
                            </div>
                            <div className={`text-xs ${pool.priceChangeColor || "text-secondary"}`}>
                                {pool.priceChange}
                            </div>
                        </div>
                        <div className="hidden md:block col-span-2 text-right">
                            <div className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                                {pool.tvl}
                            </div>
                        </div>
                        <div className="col-span-3 md:col-span-2 text-right">
                            <div className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                                {pool.vol24h}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Fees: {pool.fees24h}
                            </div>
                        </div>
                        <div className="col-span-2 md:col-span-2 text-right">
                            <div className="font-mono text-sm font-bold text-secondary">
                                {pool.apr}
                            </div>
                            {pool.aprLabel && (
                                <div className="text-xs text-primary dark:text-primary/80">
                                    {pool.aprLabel}
                                </div>
                            )}
                        </div>
                        <div className="hidden md:block col-span-1 text-right">
                            <button className="text-gray-400 hover:text-white hover:bg-primary border border-transparent hover:border-primary/30 p-2 rounded-lg transition-all cursor-pointer">
                                <SwapHorizIcon fontSize="small" />
                            </button>
                        </div>
                    </Link>
                ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-center items-center gap-4 bg-gray-50 dark:bg-surface-darker/30">
                <button className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer">
                    Previous
                </button>
                <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-lg bg-primary text-white text-sm font-medium flex items-center justify-center cursor-pointer">
                        1
                    </button>
                    <button className="w-8 h-8 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium flex items-center justify-center transition-colors cursor-pointer">
                        2
                    </button>
                    <button className="w-8 h-8 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium flex items-center justify-center transition-colors cursor-pointer">
                        3
                    </button>
                    <span className="w-8 h-8 flex items-center justify-center text-gray-400">
                        ...
                    </span>
                </div>
                <button className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer">
                    Next
                </button>
            </div>
        </div>
    );
}
