# バックエンド設計書（フロントエンド中心）

## 1. アーキテクチャ概要

### 1.1 システム構成
- **アプローチ**: フロントエンド単体アプリケーション（SPA）
- **フレームワーク**: Next.js 15.3.3 (App Router)
- **レンダリング**: Client Side Rendering (CSR)
- **データ層**: Browser localStorage
- **状態管理**: React Hooks (useState, useEffect, useCallback)
- **永続化**: JSON形式でのlocalStorage保存

### 1.2 システム構成図
```
┌─────────────────────────────────────────┐
│            Browser (Client)            │
│ ┌─────────────────────────────────────┐ │
│ │         React Components          │ │
│ │ ┌─────────────┬─────────────────┐ │ │
│ │ │ MemoList    │ MemoEditor      │ │ │
│ │ │ Component   │ Component       │ │ │
│ │ └─────────────┴─────────────────┘ │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │         Custom Hooks              │ │
│ │ ┌─────────────┬─────────────────┐ │ │
│ │ │ useMemos    │ useLocalStorage │ │ │
│ │ └─────────────┴─────────────────┘ │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │        Utility Functions          │ │
│ │ ┌─────────────┬─────────────────┐ │ │
│ │ │ Storage     │ DateUtils       │ │ │
│ │ │ Utils       │                 │ │ │
│ │ └─────────────┴─────────────────┘ │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │          localStorage             │ │
│ │    (Persistent Data Storage)      │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 2. データモデル設計

### 2.1 エンティティ定義

#### 2.1.1 Memo Entity
```typescript
interface Memo {
  id: string;          // UUID v4形式の一意識別子
  content: string;     // メモ本文（マークダウン形式対応）
  createdAt: Date;     // 作成日時（ISO 8601形式）
  updatedAt: Date;     // 最終更新日時（ISO 8601形式）
}

// 例
const sampleMemo: Memo = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  content: "今日の会議で話し合った内容について...",
  createdAt: new Date("2024-01-15T14:30:00.000Z"),
  updatedAt: new Date("2024-01-15T14:30:00.000Z")
};
```

#### 2.1.2 Application State
```typescript
interface AppState {
  memos: Memo[];                    // メモ一覧（updatedAt降順でソート）
  currentMemo: Memo | null;         // 編集中のメモ
  isLoading: boolean;               // ローディング状態
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';  // 保存状態
  lastError: string | null;         // エラーメッセージ
}
```

### 2.2 データベーススキーマ（localStorage）

#### 2.2.1 ストレージキー構造
```typescript
// localStorage内のキー構造
const STORAGE_KEYS = {
  MEMOS: 'simple-memo-app:memos',           // メモデータ
  APP_VERSION: 'simple-memo-app:version',   // アプリバージョン
  USER_SETTINGS: 'simple-memo-app:settings' // ユーザー設定（将来拡張用）
} as const;
```

#### 2.2.2 保存データ形式
```typescript
// localStorage['simple-memo-app:memos'] に保存される形式
interface StoredData {
  version: string;      // データフォーマットバージョン
  memos: Memo[];        // メモ配列
  lastBackup: string;   // 最終バックアップ日時
}

// 実際の保存例
const storedData: StoredData = {
  version: "1.0.0",
  memos: [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      content: "サンプルメモ",
      createdAt: new Date("2024-01-15T14:30:00.000Z"),
      updatedAt: new Date("2024-01-15T14:30:00.000Z")
    }
  ],
  lastBackup: "2024-01-15T14:30:00.000Z"
};
```

## 3. API設計（内部関数）

### 3.1 ストレージ操作レイヤー

#### 3.1.1 MemoStorage クラス
```typescript
class MemoStorage {
  private static readonly STORAGE_KEY = 'simple-memo-app:memos';
  private static readonly VERSION = '1.0.0';

  /**
   * 全メモを取得
   * @returns Promise<Memo[]> メモ配列（updatedAt降順）
   * @throws {StorageError} 読み込みエラー時
   */
  static async getMemos(): Promise<Memo[]>

  /**
   * メモを保存（新規/更新）
   * @param memo 保存するメモオブジェクト
   * @throws {StorageError} 保存エラー時
   */
  static async saveMemo(memo: Memo): Promise<void>

  /**
   * メモを削除
   * @param id 削除するメモのID
   * @throws {StorageError} 削除エラー時
   */
  static async deleteMemo(id: string): Promise<void>

  /**
   * 特定のメモを取得
   * @param id メモID
   * @returns Promise<Memo | null> 見つからない場合null
   */
  static async getMemoById(id: string): Promise<Memo | null>

  /**
   * 全データをクリア
   * @throws {StorageError} クリアエラー時
   */
  static async clearAll(): Promise<void>

  /**
   * ストレージ使用量を取得
   * @returns Promise<number> 使用バイト数
   */
  static async getStorageSize(): Promise<number>
}
```

#### 3.1.2 エラー処理
```typescript
class StorageError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'StorageError';
  }
}

