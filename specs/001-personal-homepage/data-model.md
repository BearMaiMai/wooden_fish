# Data Model: 个人主页数据模型

**Feature**: 个人主页功能  
**Date**: 2025-11-18  
**Status**: Phase 1 Design

## 1. 核心数据实体

### 1.1 UserProfile (用户档案)
```typescript
interface UserProfile {
  id: string;                    // 唯一标识符 (UUID)
  nickname: string;              // 用户昵称 (最大50字符)
  avatar?: string;               // 头像 (Base64 或 URL)
  signature?: string;            // 个性签名 (最大200字符)
  createdAt: Date;              // 注册时间
  updatedAt: Date;              // 最后更新时间
  preferences: UserPreferences;  // 用户偏好设置
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';  // 主题偏好
  language: string;                     // 语言偏好
  notifications: {
    achievements: boolean;              // 成就通知
    dailyReminder: boolean;            // 每日提醒
  };
}
```

### 1.2 ClickStatistics (敲击统计)
```typescript
interface ClickStatistics {
  totalClicks: number;           // 总敲击数
  todayClicks: number;          // 今日敲击数
  weekClicks: number;           // 本周敲击数
  monthClicks: number;          // 本月敲击数
  lastClickAt?: Date;           // 最后敲击时间
  dailyHistory: DailyClickRecord[];  // 每日历史记录
  streakData: StreakData;       // 连击数据
}

interface DailyClickRecord {
  date: string;                 // 日期 (YYYY-MM-DD)
  clicks: number;               // 当日敲击数
  timestamp: Date;              // 记录时间戳
}

interface StreakData {
  currentStreak: number;        // 当前连续天数
  longestStreak: number;        // 最长连续天数
  lastStreakDate: string;       // 最后连击日期
}
```

### 1.3 Achievement (成就系统)
```typescript
interface Achievement {
  id: string;                   // 成就唯一标识符
  name: string;                 // 成就名称
  description: string;          // 成就描述
  icon: string;                 // 成就图标 (emoji 或 URL)
  category: AchievementCategory; // 成就分类
  rarity: 'common' | 'rare' | 'epic' | 'legendary'; // 稀有度
  condition: AchievementCondition; // 解锁条件
  unlockedAt?: Date;           // 解锁时间
  progress?: number;           // 当前进度 (0-100)
}

type AchievementCategory = 
  | 'milestone'     // 里程碑 (总数相关)
  | 'streak'        // 连击相关
  | 'time'          // 时间相关
  | 'special';      // 特殊成就

interface AchievementCondition {
  type: 'total_clicks' | 'daily_streak' | 'single_day' | 'time_based';
  target: number;               // 目标值
  timeframe?: string;           // 时间范围 (可选)
}

interface UserAchievement {
  achievementId: string;        // 成就ID
  unlockedAt: Date;            // 解锁时间
  progress: number;            // 解锁时的进度
}
```

## 2. 数据存储结构

### 2.1 LocalStorage 键值结构
```typescript
// 存储键名常量
const STORAGE_KEYS = {
  USER_PROFILE: 'wooden_fish_user_profile',
  CLICK_STATISTICS: 'wooden_fish_click_stats', 
  USER_ACHIEVEMENTS: 'wooden_fish_achievements',
  APP_SETTINGS: 'wooden_fish_app_settings',
  DATA_VERSION: 'wooden_fish_data_version'
} as const;

// 数据版本管理
interface DataVersion {
  version: string;              // 数据版本号 (如: "1.0.0")
  migratedAt: Date;            // 迁移时间
  previousVersion?: string;     // 前一版本号
}
```

### 2.2 存储数据示例
```json
{
  "wooden_fish_user_profile": {
    "id": "user_123456789",
    "nickname": "禅心居士",
    "avatar": "data:image/jpeg;base64,/9j/4AAQ...",
    "signature": "南无阿弥陀佛，功德无量",
    "createdAt": "2025-11-18T08:00:00.000Z",
    "updatedAt": "2025-11-18T16:30:00.000Z",
    "preferences": {
      "theme": "dark",
      "language": "zh-CN",
      "notifications": {
        "achievements": true,
        "dailyReminder": false
      }
    }
  },
  
  "wooden_fish_click_stats": {
    "totalClicks": 1234,
    "todayClicks": 56,
    "weekClicks": 234,
    "monthClicks": 890,
    "lastClickAt": "2025-11-18T16:25:30.000Z",
    "dailyHistory": [
      {
        "date": "2025-11-18",
        "clicks": 56,
        "timestamp": "2025-11-18T16:25:30.000Z"
      }
    ],
    "streakData": {
      "currentStreak": 7,
      "longestStreak": 15,
      "lastStreakDate": "2025-11-18"
    }
  },
  
  "wooden_fish_achievements": [
    {
      "achievementId": "first_click",
      "unlockedAt": "2025-11-01T10:00:00.000Z",
      "progress": 100
    },
    {
      "achievementId": "streak_7_days", 
      "unlockedAt": "2025-11-18T16:00:00.000Z",
      "progress": 100
    }
  ]
}
```

