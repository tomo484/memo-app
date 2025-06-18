// ローカルストレージのキー
export const STORAGE_KEY = 'memo-app-data';

// 自動保存とdebounceの遅延時間（ミリ秒）
export const DEBOUNCE_DELAY = 3000; // 3秒
export const SEARCH_DEBOUNCE_DELAY = 300; // 0.3秒

// 検索設定
export const SEARCH_MIN_LENGTH = 3; // 最小検索文字数

// メモ表示設定
export const MEMO_TITLE_MAX_LENGTH = 20; // サイドバーでのタイトル最大文字数
export const MEMO_PREVIEW_MAX_LENGTH = 50; // プレビューテキスト最大文字数

// localStorage制限
export const STORAGE_QUOTA_LIMIT = 5 * 1024 * 1024; // 5MB (概算)

// UI設定
export const SIDEBAR_WIDTH = 320; // サイドバー幅（px）

// デフォルト値
export const DEFAULT_MEMO_CONTENT = '';
export const DEFAULT_MEMO_TITLE = '新しいメモ';

// エラーメッセージ
export const ERROR_MESSAGES = {
  STORAGE_QUOTA_EXCEEDED: 'ストレージ容量が不足しています。古いメモを削除してください。',
  STORAGE_PARSE_ERROR: 'データの読み込みに失敗しました。',
  MEMO_NOT_FOUND: 'メモが見つかりません。',
  SAVE_FAILED: 'メモの保存に失敗しました。',
  DELETE_FAILED: 'メモの削除に失敗しました。',
  UNKNOWN_ERROR: '予期しないエラーが発生しました。',
} as const;

// 成功メッセージ
export const SUCCESS_MESSAGES = {
  MEMO_SAVED: 'メモを保存しました。',
  MEMO_DELETED: 'メモを削除しました。',
  MEMO_CREATED: '新しいメモを作成しました。',
} as const; 