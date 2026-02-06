import { z } from 'zod';

// ティアリスト作成バリデーション
export const tierListSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルを入力してください')
    .max(100, 'タイトルは100文字以内で入力してください'),
  description: z
    .string()
    .max(500, '説明は500文字以内で入力してください')
    .optional(),
  categoryId: z.string().min(1, 'カテゴリーを選択してください'),
});

export type TierListFormData = z.infer<typeof tierListSchema>;

// プロフィール更新バリデーション
export const profileSchema = z.object({
  displayName: z
    .string()
    .min(1, '表示名を入力してください')
    .max(50, '表示名は50文字以内で入力してください'),
  bio: z
    .string()
    .max(200, '自己紹介は200文字以内で入力してください')
    .optional(),
  photoURL: z.string().url('有効なURLを入力してください').optional().or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// コメント投稿バリデーション
export const commentSchema = z.object({
  content: z
    .string()
    .min(1, 'コメントを入力してください')
    .max(500, 'コメントは500文字以内で入力してください'),
});

export type CommentFormData = z.infer<typeof commentSchema>;

// バリデーションヘルパー
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _form: '予期しないエラーが発生しました' } };
  }
}
