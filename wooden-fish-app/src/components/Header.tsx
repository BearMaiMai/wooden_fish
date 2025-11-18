import React, { useState } from 'react'
import { useWoodenFish } from '../contexts/WoodenFishContext'
import { useProfile } from '../contexts/ProfileContext'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Slider } from './ui/slider'
import { Switch } from './ui/switch'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import { 
  Settings, 
  Volume2, 
  Moon, 
  Sun, 
  Menu,
  Trophy,
  Heart,
  User
} from 'lucide-react'

interface HeaderProps {
  currentView?: 'main' | 'profile';
  onViewChange?: (view: 'main' | 'profile') => void;
}

export default function Header({ currentView = 'main', onViewChange }: HeaderProps) {
  const { state, dispatch } = useWoodenFish()
  const { profile } = useProfile()
  const [showSettings, setShowSettings] = useState(false)

  const handleThemeToggle = () => {
    const newTheme = state.selectedTheme === 'dark' ? 'light' : 'dark'
    dispatch({ type: 'SET_THEME', payload: newTheme })
  }

  const handleVolumeChange = (value: number[]) => {
    dispatch({ type: 'SET_VOLUME', payload: value[0] })
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="zen-container">
        <div className="flex items-center justify-between h-16">
          {/* 左侧 - 标题和功德显示 */}
          <div className="flex items-center space-x-4">
            <h1 
              className="text-2xl font-bold text-amber-700 dark:text-amber-400 font-serif cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onViewChange?.('main')}
            >
              电子功德
            </h1>
            <div className="hidden sm:flex items-center space-x-2">
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                <Heart className="w-3 h-3 mr-1" />
                功德: {state.merit.toLocaleString()}
              </Badge>
              {state.combo > 0 && (
                <Badge variant="outline" className="border-orange-300 text-orange-600 animate-pulse">
                  连击: {state.combo}
                </Badge>
              )}
            </div>
          </div>

          {/* 右侧 - 控制按钮 */}
          <div className="flex items-center space-x-2">
            {/* 个人主页按钮 */}
            <Button
              variant={currentView === 'profile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange?.('profile')}
              className="hover:bg-amber-100 dark:hover:bg-amber-900"
            >
              <User className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">
                {profile ? profile.nickname : '个人主页'}
              </span>
              <span className="sm:hidden">档案</span>
            </Button>

            {/* 成就数量 */}
            <div className="hidden md:flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
              <Trophy className="w-4 h-4" />
              <span>{state.achievements.length}</span>
            </div>

            {/* 主题切换 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleThemeToggle}
              className="hover:bg-amber-100 dark:hover:bg-amber-900"
            >
              {state.selectedTheme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* 音量控制 - 桌面端 */}
            <div className="hidden md:flex items-center space-x-2 w-24">
              <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <Slider
                value={[state.volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.1}
                className="flex-1"
              />
            </div>

            {/* 设置面板 */}
            <Sheet open={showSettings} onOpenChange={setShowSettings}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-amber-100 dark:hover:bg-amber-900"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-80">
                <SheetHeader>
                  <SheetTitle className="text-amber-700 dark:text-amber-400">
                    设置
                  </SheetTitle>
                </SheetHeader>
                
                <div className="space-y-6 mt-6">
                  {/* 音量控制 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">音量</label>
                    <div className="flex items-center space-x-2">
                      <Volume2 className="w-4 h-4" />
                      <Slider
                        value={[state.volume]}
                        onValueChange={handleVolumeChange}
                        max={1}
                        step={0.1}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-500 w-8">
                        {Math.round(state.volume * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* 音效选择 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">音效</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['classic', 'temple', 'nature', 'modern'].map((sound) => (
                        <Button
                          key={sound}
                          variant={state.selectedSound === sound ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => dispatch({ type: 'SET_SOUND', payload: sound })}
                          className="capitalize"
                        >
                          {sound === 'classic' && '经典'}
                          {sound === 'temple' && '寺庙'}
                          {sound === 'nature' && '自然'}
                          {sound === 'modern' && '现代'}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* 自动敲击设置 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">自动敲击</label>
                      <Switch
                        checked={state.isAutoTapping}
                        onCheckedChange={(checked) => 
                          dispatch({ type: 'SET_AUTO_TAPPING', payload: checked })
                        }
                      />
                    </div>
                    
                    {state.isAutoTapping && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm">速度 (次/秒)</label>
                          <Slider
                            value={[state.autoTapSpeed]}
                            onValueChange={(value) => 
                              dispatch({ type: 'SET_AUTO_TAP_SPEED', payload: value[0] })
                            }
                            min={0.5}
                            max={5}
                            step={0.5}
                          />
                          <div className="text-xs text-gray-500 text-center">
                            {state.autoTapSpeed} 次/秒
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm">持续时间 (分钟)</label>
                          <Slider
                            value={[state.autoTapDuration]}
                            onValueChange={(value) => 
                              dispatch({ type: 'SET_AUTO_TAP_DURATION', payload: value[0] })
                            }
                            min={1}
                            max={60}
                            step={1}
                          />
                          <div className="text-xs text-gray-500 text-center">
                            {state.autoTapDuration} 分钟
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* 移动端菜单 */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-amber-100 dark:hover:bg-amber-900"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}