import React, { createContext, useContext, useReducer, useEffect } from 'react'

// 祈愿类型
interface Wish {
  id: string
  content: string
  meritCost: number
  timestamp: number
}

// 状态类型定义
interface WoodenFishState {
  merit: number // 功德值
  todayTaps: number // 今日敲击次数
  combo: number // 连击数
  lastTapTime: number // 上次敲击时间
  isAutoTapping: boolean // 是否自动敲击
  autoTapSpeed: number // 自动敲击速度(次/秒)
  autoTapDuration: number // 自动敲击持续时间(分钟)
  volume: number // 音量 0-1
  selectedSound: string // 选中的音效
  selectedTheme: string // 选中的主题
  achievements: string[] // 已解锁成就
  wishes: Wish[] // 祈愿记录
  zenQuote: string // 当前禅语
  meditationTime: number // 冥想时间(秒)
  isMeditating: boolean // 是否在冥想
}

// 动作类型
type WoodenFishAction =
  | { type: 'TAP_WOODEN_FISH' }
  | { type: 'SET_AUTO_TAPPING'; payload: boolean }
  | { type: 'SET_AUTO_TAP_SPEED'; payload: number }
  | { type: 'SET_AUTO_TAP_DURATION'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_SOUND'; payload: string }
  | { type: 'SET_THEME'; payload: string }
  | { type: 'ADD_ACHIEVEMENT'; payload: string }
  | { type: 'ADD_WISH'; payload: Wish }
  | { type: 'SET_ZEN_QUOTE'; payload: string }
  | { type: 'START_MEDITATION' }
  | { type: 'STOP_MEDITATION' }
  | { type: 'UPDATE_MEDITATION_TIME'; payload: number }
  | { type: 'RESET_COMBO' }
  | { type: 'LOAD_STATE'; payload: Partial<WoodenFishState> }

// 初始状态
const initialState: WoodenFishState = {
  merit: 0,
  todayTaps: 0,
  combo: 0,
  lastTapTime: 0,
  isAutoTapping: false,
  autoTapSpeed: 1,
  autoTapDuration: 5,
  volume: 0.7,
  selectedSound: 'classic',
  selectedTheme: 'default',
  achievements: [],
  wishes: [],
  zenQuote: '心静自然凉，功德自然来',
  meditationTime: 0,
  isMeditating: false,
}

// 禅语库
const zenQuotes = [
  '心静自然凉，功德自然来',
  '一念善心起，功德遍十方',
  '敲击木鱼声，净化心灵尘',
  '功德如甘露，滋润众生心',
  '静心敲木鱼，烦恼自消散',
  '每一声敲击，都是慈悲心',
  '木鱼声声响，智慧日日增',
  '功德积如山，慈悲深如海',
  '敲击即修行，声声皆佛音',
  '心诚则灵验，功德自无量'
]

// Reducer函数
function woodenFishReducer(state: WoodenFishState, action: WoodenFishAction): WoodenFishState {
  switch (action.type) {
    case 'TAP_WOODEN_FISH': {
      const now = Date.now()
      const timeDiff = now - state.lastTapTime
      const newCombo = timeDiff < 2000 ? state.combo + 1 : 1
      
      return {
        ...state,
        merit: state.merit + 1,
        todayTaps: state.todayTaps + 1,
        combo: newCombo,
        lastTapTime: now,
      }
    }
    
    case 'SET_AUTO_TAPPING':
      return { ...state, isAutoTapping: action.payload }
    
    case 'SET_AUTO_TAP_SPEED':
      return { ...state, autoTapSpeed: action.payload }
    
    case 'SET_AUTO_TAP_DURATION':
      return { ...state, autoTapDuration: action.payload }
    
    case 'SET_VOLUME':
      return { ...state, volume: action.payload }
    
    case 'SET_SOUND':
      return { ...state, selectedSound: action.payload }
    
    case 'SET_THEME':
      return { ...state, selectedTheme: action.payload }
    
    case 'ADD_ACHIEVEMENT':
      if (!state.achievements.includes(action.payload)) {
        return { ...state, achievements: [...state.achievements, action.payload] }
      }
      return state
    
    case 'ADD_WISH':
      if (state.merit >= action.payload.meritCost) {
        return {
          ...state,
          merit: state.merit - action.payload.meritCost,
          wishes: [...state.wishes, action.payload]
        }
      }
      return state
    
    case 'SET_ZEN_QUOTE':
      return { ...state, zenQuote: action.payload }
    
    case 'START_MEDITATION':
      return { ...state, isMeditating: true }
    
    case 'STOP_MEDITATION':
      return { ...state, isMeditating: false }
    
    case 'UPDATE_MEDITATION_TIME':
      return { ...state, meditationTime: action.payload }
    
    case 'RESET_COMBO':
      return { ...state, combo: 0 }
    
    case 'LOAD_STATE':
      return { ...state, ...action.payload }
    
    default:
      return state
  }
}

// Context创建
const WoodenFishContext = createContext<{
  state: WoodenFishState
  dispatch: React.Dispatch<WoodenFishAction>
} | null>(null)

// Provider组件
export function WoodenFishProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(woodenFishReducer, initialState)

  // 本地存储
  useEffect(() => {
    const savedState = localStorage.getItem('wooden-fish-state')
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        dispatch({ type: 'LOAD_STATE', payload: parsedState })
      } catch (error) {
        console.error('Failed to load saved state:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('wooden-fish-state', JSON.stringify(state))
  }, [state])

  // 自动更换禅语
  useEffect(() => {
    const interval = setInterval(() => {
      const randomQuote = zenQuotes[Math.floor(Math.random() * zenQuotes.length)]
      dispatch({ type: 'SET_ZEN_QUOTE', payload: randomQuote })
    }, 30000) // 30秒更换一次

    return () => clearInterval(interval)
  }, [])

  // 连击重置
  useEffect(() => {
    if (state.combo > 0) {
      const timeout = setTimeout(() => {
        dispatch({ type: 'RESET_COMBO' })
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [state.lastTapTime, state.combo])

  // 成就检查
  useEffect(() => {
    // 首次敲击
    if (state.todayTaps === 1 && !state.achievements.includes('first-tap')) {
      dispatch({ type: 'ADD_ACHIEVEMENT', payload: 'first-tap' })
    }
    
    // 功德里程碑
    if (state.merit >= 100 && !state.achievements.includes('merit-100')) {
      dispatch({ type: 'ADD_ACHIEVEMENT', payload: 'merit-100' })
    }
    
    if (state.merit >= 1000 && !state.achievements.includes('merit-1000')) {
      dispatch({ type: 'ADD_ACHIEVEMENT', payload: 'merit-1000' })
    }
    
    // 连击成就
    if (state.combo >= 10 && !state.achievements.includes('combo-10')) {
      dispatch({ type: 'ADD_ACHIEVEMENT', payload: 'combo-10' })
    }
    
    if (state.combo >= 50 && !state.achievements.includes('combo-50')) {
      dispatch({ type: 'ADD_ACHIEVEMENT', payload: 'combo-50' })
    }
  }, [state.merit, state.combo, state.todayTaps, state.achievements])

  return (
    <WoodenFishContext.Provider value={{ state, dispatch }}>
      {children}
    </WoodenFishContext.Provider>
  )
}

// Hook
export function useWoodenFish() {
  const context = useContext(WoodenFishContext)
  if (!context) {
    throw new Error('useWoodenFish must be used within a WoodenFishProvider')
  }
  return context
}