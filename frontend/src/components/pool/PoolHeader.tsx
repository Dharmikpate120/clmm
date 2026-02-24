"use client";

export default function PoolHeader() {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                    <img
                        alt="SOL"
                        className="w-12 h-12 rounded-full border-4 border-background bg-black z-10"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrETAEdMSL3H499w94eluhcBFBsEKq6H4oIZhYfLaSHiYOMv81BQbHAy6PZ7aey9kD_UpolsmVdUdpfKoTz3OptcGWc4ijucd8WnhH0n2fJnwzYRwdZOUjdqrkbW_w7QXSsMIqFy5u2OM0Ff-_mT5HIVQ-bqlg1u_vzGWvOxSiLYr7Z816Y4IFIAHyZYDtNcIg1tciD8OEab2BjraEulEnwlk4s317vYzlPfis28uXg7B1CYqpILSnICDXLQr1DJmPF_rCEqc0OI0"
                    />
                    <img
                        alt="USDC"
                        className="w-12 h-12 rounded-full border-4 border-background bg-white z-0"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxwkXGm9PHXmlFjOlqHsxu0zI_SEniw76tPKnm4KkYgtuxAc2_9YpDOr2SSBo2jGKK8FG7h150SpojXCwqP2jDhl03QlyhhnOqDpw4tgW1ASM3YQF0nVqaspCyMSo6LrC6AEaP2cZBhijYn9Sj_6qwY8ptexThUX725a3IHt9Y3-kag9n0dT1TPehsMK4XHg-czD-ZfYjq5EH9R7p-sO-mjO5TkJop9rJFeemFhmz9kxjn8oi_QjvivQGYMkAw4WavVNdW081DlGM"
                    />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        SOL - USDC
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary/20 text-primary border border-primary/20">
                            0.05%
                        </span>
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="bg-muted px-2 py-0.5 rounded text-xs">
                            Concentrated
                        </span>
                        <span>Fee Tier: 0.05%</span>
                    </div>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                        Current Price
                    </div>
                    <div className="text-xl font-mono font-bold text-foreground">$143.25</div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                        24h Change
                    </div>
                    <div className="text-xl font-mono font-bold text-secondary">
                        +2.15%
                    </div>
                </div>
            </div>
        </div>
    );
}
