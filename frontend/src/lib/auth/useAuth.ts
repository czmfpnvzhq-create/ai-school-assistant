"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface UserPayload {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<UserPayload | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('edunexus_token');
    }
    return null;
  };

  const getUser = (): UserPayload | null => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('edunexus_user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('edunexus_token');
      localStorage.removeItem('edunexus_user');
      router.push('/login');
    }
  };

  const isAuthenticated = (): boolean => {
    return !!getToken();
  };

  return { getToken, getUser, logout, isAuthenticated, user };
}
