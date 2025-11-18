import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useProfile } from '@/contexts/ProfileContext';
import { ArrowLeft, Settings, User, BarChart3, Trophy, Calendar } from 'lucide-react';

interface ProfilePageProps {
  onBack?: () => void;
  className?: string;
}

export function ProfilePage({ onBack, className }: ProfilePageProps) {
  const { profile, stats, isLoading, error, createProfile } = useProfile();
  const [showCreateProfile, setShowCreateProfile] = useState(false);

  // 如果正在加载
  if (isLoading) {
    return (
      <div className={`container mx-auto p-4 ${className || ''}`}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  // 如果有错误
  if (error) {
    return (
      <div className={`container mx-auto p-4 ${className || ''}`}>
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">加载失败: {error}</p>
            <Button onClick={() => window.location.reload()}>重新加载</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 如果没有用户档案，显示创建档案界面
  if (!profile) {
    return <CreateProfileForm onCreateProfile={createProfile} />;
  }

  return (
    <div className={`container mx-auto p-4 space-y-6 ${className || ''}`}>
      {/* 顶部导航 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
          )}
          <h1 className="text-2xl font-bold">个人主页</h1>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          设置
        </Button>
      </div>

      {/* 用户信息卡片 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            {/* 头像 */}
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
              {profile.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt="头像" 
                  className="w-full h-full rounded-full object-cover" 
                />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </div>

            {/* 用户信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-xl font-semibold truncate">{profile.nickname}</h2>
                <Badge variant="secondary">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(profile.createdAt).toLocaleDateString()}
                </Badge>
              </div>
              
              {profile.signature && (
                <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                  {profile.signature}
                </p>
              )}
              
              <div className="text-xs text-muted-foreground">
                最后更新: {new Date(profile.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {stats.totalClicks.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">总敲击数</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {stats.todayClicks}
            </div>
            <div className="text-sm text-muted-foreground">今日敲击</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {stats.weekClicks}
            </div>
            <div className="text-sm text-muted-foreground">本周敲击</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {stats.monthClicks}
            </div>
            <div className="text-sm text-muted-foreground">本月敲击</div>
          </CardContent>
        </Card>
      </div>

      {/* 连击信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            连击记录
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600 mb-1">
                {stats.streakData.currentStreak}
              </div>
              <div className="text-sm text-muted-foreground">当前连击</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-600 mb-1">
                {stats.streakData.longestStreak}
              </div>
              <div className="text-sm text-muted-foreground">最长连击</div>
            </div>
          </div>
          {stats.streakData.lastStreakDate && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              最后连击日期: {stats.streakData.lastStreakDate}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 历史数据预览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            最近活动
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.dailyHistory.length > 0 ? (
            <div className="space-y-2">
              {stats.dailyHistory
                .slice(-7) // 显示最近7天
                .reverse()
                .map((record) => (
                  <div key={record.date} className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium">{record.date}</span>
                    <Badge variant="outline">
                      {record.clicks} 次
                    </Badge>
                  </div>
                ))}
              {stats.dailyHistory.length > 7 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm">
                    查看更多
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无历史数据</p>
              <p className="text-sm">开始敲击木鱼来记录您的修行历程</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 底部信息 */}
      <div className="text-center text-xs text-muted-foreground">
        {stats.lastClickAt && (
          <p>最后敲击: {new Date(stats.lastClickAt).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}

// 创建档案表单组件
interface CreateProfileFormProps {
  onCreateProfile: (data: { nickname: string; signature?: string }) => Promise<void>;
}

function CreateProfileForm({ onCreateProfile }: CreateProfileFormProps) {
  const [nickname, setNickname] = useState('');
  const [signature, setSignature] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      return;
    }

    setIsCreating(true);
    try {
      await onCreateProfile({
        nickname: nickname.trim(),
        signature: signature.trim() || undefined
      });
    } catch (error) {
      console.error('创建档案失败:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center">
            <User className="h-6 w-6 mr-2" />
            创建个人档案
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            开始您的木鱼修行之旅
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nickname" className="text-sm font-medium mb-2 block">
                昵称 <span className="text-destructive">*</span>
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="请输入您的昵称"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={50}
                required
              />
            </div>

            <div>
              <label htmlFor="signature" className="text-sm font-medium mb-2 block">
                个性签名
              </label>
              <textarea
                id="signature"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="分享您的修行感悟..."
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                rows={3}
                maxLength={200}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {signature.length}/200
              </div>
            </div>

            <Separator />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={!nickname.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  创建中...
                </>
              ) : (
                '创建档案'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}