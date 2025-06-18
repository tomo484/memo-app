import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * クラス名を結合し、Tailwind CSSのクラスをマージする
 * @param inputs クラス名の配列
 * @returns マージされたクラス名文字列
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 