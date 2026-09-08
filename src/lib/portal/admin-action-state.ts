/**
 * Kiểu trạng thái dùng chung cho các Server Action admin (dùng với
 * `useActionState`). Tách khỏi `admin-actions.ts` vì file `"use server"` chỉ
 * được phép export async function — không export được `interface`/`const`.
 */

export interface ActionState {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export const initialActionState: ActionState = {};
