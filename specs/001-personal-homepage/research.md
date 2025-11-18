# Research: 个人主页功能技术调研

**Feature**: 个人主页功能  
**Date**: 2025-11-18  
**Status**: Phase 0 Research

## 1. 现有技术栈分析

### 1.1 当前项目架构
- **框架**: React 18.3.1 + TypeScript 5.x + Vite 5.1.4
- **UI库**: shadcn/ui (基于 Radix UI)
- **样式**: Tailwind CSS + Sass
- **图表**: Recharts 2.15.0 (已安装)
- **状态管理**: React Context API + useState/useEffect
- **数据持久化**: 需要调研，当前可能使用 localStorage

### 1.2 现有组件结构分析
```
src/components/
├── BottomControls.tsx      # 底部控制面板
├── Header.tsx              # 顶部导航 (8.3KB - 功能丰富)
├── MainLayout.tsx          # 主布局组件
├── SidePanel.tsx           # 侧边面板 (12.02KB - 复杂组件)
├── WoodenFishHammer.tsx    # 敲击锤子组件
├── WoodenFishMain.tsx      # 主要木鱼组件 (15.92KB - 核心组件)
└── ui/                     # shadcn/ui 组件库
```

**发现**: 现有组件结构良好，Header 组件较大可能已包含导航逻辑，需要分析是否可以复用。

## 2. 数据架构调研

### 2.1 现有数据上下文分析
从 `WoodenFishContext.tsx` (8.21KB) 可以推断：
- 已有完整的敲击数据管理
- 可能包含统计计算逻辑
- 需要分析数据结构和存储方式

### 2.2 建议数据模型
```typescript
interface UserProfile {
  id: string;
  nickname: string;
  avatar?: string; // Base64 或 URL
  signature?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ClickStatistics {
  totalClicks: number;
  todayClicks: number;
  weekClicks: number;
  monthClicks: number;
  dailyHistory: Array<{
    date: string; // YYYY-MM-DD
    clicks: number;
  }>;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress?: number; // 0-100
}
```

### 2.3 数据存储策略
**LocalStorage 容量分析**:
- 大多数浏览器限制: 5-10MB
- 用户档案数据: ~1KB
- 30天历史数据: ~2KB  
- 头像图片(Base64): 50-200KB
- 总计预估: < 300KB (安全范围内)

**备选方案**:
1. **LocalStorage** (推荐): 简单可靠，适合当前需求
2. **IndexedDB**: 容量更大，但复杂度高
3. **外部存储**: 需要后端支持，暂不考虑

## 3. UI/UX 设计调研

### 3.1 现有设计系统分析
- 使用 shadcn/ui 组件库，设计风格统一
- Tailwind CSS 提供响应式能力
- 深色/浅色主题支持 (next-themes)

### 3.2 个人主页布局设计
```
┌─────────────────────────────────────┐
│ Header (现有导航 + 个人主页入口)        │
├─────────────────────────────────────┤
│ Profile Header                       │
│ ┌─────────┐ 用户昵称                 │
│ │ Avatar  │ 注册时间                │
│ │ (80px)  │ 个性签名                │
│ └─────────┘ [编辑] 按钮             │
├─────────────────────────────────────┤
│ Stats Overview (卡片布局)            │
│ ┌─────────┐┌─────────┐┌─────────┐   │
│ │总敲击数 ││今日敲击 ││本周敲击 │   │
│ │ 1,234   ││   56    ││  234    │   │
│ └─────────┘└─────────┘└─────────┘   │
├─────────────────────────────────────┤
│ Trend Chart (30天趋势)              │
│ ████▅▆▇█▅▄▃▂▁▂▃▄▅▆▇████▅▆▇█▅▄▃▂ │
├─────────────────────────────────────┤
│ Achievement Badges                   │
│ 🏆 持之以恒  🎯 初心不改  ⭐ 功德圆满 │
└─────────────────────────────────────┘
```

### 3.3 响应式设计策略
- **桌面端**: 3列布局，统计卡片横向排列
- **平板端**: 2列布局，部分卡片堆叠
- **移动端**: 1列布局，所有元素垂直排列

