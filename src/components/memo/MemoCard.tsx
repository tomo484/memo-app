import React from 'react';
import { Memo } from '../../types/memo';
import { extractTitle } from '../../utils/textUtils';
import { formatRelativeTime } from '../../utils/dateUtils';
import { countWords } from '../../utils/textUtils';
import { cn } from '../../lib/utils';
import Image from 'next/image';

interface MemoCardProps {
  memo: Memo;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export function MemoCard({ memo, isSelected, onClick, className }: MemoCardProps) {
  const title = extractTitle(memo.content);
  const relativeTime = formatRelativeTime(memo.updatedAt);
  const wordCount = countWords(memo.content);

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-colors',
        'hover:bg-muted/50',
        isSelected && 'bg-muted/50',
        className
      )}
    >
      {/* メモアイコン（48x48px、グレー背景の円形） */}
      <div className="flex-shrink-0 w-12 h-12 bg-input rounded-lg flex items-center justify-center">
        <Image
          src="/icons/note-icon.svg"
          alt="Note"
          width={24}
          height={24}
          className="text-foreground"
        />
      </div>

      {/* メモ情報 */}
      <div className="flex-1 min-w-0">
        {/* タイトル */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-medium text-foreground truncate">
            {title}
          </h3>
        </div>

        {/* メタ情報 */}
        <div className="flex items-center text-sm text-muted-foreground">
          <span>Updated {relativeTime}</span>
          <span className="mx-1">·</span>
          <span>
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
        </div>
      </div>
    </div>
  );
} 