import React, { useState } from 'react'
import { useWoodenFish } from '../contexts/WoodenFishContext'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Progress } from './ui/progress'
import { 
  Trophy, 
  Heart, 
  Clock, 
  Sparkles,
  Award,
  Star,
  MessageCircle
} from 'lucide-react'
import { useToast } from '../hooks/use-toast'

export default function SidePanel() {
  const { state, dispatch } = useWoodenFish()
  const { toast } = useToast()
  const [wishText, setWishText] = useState('')
  const [meditationTimer, setMeditationTimer] = useState(0)

  // 成就数据
  const achievements = [
    { id: 'first-tap', name: '初心', description: '第一次敲击木鱼', icon: '🔰', unlocked: state.achievements.includes('first-tap') },
    { id: 'merit-100', name: '功德百善', description: '累积100点功德', icon: '💯', unlocked: state.achievements.includes('merit-100') },
    { id: 'merit-1000', name: '功德千里', description: '累积1000点功德', icon: '🏆', unlocked: state.achievements.includes('merit-1000') },
    { id: 'combo-10', name: '十连击', description: '连续敲击10次', icon: '🔥', unlocked: state.achievements.includes('combo-10') },
    { id: 'combo-50', name: '五十连击', description: '连续敲击50次', icon: '⚡', unlocked: state.achievements.includes('combo-50') },
    { id: 'daily-100', name: '日行百善', description: '单日敲击100次', icon: '🌟', unlocked: state.todayTaps >= 100 },
  ]

  // 处理许愿
  const handleMakeWish = () => {
    if (!wishText.trim()) {
      toast({
        title: "❌ 许愿失败",
        description: "请输入您的愿望",
        variant: "destructive"
      })
      return
    }

    const meritCost = 10
    if (state.merit < meritCost) {
      toast({
        title: "❌ 功德不足",
        description: `许愿需要消耗 ${meritCost} 点功德`,
        variant: "destructive"
      })
      return
    }

    const wish = {
      id: Date.now().toString(),
      content: wishText,
      meritCost,
      timestamp: Date.now()
    }

    dispatch({ type: 'ADD_WISH', payload: wish })
    setWishText('')
    
    toast({
      title: "✨ 许愿成功",
      description: "愿您心想事成，功德圆满",
    })
  }

  // 开始冥想
  const startMeditation = () => {
    if (state.isMeditating) {
      dispatch({ type: 'STOP_MEDITATION' })
      toast({
        title: "🧘 冥想结束",
        description: `本次冥想 ${Math.floor(meditationTimer / 60)} 分 ${meditationTimer % 60} 秒`,
      })
      setMeditationTimer(0)
    } else {
      dispatch({ type: 'START_MEDITATION' })
      toast({
        title: "🧘 开始冥想",
        description: "进入冥想模式，专注当下",
      })
    }
  }

  // 冥想计时器
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (state.isMeditating) {
      interval = setInterval(() => {
        setMeditationTimer(prev => {
          const newTime = prev + 1
          dispatch({ type: 'UPDATE_MEDITATION_TIME', payload: newTime })
          return newTime
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [state.isMeditating, dispatch])

  return (
    <div className="w-80 h-screen overflow-y-auto bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50 p-4 space-y-4">
      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="achievements" className="text-xs">
            <Trophy className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="meditation" className="text-xs">
            <Clock className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="wishes" className="text-xs">
            <Sparkles className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="quotes" className="text-xs">
            <MessageCircle className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>

        {/* 成就系统 */}
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Award className="w-5 h-5 mr-2 text-amber-600" />
                成就系统
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                    achievement.unlocked
                      ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700'
                      : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 opacity-60'
                  }`}
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{achievement.name}</h4>
                    <p className="text-xs text-gray-500">{achievement.description}</p>
                  </div>
                  {achievement.unlocked && (
                    <Badge variant="secondary" className="text-xs">
                      已解锁
                    </Badge>
                  )}
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">成就进度</span>
                  <span className="text-sm text-amber-600">
                    {state.achievements.length}/{achievements.length}
                  </span>
                </div>
                <Progress 
                  value={(state.achievements.length / achievements.length) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 冥想计时器 */}
        <TabsContent value="meditation" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                冥想计时
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-mono font-bold text-blue-600 mb-2">
                  {Math.floor(meditationTimer / 60).toString().padStart(2, '0')}:
                  {(meditationTimer % 60).toString().padStart(2, '0')}
                </div>
                <p className="text-sm text-gray-500">
                  {state.isMeditating ? '冥想进行中...' : '点击开始冥想'}
                </p>
              </div>
              
              <Button
                onClick={startMeditation}
                variant={state.isMeditating ? "destructive" : "default"}
                className="w-full"
              >
                {state.isMeditating ? '结束冥想' : '开始冥想'}
              </Button>
              
              <div className="text-xs text-gray-500 text-center">
                <p>总冥想时间: {Math.floor(state.meditationTime / 60)} 分钟</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 祈愿功能 */}
        <TabsContent value="wishes" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                祈愿许愿
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Textarea
                  placeholder="请输入您的愿望..."
                  value={wishText}
                  onChange={(e) => setWishText(e.target.value)}
                  className="min-h-20"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">消耗功德: 10</span>
                  <span className="text-amber-600">当前功德: {state.merit}</span>
                </div>
                <Button
                  onClick={handleMakeWish}
                  disabled={state.merit < 10 || !wishText.trim()}
                  className="w-full"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  许愿
                </Button>
              </div>
              
              {/* 愿望记录 */}
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">愿望记录</h4>
                {state.wishes.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">暂无愿望记录</p>
                ) : (
                  state.wishes.slice(-5).reverse().map((wish) => (
                    <div key={wish.id} className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-xs">
                      <p className="text-gray-700 dark:text-gray-300">{wish.content}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(wish.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 禅语欣赏 */}
        <TabsContent value="quotes" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
                禅语智慧
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                <p className="text-center font-serif text-lg leading-relaxed text-green-700 dark:text-green-300">
                  {state.zenQuote}
                </p>
              </div>
              
              <Button
                onClick={() => {
                  const quotes = [
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
                  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
                  dispatch({ type: 'SET_ZEN_QUOTE', payload: randomQuote })
                }}
                variant="outline"
                className="w-full"
              >
                <Star className="w-4 h-4 mr-2" />
                换一句禅语
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}