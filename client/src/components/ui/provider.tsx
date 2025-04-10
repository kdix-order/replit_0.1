import React, { createContext, useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type User = {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: () => void;
  adminDemoLogin: () => void;
  customerDemoLogin: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAdmin: false,
  isAuthenticated: false,
  login: () => {},
  adminDemoLogin: () => {},
  customerDemoLogin: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  // Check for token in URL (from OAuth redirect)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token");
    
    if (tokenParam) {
      localStorage.setItem("token", tokenParam);
      setToken(tokenParam);
      
      // Remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Fetch user data if we have a token
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: !!token,
    retry: false,
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            setToken(null);
          }
          throw new Error("Failed to fetch user data");
        }
        
        return res.json();
      } catch (error) {
        return null;
      }
    },
  });

  const login = () => {
    window.location.href = "/api/auth/google";
  };
  
  const adminDemoLogin = async () => {
    try {
      const response = await fetch("/api/auth/admin-demo-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Admin demo login failed");
      }
      
      const data = await response.json();
      const { token: newToken } = data;
      
      if (newToken) {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        
        toast({
          title: "デモアカウントでログインしました",
          description: "管理者権限でログインしています"
        });
        
        // Refresh queries
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      }
    } catch (error) {
      console.error("Admin demo login error:", error);
      toast({
        title: "ログインエラー",
        description: "管理者デモログインに失敗しました",
        variant: "destructive"
      });
    }
  };

  const customerDemoLogin = async () => {
    try {
      const response = await fetch("/api/auth/customer-demo-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Customer demo login failed");
      }
      
      const data = await response.json();
      const { token: newToken } = data;
      
      if (newToken) {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        
        toast({
          title: "デモアカウントでログインしました",
          description: "お客様アカウントでログインしています"
        });
        
        // Refresh queries
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      }
    } catch (error) {
      console.error("Customer demo login error:", error);
      toast({
        title: "ログインエラー",
        description: "お客様デモログインに失敗しました",
        variant: "destructive"
      });
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    queryClient.clear();
    setLocation("/");
    toast({
      title: "ログアウトしました",
      description: "またのご利用をお待ちしております",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.isAdmin || false,
        isAuthenticated: !!user,
        login,
        adminDemoLogin,
        customerDemoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
