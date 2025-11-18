# Quick Start Guide: 个人主页功能开发

**Feature**: 个人主页功能  
**Date**: 2025-11-18  
**Target Audience**: 开发人员

## 🚀 快速开始

### 前置条件
- 已完成项目环境配置
- 熟悉 React + TypeScript + Vite 开发
- 了解 shadcn/ui 组件库使用

### 开发环境准备
```bash
cd wooden-fish-app
npm install
npm run dev
```

## 📁 文件结构概览

### 需要创建的新文件
```
src/
├── components/profile/          # 个人主页组件目录
│   ├── ProfilePage.tsx         # 主页面 (优先级: P1)
│   ├── ProfileHeader.tsx       # 用户信息头部 (优先级: P1)
│   ├── StatsOverview.tsx       # 统计概览 (优先级: P1)
│   ├── StatsChart.tsx          # 趋势图表 (优先级: P2)
│   ├── ProfileSettings.tsx     # 设置面板 (优先级: P3)
│   ├── AchievementBadges.tsx   # 成就徽章 (优先级: P4)
│   └── AvatarUpload.tsx        # 头像上传 (优先级: P3)
├── contexts/
│   └── ProfileContext.tsx      # 用户档案上下文 (优先级: P1)
├── hooks/
│   ├── useLocalStorage.ts      # 本地存储 hook (优先级: P1)
│   ├── useUserStats.ts         # 统计数据 hook (优先级: P1)
│   └── useAchievements.ts      # 成就系统 hook (优先级: P4)
├── types/
│   └── profile.ts              # 类型定义 (优先级: P1)
└── utils/
    ├── statsCalculator.ts      # 统计计算 (优先级: P2)
    ├── achievementEngine.ts    # 成就引擎 (优先级: P4)
    └── imageUtils.ts           # 图片处理 (优先级: P3)
```

## 🎯 开发优先级

### Phase 1: 基础架构 (P1 - 必须完成)
1. **类型定义** (`types/profile.ts`)
2. **本地存储 Hook** (`hooks/useLocalStorage.ts`)
3. **用户档案上下文** (`contexts/ProfileContext.tsx`)
4. **基础页面框架** (`components/profile/ProfilePage.tsx`)

### Phase 2: 核心功能 (P2 - 高优先级)
1. **用户信息展示** (`components/profile/ProfileHeader.tsx`)
2. **统计概览** (`components/profile/StatsOverview.tsx`)
3. **统计计算工具** (`utils/statsCalculator.ts`)
4. **趋势图表** (`components/profile/StatsChart.tsx`)

### Phase 3: 交互功能 (P3 - 中优先级)  
1. **设置面板** (`components/profile/ProfileSettings.tsx`)
2. **头像上传** (`components/profile/AvatarUpload.tsx`)
3. **图片处理工具** (`utils/imageUtils.ts`)

### Phase 4: 高级功能 (P4 - 低优先级)
1. **成就系统** (`hooks/useAchievements.ts`)
2. **成就引擎** (`utils/achievementEngine.ts`)
3. **成就徽章** (`components/profile/AchievementBadges.tsx`)

## 🛠️ 开发步骤详解

### Step 1: 创建类型定义 (15分钟)
```typescript
// src/types/profile.ts
export interface UserProfile {
  id: string;
  nickname: string;
  avatar?: string;
  signature?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClickStatistics {
  totalClicks: number;
  todayClicks: number;
  weekClicks: number;
  monthClicks: number;
  dailyHistory: DailyClickRecord[];
}

export interface DailyClickRecord {
  date: string; // YYYY-MM-DD
  clicks: number;
  timestamp: Date;
}
```

### Step 2: 实现本地存储 Hook (30分钟)
```typescript
// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}
```

### Step 3: 创建用户档案上下文 (45分钟)
```typescript
// src/contexts/ProfileContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { UserProfile, ClickStatistics } from '@/types/profile';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface ProfileContextType {
  profile: UserProfile | null;
  stats: ClickStatistics;
  updateProfile: (updates: Partial<UserProfile>) => void;
  recordClick: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useLocalStorage<UserProfile | null>('user_profile', null);
  const [stats, setStats] = useLocalStorage<ClickStatistics>('click_stats', {
    totalClicks: 0,
    todayClicks: 0,
    weekClicks: 0,
    monthClicks: 0,
    dailyHistory: []
  });

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (profile) {
      setProfile({
        ...profile,
        ...updates,
        updatedAt: new Date()
      });
    }
  };

  const recordClick = () => {
    // 实现敲击记录逻辑
    setStats(prev => ({
      ...prev,
      totalClicks: prev.totalClicks + 1,
      todayClicks: prev.todayClicks + 1
    }));
  };

  return (
    <ProfileContext.Provider value={{ profile, stats, updateProfile, recordClick }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
};
```

