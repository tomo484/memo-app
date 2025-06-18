import { v4 as uuidv4 } from 'uuid';

/**
 * 新しいUUIDを生成する
 * @returns 新しいUUID文字列
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * UUIDの形式が正しいかを検証する
 * @param id 検証するID文字列
 * @returns 正しいUUID形式の場合true
 */
export function isValidId(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * 短縮されたIDを生成する（表示用）
 * @param id 元のUUID
 * @param length 短縮後の長さ（デフォルト: 8）
 * @returns 短縮されたID文字列
 */
export function shortenId(id: string, length: number = 8): string {
  return id.substring(0, length);
} 