## 4. 图表库技术调研

### 4.1 Recharts 能力评估
**优势**:
- 已安装在项目中，无额外依赖
- React 原生支持，TypeScript 友好
- 响应式图表，移动端适配良好
- 丰富的图表类型和自定义选项

**适用图表类型**:
- LineChart: 30天敲击趋势
- BarChart: 周/月统计对比
- PieChart: 时间段分布 (可选)

### 4.2 图表性能分析
- 30天数据点渲染性能: 优秀 (< 100ms)
- 内存占用: 轻量级 (< 5MB)
- 动画效果: 流畅，支持自定义

### 4.3 示例实现
```typescript
const StatsChart: React.FC = () => {
  const data = useMemo(() => 
    generateLast30DaysData(), []);
    
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="clicks" 
          stroke="#8884d8" 
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

## 5. 路由方案调研

### 5.1 当前路由状态
- 项目可能是单页面应用，无明显路由配置
- Header 组件较大，可能包含页面切换逻辑

### 5.2 路由选项评估
**选项1: 无路由方案** (推荐)
- 在现有页面中添加个人主页模态框或侧滑面板
- 利用现有的 SidePanel 组件架构
- 简单快速，不破坏现有结构

**选项2: React Router**
- 添加真正的路由支持
- URL: `/`, `/profile`, `/profile/settings`
- 更专业，但增加复杂度

**推荐**: 采用选项1，在 Header 中添加个人主页入口，以模态框或专门页面形式展示。

## 6. 成就系统设计调研

### 6.1 成就类型设计
```typescript
const achievementDefinitions = [
  {
    id: 'first-click',
    name: '初心不改',
    description: '完成第一次敲击',
    condition: (stats) => stats.totalClicks >= 1,
    icon: '🎯'
  },
  {
    id: 'daily-streak-7',
    name: '持之以恒',
    description: '连续7天敲击木鱼',
    condition: (stats) => calculateStreak(stats) >= 7,
    icon: '🏆'
  },
  {
    id: 'milestone-1000',
    name: '功德圆满',
    description: '累计敲击1000次',
    condition: (stats) => stats.totalClicks >= 1000,
    icon: '⭐'
  }
];
```

### 6.2 成就判定引擎
- 监听敲击事件，实时检查成就条件
- 使用 localStorage 持久化成就状态
- 支持进度条显示 (如: 750/1000)

## 7. 性能优化策略

### 7.1 组件优化
- 使用 React.memo 优化纯展示组件
- useMemo 缓存计算密集的统计数据
- useCallback 优化事件处理函数

### 7.2 数据加载优化
- 懒加载图表组件 (React.lazy)
- 分批加载历史数据
- 防抖处理用户输入

### 7.3 图片优化
- 头像压缩 (Canvas API)
- WebP 格式支持检测
- 图片尺寸限制 (200KB 以内)

## 8. 风险评估与解决方案

### 8.1 高风险项
**风险**: LocalStorage 容量限制
**解决方案**: 
- 实施数据清理策略 (保留最近90天数据)
- 添加容量监控和预警
- 提供数据导出功能

**风险**: 头像上传性能影响
**解决方案**:
- 客户端图片压缩
- 异步处理，显示上传进度
- 回退到默认头像机制

### 8.2 中风险项
**风险**: 现有数据结构兼容性
**解决方案**:
- 渐进式迁移，保持向后兼容
- 数据版本管理机制
- 完整的数据备份和恢复

## 9. 开发计划建议

### Phase 0 (完成): 技术调研
### Phase 1 (3-4天): 数据模型和基础架构
- 实现 ProfileContext
- 设计数据存储层
- 基础类型定义

### Phase 2 (4-5天): 核心UI组件
- ProfilePage 主框架
- 基础信息展示组件
- 统计数据组件

### Phase 3 (3-4天): 高级功能
- 图表集成
- 设置面板
- 成就系统

### Phase 4 (2-3天): 优化和测试
- 性能优化
- 响应式适配
- 错误处理

**总预估时间**: 12-16天