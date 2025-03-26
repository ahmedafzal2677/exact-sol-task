import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { jwtService } from '../services/jwtService';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const staticUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'anc@xyz.com',
    role: 'admin',
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@xyz.com',
    role: 'user',
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane@xyz.com',
    role: 'user',
  },
];

// In a real app, this would be handled by the backend
const generateJWT = (user: User): string => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), 
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = btoa('test-key-seecret');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = jwtService.getToken();
    if (token && jwtService.isTokenValid(token)) {
      try {
        const payload = JSON.parse((token.split('.')[1]));
        const user = staticUsers.find(u => u.id === payload.sub);
        if (user) {
          setUser(user);
          setIsAuthenticated(true);
        }
      } catch {
        jwtService.removeToken();
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const user = staticUsers.find(u => u.email === email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Simple password check - in real app, use proper password hashing
    const validPassword = 
      (email === 'anc@xyz.com' && password === 'abc123') ||
      (email === 'john@xyz.com' && password === 'john123') ||
      (email === 'jane@xyz.com' && password === 'jane123');

    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    const token = generateJWT(user);
    jwtService.setToken(token);
    setUser(user);
    setIsAuthenticated(true);
    return user;
  };

  const logout = () => {
    jwtService.removeToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 