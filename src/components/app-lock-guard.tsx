import { useState, useCallback, useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { LockScreen } from './lock-screen';

import { isLockEnabled } from '@/services/app-lock-service';

export function AppLockGuard({ children }: { children: React.ReactNode }) {
  const [locked, setLocked] = useState(true);
  const [checking, setChecking] = useState(true);

  const checkLock = useCallback(async () => {
    const enabled = await isLockEnabled();
    if (!enabled) {
      setLocked(false);
    } else {
      setLocked(true);
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    checkLock();
  }, [checkLock]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        checkLock();
      }
    });
    return () => sub.remove();
  }, [checkLock]);

  const handleUnlock = useCallback(() => {
    setLocked(false);
  }, []);

  if (checking) return null;

  return (
    <>
      {children}
      {locked && <LockScreen onUnlock={handleUnlock} />}
    </>
  );
}
