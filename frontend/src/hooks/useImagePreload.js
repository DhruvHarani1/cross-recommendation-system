import { useEffect, useState } from 'react';

export function useImagePreload(urls) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let count = 0;

    if (urls.length === 0) {
      setLoaded(true);
      return;
    }

    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
      const done = () => {
        count += 1;
        if (count >= urls.length && !cancelled) setLoaded(true);
      };
      img.onload = done;
      img.onerror = done; // don't block on a single broken URL
    });

    return () => { cancelled = true; };
  }, [urls]);

  return loaded;
}