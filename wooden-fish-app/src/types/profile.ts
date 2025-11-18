// 个人主页功能的TypeScript类型定义

export interface UserProfile {
  id: string;
  nickname: string;
  avatar?: string; // Base64 或 URL
  signature?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    achievements: boolean;
    dailyReminder: boolean;
  };
}

export interface ClickStatistics {
  totalClicks: number;
  todayClicks: number;
  weekClicks: number;
  monthClicks: number;
  lastClickAt?: Date;
  dailyHistory: DailyClickRecord[];
  streakData: StreakData;
}

export interface DailyClickRecord {
  date: string; // YYYY-MM-DD
  clicks: number;
  timestamp: Date;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastStreakDate: string; // YYYY-MM-DD
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji 或 URL
  category: AchievementCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  condition: AchievementCondition;
  unlockedAt?: Date;
  progress?: number; // 0-100
}

export type AchievementCategory = 
  | 'milestone'     // 里程碑 (总数相关)
  | 'streak'        // 连击相关
  | 'time'          // 时间相关
  | 'special';      // 特殊成就

export interface AchievementCondition {
  type: 'total_clicks' | 'daily_streak' | 'single_day' | 'time_based';
  target: number;
  timeframe?: string;
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: Date;
  progress: number;
}

// 存储键名常量
export const STORAGE_KEYS = {
  USER_PROFILE: 'wooden_fish_user_profile',
  CLICK_STATISTICS: 'wooden_fish_click_stats',
  USER_ACHIEVEMENTS: 'wooden_fish_achievements',
  APP_SETTINGS: 'wooden_fish_app_settings',
  DATA_VERSION: 'wooden_fish_data_version'
} as const;

// 验证规则
export const ValidationRules = {
  nickname: {
    minLength: 1,
    maxLength: 50,
    pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_\-\s]+$/
  },
  signature: {
    maxLength: 200
  },
  avatar: {
    maxSize: 200 * 1024, // 200KB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  }
} as const;

// 错误类型
export enum ProfileErrorType {
  STORAGE_ERROR = 'STORAGE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR'
}

export interface ProfileError {
  type: ProfileErrorType;
  message: string;
  details?: any;
  timestamp: Date;
}