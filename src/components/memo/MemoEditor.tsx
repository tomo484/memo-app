import React, { useEffect, useRef } from 'react';
import { Memo, SaveStatus } from '../../types/memo';
import { extractTitle, countWords } from '../../utils/textUtils';
import { formatRelativeTime } from '../../utils/dateUtils';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface MemoEditorProps {
  memo: Memo | null;
  saveStatus: SaveStatus;
  onContentChange: (content: string) => void;
  onDelete: () => void;
  className?: string;
}

export function MemoEditor({
  memo,
  saveStatus,
  onContentChange,
  onDelete,
  className,
}: MemoEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // メモが選択されたときに自動フォーカス
  useEffect(() => {
    if (memo && textareaRef.current) {
      textareaRef.current.focus();
      // カーソルを末尾に移動
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [memo]);

  // テキストエリアの自動リサイズ
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [memo?.content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e.target.value);
  };

  const getSaveStatusDisplay = () => {
    switch (saveStatus) {
      case 'typing':
        return (
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            Typing...
          </span>
        );
      case 'saving':
        return (
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Saving...
          </span>
        );
      case 'saved':
        return (
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Auto-saved
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-2 text-red-500">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            Save failed
          </span>
        );
      default:
        return null;
    }
  };

  if (!memo) {
    // 空状態表示
    return (
      <div className={cn('flex flex-col h-full bg-background', className)}>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Select a note to start editing
          </h2>
          <p className="text-muted-foreground">
            Or create a new note to get started
          </p>
        </div>
      </div>
    );
  }

  const title = extractTitle(memo.content);
  const wordCount = countWords(memo.content);
  const lastUpdated = formatRelativeTime(memo.updatedAt);

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* エディタヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-foreground truncate">
            {title}
          </h1>
          <div className="text-sm text-muted-foreground mt-1">
            Last updated {lastUpdated}
          </div>
        </div>
      </div>

      {/* メインエディタ */}
      <div className="flex-1 flex flex-col">
        <textarea
          ref={textareaRef}
          value={memo.content}
          onChange={handleContentChange}
          placeholder="Start typing..."
          className={cn(
            'flex-1 w-full p-4 resize-none border-0 outline-none',
            'bg-transparent text-foreground',
            'text-base leading-relaxed',
            'placeholder:text-muted-foreground',
            'focus:ring-0'
          )}
          style={{
            minHeight: '200px',
          }}
        />
      </div>

      {/* ステータスバー */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card">
        {/* 左側: 保存状態 */}
        <div className="flex items-center gap-4">
          {getSaveStatusDisplay()}
          <span className="text-sm text-muted-foreground">
            {wordCount} {wordCount === 1 ? 'character' : 'characters'}
          </span>
        </div>

        {/* 右側: 削除ボタン */}
        <div className="flex items-center gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={onDelete}
            className="flex items-center gap-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 4H14M6 4V2.5C6 2.22386 6.22386 2 6.5 2H9.5C9.77614 2 10 2.22386 10 2.5V4M12.5 4V13.5C12.5 13.7761 12.2761 14 12 14H4C3.72386 14 3.5 13.7761 3.5 13.5V4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
} 