### Step 4: 创建基础页面框架 (30分钟)
```typescript
// src/components/profile/ProfilePage.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useProfile } from '@/contexts/ProfileContext';

export function ProfilePage() {
  const { profile, stats } = useProfile();

  if (!profile) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              请先创建您的个人档案
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">个人主页</h1>
      
      {/* 用户信息头部 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              {profile.avatar ? (
                <img src={profile.avatar} alt="头像" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{profile.nickname}</h2>
              <p className="text-muted-foreground">
                注册于 {new Date(profile.createdAt).toLocaleDateString()}
              </p>
              {profile.signature && (
                <p className="text-sm mt-1">{profile.signature}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.totalClicks}</div>
            <div className="text-muted-foreground">总敲击数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.todayClicks}</div>
            <div className="text-muted-foreground">今日敲击</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.weekClicks}</div>
            <div className="text-muted-foreground">本周敲击</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### Step 5: 集成到主应用 (15分钟)
```typescript
// src/App.tsx 修改
import { ProfileProvider } from '@/contexts/ProfileContext';
import { ProfilePage } from '@/components/profile/ProfilePage';

function App() {
  const [currentView, setCurrentView] = useState('main'); // 添加视图状态

  return (
    <ProfileProvider>
      <div className="App">
        {currentView === 'main' && (
          <>
            <Header onProfileClick={() => setCurrentView('profile')} />
            {/* 现有的木鱼组件 */}
          </>
        )}
        {currentView === 'profile' && (
          <>
            <button onClick={() => setCurrentView('main')}>返回主页</button>
            <ProfilePage />
          </>
        )}
      </div>
    </ProfileProvider>
  );
}
```

## 🧪 测试策略

### 单元测试
```typescript
// 测试用户档案上下文
describe('ProfileContext', () => {
  it('should update profile correctly', () => {
    // 测试档案更新逻辑
  });
  
  it('should record clicks correctly', () => {
    // 测试敲击记录逻辑
  });
});
```

### 集成测试
- 测试组件间数据流
- 测试 LocalStorage 持久化
- 测试响应式布局

## 🚨 常见陷阱与解决方案

### 1. LocalStorage 数据丢失
**问题**: 用户清理浏览器数据导致档案丢失
**解决**: 
- 添加数据备份功能
- 提供数据导入/导出
- 优雅的数据初始化

### 2. 图片上传性能问题
**问题**: 大图片导致页面卡顿
**解决**:
- 客户端图片压缩
- 异步处理上传
- 进度提示

### 3. 统计数据不准确
**问题**: 时区、日期计算错误
**解决**:
- 使用标准化的日期处理
- 添加数据验证
- 定期数据校正

## 📊 性能监控

### 关键指标
- 页面加载时间: < 3秒
- 图表渲染时间: < 1秒
- LocalStorage 使用量: < 300KB
- 内存使用: < 50MB

### 监控工具
- React DevTools Profiler
- Chrome DevTools Performance
- Lighthouse 性能审计

## 🔗 相关资源

- [shadcn/ui 文档](https://ui.shadcn.com/)
- [Recharts 文档](https://recharts.org/)
- [React Hook Form](https://react-hook-form.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## ✅ 完成检查清单

### Phase 1 (基础架构)
- [ ] 创建类型定义文件
- [ ] 实现 useLocalStorage Hook
- [ ] 创建 ProfileContext
- [ ] 实现基础页面框架
- [ ] 集成到主应用

### Phase 2 (核心功能)
- [ ] 用户信息展示组件
- [ ] 统计概览组件
- [ ] 统计计算工具
- [ ] 趋势图表组件
- [ ] 响应式布局适配

### Phase 3 (交互功能)
- [ ] 设置面板组件
- [ ] 头像上传功能
- [ ] 表单验证
- [ ] 错误处理

### Phase 4 (高级功能)
- [ ] 成就系统实现
- [ ] 成就引擎逻辑
- [ ] 成就徽章展示
- [ ] 动画效果

### 最终测试
- [ ] 功能测试完成
- [ ] 性能测试通过
- [ ] 兼容性测试通过
- [ ] 用户体验测试通过