import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';
import { nintendoTheme } from '../theme/nintendoTheme';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password?: string) => boolean;
  register: (username: string, email: string, password?: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Lista inicial de usuarios registrados para pruebas
const INITIAL_USERS: User[] = [
  {
    id: 'user-demo-1',
    username: 'ExploradorGeo',
    email: 'explorador@geochat.org',
    color: nintendoTheme.colors.avatarColors[0],
  },
  {
    id: 'user-demo-2',
    username: 'ViajeroContextual',
    email: 'viajero@geochat.org',
    color: nintendoTheme.colors.avatarColors[1],
  },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(INITIAL_USERS);
  const [user, setUser] = useState<User | null>(INITIAL_USERS[0]);

  const login = (usernameOrEmail: string, _password?: string): boolean => {
    const trimmed = usernameOrEmail.trim().toLowerCase();
    const found = registeredUsers.find(
      (u) => u.username.toLowerCase() === trimmed || u.email.toLowerCase() === trimmed
    );

    if (found) {
      setUser(found);
      return true;
    }

    // Si no está registrado previamente, iniciamos sesión con cuenta nueva
    const randomColor =
      nintendoTheme.colors.avatarColors[
        registeredUsers.length % nintendoTheme.colors.avatarColors.length
      ];

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: usernameOrEmail.trim(),
      email: `${usernameOrEmail.trim().toLowerCase().replace(/\s+/g, '')}@geochat.org`,
      color: randomColor,
    };

    setRegisteredUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    return true;
  };

  const register = (username: string, email: string, _password?: string): boolean => {
    const randomColor =
      nintendoTheme.colors.avatarColors[
        registeredUsers.length % nintendoTheme.colors.avatarColors.length
      ];

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: username.trim(),
      email: email.trim(),
      color: randomColor,
    };

    setRegisteredUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