## 3. 数据操作接口

### 3.1 用户档案操作
```typescript
interface ProfileService {
  // 获取用户档案
  getProfile(): Promise<UserProfile | null>;
  
  // 更新用户档案
  updateProfile(updates: Partial<UserProfile>): Promise<void>;
  
  // 上传头像
  uploadAvatar(file: File): Promise<string>;
  
  // 重置档案
  resetProfile(): Promise<void>;
}
```

### 3.2 统计数据操作
```typescript
interface StatsService {
  // 获取统计数据
  getStats(): Promise<ClickStatistics>;
  
  // 记录新的敲击
  recordClick(timestamp?: Date): Promise<void>;
  
  // 获取历史数据
  getHistoryData(days: number): Promise<DailyClickRecord[]>;
  
  // 计算连击数据
  calculateStreak(): Promise<StreakData>;
  
  // 清理过期数据
  cleanupOldData(keepDays: number): Promise<void>;
}
```

### 3.3 成就系统操作
```typescript
interface AchievementService {
  // 获取所有成就定义
  getAllAchievements(): Achievement[];
  
  // 获取用户已解锁成就
  getUserAchievements(): Promise<UserAchievement[]>;
  
  // 检查成就条件
  checkAchievements(stats: ClickStatistics): Promise<Achievement[]>;
  
  // 解锁成就
  unlockAchievement(achievementId: string): Promise<void>;
  
  // 获取成就进度
  getAchievementProgress(achievementId: string): Promise<number>;
}
```

## 4. 数据流设计

### 4.1 数据更新流程
```
用户敲击木鱼
    ↓
WoodenFishContext 记录敲击
    ↓
触发 StatsService.recordClick()
    ↓
更新 ClickStatistics
    ↓
触发 AchievementService.checkAchievements()
    ↓
检查并解锁新成就
    ↓
更新 UI 显示
```

### 4.2 数据同步策略
- **实时同步**: 敲击数据立即更新
- **批量同步**: 统计数据每分钟批量计算
- **延迟同步**: 历史数据每小时整理一次
- **持久化**: 所有变更立即写入 LocalStorage

## 5. 数据验证与约束

### 5.1 数据验证规则
```typescript
const ValidationRules = {
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
};
```

### 5.2 数据完整性检查
```typescript
interface DataIntegrityChecker {
  // 验证用户档案数据
  validateProfile(profile: UserProfile): ValidationResult;
  
  // 验证统计数据
  validateStats(stats: ClickStatistics): ValidationResult;
  
  // 修复损坏的数据
  repairData(): Promise<RepairResult>;
  
  // 数据备份
  backupData(): Promise<string>;
  
  // 数据恢复
  restoreData(backup: string): Promise<void>;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
```

## 6. 性能考虑

### 6.1 数据大小估算
- UserProfile: ~1KB
- ClickStatistics (30天数据): ~2KB
- UserAchievements: ~1KB
- 头像图片: 50-200KB
- **总计**: < 300KB (LocalStorage 5MB 限制内安全)

### 6.2 优化策略
- **数据压缩**: JSON 数据最小化
- **懒加载**: 历史数据按需加载
- **缓存策略**: 内存缓存频繁访问的数据
- **清理机制**: 定期清理过期数据

## 7. 数据迁移策略

### 7.1 版本升级处理
```typescript
interface DataMigration {
  version: string;
  migrate(oldData: any): Promise<any>;
  rollback?(newData: any): Promise<any>;
}

const migrations: DataMigration[] = [
  {
    version: '1.1.0',
    migrate: async (oldData) => {
      // 添加新的 preferences 字段
      return {
        ...oldData,
        preferences: {
          theme: 'system',
          language: 'zh-CN',
          notifications: {
            achievements: true,
            dailyReminder: false
          }
        }
      };
    }
  }
];
```

### 7.2 数据备份恢复
- 自动备份: 每周自动创建数据备份
- 手动备份: 用户可手动导出数据
- 数据恢复: 支持从备份文件恢复数据
- 跨设备同步: 未来可扩展云端同步功能