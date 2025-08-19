import React from 'react'
import { useWoodenFish } from '../contexts/WoodenFishContext'
import WoodenFishMain from './WoodenFishMain'
import Header from './Header'
import SidePanel from './SidePanel'
import BottomControls from './BottomControls'
import { cn } from '../lib/utils'

export default function MainLayout() {
  const { state } = useWoodenFish()

  return (
    <div 
      className={cn(
        "min-h-screen transition-all duration-500",
        state.isMeditating && "meditation-mode"
      )}
      data-theme={state.selectedTheme}
    >
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-br from-amber-200/20 to-yellow-200/20 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-orange-200/20 to-red-200/20 rounded-full blur-lg animate-pulse delay-2000" />
      </div>

      {/* 主要内容区域 */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* 顶部导航 */}
        <Header />
        
        {/* 主内容区 */}
        <main className="flex-1 flex">
          {/* 侧边面板 - 桌面端显示 */}
          <div className="hidden lg:block">
            <SidePanel />
          </div>
          
          {/* 中央木鱼区域 */}
          <div className="flex-1 flex flex-col">
            <WoodenFishMain />
          </div>
        </main>
        
        {/* 底部控制栏 */}
        <BottomControls />
      </div>
      
      {/* 冥想模式遮罩 */}
      {state.isMeditating && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-5 pointer-events-none transition-all duration-1000" />
      )}
    </div>
  )
}