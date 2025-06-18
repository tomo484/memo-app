'use client';

import React, { useState } from 'react';
import { useMemos } from '../hooks/useMemos';
import { useAutoSave } from '../hooks/useAutoSave';
import { Header } from '../components/layout/Header';
import { MemoSidebar } from '../components/memo/MemoSidebar';
import { MemoEditor } from '../components/memo/MemoEditor';
import { ConfirmDeleteModal } from '../components/ui/Modal';
import { Memo } from '../types/memo';

export default function Home() {
  const {
    memos,
    filteredMemos,
    currentMemo,
    isLoading,
    saveStatus,
    searchQuery,
    createMemo,
    updateMemo,
    deleteMemo,
    setCurrentMemo,
    setSearchQuery,
    clearSearch,
  } = useMemos();

  // 削除確認モーダルの状態
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 自動保存機能
  const { saveStatus: autoSaveStatus } = useAutoSave({
    data: currentMemo?.content || '',
    onSave: async () => {
      if (currentMemo) {
        await updateMemo(currentMemo.id, currentMemo.content);
      }
    },
    enabled: !!currentMemo,
  });

  // 新規メモ作成
  const handleNewNote = async () => {
    try {
      await createMemo('');
    } catch (error) {
      console.error('Failed to create new memo:', error);
    }
  };

  // メモ選択
  const handleMemoSelect = (memo: Memo) => {
    setCurrentMemo(memo);
  };

  // メモ内容変更
  const handleContentChange = (content: string) => {
    if (currentMemo) {
      setCurrentMemo({ ...currentMemo, content });
    }
  };

  // 削除処理
  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (currentMemo) {
      try {
        await deleteMemo(currentMemo.id);
      } catch (error) {
        console.error('Failed to delete memo:', error);
      }
    }
  };

  // 実際の保存状態を決定（自動保存とメモフックの状態を統合）
  const currentSaveStatus = autoSaveStatus || saveStatus;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* ヘッダー */}
      <Header onNewNote={handleNewNote} />

      {/* メインコンテンツ（左右分割） */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左サイドバー */}
        <MemoSidebar
          memos={memos}
          filteredMemos={filteredMemos}
          currentMemo={currentMemo}
          searchQuery={searchQuery}
          isLoading={isLoading}
          onMemoSelect={handleMemoSelect}
          onSearchChange={setSearchQuery}
          onSearchClear={clearSearch}
        />

        {/* 右エディタエリア */}
        <div className="flex-1 flex flex-col">
          <MemoEditor
            memo={currentMemo}
            saveStatus={currentSaveStatus}
            onContentChange={handleContentChange}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* 削除確認モーダル */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete this note?"
        message="This action cannot be undone."
      />
    </div>
  );
}
