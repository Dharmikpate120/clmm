"use client";

import ShowChartIcon from "@mui/icons-material/ShowChart";

export default function PriceChart() {
    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-6 h-[500px] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <ShowChartIcon className="text-9xl text-primary" style={{ fontSize: '128px' }} />
            </div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Price History
                </h2>
                <div className="flex bg-gray-100 dark:bg-surface-darker rounded-lg p-1">
                    <button className="px-3 py-1 rounded-md text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer transition-colors">
                        1H
                    </button>
                    <button className="px-3 py-1 rounded-md text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer transition-colors">
                        1D
                    </button>
                    <button className="px-3 py-1 rounded-md text-xs font-medium bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white cursor-pointer transition-colors">
                        1W
                    </button>
                    <button className="px-3 py-1 rounded-md text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer transition-colors">
                        1M
                    </button>
                </div>
            </div>
            <div className="flex-grow w-full relative">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="border-t border-dashed border-gray-200 dark:border-gray-800 w-full h-0"></div>
                    <div className="border-t border-dashed border-gray-200 dark:border-gray-800 w-full h-0"></div>
                    <div className="border-t border-dashed border-gray-200 dark:border-gray-800 w-full h-0"></div>
                    <div className="border-t border-dashed border-gray-200 dark:border-gray-800 w-full h-0"></div>
                    <div className="border-t border-dashed border-gray-200 dark:border-gray-800 w-full h-0"></div>
                </div>
                <svg
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 100"
                >
                    <defs>
                        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#9945FF" stopOpacity="0.2"></stop>
                            <stop offset="100%" stopColor="#9945FF" stopOpacity="0"></stop>
                        </linearGradient>
                    </defs>
                    <path
                        d="M0,100 L0,80 C10,70 20,85 30,60 C40,35 50,55 60,45 C70,35 80,40 90,20 L100,15 L100,100 Z"
                        fill="url(#chartGradient)"
                    ></path>
                    <path
                        className="chart-path animate-[dash_3s_ease-out_forwards]"
                        style={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
                        d="M0,80 C10,70 20,85 30,60 C40,35 50,55 60,45 C70,35 80,40 90,20 L100,15"
                        fill="none"
                        stroke="#9945FF"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                    ></path>
                </svg>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-4 font-mono">
                <span>Nov 12</span>
                <span>Nov 14</span>
                <span>Nov 16</span>
                <span>Nov 18</span>
                <span>Nov 20</span>
            </div>
            <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
        </div>
    );
}
