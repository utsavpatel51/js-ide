import { useEffect, useState } from 'react';

const useLocalStorage = (key, initialValue = null) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(key));
    setValue(data || '');
  }, [key]);

  useEffect(() => {
    if (value === null) return;
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

export default useLocalStorage;
