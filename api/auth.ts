import type { AuthResponse } from "@/types";
import { instance } from "./instance";

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
  try {
    const response = await instance.post<{ success: true; data: AuthResponse }>(
      "/auth/register",
      body
    );
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
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

export interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  createdAt: string;
}

export async function getMe(): Promise<UserProfile> {
  const response = await instance.get("/users/me");
  return response.data.data.user;
}

export interface UpdateProfileData {
  fullName?: string;
  profilePicture?: string;
}

export async function updateProfile(data: UpdateProfileData): Promise<UserProfile> {
  const response = await instance.put("/users/me", data);
  return response.data.data.user;
}