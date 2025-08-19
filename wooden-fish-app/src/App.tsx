import React from 'react'
import { ThemeProvider } from './components/theme-provider'
import { WoodenFishProvider } from './contexts/WoodenFishContext'
import MainLayout from './components/MainLayout'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="wooden-fish-theme">
      <WoodenFishProvider>
        <MainLayout />
        <Toaster />
      </WoodenFishProvider>
    </ThemeProvider>
  )
}

export default App