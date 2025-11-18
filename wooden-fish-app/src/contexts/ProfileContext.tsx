import React, { createContext, useContext, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { UserProfile, ClickStatistics, STORAGE_KEYS, UserPreferences } from '@/types/profile';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

interface ProfileContextType {
  // 状态
  profile: UserProfile | null;
  stats: ClickStatistics;
  isLoading: boolean;
  error: string | null;

  // 档案操作
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  createProfile: (profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt' | 'preferences'>) => Promise<void>;
  resetProfile: () => Promise<void>;

  // 统计操作
  recordClick: () => void;
  refreshStats: () => Promise<void>;
  getTodayClicks: () => number;
  getWeekClicks: () => number;
  getMonthClicks: () => number;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const { toast } = useToast();
  
  // 使用localStorage hooks
  const [profile, setProfile, profileStorage] = useLocalStorage<UserProfile | null>(
    STORAGE_KEYS.USER_PROFILE,
    null
  );
  
  const [stats, setStats, statsStorage] = useLocalStorage<ClickStatistics>(
    STORAGE_KEYS.CLICK_STATISTICS,
    {
      totalClicks: 0,
      todayClicks: 0,
      weekClicks: 0,
      monthClicks: 0,
      lastClickAt: undefined,
      dailyHistory: [],
      streakData: {
        currentStreak: 0,
        longestStreak: 0,
        lastStreakDate: ''
      }
    }
  );

  // 计算加载状态和错误
  const isLoading = profileStorage.loading || statsStorage.loading;
  const error = profileStorage.error || statsStorage.error;

  // 生成唯一ID
  const generateId = useCallback((): string => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // 创建用户档案
  const createProfile = useCallback(async (
    profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt' | 'preferences'>
  ) => {
    try {
      const now = new Date();
      const newProfile: UserProfile = {
        ...profileData,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        preferences: {
          theme: 'system',
          language: 'zh-CN',
          notifications: {
            achievements: true,
            dailyReminder: false
          }
        }
      };

      setProfile(newProfile);
      toast({
        title: "个人档案创建成功",
        description: `欢迎，${newProfile.nickname}！`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建档案失败';
      toast({
        title: "创建失败",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  }, [generateId, setProfile, toast]);

  // 更新用户档案
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile) {
      throw new Error('用户档案不存在');
    }

    try {
      const updatedProfile: UserProfile = {
        ...profile,
        ...updates,
        updatedAt: new Date()
      };

      setProfile(updatedProfile);
      toast({
        title: "档案更新成功",
        description: "您的个人信息已保存",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新档案失败';
      toast({
        title: "更新失败", 
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  }, [profile, setProfile, toast]);

  // 重置档案
  const resetProfile = useCallback(async () => {
    try {
      setProfile(null);
      setStats({
        totalClicks: 0,
        todayClicks: 0,
        weekClicks: 0,
        monthClicks: 0,
        lastClickAt: undefined,
        dailyHistory: [],
        streakData: {
          currentStreak: 0,
          longestStreak: 0,
          lastStreakDate: ''
        }
      });
      
      toast({
        title: "档案已重置",
        description: "所有数据已清除",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '重置失败';
      toast({
        title: "重置失败",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  }, [setProfile, setStats, toast]);

  // 获取今天的日期字符串
  const getTodayDateString = useCallback((): string => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // 计算统计数据
  const calculateStats = useCallback((history: typeof stats.dailyHistory) => {
    const today = getTodayDateString();
    const now = new Date();
    
    // 计算今日敲击数
    const todayRecord = history.find(record => record.date === today);
    const todayClicks = todayRecord?.clicks || 0;

    // 计算本周敲击数 (周一到今天)
    const startOfWeek = new Date(now);
    const dayOfWeek = startOfWeek.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(startOfWeek.getDate() - daysFromMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekClicks = history
      .filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startOfWeek && recordDate <= now;
      })
      .reduce((sum, record) => sum + record.clicks, 0);

    // 计算本月敲击数
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthClicks = history
      .filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startOfMonth && recordDate <= now;
      })
      .reduce((sum, record) => sum + record.clicks, 0);

    return { todayClicks, weekClicks, monthClicks };
  }, [getTodayDateString]);

  // 记录敲击
  const recordClick = useCallback(() => {
    const now = new Date();
    const today = getTodayDateString();

    setStats(prevStats => {
      // 更新或创建今日记录
      const updatedHistory = [...prevStats.dailyHistory];
      const todayIndex = updatedHistory.findIndex(record => record.date === today);
      
      if (todayIndex >= 0) {
        updatedHistory[todayIndex] = {
          ...updatedHistory[todayIndex],
          clicks: updatedHistory[todayIndex].clicks + 1,
          timestamp: now
        };
      } else {
        updatedHistory.push({
          date: today,
          clicks: 1,
          timestamp: now
        });
      }

      // 保持最近90天的数据
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const filteredHistory = updatedHistory.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= ninetyDaysAgo;
      });

      // 重新计算统计数据
      const newStats = calculateStats(filteredHistory);

      return {
        ...prevStats,
        totalClicks: prevStats.totalClicks + 1,
        ...newStats,
        lastClickAt: now,
        dailyHistory: filteredHistory
      };
    });
  }, [getTodayDateString, setStats, calculateStats]);

  // 刷新统计数据
  const refreshStats = useCallback(async () => {
    const newStats = calculateStats(stats.dailyHistory);
    setStats(prevStats => ({
      ...prevStats,
      ...newStats
    }));
  }, [stats.dailyHistory, calculateStats, setStats]);

  // 获取统计数据的便捷方法
  const getTodayClicks = useCallback(() => stats.todayClicks, [stats.todayClicks]);
  const getWeekClicks = useCallback(() => stats.weekClicks, [stats.weekClicks]);
  const getMonthClicks = useCallback(() => stats.monthClicks, [stats.monthClicks]);

  // 初始化时刷新统计数据
  useEffect(() => {
    if (!isLoading && stats.dailyHistory.length > 0) {
      refreshStats();
    }
  }, [isLoading]); // 只在加载完成时执行一次

  // Context值
  const contextValue = useMemo(() => ({
    // 状态
    profile,
    stats,
    isLoading,
    error,
    
    // 档案操作
    updateProfile,
    createProfile,
    resetProfile,
    
    // 统计操作
    recordClick,
    refreshStats,
    getTodayClicks,
    getWeekClicks,
    getMonthClicks
  }), [
    profile,
    stats,
    isLoading,
    error,
    updateProfile,
    createProfile, 
    resetProfile,
    recordClick,
    refreshStats,
    getTodayClicks,
    getWeekClicks,
    getMonthClicks
  ]);

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
}

// Hook for using the profile context
export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

// 导出类型以供其他文件使用
export type { ProfileContextType };