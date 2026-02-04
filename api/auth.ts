import { instance } from "./instance";
import type { AuthResponse } from "@/types";

export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterBody {
  fullName: string;
  email: string;
  password: string;
}

export async function login(body: LoginBody): Promise<AuthResponse> {
  console.log(body)
  const response = await instance.post<{ success: true; data: AuthResponse }>(
    "/auth/login",
    body
  );
  return response.data.data;
}

export async function register(body: RegisterBody): Promise<AuthResponse> {
  const response = await instance.post<{ success: true; data: AuthResponse }>(
    "/auth/register",
    body
  );
  return response.data.data;
}



/**
 * تسجيل الخروج (حذف الـ token فقط)
 */
export const logout = async (): Promise<void> => {
  try {
    await instance.post('/auth/logout');
  } catch (error) {
    console.error('❌ Logout API error:', error);
    // نكمل حتى لو فشل الـ request
  }
};