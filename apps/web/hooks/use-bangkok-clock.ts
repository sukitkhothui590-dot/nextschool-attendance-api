'use client';

import { useEffect, useState } from 'react';
import {
  getBangkokClockSnapshot,
  type BangkokClockSnapshot,
} from '@/lib/time/bangkok';

export function useBangkokClock(intervalMs = 1000): BangkokClockSnapshot {
  const [snapshot, setSnapshot] = useState(() => getBangkokClockSnapshot());

  useEffect(() => {
    setSnapshot(getBangkokClockSnapshot());
    const id = window.setInterval(() => setSnapshot(getBangkokClockSnapshot()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return snapshot;
}
