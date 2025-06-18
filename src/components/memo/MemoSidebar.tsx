import React from 'react';
import { Memo } from '../../types/memo';
import { MemoSearchBar } from './MemoSearchBar';
import { MemoCard } from './MemoCard';
import { cn } from '../../lib/utils';

interface MemoSidebarProps {
  memos: Memo[];
  filteredMemos: Memo[];
  currentMemo: Memo | null;
  searchQuery: string;
  isLoading: boolean;
  onMemoSelect: (memo: Memo) => void;
  onSearchChange: (query: string) => void;
  onSearchClear: () => void;
  className?: string;
}

export function MemoSidebar({
  memos,
  filteredMemos,
  currentMemo,
  searchQuery,
  isLoading,
  onMemoSelect,
  onSearchChange,
  onSearchClear,
  className,
}: MemoSidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col bg-background border-r border-border',
        'w-80', // 320px fixed width
        'h-full',
        className
      )}
    >
      {/* セクションタイトル */}
      <div className="px-4 py-5 border-b border-border">
        <h2 className="text-2xl font-bold text-foreground">Notes</h2>
      </div>

      {/* 検索バー */}
      <div className="px-4 py-3">
        <MemoSearchBar
          value={searchQuery}
          onChange={onSearchChange}
          onClear={onSearchClear}
        />
      </div>

      {/* メモリスト */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          // ローディング状態
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : filteredMemos.length === 0 ? (
          // 空状態
          <div className="flex flex-col items-center justify-center h-32 px-4 text-center">
            {searchQuery ? (
              <>
                <div className="text-muted-foreground mb-2">No notes found</div>
                <div className="text-sm text-muted-foreground">
                  Try searching for something else
                </div>
              </>
            ) : (
              <>
                <div className="text-muted-foreground mb-2">No notes yet</div>
                <div className="text-sm text-muted-foreground">
                  Start writing your first note
                </div>
              </>
            )}
          </div>
        ) : (
          // メモリスト
          <div className="px-4 py-2 space-y-1">
            {filteredMemos.map((memo) => (
              <MemoCard
                key={memo.id}
                memo={memo}
                isSelected={currentMemo?.id === memo.id}
                onClick={() => onMemoSelect(memo)}
              />
            ))}
          </div>
        )}
      </div>

      {/* フッター情報（オプション） */}
      {!isLoading && memos.length > 0 && (
        <div className="px-4 py-2 border-t border-border">
          <div className="text-xs text-muted-foreground">
            {filteredMemos.length} of {memos.length} notes
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        </div>
      )}
    </aside>
  );
} 