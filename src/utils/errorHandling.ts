import { FirebaseError } from 'firebase/app';

export interface AppError {
  title: string;
  message: string;
  code?: string;
  shouldRetry?: boolean;
}

/**
 * Firebaseエラーを人間が読めるエラーメッセージに変換
 */
export function getFirebaseErrorMessage(error: unknown): AppError {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      // Auth errors
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return {
          title: 'ログイン失敗',
          message: 'メールアドレスまたはパスワードが正しくありません。',
          code: error.code,
        };
      case 'auth/email-already-in-use':
        return {
          title: '登録失敗',
          message: 'このメールアドレスは既に使用されています。',
          code: error.code,
        };
      case 'auth/weak-password':
        return {
          title: 'パスワードエラー',
          message: 'パスワードは6文字以上である必要があります。',
          code: error.code,
        };
      case 'auth/invalid-email':
        return {
          title: 'メールアドレスエラー',
          message: '有効なメールアドレスを入力してください。',
          code: error.code,
        };
      case 'auth/network-request-failed':
        return {
          title: 'ネットワークエラー',
          message: 'ネットワーク接続を確認してください。',
          code: error.code,
          shouldRetry: true,
        };
      case 'auth/too-many-requests':
        return {
          title: 'リクエスト過多',
          message: 'しばらく時間をおいてから再試行してください。',
          code: error.code,
          shouldRetry: true,
        };
      case 'auth/operation-not-allowed':
        return {
          title: 'サインイン方法が無効',
          message: 'この方法でのサインインは現在無効になっています。',
          code: error.code,
        };
      case 'auth/popup-closed-by-user':
        return {
          title: 'サインインキャンセル',
          message: 'サインインがキャンセルされました。',
          code: error.code,
        };

      // Firestore errors
      case 'permission-denied':
        return {
          title: 'アクセス拒否',
          message: 'この操作を実行する権限がありません。',
          code: error.code,
        };
      case 'not-found':
        return {
          title: 'データが見つかりません',
          message: '要求されたデータが見つかりませんでした。',
          code: error.code,
        };
      case 'already-exists':
        return {
          title: 'データが既に存在します',
          message: 'このデータは既に存在しています。',
          code: error.code,
        };
      case 'resource-exhausted':
        return {
          title: 'リソース制限',
          message: 'リクエスト制限に達しました。後でもう一度お試しください。',
          code: error.code,
          shouldRetry: true,
        };
      case 'failed-precondition':
        return {
          title: '前提条件エラー',
          message: '操作を実行できませんでした。状態を確認してください。',
          code: error.code,
        };
      case 'aborted':
        return {
          title: '操作が中断されました',
          message: '競合が発生しました。もう一度お試しください。',
          code: error.code,
          shouldRetry: true,
        };
      case 'out-of-range':
        return {
          title: '範囲外のエラー',
          message: '無効な範囲が指定されました。',
          code: error.code,
        };
      case 'unavailable':
        return {
          title: 'サービス利用不可',
          message: 'サービスが一時的に利用できません。',
          code: error.code,
          shouldRetry: true,
        };
      case 'data-loss':
        return {
          title: 'データ損失',
          message: 'データの損失が検出されました。',
          code: error.code,
        };
      case 'unauthenticated':
        return {
          title: '認証エラー',
          message: '認証が必要です。ログインしてください。',
          code: error.code,
        };

      // Storage errors
      case 'storage/unauthorized':
        return {
          title: 'アクセス拒否',
          message: 'ファイルにアクセスする権限がありません。',
          code: error.code,
        };
      case 'storage/canceled':
        return {
          title: 'アップロードキャンセル',
          message: 'アップロードがキャンセルされました。',
          code: error.code,
        };
      case 'storage/unknown':
        return {
          title: 'ストレージエラー',
          message: '不明なエラーが発生しました。',
          code: error.code,
          shouldRetry: true,
        };
      case 'storage/object-not-found':
        return {
          title: 'ファイルが見つかりません',
          message: '指定されたファイルが存在しません。',
          code: error.code,
        };
      case 'storage/quota-exceeded':
        return {
          title: 'ストレージ容量超過',
          message: 'ストレージ容量が不足しています。',
          code: error.code,
        };
      case 'storage/retry-limit-exceeded':
        return {
          title: 'リトライ制限',
          message: '再試行の制限に達しました。',
          code: error.code,
        };

      default:
        return {
          title: 'エラーが発生しました',
          message: error.message || '予期しないエラーが発生しました。',
          code: error.code,
          shouldRetry: true,
        };
    }
  }

  // ネットワークエラー
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    return {
      title: 'ネットワークエラー',
      message: 'インターネット接続を確認してください。',
      shouldRetry: true,
    };
  }

  // 一般的なエラー
  if (error instanceof Error) {
    return {
      title: 'エラーが発生しました',
      message: error.message || '予期しないエラーが発生しました。',
      shouldRetry: false,
    };
  }

  // 不明なエラー
  return {
    title: 'エラーが発生しました',
    message: '予期しないエラーが発生しました。もう一度お試しください。',
    shouldRetry: true,
  };
}

/**
 * エラーをログに記録（開発環境では詳細を表示）
 */
export function logError(error: unknown, context?: string) {
  if (__DEV__) {
    console.group(`🚨 Error${context ? ` in ${context}` : ''}`);
    console.error(error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
    console.groupEnd();
  } else {
    // 本番環境ではエラー監視サービスに送信
    // Sentry.captureException(error, { tags: { context } });
    console.error('Error:', error);
  }
}

/**
 * エラーメッセージを表示するためのヘルパー
 */
export function handleError(error: unknown, context?: string): AppError {
  logError(error, context);
  return getFirebaseErrorMessage(error);
}
