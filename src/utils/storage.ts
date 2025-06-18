import { Memo, StorageError } from '../types/memo';
import { STORAGE_KEY, STORAGE_QUOTA_LIMIT, ERROR_MESSAGES } from './constants';
import { generateId, isValidId } from './idUtils';
import { getCurrentDate } from './dateUtils';

/**
 * localStorage を使用したメモデータの永続化クラス
 */
export class MemoStorage {
  private static instance: MemoStorage | null = null;

  /**
   * シングルトンパターンでインスタンスを取得
   */
  public static getInstance(): MemoStorage {
    if (!MemoStorage.instance) {
      MemoStorage.instance = new MemoStorage();
    }
    return MemoStorage.instance;
  }

  private constructor() {
    // プライベートコンストラクタ（シングルトンパターン）
  }

  /**
   * 全てのメモを取得する
   * @returns メモの配列
   * @throws StorageError
   */
  public getMemos(): Memo[] {
    try {
      if (typeof window === 'undefined') {
        // サーバーサイドでは空配列を返す
        return [];
      }

      const data = localStorage.getItem(STORAGE_KEY);
      
      if (!data) {
        return [];
      }

      const parsed = JSON.parse(data);
      
      // データの形式を検証
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid data format: expected array');
      }

      // 各メモの形式を検証し、Dateオブジェクトに変換
      const memos: Memo[] = parsed.map((item: unknown) => {
        if (!this.isValidMemoData(item)) {
          throw new Error(`Invalid memo data: ${JSON.stringify(item)}`);
        }

        // この時点でitemは有効なメモデータであることが保証されている
        const validItem = item as {
          id: string;
          content: string;
          createdAt: string;
          updatedAt: string;
        };

        return {
          id: validItem.id,
          content: validItem.content,
          createdAt: new Date(validItem.createdAt),
          updatedAt: new Date(validItem.updatedAt),
        };
      });

      // 更新日時で降順ソート
      return memos.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    } catch (error) {
      console.error('Failed to get memos:', error);
      
      if (error instanceof SyntaxError) {
        throw this.createStorageError('PARSE_ERROR', ERROR_MESSAGES.STORAGE_PARSE_ERROR, error);
      }
      
      throw this.createStorageError('UNKNOWN', ERROR_MESSAGES.UNKNOWN_ERROR, error as Error);
    }
  }

  /**
   * メモを保存する
   * @param memo 保存するメモ
   * @throws StorageError
   */
  public saveMemo(memo: Memo): void {
    try {
      if (typeof window === 'undefined') {
        throw new Error('localStorage is not available on server side');
      }

      const memos = this.getMemos();
      const existingIndex = memos.findIndex(m => m.id === memo.id);
      
      if (existingIndex >= 0) {
        // 既存メモの更新
        memos[existingIndex] = { ...memo };
      } else {
        // 新規メモの追加
        memos.push(memo);
      }

      this.saveMemos(memos);

    } catch (error) {
      console.error('Failed to save memo:', error);
      
      // StorageErrorオブジェクトかどうかをチェック
      if (error && typeof error === 'object' && 'type' in error && 'message' in error) {
        throw error;
      }
      
      throw this.createStorageError('UNKNOWN', ERROR_MESSAGES.SAVE_FAILED, error as Error);
    }
  }

  /**
   * メモを削除する
   * @param id 削除するメモのID
   * @throws StorageError
   */
  public deleteMemo(id: string): void {
    try {
      if (!isValidId(id)) {
        throw this.createStorageError('NOT_FOUND', ERROR_MESSAGES.MEMO_NOT_FOUND);
      }

      const memos = this.getMemos();
      const filteredMemos = memos.filter(memo => memo.id !== id);
      
      if (filteredMemos.length === memos.length) {
        throw this.createStorageError('NOT_FOUND', ERROR_MESSAGES.MEMO_NOT_FOUND);
      }

      this.saveMemos(filteredMemos);

    } catch (error) {
      console.error('Failed to delete memo:', error);
      
      // StorageErrorオブジェクトかどうかをチェック
      if (error && typeof error === 'object' && 'type' in error && 'message' in error) {
        throw error;
      }
      
      throw this.createStorageError('UNKNOWN', ERROR_MESSAGES.DELETE_FAILED, error as Error);
    }
  }

  /**
   * IDでメモを取得する
   * @param id メモのID
   * @returns メモオブジェクト、見つからない場合はundefined
   */
  public getMemoById(id: string): Memo | undefined {
    try {
      if (!isValidId(id)) {
        return undefined;
      }

      const memos = this.getMemos();
      return memos.find(memo => memo.id === id);

    } catch (error) {
      console.error('Failed to get memo by id:', error);
      return undefined;
    }
  }

  /**
   * メモを更新する（部分更新対応）
   * @param id 更新するメモのID
   * @param updates 更新内容
   * @throws StorageError
   */
  public updateMemo(id: string, updates: Partial<Pick<Memo, 'content'>>): void {
    try {
      const existingMemo = this.getMemoById(id);
      
      if (!existingMemo) {
        throw this.createStorageError('NOT_FOUND', ERROR_MESSAGES.MEMO_NOT_FOUND);
      }

      const updatedMemo: Memo = {
        ...existingMemo,
        ...updates,
        updatedAt: getCurrentDate(),
      };

      this.saveMemo(updatedMemo);

    } catch (error) {
      console.error('Failed to update memo:', error);
      
      // StorageErrorオブジェクトかどうかをチェック
      if (error && typeof error === 'object' && 'type' in error && 'message' in error) {
        throw error;
      }
      
      throw this.createStorageError('UNKNOWN', ERROR_MESSAGES.SAVE_FAILED, error as Error);
    }
  }

  /**
   * 新しいメモを作成する
   * @param content メモの内容
   * @returns 作成されたメモ
   */
  public createMemo(content: string = ''): Memo {
    const now = getCurrentDate();
    const memo: Memo = {
      id: generateId(),
      content,
      createdAt: now,
      updatedAt: now,
    };

    this.saveMemo(memo);
    return memo;
  }

  /**
   * 全データをクリアする（テスト用）
   */
  public clearAll(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  /**
   * ストレージの使用量を取得する（概算）
   * @returns バイト数
   */
  public getStorageSize(): number {
    if (typeof window === 'undefined') {
      return 0;
    }

    const data = localStorage.getItem(STORAGE_KEY);
    return data ? new Blob([data]).size : 0;
  }

  /**
   * メモ配列をlocalStorageに保存する
   * @param memos 保存するメモ配列
   * @throws StorageError
   */
  private saveMemos(memos: Memo[]): void {
    try {
      const data = JSON.stringify(memos, (key, value) => {
        // Dateオブジェクトを文字列に変換
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      });

      // 容量チェック
      const dataSize = new Blob([data]).size;
      if (dataSize > STORAGE_QUOTA_LIMIT) {
        throw this.createStorageError('QUOTA_EXCEEDED', ERROR_MESSAGES.STORAGE_QUOTA_EXCEEDED);
      }

      localStorage.setItem(STORAGE_KEY, data);

    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw this.createStorageError('QUOTA_EXCEEDED', ERROR_MESSAGES.STORAGE_QUOTA_EXCEEDED, error);
      }
      
      throw error;
    }
  }

  /**
   * メモデータの形式を検証する
   * @param data 検証するデータ
   * @returns 正しい形式の場合true
   */
  private isValidMemoData(data: unknown): data is {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
  } {
    return (
      data !== null &&
      typeof data === 'object' &&
      'id' in data &&
      'content' in data &&
      'createdAt' in data &&
      'updatedAt' in data &&
      typeof (data as Record<string, unknown>).id === 'string' &&
      typeof (data as Record<string, unknown>).content === 'string' &&
      typeof (data as Record<string, unknown>).createdAt === 'string' &&
      typeof (data as Record<string, unknown>).updatedAt === 'string' &&
      isValidId((data as Record<string, unknown>).id as string)
    );
  }

  /**
   * StorageErrorを作成する
   * @param type エラーの種類
   * @param message エラーメッセージ
   * @param originalError 元のエラー
   * @returns StorageError
   */
  private createStorageError(
    type: StorageError['type'], 
    message: string, 
    originalError?: Error
  ): StorageError {
    return {
      type,
      message,
      originalError,
    };
  }
}

// デフォルトエクスポート
export default MemoStorage.getInstance(); 