// エラーの種類
enum StorageErrorType {
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',    // 容量超過
  PARSE_ERROR = 'PARSE_ERROR',          // JSON解析エラー
  ACCESS_DENIED = 'ACCESS_DENIED',      // アクセス拒否
  UNKNOWN = 'UNKNOWN'                   // その他
}
```

### 3.2 ビジネスロジックレイヤー

#### 3.2.1 useMemos Hook
```typescript
interface UseMemos {
  memos: Memo[];
  filteredMemos: Memo[];         // 検索フィルタリング後のメモ
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

export const useMemos = (): UseMemos => {
  // 実装詳細...
}
```

#### 3.2.2 自動保存機能
```typescript
interface UseAutoSave {
  isDirty: boolean;
  lastSavedAt: Date | null;
  saveStatus: SaveStatus;
}

export const useAutoSave = (
  content: string,
  onSave: (content: string) => Promise<void>,
  delay: number = 3000
): UseAutoSave => {
  // debounce機能付きの自動保存
  // 3秒間の無操作後に自動保存実行
}
```

### 3.3 ユーティリティ関数

#### 3.3.1 日付操作
```typescript
// dateUtils.ts
export class DateUtils {
  /**
   * 相対時間表示
   * @param date 対象日時
   * @returns string "2時間前" "昨日" など
   */
  static formatRelative(date: Date): string

  /**
   * 日時フォーマット
   * @param date 対象日時
   * @param format フォーマット形式
   * @returns string フォーマット済み日時
   */
  static format(date: Date, format: string): string

  /**
   * 今日・昨日・それ以前の判定
   * @param date 対象日時
   * @returns 'today' | 'yesterday' | 'older'
   */
  static getDateCategory(date: Date): 'today' | 'yesterday' | 'older'
}
```

#### 3.3.2 テキスト処理
```typescript
// textUtils.ts
export class TextUtils {
  /**
   * メモタイトル抽出（先頭30文字）
   * @param content メモ内容
   * @returns string タイトル
   */
  static extractTitle(content: string): string

  /**
   * プレビューテキスト抽出
   * @param content メモ内容
   * @param maxLength 最大文字数
   * @returns string プレビュー
   */
  static extractPreview(content: string, maxLength: number = 50): string

  /**
   * 文字数カウント
   * @param content テキスト
   * @returns number 文字数
   */
  static countCharacters(content: string): number

  /**
   * 検索ハイライト
   * @param content 検索対象テキスト
   * @param query 検索クエリ
   * @returns string ハイライト済みHTML
   */
  static highlightSearch(content: string, query: string): string
}
```

#### 3.3.3 ID生成
```typescript
// idUtils.ts
export class IdUtils {
  /**
   * UUID v4生成
   * @returns string UUID
   */
  static generateUuid(): string

