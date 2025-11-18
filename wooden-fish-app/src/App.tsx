import React from 'react'
import { ThemeProvider } from './components/theme-provider'
import { WoodenFishProvider } from './contexts/WoodenFishContext'
import { ProfileProvider } from './contexts/ProfileContext'
import MainLayout from './components/MainLayout'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="wooden-fish-theme">
      <ProfileProvider>
        <WoodenFishProvider>
          <MainLayout />
          <Toaster />
        </WoodenFishProvider>
      </ProfileProvider>
    </ThemeProvider>
  )
}

export default App