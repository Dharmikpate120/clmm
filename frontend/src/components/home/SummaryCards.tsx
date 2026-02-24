"use client";

import ShowChartIcon from "@mui/icons-material/ShowChart";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

export default function SummaryCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card text-card-foreground rounded-xl p-5 border border-border shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShowChartIcon className="text-6xl text-primary" style={{ fontSize: '60px' }} />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">
                    Total Value Locked
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">
                        $482,931,204
                    </span>
                    <span className="text-xs font-medium text-secondary flex items-center">
                        <ArrowUpwardIcon fontSize="small" style={{ fontSize: '14px' }} /> 2.4%
                    </span>
                </div>
            </div>
            <div className="bg-card text-card-foreground rounded-xl p-5 border border-border shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <WaterDropIcon className="text-6xl text-accent-blue" style={{ fontSize: '60px' }} />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">
                    24h Volume
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">
                        $124,592,110
                    </span>
                    <span className="text-xs font-medium text-secondary flex items-center">
                        <ArrowUpwardIcon fontSize="small" style={{ fontSize: '14px' }} /> 12.1%
                    </span>
                </div>
            </div>
            <div className="bg-card text-card-foreground rounded-xl p-5 border border-border shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <LocalAtmIcon className="text-6xl text-secondary" style={{ fontSize: '60px' }} />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">
                    24h Fees Generated
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">
                        $342,881
                    </span>
                    <span className="text-xs font-medium text-secondary flex items-center">
                        <ArrowUpwardIcon fontSize="small" style={{ fontSize: '14px' }} /> 5.8%
                    </span>
                </div>
            </div>
        </div>
    );
}
