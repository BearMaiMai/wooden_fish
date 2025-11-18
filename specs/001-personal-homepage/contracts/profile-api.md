# Profile API Contracts

**Feature**: 个人主页功能  
**Date**: 2025-11-18  
**Type**: 内部 API 契约

## 1. ProfileContext API

### 1.1 Context Provider Interface
```typescript
interface ProfileContextType {
  // 状态
  profile: UserProfile | null;
  stats: ClickStatistics;
  isLoading: boolean;
  error: string | null;

  // 档案操作
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  createProfile: (profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  resetProfile: () => Promise<void>;

  // 统计操作
  recordClick: () => void;
  getHistoryData: (days: number) => DailyClickRecord[];
  refreshStats: () => Promise<void>;

  // 成就操作
  checkAchievements: () => Promise<Achievement[]>;
  getUserAchievements: () => UserAchievement[];
}
```

### 1.2 使用示例
```typescript
// 获取用户档案
const { profile, updateProfile } = useProfile();

// 更新昵称
await updateProfile({ nickname: '新昵称' });

// 记录敲击
recordClick();

// 获取历史数据
const history = getHistoryData(30);
```

## 2. LocalStorage API

### 2.1 存储键名规范
```typescript
const STORAGE_KEYS = {
  USER_PROFILE: 'wooden_fish_user_profile',
  CLICK_STATISTICS: 'wooden_fish_click_stats',
  USER_ACHIEVEMENTS: 'wooden_fish_achievements',
  APP_SETTINGS: 'wooden_fish_app_settings',
  DATA_VERSION: 'wooden_fish_data_version'
} as const;
```

### 2.2 数据格式契约
```typescript
// 用户档案存储格式
interface StoredUserProfile {
  id: string;
  nickname: string;
  avatar?: string;
  signature?: string;
  createdAt: string; // ISO 8601 字符串
  updatedAt: string; // ISO 8601 字符串
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: {
      achievements: boolean;
      dailyReminder: boolean;
    };
  };
}

// 统计数据存储格式
interface StoredClickStatistics {
  totalClicks: number;
  todayClicks: number;
  weekClicks: number;
  monthClicks: number;
  lastClickAt?: string; // ISO 8601 字符串
  dailyHistory: Array<{
    date: string; // YYYY-MM-DD
    clicks: number;
    timestamp: string; // ISO 8601 字符串
  }>;
  streakData: {
    currentStreak: number;
    longestStreak: number;
    lastStreakDate: string; // YYYY-MM-DD
  };
}
```

## 3. Component Props API

### 3.1 ProfilePage Props
```typescript
interface ProfilePageProps {
  className?: string;
  onBack?: () => void;
}
```

### 3.2 ProfileHeader Props
```typescript
interface ProfileHeaderProps {
  profile: UserProfile;
  onEdit?: () => void;
  editable?: boolean;
  className?: string;
}
```

### 3.3 StatsOverview Props
```typescript
interface StatsOverviewProps {
  stats: ClickStatistics;
  loading?: boolean;
  className?: string;
}
```

### 3.4 StatsChart Props
```typescript
interface StatsChartProps {
  data: DailyClickRecord[];
  height?: number;
  showTooltip?: boolean;
  className?: string;
}
```

### 3.5 ProfileSettings Props
```typescript
interface ProfileSettingsProps {
  profile: UserProfile;
  onSave: (updates: Partial<UserProfile>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}
```

### 3.6 AvatarUpload Props
```typescript
interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload: (file: File) => Promise<string>;
  maxSize?: number; // bytes
  allowedTypes?: string[];
  className?: string;
}
```

## 4. Hook APIs

### 4.1 useLocalStorage Hook
```typescript
function useLocalStorage<T>(
  key: string, 
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void];

// 使用示例
const [profile, setProfile] = useLocalStorage<UserProfile | null>(
  'user_profile', 
  null
);
```

### 4.2 useUserStats Hook
```typescript
interface UseUserStatsReturn {
  stats: ClickStatistics;
  recordClick: () => void;
  getHistoryData: (days: number) => DailyClickRecord[];
  refreshStats: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

function useUserStats(): UseUserStatsReturn;
```

### 4.3 useAchievements Hook
```typescript
interface UseAchievementsReturn {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  checkAchievements: () => Promise<Achievement[]>;
  getProgress: (achievementId: string) => number;
  isUnlocked: (achievementId: string) => boolean;
}

function useAchievements(): UseAchievementsReturn;
```

## 5. Utility APIs

