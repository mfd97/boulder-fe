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
