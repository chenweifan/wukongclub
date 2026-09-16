import { useEffect, useState } from 'react';

/**
 * 防抖值。
 * 用在「输入即写 URL」的场景：每敲一个字都 replaceState 会让地址栏抖得厉害，
 * 也没有必要为中间态发请求。
 */
export function useDebouncedValue<TValue>(value: TValue, delayMs = 250): TValue {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debounced;
}
