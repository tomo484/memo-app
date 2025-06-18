import { MEMO_TITLE_MAX_LENGTH, MEMO_PREVIEW_MAX_LENGTH, DEFAULT_MEMO_TITLE } from './constants';

/**
 * メモ内容からタイトルを抽出する
 * @param content メモの内容
 * @param maxLength 最大文字数（デフォルト: MEMO_TITLE_MAX_LENGTH）
 * @returns 抽出されたタイトル
 */
export function extractTitle(content: string, maxLength: number = MEMO_TITLE_MAX_LENGTH): string {
  if (!content || content.trim() === '') {
    return DEFAULT_MEMO_TITLE;
  }

  // 改行文字を除去し、最初の行を取得
  const firstLine = content.split('\n')[0].trim();
  
  if (firstLine === '') {
    return DEFAULT_MEMO_TITLE;
  }

  // 指定された長さで切り抜き
  if (firstLine.length <= maxLength) {
    return firstLine;
  }

  return firstLine.substring(0, maxLength) + '...';
}

/**
 * プレビューテキストを生成する
 * @param content メモの内容
 * @param maxLength 最大文字数（デフォルト: MEMO_PREVIEW_MAX_LENGTH）
 * @returns プレビューテキスト
 */
export function generatePreview(content: string, maxLength: number = MEMO_PREVIEW_MAX_LENGTH): string {
  if (!content || content.trim() === '') {
    return '';
  }

  // 改行文字をスペースに置換し、連続するスペースを1つにまとめる
  const cleanContent = content.replace(/\s+/g, ' ').trim();

  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }

  return cleanContent.substring(0, maxLength) + '...';
}

/**
 * 文字数をカウントする（単語数ベース）
 * @param content メモの内容
 * @returns 単語数
 */
export function countWords(content: string): number {
  if (!content || content.trim() === '') {
    return 0;
  }

  // 日本語の場合は文字数、英語の場合は単語数をカウント
  const hasJapanese = /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(content);
  
  if (hasJapanese) {
    // 日本語が含まれる場合は文字数をカウント（スペースと改行を除く）
    return content.replace(/\s/g, '').length;
  } else {
    // 英語の場合は単語数をカウント
    const words = content.trim().split(/\s+/);
    return words.length === 1 && words[0] === '' ? 0 : words.length;
  }
}

/**
 * テキスト内で検索クエリにマッチするかを判定する
 * @param text 検索対象のテキスト
 * @param query 検索クエリ
 * @param caseSensitive 大文字小文字を区別するか（デフォルト: false）
 * @returns マッチする場合true
 */
export function searchInText(text: string, query: string, caseSensitive: boolean = false): boolean {
  if (!query || query.trim() === '') {
    return true; // 空のクエリは全てにマッチ
  }

  if (!text) {
    return false;
  }

  const searchText = caseSensitive ? text : text.toLowerCase();
  const searchQuery = caseSensitive ? query : query.toLowerCase();

  return searchText.includes(searchQuery);
}

/**
 * 検索クエリでテキストをハイライトする（HTML文字列を返す）
 * @param text 対象テキスト
 * @param query 検索クエリ
 * @param caseSensitive 大文字小文字を区別するか
 * @returns ハイライトされたHTML文字列
 */
export function highlightText(text: string, query: string, caseSensitive: boolean = false): string {
  if (!query || query.trim() === '' || !text) {
    return text;
  }

  const flags = caseSensitive ? 'g' : 'gi';
  const regex = new RegExp(`(${escapeRegExp(query)})`, flags);
  
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * 正規表現で使用される特殊文字をエスケープする
 * @param string エスケープする文字列
 * @returns エスケープされた文字列
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 文字列をサニタイズする（XSS対策）
 * @param str サニタイズする文字列
 * @returns サニタイズされた文字列
 */
export function sanitizeString(str: string): string {
  if (!str) return '';
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * テキストが空かどうかを判定する
 * @param text 判定するテキスト
 * @returns 空の場合true
 */
export function isEmpty(text: string): boolean {
  return !text || text.trim() === '';
} 