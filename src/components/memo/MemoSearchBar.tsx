import React from 'react';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';
import Image from 'next/image';

interface MemoSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  className?: string;
}

export function MemoSearchBar({ value, onChange, onClear, className }: MemoSearchBarProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onClear();
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative flex items-center">
        {/* 検索アイコン */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center">
          <Image
            src="/icons/search-icon.svg"
            alt="Search"
            width={24}
            height={24}
            className="text-muted-foreground"
          />
        </div>
        
        {/* 検索入力フィールド */}
        <Input
          type="text"
          placeholder="Search notes"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={cn(
            'pl-12 pr-10 h-12', // 左側にアイコンスペース、右側にクリアボタンスペース
            'bg-input border-0', // Figmaデザインに合わせてボーダーなし
            'rounded-xl', // 12px border radius
            'text-base', // 16px font size
            'placeholder:text-muted-foreground'
          )}
        />
        
        {/* クリアボタン（検索文字がある場合のみ表示） */}
        {value && (
          <button
            type="button"
            onClick={onClear}
            className={cn(
              'absolute right-4 top-1/2 -translate-y-1/2',
              'w-6 h-6 flex items-center justify-center',
              'text-muted-foreground hover:text-foreground',
              'transition-colors'
            )}
            aria-label="Clear search"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
} 