### 5.1 statsCalculator 工具
```typescript
interface StatsCalculator {
  // 计算今日敲击数
  calculateTodayClicks(history: DailyClickRecord[]): number;
  
  // 计算本周敲击数
  calculateWeekClicks(history: DailyClickRecord[]): number;
  
  // 计算本月敲击数
  calculateMonthClicks(history: DailyClickRecord[]): number;
  
  // 计算连击天数
  calculateStreak(history: DailyClickRecord[]): StreakData;
  
  // 生成图表数据
  generateChartData(history: DailyClickRecord[], days: number): ChartDataPoint[];
}
```

### 5.2 achievementEngine 工具
```typescript
interface AchievementEngine {
  // 检查单个成就条件
  checkAchievement(achievement: Achievement, stats: ClickStatistics): boolean;
  
  // 批量检查成就
  checkAllAchievements(stats: ClickStatistics): Achievement[];
  
  // 计算成就进度
  calculateProgress(achievement: Achievement, stats: ClickStatistics): number;
  
  // 获取下一个目标成就
  getNextTargets(stats: ClickStatistics): Achievement[];
}
```

### 5.3 imageUtils 工具
```typescript
interface ImageUtils {
  // 压缩图片
  compressImage(file: File, maxSize: number, quality: number): Promise<File>;
  
  // 转换为 Base64
  fileToBase64(file: File): Promise<string>;
  
  // 验证图片格式
  validateImageType(file: File, allowedTypes: string[]): boolean;
  
  // 获取图片尺寸
  getImageDimensions(file: File): Promise<{ width: number; height: number }>;
}
```

## 6. 事件契约

### 6.1 Profile 事件
```typescript
// 档案更新事件
interface ProfileUpdateEvent {
  type: 'profile:update';
  profile: UserProfile;
  changes: Partial<UserProfile>;
}

// 档案创建事件
interface ProfileCreateEvent {
  type: 'profile:create';
  profile: UserProfile;
}

// 档案重置事件
interface ProfileResetEvent {
  type: 'profile:reset';
}
```

### 6.2 Stats 事件
```typescript
// 敲击记录事件
interface ClickRecordEvent {
  type: 'click:record';
  timestamp: Date;
  newStats: ClickStatistics;
}

// 统计刷新事件
interface StatsRefreshEvent {
  type: 'stats:refresh';
  stats: ClickStatistics;
}
```

### 6.3 Achievement 事件
```typescript
// 成就解锁事件
interface AchievementUnlockEvent {
  type: 'achievement:unlock';
  achievement: Achievement;
  timestamp: Date;
}

// 成就进度更新事件
interface AchievementProgressEvent {
  type: 'achievement:progress';
  achievementId: string;
  progress: number;
}
```

## 7. 错误处理契约

### 7.1 错误类型定义
```typescript
enum ProfileErrorType {
  STORAGE_ERROR = 'STORAGE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR'
}

interface ProfileError {
  type: ProfileErrorType;
  message: string;
  details?: any;
  timestamp: Date;
}
```

### 7.2 错误处理策略
```typescript
interface ErrorHandler {
  // 处理存储错误
  handleStorageError(error: Error): void;
  
  // 处理验证错误
  handleValidationError(field: string, message: string): void;
  
  // 显示用户友好的错误信息
  showUserError(error: ProfileError): void;
  
  // 记录错误日志
  logError(error: ProfileError): void;
}
```

## 8. 性能指标契约

### 8.1 性能要求
```typescript
interface PerformanceMetrics {
  // 页面加载时间 (毫秒)
  pageLoadTime: number; // < 3000ms
  
  // 组件渲染时间 (毫秒)
  componentRenderTime: number; // < 100ms
  
  // 数据操作时间 (毫秒)
  dataOperationTime: number; // < 50ms
  
  // 内存使用量 (MB)
  memoryUsage: number; // < 50MB
  
  // 存储使用量 (KB)
  storageUsage: number; // < 300KB
}
```

### 8.2 性能监控接口
```typescript
interface PerformanceMonitor {
  // 开始性能测量
  startMeasure(name: string): void;
  
  // 结束性能测量
  endMeasure(name: string): number;
  
  // 记录性能指标
  recordMetric(name: string, value: number): void;
  
  // 获取性能报告
  getPerformanceReport(): PerformanceMetrics;
}
```

## 9. 测试契约

### 9.1 单元测试接口
```typescript
interface TestSuite {
  // 测试用户档案操作
  testProfileOperations(): Promise<void>;
  
  // 测试统计计算
  testStatsCalculation(): Promise<void>;
  
  // 测试成就系统
  testAchievementSystem(): Promise<void>;
  
  // 测试数据持久化
  testDataPersistence(): Promise<void>;
}
```

### 9.2 集成测试接口
```typescript
interface IntegrationTestSuite {
  // 测试组件集成
  testComponentIntegration(): Promise<void>;
  
  // 测试数据流
  testDataFlow(): Promise<void>;
  
  // 测试用户交互
  testUserInteraction(): Promise<void>;
}
```