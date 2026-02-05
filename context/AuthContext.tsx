import { createContext } from 'react';
import type { User } from '@/types';

export interface AuthContextValue {
  isAuth: boolean;
  setIsAuth: (value: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextValue>({
  isAuth: false,
  setIsAuth: () => {},
  user: null,
  setUser: () => {}
});
