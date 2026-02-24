'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { ThemeSelect } from '@/components/theme-select'
import SettingsIcon from "@mui/icons-material/Settings";

const ClusterDropdown = dynamic(() => import('@/components/cluster-dropdown').then((m) => m.ClusterDropdown), {
  ssr: false,
})

export function AppHeader({ links = [] }: { links: { label: string; path: string }[] }) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path ? "text-primary bg-primary/10 dark:text-secondary dark:bg-secondary/10" : "text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-secondary";
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="font-bold text-lg tracking-tight dark:text-white">SolFluence</span>
            </Link>
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                {links.map(({ label, path }) => (
                  <Link
                    key={path}
                    href={path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(path)}`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <ClusterDropdown />
            </div>

            <WalletDropdown />

            <div className="hidden md:block">
              <ThemeSelect />
            </div>
            <button className="md:hidden p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer">
              {/* Mobile Menu Placeholder - Design didn't specify mobile menu behavior clearly, keeping simple for now */}
              <SettingsIcon fontSize="small" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
