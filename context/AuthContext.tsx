import { createContext } from 'react';

export interface AuthContextValue {
  isAuth: boolean;
  setIsAuth: (value: boolean) => void;
}

export const AuthContext = createContext<AuthContextValue >({
  isAuth: false,
  setIsAuth: () => {}
});
