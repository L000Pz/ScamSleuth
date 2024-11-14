// src/components/MirageSetup.tsx
"use client";

import { useEffect } from 'react';
import { makeServer } from '../../mirage';

export default function MirageSetup() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Initializing Mirage in the client');
      makeServer();
    }
  }, []);

  return null;
}
