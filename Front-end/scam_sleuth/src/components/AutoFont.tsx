// components/AutoFont.tsx
'use client';

import { useEffect } from 'react';

export default function AutoFont() {
  useEffect(() => {
    const persianRegex = /[\u0600-\u06FF]/;
    
    const applyFont = () => {
      const allElements = document.querySelectorAll('body *');
      
      allElements.forEach((element) => {
        const el = element as HTMLElement;

        if (el.closest('.prose')) return;

        const text = Array.from(el.childNodes)
          .filter(node => node.nodeType === Node.TEXT_NODE)
          .map(node => node.textContent)
          .join('');
        
        if (text && persianRegex.test(text)) {
          el.style.fontFamily = 'Vazirmatn, Tahoma, sans-serif';
        } else if (text && text.trim()) {
          el.style.fontFamily = 'Montserrat, sans-serif';
        }
      });
    };
    
    applyFont();
    
    const observer = new MutationObserver(applyFont);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    
    return () => observer.disconnect();
  }, []);

  return null;
}