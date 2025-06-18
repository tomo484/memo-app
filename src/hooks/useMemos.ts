import { useState, useEffect, useMemo, useCallback } from 'react';
import { Memo, SaveStatus, UseMemos } from '../types/memo';
import memoStorage from '../utils/storage';
import { searchInText } from '../utils/textUtils';
import { SEARCH_DEBOUNCE_DELAY } from '../utils/constants';

/**
 * メモ管理と検索機能を提供するカスタムフック
 */
export function useMemos(): UseMemos {
  // 状態管理
  const [memos, setMemos] = useState<Memo[]>([]);
  const [currentMemo, setCurrentMemo] = useState<Memo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [searchQuery, setSearchQueryState] = useState<string>('');
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // 初期データロード処理
  useEffect(() => {
    const loadMemos = async () => {
      try {
        setIsLoading(true);
        const loadedMemos = memoStorage.getMemos();
        setMemos(loadedMemos);
      } catch (error) {
        console.error('Failed to load memos:', error);
        setSaveStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    loadMemos();
  }, []);

  // 検索フィルタリング（リアルタイム）
  const filteredMemos = useMemo(() => {
    if (!searchQuery.trim()) {
      return memos;
    }

    return memos.filter(memo => 
      searchInText(memo.content, searchQuery, false)
    );
  }, [memos, searchQuery]);

  // 新規メモ作成
  const createMemo = useCallback(async (content: string = ''): Promise<Memo> => {
    try {
      setSaveStatus('saving');
      const newMemo = memoStorage.createMemo(content);
      
      setMemos(prevMemos => [newMemo, ...prevMemos]);
      setCurrentMemo(newMemo);
      setSaveStatus('saved');
      
      return newMemo;
    } catch (error) {
      console.error('Failed to create memo:', error);
      setSaveStatus('error');
      throw error;
    }
  }, []);

  // メモ更新
  const updateMemo = useCallback(async (id: string, content: string): Promise<void> => {
    try {
      setSaveStatus('saving');
      memoStorage.updateMemo(id, { content });
      
      setMemos(prevMemos => 
        prevMemos.map(memo => 
          memo.id === id 
            ? { ...memo, content, updatedAt: new Date() }
            : memo
        )
      );

      // 現在編集中のメモも更新
      if (currentMemo?.id === id) {
        setCurrentMemo(prev => prev ? { ...prev, content, updatedAt: new Date() } : null);
      }

      setSaveStatus('saved');
    } catch (error) {
      console.error('Failed to update memo:', error);
      setSaveStatus('error');
      throw error;
    }
  }, [currentMemo]);

  // メモ削除
  const deleteMemo = useCallback(async (id: string): Promise<void> => {
    try {
      setSaveStatus('saving');
      memoStorage.deleteMemo(id);
      
      setMemos(prevMemos => prevMemos.filter(memo => memo.id !== id));
      
      // 削除されたメモが現在編集中の場合はクリア
      if (currentMemo?.id === id) {
        setCurrentMemo(null);
      }

      setSaveStatus('saved');
    } catch (error) {
      console.error('Failed to delete memo:', error);
      setSaveStatus('error');
      throw error;
    }
  }, [currentMemo]);

  // IDでメモ取得
  const getMemoById = useCallback((id: string): Memo | undefined => {
    return memos.find(memo => memo.id === id);
  }, [memos]);

  // 現在のメモを保存
  const saveCurrentMemo = useCallback(async (): Promise<void> => {
    if (!currentMemo) {
      return;
    }

    try {
      await updateMemo(currentMemo.id, currentMemo.content);
    } catch (error) {
      console.error('Failed to save current memo:', error);
      throw error;
    }
  }, [currentMemo, updateMemo]);

  // 検索クエリ設定（debounce付き）
  const setSearchQuery = useCallback((query: string): void => {
    // 既存のタイマーをクリア
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    // 新しいタイマーを設定
    const timer = setTimeout(() => {
      setSearchQueryState(query);
    }, SEARCH_DEBOUNCE_DELAY);

    setSearchDebounceTimer(timer);
  }, [searchDebounceTimer]);

  // 検索クリア
  const clearSearch = useCallback((): void => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
      setSearchDebounceTimer(null);
    }
    setSearchQueryState('');
  }, [searchDebounceTimer]);

  // メモのエクスポート
  const exportMemos = useCallback((format: 'json' | 'markdown'): string => {
    if (format === 'json') {
      return JSON.stringify(memos, null, 2);
    }

    // Markdown形式
    const markdownContent = memos
      .map(memo => {
        const title = memo.content.split('\n')[0] || '無題のメモ';
        const content = memo.content;
        const date = memo.updatedAt.toLocaleDateString();
        
        return `# ${title}\n\n${content}\n\n*更新日: ${date}*\n\n---\n`;
      })
      .join('\n');

    return markdownContent;
  }, [memos]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [searchDebounceTimer]);

  return {
    // 状態
    memos,
    filteredMemos,
    currentMemo,
    isLoading,
    saveStatus,
    searchQuery,

    // メモ操作
    createMemo,
    updateMemo,
    deleteMemo,
    getMemoById,

    // 編集状態管理
    setCurrentMemo,
    saveCurrentMemo,

    // 検索機能
    setSearchQuery,
    clearSearch,

    // ユーティリティ
    exportMemos,
  };
} 