  /**
   * 短縮ID生成（URLフレンドリー）
   * @returns string 短縮ID
   */
  static generateShortId(): string
}
```

## 4. ファイル構成設計

### 4.1 ディレクトリ構造
```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # メモ管理画面（左右分割）（/）
│   ├── layout.tsx               # ルートレイアウト
│   └── globals.css              # グローバルスタイル
├── components/                   # UIコンポーネント
│   ├── memo/
│   │   ├── MemoSidebar.tsx      # 左サイドバーコンポーネント
│   │   ├── MemoList.tsx         # メモ一覧コンポーネント
│   │   ├── MemoCard.tsx         # メモカードコンポーネント
│   │   ├── MemoEditor.tsx       # 右エディタコンポーネント
│   │   └── MemoSearchBar.tsx    # 検索バーコンポーネント
│   ├── ui/                      # 汎用UIコンポーネント
│   │   ├── Button.tsx           # ボタンコンポーネント
│   │   ├── Modal.tsx            # モーダルコンポーネント
│   │   ├── Card.tsx             # カードコンポーネント
│   │   └── Toast.tsx            # トーストコンポーネント
│   └── layout/
│       ├── Header.tsx           # ヘッダーコンポーネント
│       └── Navigation.tsx       # ナビゲーションコンポーネント
├── hooks/                       # カスタムフック
│   ├── useMemos.ts              # メモ管理フック
│   ├── useAutoSave.ts           # 自動保存フック
│   ├── useLocalStorage.ts       # localStorage操作フック
│   └── useKeyboardShortcuts.ts  # キーボードショートカット
├── utils/                       # ユーティリティ関数
│   ├── storage.ts               # ストレージ操作
│   ├── dateUtils.ts             # 日付関連
│   ├── textUtils.ts             # テキスト処理
│   ├── idUtils.ts               # ID生成
│   └── constants.ts             # 定数定義
├── types/                       # 型定義
│   ├── memo.ts                  # メモ関連型
│   ├── storage.ts               # ストレージ関連型
│   └── ui.ts                    # UI関連型
└── lib/                         # ライブラリ設定
    └── utils.ts                 # cn()関数など
```

### 4.2 主要ファイルの責務

#### 4.2.1 pages/コンポーネント
- **page.tsx**: 左右分割のメモ管理ダッシュボード

#### 4.2.2 components/コンポーネント
- **MemoSidebar**: 左サイドバー全体（検索+一覧）
- **MemoSearchBar**: 検索機能
- **MemoList**: メモ一覧の表示ロジック
- **MemoCard**: 個別メモカードのUI
- **MemoEditor**: 右側エディタエリア全体

#### 4.2.3 hooks/カスタムフック
- **useMemos**: メモ操作の中央管理
- **useAutoSave**: 自動保存機能の提供
- **useLocalStorage**: ブラウザストレージの抽象化

## 5. データフロー設計

### 5.1 データフロー図
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │    │    React    │    │ localStorage│
│   Events    │    │   States    │    │    Data     │
└─────┬───────┘    └─────┬───────┘    └─────┬───────┘
      │                  │                  │
      ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────┐
│               Application Flow                      │
│                                                     │
│ 1. ユーザー操作 (Click, Type, etc.)                   │
│        ↓                                            │
│ 2. Event Handler (onClick, onChange)                │
│        ↓                                            │
│ 3. Custom Hook (useMemos, useAutoSave)              │
│        ↓                                            │
│ 4. Business Logic (create, update, delete)          │
│        ↓                                            │
│ 5. Storage Layer (MemoStorage)                      │
│        ↓                                            │
│ 6. localStorage Update                               │
│        ↓                                            │
│ 7. State Update (React re-render)                   │
│        ↓                                            │
│ 8. UI Update (Component re-render)                  │
└─────────────────────────────────────────────────────┘
```

### 5.2 状態管理フロー

#### 5.2.1 メモ作成フロー
```typescript
// 1. ユーザーが「新規メモ」ボタンをクリック
// 2. createMemo()関数が呼び出される
// 3. 新しいMemoオブジェクトを生成（UUID付与）
// 4. localStorage に保存
// 5. アプリケーション状態を更新
// 6. 編集画面にリダイレクト
```

#### 5.2.2 自動保存フロー
```typescript
// 1. テキストエリアで文字入力
// 2. onChange イベントが発火
// 3. useAutoSave フックが変更を検知
// 4. 3秒のdebounce待機
// 5. updateMemo()関数が自動実行
// 6. localStorage が更新される
// 7. 保存状態の表示が更新される
```

## 6. エラーハンドリング設計

### 6.1 エラー分類と対応

#### 6.1.1 ストレージエラー
```typescript
// 容量超過エラー
try {
  await MemoStorage.saveMemo(memo);
} catch (error) {
  if (error instanceof StorageError && error.type === 'QUOTA_EXCEEDED') {
    // ユーザーに容量超過を通知
    showToast('ストレージ容量が不足しています。古いメモを削除してください。', 'error');
  }
}
```

#### 6.1.2 データ整合性エラー
```typescript
// データ破損時の復旧
try {
  const memos = await MemoStorage.getMemos();
} catch (error) {
  // localStorage をクリアして初期化
  await MemoStorage.clearAll();
  showToast('データを初期化しました。', 'warning');
}
```

### 6.2 ユーザーフィードバック

#### 6.2.1 エラーメッセージ設計
```typescript
const ERROR_MESSAGES = {
  STORAGE_QUOTA_EXCEEDED: 'ストレージ容量が不足しています。',
  NETWORK_ERROR: '一時的なエラーが発生しました。',
  DATA_CORRUPTION: 'データが破損しています。初期化します。',
  UNKNOWN_ERROR: '予期しないエラーが発生しました。'
} as const;
```

## 7. パフォーマンス最適化

### 7.1 React最適化

#### 7.1.1 メモ化戦略
```typescript
// useMemo でメモ一覧のソートを最適化
const sortedMemos = useMemo(() => {
  return memos.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}, [memos]);

// useCallback でイベントハンドラーを最適化
const handleMemoClick = useCallback((id: string) => {
  router.push(`/memo/${id}`);
}, [router]);
```

#### 7.1.2 Virtual Scrolling（将来拡張）
```typescript
// 大量メモ対応のための仮想スクロール
// react-window ライブラリ使用を検討
```

### 7.2 ストレージ最適化

#### 7.2.1 データ圧縮
```typescript
// JSON圧縮によるストレージ効率化
const compressedData = LZString.compress(JSON.stringify(memos));
localStorage.setItem(STORAGE_KEY, compressedData);
```

## 8. セキュリティ考慮事項

### 8.1 XSS対策
- ユーザー入力のサニタイズ
- dangerouslySetInnerHTML の使用禁止
- Content Security Policy の設定

### 8.2 データ保護
- localStorage データの暗号化（機密性が必要な場合）
- ユーザーデータの意図しない流出防止

## 9. テスト戦略

### 9.1 単体テスト
```typescript
// MemoStorage のテスト例
describe('MemoStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should save and retrieve memo', async () => {
    const memo = createTestMemo();
    await MemoStorage.saveMemo(memo);
    
    const retrieved = await MemoStorage.getMemoById(memo.id);
    expect(retrieved).toEqual(memo);
  });
});
```

### 9.2 統合テスト
- ユーザーシナリオベースのE2Eテスト
- 主要機能の動作確認 