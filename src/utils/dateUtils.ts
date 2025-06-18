/**
 * 相対時間を表示する（例: "2 days ago", "3 hours ago"）
 * @param date 対象の日時
 * @returns 相対時間の文字列
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // 未来の日時の場合
  if (diffInSeconds < 0) {
    return 'Just now';
  }

  // 1分未満
  if (diffInSeconds < 60) {
    return 'Just now';
  }

  // 1時間未満
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  // 24時間未満
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  // 30日未満
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  // 12ヶ月未満
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }

  // 1年以上
  const years = Math.floor(diffInSeconds / 31536000);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

/**
 * 日時を読みやすい形式でフォーマットする
 * @param date 対象の日時
 * @returns フォーマットされた日時文字列 (例: "Dec 15, 2024 at 2:30 PM")
 */
export function formatDateTime(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  
  return date.toLocaleDateString('en-US', options);
}

/**
 * 日時をISO文字列から復元する
 * @param dateString ISO形式の日時文字列
 * @returns Dateオブジェクト
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * 現在の日時を取得する
 * @returns 現在のDateオブジェクト
 */
export function getCurrentDate(): Date {
  return new Date();
} 