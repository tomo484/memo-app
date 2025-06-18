import React from 'react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface HeaderProps {
  onNewNote: () => void;
  className?: string;
}

export function Header({ onNewNote, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'flex items-center justify-between',
        'px-10 py-3',
        'bg-background border-b border-border',
        'h-16', // header-height from CSS variables
        className
      )}
    >
      {/* 左側: アプリタイトル */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-foreground">
          📝 Simple Notepad
        </h1>
      </div>

      {/* 右側: New Noteボタン */}
      <div className="flex items-center gap-4">
        <Button
          variant="primary"
          size="md"
          onClick={onNewNote}
          className="h-10"
        >
          + New Note
        </Button>
      </div>
    </header>
  );
} 