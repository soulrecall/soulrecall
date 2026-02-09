'use client'

import { LayoutDashboard, Wallet, Settings, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">AgentVault</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative flex items-center gap-2 rounded-md border bg-muted px-3 py-1.5 text-sm hover:bg-muted/80">
          <Wallet className="h-4 w-4" />
          <span>Wallets</span>
        </button>

        <button className="rounded-md border bg-muted p-2 hover:bg-muted/80">
          <Settings className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted hover:bg-muted/80"
          >
            <Menu className="h-4 w-4 text-muted-foreground" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 z-50 w-56 rounded-lg border bg-card shadow-lg">
              <div className="p-1">
                <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-left hover:bg-muted">
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
