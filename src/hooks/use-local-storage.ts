import React, { useEffect, useState } from 'react';

const useLocalStorage = <T>(
  key: string,
  initialValue: T | null = null
): [T | null, React.Dispatch<React.SetStateAction<T | null>>] => {
  const [value, setValue] = useState<T | null>(initialValue);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(key) || '');
    setValue(data);
  }, [key]);

  useEffect(() => {
    if (value === null) return;
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

export default useLocalStorage;
