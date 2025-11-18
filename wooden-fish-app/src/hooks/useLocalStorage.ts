import { useState, useEffect, useCallback } from 'react';

/**
 * useLocalStorage Hook
 * 提供类型安全的localStorage操作，支持自动序列化和错误处理
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, { error: string | null; loading: boolean }] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 从localStorage读取数据
  useEffect(() => {
    try {
      setLoading(true);
      setError(null);
      
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        const parsedValue = JSON.parse(item);
        setStoredValue(parsedValue);
      } else {
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      setError(`读取数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setStoredValue(initialValue);
    } finally {
      setLoading(false);
    }
  }, [key, initialValue]);

  // 设置值到localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      setError(null);
      
      // 允许传入函数来更新值
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // 保存到state
      setStoredValue(valueToStore);
      
      // 保存到localStorage
      if (valueToStore === undefined || valueToStore === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
      setError(`保存数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }, [key, storedValue]);

  return [storedValue, setValue, { error, loading }];
}

/**
 * 检查localStorage是否可用
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__localStorage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取localStorage使用情况
 */
export function getStorageInfo(): { used: number; available: number; percentage: number } {
  if (!isLocalStorageAvailable()) {
    return { used: 0, available: 0, percentage: 0 };
  }

  let used = 0;
  for (const key in window.localStorage) {
    if (window.localStorage.hasOwnProperty(key)) {
      used += window.localStorage[key].length;
    }
  }

  // 大多数浏览器localStorage限制为5MB
  const available = 5 * 1024 * 1024; // 5MB in bytes
  const percentage = (used / available) * 100;

  return { used, available, percentage };
}

/**
 * 清理过期的localStorage数据
 */
export function cleanupStorage(keysWithExpiry: Array<{ key: string; maxAge: number }>): void {
  keysWithExpiry.forEach(({ key, maxAge }) => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const data = JSON.parse(item);
        if (data.timestamp) {
          const age = Date.now() - new Date(data.timestamp).getTime();
          if (age > maxAge) {
            window.localStorage.removeItem(key);
            console.log(`Cleaned up expired key: ${key}`);
          }
        }
      }
    } catch (error) {
      console.warn(`Error cleaning up key "${key}":`, error);
    }
  });
}