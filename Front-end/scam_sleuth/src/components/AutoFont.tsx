// components/AutoFont.tsx
'use client';

import { useEffect } from 'react';

export default function AutoFont() {
  useEffect(() => {
    const persianRegex = /[\u0600-\u06FF]/;
    
    const applyFont = () => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null
      );

      let node;
      while (node = walker.nextNode()) {
        const parent = node.parentElement;
        
        if (parent && parent.closest('.prose')) {
          continue;
        }
        
        const text = node.textContent || '';
        
        if (parent && text.trim()) {
          if (persianRegex.test(text)) {
            parent.style.fontFamily = 'Vazirmatn, Tahoma, sans-serif';
          } else {
            parent.style.fontFamily = 'Montserrat, sans-serif';
          }
        }
      }
    };
    
    // اول لود بشه
    setTimeout(applyFont, 100);
    
    const observer = new MutationObserver(() => {
      setTimeout(applyFont, 50);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    
    return () => observer.disconnect();
  }, []);

  return null;
}