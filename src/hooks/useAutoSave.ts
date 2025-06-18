import { useState, useEffect, useCallback, useRef } from 'react';
import { SaveStatus, UseAutoSave } from '../types/memo';
import { DEBOUNCE_DELAY } from '../utils/constants';

interface UseAutoSaveOptions {
  /** 自動保存を実行する関数 */
  onSave: () => Promise<void>;
  /** 保存対象のデータ */
  data: string;
  /** 自動保存を有効にするか（デフォルト: true） */
  enabled?: boolean;
  /** debounce遅延時間（ミリ秒、デフォルト: DEBOUNCE_DELAY） */
  delay?: number;
  /** リトライ回数（デフォルト: 3） */
  maxRetries?: number;
}

/**
 * 自動保存機能を提供するカスタムフック
 */
export function useAutoSave({
  onSave,
  data,
  enabled = true,
  delay = DEBOUNCE_DELAY,
  maxRetries = 3,
}: UseAutoSaveOptions): UseAutoSave {
  // 状態管理
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Ref for managing timers and retry count
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const retryCount = useRef<number>(0);
  const lastData = useRef<string>(data);
  const isSaving = useRef<boolean>(false);

  // 自動保存実行関数
  const performSave = useCallback(async (): Promise<void> => {
    if (isSaving.current || !enabled) {
      return;
    }

    try {
      isSaving.current = true;
      setSaveStatus('saving');
      
      await onSave();
      
      setLastSaved(new Date());
      setSaveStatus('saved');
      retryCount.current = 0; // リトライカウントをリセット
      
    } catch (error) {
      console.error('Auto-save failed:', error);
      
      // リトライ処理
      if (retryCount.current < maxRetries) {
        retryCount.current++;
        
        // 指数バックオフでリトライ
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount.current - 1), 10000);
        
        setTimeout(() => {
          performSave();
        }, retryDelay);
        
        setSaveStatus('saving'); // リトライ中は保存中状態を維持
      } else {
        setSaveStatus('error');
        retryCount.current = 0; // リトライカウントをリセット
      }
    } finally {
      isSaving.current = false;
    }
  }, [onSave, enabled, maxRetries]);

  // 手動保存関数
  const save = useCallback(async (): Promise<void> => {
    // 既存のdebounceタイマーをクリア
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }

    await performSave();
  }, [performSave]);

  // 状態リセット関数
  const reset = useCallback((): void => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    
    setSaveStatus('idle');
    setLastSaved(null);
    retryCount.current = 0;
    isSaving.current = false;
  }, []);

  // データ変更監視とdebounce処理
  useEffect(() => {
    // 初回レンダー時や無効化時はスキップ
    if (!enabled || data === lastData.current) {
      lastData.current = data;
      return;
    }

    // 内容が変更された場合
    if (data !== lastData.current) {
      lastData.current = data;
      
      // 既存のタイマーをクリア
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // 入力中状態に設定
      if (saveStatus !== 'saving') {
        setSaveStatus('typing');
      }

      // 新しいdebounceタイマーを設定
      debounceTimer.current = setTimeout(() => {
        performSave();
      }, delay);
    }

    // クリーンアップ
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [data, enabled, delay, performSave, saveStatus]);

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // ページ離脱時の保存処理
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (saveStatus === 'typing' && enabled) {
        // 未保存の変更がある場合は警告を表示
        event.preventDefault();
        event.returnValue = '未保存の変更があります。ページを離れますか？';
        
        // 最後の保存を試行（非同期処理なので完了は保証されない）
        performSave();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && saveStatus === 'typing' && enabled) {
        // ページが非表示になる時に保存を実行
        performSave();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveStatus, enabled, performSave]);

  return {
    saveStatus,
    lastSaved,
    save,
    reset,
  };
} 