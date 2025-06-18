// メモデータの型定義
export interface Memo {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// 保存状態の型定義
export type SaveStatus = 'idle' | 'typing' | 'saving' | 'saved' | 'error';

// アプリケーション全体の状態
export interface AppState {
  memos: Memo[];
  currentMemo: Memo | null;
  isLoading: boolean;
  saveStatus: SaveStatus;
  searchQuery: string;
  filteredMemos: Memo[];
}

// 検索オプション
export interface SearchOptions {
  query: string;
  caseSensitive?: boolean;
  minLength?: number;
}

// ストレージエラーの型定義
export interface StorageError {
  type: 'QUOTA_EXCEEDED' | 'PARSE_ERROR' | 'NOT_FOUND' | 'UNKNOWN';
  message: string;
  originalError?: Error;
}

// メモ作成・更新用の部分型
export type CreateMemoInput = Pick<Memo, 'content'>;
export type UpdateMemoInput = Partial<Pick<Memo, 'content'>>;

// フック戻り値の型定義
export interface UseMemos {
  // 状態
  memos: Memo[];
  filteredMemos: Memo[];
  currentMemo: Memo | null;
  isLoading: boolean;
  saveStatus: SaveStatus;
  searchQuery: string;
  
  // メモ操作
  createMemo: (content?: string) => Promise<Memo>;
  updateMemo: (id: string, content: string) => Promise<void>;
  deleteMemo: (id: string) => Promise<void>;
  getMemoById: (id: string) => Memo | undefined;
  
  // 編集状態管理
  setCurrentMemo: (memo: Memo | null) => void;
  saveCurrentMemo: () => Promise<void>;
  
  // 検索機能
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  
  // ユーティリティ
  exportMemos: (format: 'json' | 'markdown') => string;
}

// 自動保存フック用の型定義
export interface UseAutoSave {
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  save: () => Promise<void>;
  reset: () => void;
} 