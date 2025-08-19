import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '../lib/utils'

interface HammerProps {
  isVisible: boolean
  position: { x: number; y: number }
  isAnimating: boolean
  onAnimationComplete: () => void
}

export default function WoodenFishHammer({ isVisible, position, isAnimating, onAnimationComplete }: HammerProps) {
  const hammerRef = useRef<HTMLDivElement>(null)
  const [animationState, setAnimationState] = useState<'idle' | 'lifting' | 'striking' | 'completing'>('idle')
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 防抖处理，确保动画完整执行
  const handleAnimationComplete = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }
    
    animationTimeoutRef.current = setTimeout(() => {
      setAnimationState('idle')
      onAnimationComplete()
    }, 50) // 短暂延迟确保动画完成
  }, [onAnimationComplete])

  useEffect(() => {
    if (isAnimating && animationState === 'idle' && hammerRef.current) {
      // 开始完整的敲击动画序列
      setAnimationState('striking')
      
      const hammer = hammerRef.current
      
      // 重置动画
      hammer.style.animation = 'none'
      hammer.offsetHeight // 强制重绘
      
      // 执行完整的敲击动画 - 同步为300ms
      hammer.style.animation = 'hammerFullStrike 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
      
      // 动画完成回调 - 同步为300ms
      const timeout = setTimeout(() => {
        setAnimationState('completing')
        handleAnimationComplete()
      }, 300)
      
      return () => {
        if (timeout) clearTimeout(timeout)
      }
    }
  }, [isAnimating, animationState, handleAnimationComplete])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      ref={hammerRef}
      className={cn(
        "fixed pointer-events-none z-50",
        animationState !== 'idle' && "hammer-animating"
      )}
      style={{
        left: position.x - 20,
        top: position.y - 50,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* 木鱼锤SVG */}
      <svg
        width="40"
        height="60"
        viewBox="0 0 40 60"
        className="drop-shadow-lg"
      >
        {/* 锤柄 */}
        <rect
          x="18"
          y="20"
          width="4"
          height="35"
          rx="2"
          fill="url(#hammerHandleGradient)"
          stroke="#5d4037"
          strokeWidth="0.5"
        />
        
        {/* 锤头 */}
        <ellipse
          cx="20"
          cy="15"
          rx="12"
          ry="8"
          fill="url(#hammerHeadGradient)"
          stroke="#3e2723"
          strokeWidth="1"
        />
        
        {/* 锤头纹理 */}
        <ellipse
          cx="20"
          cy="13"
          rx="8"
          ry="5"
          fill="none"
          stroke="#5d4037"
          strokeWidth="0.5"
          opacity="0.6"
        />
        
        {/* 锤头中心点 */}
        <circle
          cx="20"
          cy="15"
          r="2"
          fill="#8d6e63"
          opacity="0.8"
        />

        {/* 渐变定义 */}
        <defs>
          <linearGradient id="hammerHandleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8d6e63" />
            <stop offset="50%" stopColor="#6d4c41" />
            <stop offset="100%" stopColor="#5d4037" />
          </linearGradient>
          <radialGradient id="hammerHeadGradient" cx="0.3" cy="0.3">
            <stop offset="0%" stopColor="#a1887f" />
            <stop offset="50%" stopColor="#6d4c41" />
            <stop offset="100%" stopColor="#4e342e" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  )
}