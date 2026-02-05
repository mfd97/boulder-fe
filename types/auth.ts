// frontend/src/types/auth.ts
export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterCredentials {
    email: string;
    password: string;
  }
  
  export interface AuthUser {
    _id: string;
    email: string;
    currentStreak: number;
    lastQuizDate: string | null;
    createdAt: string;
  }
  
  export interface AuthResponse {
    success: boolean;
    data: {
      token: string;
      user: AuthUser;
    };
  }
  
  export interface AuthError {
    success: false;
    error: string;
  }