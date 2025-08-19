import React from 'react'
import { useWoodenFish } from '../contexts/WoodenFishContext'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  Home, 
  Trophy, 
  Clock, 
  Sparkles, 
  Heart,
  MessageCircle
} from 'lucide-react'
import { cn } from '../lib/utils'

export default function BottomControls() {
  const { state } = useWoodenFish()

  return (
    <div className="sticky bottom-0 z-40 md:hidden">
      {/* 移动端功德显示条 */}
      <div className="bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/50 dark:to-yellow-900/50 px-4 py-2 border-t border-amber-200 dark:border-amber-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
              <Heart className="w-3 h-3 mr-1" />
              {state.merit.toLocaleString()}
            </Badge>
            <Badge variant="outline" className="border-orange-300 text-orange-600 text-xs">
              今日: {state.todayTaps}
            </Badge>
            {state.combo > 0 && (
              <Badge variant="default" className="bg-red-500 text-white text-xs animate-pulse">
                连击: {state.combo}
              </Badge>
            )}
          </div>
          
          {state.isAutoTapping && (
            <div className="text-xs text-amber-700 dark:text-amber-300">
              自动中...
            </div>
          )}
        </div>
      </div>

      {/* 移动端底部导航栏 */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-around py-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center space-y-1 h-auto py-2 px-3"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">主页</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center space-y-1 h-auto py-2 px-3 relative"
          >
            <Trophy className="w-5 h-5" />
            <span className="text-xs">成就</span>
            {state.achievements.length > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center">
                {state.achievements.length}
              </Badge>
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex flex-col items-center space-y-1 h-auto py-2 px-3",
              state.isMeditating && "text-blue-600"
            )}
          >
            <Clock className="w-5 h-5" />
            <span className="text-xs">冥想</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center space-y-1 h-auto py-2 px-3 relative"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-xs">祈愿</span>
            {state.wishes.length > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center">
                {state.wishes.length}
              </Badge>
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center space-y-1 h-auto py-2 px-3"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">禅语</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
