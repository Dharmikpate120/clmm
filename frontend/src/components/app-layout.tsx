'use client'

import { Toaster } from './ui/sonner'
import { AppHeader } from '@/components/app-header'
import React from 'react'
import { ClusterUiChecker } from '@/features/cluster/ui/cluster-ui-checker'

import { AccountUiChecker } from '@/features/account/ui/account-ui-checker'
import Footer from './Footer'

export function AppLayout({
  children,
  links,
}: {
  children: React.ReactNode
  links: { label: string; path: string }[]
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader links={links} />
      <main className="flex-grow container mx-auto p-4">
        <ClusterUiChecker>
          <AccountUiChecker />
        </ClusterUiChecker>
        {children}
      </main>
      <Footer />
      <Toaster closeButton />
    </div>
  )
}
