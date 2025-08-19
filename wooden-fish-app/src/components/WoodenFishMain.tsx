import React, { useEffect, useRef, useState } from 'react'
import { useWoodenFish } from '../contexts/WoodenFishContext'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { cn } from '../lib/utils'
import { useToast } from '../hooks/use-toast'
import WoodenFishHammer from './WoodenFishHammer'

export default function WoodenFishMain() {
  const { state, dispatch } = useWoodenFish()
  const { toast } = useToast()
  const woodenFishRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])
  const [floatingTexts, setFloatingTexts] = useState<Array<{ id: number; x: number; y: number; text: string }>>([])
  const [hammerState, setHammerState] = useState({
    isVisible: false,
    position: { x: 0, y: 0 },
    isAnimating: false
  })
  const [isWoodenFishShaking, setIsWoodenFishShaking] = useState(false)
  const autoTapIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const autoTapTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 鼠标移动跟踪 - 只在木鱼区域内显示锤子
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!woodenFishRef.current) return
      
      const rect = woodenFishRef.current.getBoundingClientRect()
      const isInWoodenFishArea = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      )

      if (isInWoodenFishArea) {
        setHammerState(prev => ({
          ...prev,
          isVisible: true,
          position: { x: e.clientX, y: e.clientY }
        }))
      } else if (!hammerState.isAnimating) {
        setHammerState(prev => ({ ...prev, isVisible: false }))
      }
    }

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [hammerState.isAnimating])

  // 初始化音频上下文
  useEffect(() => {
    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (error) {
        console.error('Failed to initialize audio context:', error)
      }
    }
    initAudio()

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // 播放木鱼音效
  const playWoodenFishSound = async () => {
    if (!audioContextRef.current || state.volume === 0) return

    try {
      const audioContext = audioContextRef.current
      
      // 创建不同音效的频率配置
      const soundConfigs = {
        classic: { freq: 200, decay: 0.3, type: 'sine' as OscillatorType },
        temple: { freq: 150, decay: 0.5, type: 'triangle' as OscillatorType },
        nature: { freq: 300, decay: 0.2, type: 'sawtooth' as OscillatorType },
        modern: { freq: 250, decay: 0.4, type: 'square' as OscillatorType }
      }

      const config = soundConfigs[state.selectedSound as keyof typeof soundConfigs] || soundConfigs.classic

      // 创建振荡器和增益节点
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(config.freq, audioContext.currentTime)
      oscillator.type = config.type

      // 设置音量包络
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(state.volume * 0.3, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + config.decay)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + config.decay)
    } catch (error) {
      console.error('Failed to play sound:', error)
    }
  }

  // 处理木鱼点击 - 优化动画效果和物理规律
  const handleWoodenFishClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!woodenFishRef.current) return

    // 严格的防重复机制：确保锤子完全抬起后才能再次敲击
    if (hammerState.isAnimating) {
      console.log('锤子未完全抬起，忽略点击 - 符合物理规律')
      return
    }

    const rect = woodenFishRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    console.log('开始敲击动画 - 锤子下落敲击')

    // 立即设置动画状态，确保锤子必须完全抬起
    setHammerState(prev => ({
      ...prev,
      isAnimating: true,
      position: { x: event.clientX, y: event.clientY }
    }))

    // 立即执行敲击逻辑，确保计数正确
    dispatch({ type: 'TAP_WOODEN_FISH' })
    
    // 播放音效
    playWoodenFishSound()

    // 触发木鱼震动效果
    setIsWoodenFishShaking(true)

    // 优化动画时长：从500ms缩短至300ms
    const animationDuration = 300 // 300毫秒动画时间，更快响应
    
    // 震动效果定时器 - 与动画同步
    setTimeout(() => {
      setIsWoodenFishShaking(false)
    }, animationDuration)

    // 添加涟漪效果
    const rippleId = Date.now()
    setRipples(prev => [...prev, { id: rippleId, x, y }])
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== rippleId))
    }, 800) // 缩短涟漪时间

    // 添加浮动文字
    const textId = Date.now() + Math.random()
    const texts = ['+1 功德', '功德+1', '善哉善哉', '阿弥陀佛', '功德无量']
    const randomText = texts[Math.floor(Math.random() * texts.length)]
    setFloatingTexts(prev => [...prev, { id: textId, x, y, text: randomText }])
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== textId))
    }, 1200) // 缩短文字显示时间

    // 物理规律：锤子必须完全抬起后才能进行下次敲击
    setTimeout(() => {
      console.log('锤子完全抬起 - 可进行下次敲击')
      setHammerState(prev => ({
        ...prev,
        isAnimating: false
      }))
    }, animationDuration)

    // 检查成就
    if (state.merit + 1 === 100) {
      toast({
        title: "🎉 成就解锁",
        description: "功德百善 - 累积100点功德",
      })
    }

    if (state.combo + 1 === 10) {
      toast({
        title: "🔥 连击成就",
        description: "十连击 - 连续敲击10次",
      })
    }
  }

  // 锤子动画完成回调 - 原生JavaScript控制
  const handleHammerAnimationComplete = () => {
    // 由于已经在handleWoodenFishClick中使用原生setTimeout控制
    // 这里只需要保持锤子可见状态
    console.log('锤子动画回调触发')
  }

  // 自动敲击逻辑
  useEffect(() => {
    if (state.isAutoTapping) {
      const interval = 1000 / state.autoTapSpeed
      
      autoTapIntervalRef.current = setInterval(() => {
        dispatch({ type: 'TAP_WOODEN_FISH' })
        playWoodenFishSound()
        
        // 添加随机位置的涟漪效果和浮动文字
        const x = Math.random() * 160 + 70 // 更合理的范围
        const y = Math.random() * 160 + 70
        const rippleId = Date.now()
        const textId = Date.now() + Math.random() // 确保唯一性
        
        setRipples(prev => [...prev, { id: rippleId, x, y }])
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== rippleId))
        }, 1000)
        
        // 添加自动敲击的浮动文字
        const autoTexts = ['自动+1', '功德+1', '善哉', '阿弥陀佛']
        const randomText = autoTexts[Math.floor(Math.random() * autoTexts.length)]
        setFloatingTexts(prev => [...prev, { id: textId, x, y, text: randomText }])
        setTimeout(() => {
          setFloatingTexts(prev => prev.filter(t => t.id !== textId))
        }, 1500) // 缩短显示时间
      }, interval)

      // 设置自动停止
      autoTapTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'SET_AUTO_TAPPING', payload: false })
        toast({
          title: "⏰ 自动敲击结束",
          description: `已完成 ${state.autoTapDuration} 分钟的自动敲击`,
        })
      }, state.autoTapDuration * 60 * 1000)
    } else {
      if (autoTapIntervalRef.current) {
        clearInterval(autoTapIntervalRef.current)
        autoTapIntervalRef.current = null
      }
      if (autoTapTimeoutRef.current) {
        clearTimeout(autoTapTimeoutRef.current)
        autoTapTimeoutRef.current = null
      }
    }

    return () => {
      if (autoTapIntervalRef.current) clearInterval(autoTapIntervalRef.current)
      if (autoTapTimeoutRef.current) clearTimeout(autoTapTimeoutRef.current)
    }
  }, [state.isAutoTapping, state.autoTapSpeed, state.autoTapDuration])

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-8">
      {/* 禅语显示 */}
      <Card className="zen-card p-6 max-w-md text-center">
        <p className="text-lg font-medium text-amber-700 dark:text-amber-300 font-serif leading-relaxed">
          {state.zenQuote}
        </p>
      </Card>

      {/* 功德和连击显示 */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Badge variant="secondary" className="text-lg px-4 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200">
          功德: {state.merit.toLocaleString()}
        </Badge>
        <Badge variant="outline" className="text-sm px-3 py-1 border-orange-300 text-orange-600">
          今日: {state.todayTaps}
        </Badge>
        {state.combo > 0 && (
          <Badge variant="default" className="text-sm px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 animate-pulse">
            连击: {state.combo}
          </Badge>
        )}
      </div>

      {/* 木鱼主体 */}
      <div className="relative">
        <div
          ref={woodenFishRef}
          onClick={handleWoodenFishClick}
          className={cn(
            "relative w-64 h-64 md:w-80 md:h-80 transition-transform duration-200",
            !hammerState.isAnimating && "hover:scale-105 active:scale-95",
            "wooden-fish-area", // 木鱼区域样式
            isWoodenFishShaking && "shake-animation" // 震动动画
          )}
        >
          {/* 木鱼SVG */}
          <svg
            viewBox="0 0 300 300"
            className="w-full h-full drop-shadow-2xl"
            style={{
              filter: 'drop-shadow(0 10px 30px rgba(62, 39, 35, 0.3))'
            }}
          >
            {/* 木鱼主体 */}
            <ellipse
              cx="150"
              cy="180"
              rx="120"
              ry="80"
              fill="url(#woodGradient)"
              stroke="#3e2723"
              strokeWidth="3"
            />
            
            {/* 木鱼顶部 */}
            <ellipse
              cx="150"
              cy="120"
              rx="100"
              ry="60"
              fill="url(#woodGradientTop)"
              stroke="#3e2723"
              strokeWidth="2"
            />
            
            {/* 木鱼纹理 */}
            <path
              d="M 80 140 Q 150 100 220 140"
              stroke="#5d4037"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M 90 160 Q 150 130 210 160"
              stroke="#5d4037"
              strokeWidth="1.5"
              fill="none"
              opacity="0.4"
            />
            
            {/* 木鱼敲击点 */}
            <circle
              cx="150"
              cy="150"
              r="8"
              fill="#8d6e63"
              className="animate-pulse"
            />

            {/* 渐变定义 */}
            <defs>
              <radialGradient id="woodGradient" cx="0.3" cy="0.3">
                <stop offset="0%" stopColor="#8d6e63" />
                <stop offset="50%" stopColor="#5d4037" />
                <stop offset="100%" stopColor="#3e2723" />
              </radialGradient>
              <radialGradient id="woodGradientTop" cx="0.3" cy="0.3">
                <stop offset="0%" stopColor="#a1887f" />
                <stop offset="50%" stopColor="#6d4c41" />
                <stop offset="100%" stopColor="#4e342e" />
              </radialGradient>
            </defs>
          </svg>

          {/* 涟漪效果 */}
          {ripples.map((ripple) => (
            <div
              key={ripple.id}
              className="absolute pointer-events-none"
              style={{
                left: ripple.x - 20,
                top: ripple.y - 20,
                width: 40,
                height: 40,
              }}
            >
              <div className="w-full h-full rounded-full border-2 border-amber-400 animate-ping opacity-75" />
            </div>
          ))}

          {/* 浮动文字 */}
          {floatingTexts.map((text) => (
            <div
              key={text.id}
              className="absolute floating-text text-amber-600 font-bold text-lg"
              style={{
                left: text.x - 30,
                top: text.y - 40,
              }}
            >
              {text.text}
            </div>
          ))}
        </div>

        {/* 光晕效果 */}
        <div className={cn(
          "absolute inset-0 -z-10 bg-gradient-to-r from-amber-200/20 via-yellow-200/20 to-orange-200/20 rounded-full blur-3xl transition-all duration-1000",
          state.isAutoTapping ? "animate-pulse opacity-60 scale-110" : "opacity-30"
        )} />
        
        {/* 自动敲击状态指示 */}
        {state.isAutoTapping && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
            自动敲击中
          </div>
        )}
      </div>

      {/* 自动敲击控制 */}
      <div className="flex items-center space-x-4">
        <Button
          onClick={() => dispatch({ type: 'SET_AUTO_TAPPING', payload: !state.isAutoTapping })}
          variant={state.isAutoTapping ? "destructive" : "default"}
          size="lg"
          className="px-8"
        >
          {state.isAutoTapping ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              停止自动
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              开始自动
            </>
          )}
        </Button>

        <Button
          onClick={() => {
            dispatch({ type: 'RESET_COMBO' })
            toast({
              title: "🔄 连击重置",
              description: "连击数已重置为0",
            })
          }}
          variant="outline"
          size="lg"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          重置连击
        </Button>
      </div>

      {/* 自动敲击状态显示 */}
      {state.isAutoTapping && (
        <Card className="zen-card p-4 text-center">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            自动敲击中... 速度: {state.autoTapSpeed} 次/秒
          </p>
          <p className="text-xs text-gray-500 mt-1">
            持续时间: {state.autoTapDuration} 分钟
          </p>
        </Card>
      )}

      {/* 木鱼锤组件 */}
      <WoodenFishHammer
        isVisible={hammerState.isVisible}
        position={hammerState.position}
        isAnimating={hammerState.isAnimating}
        onAnimationComplete={handleHammerAnimationComplete}
      />
    </div>
  )
}
