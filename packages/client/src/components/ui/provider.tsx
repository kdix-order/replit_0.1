import React, { createContext, useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type User = {
  id: string;
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

  // Check for token in URL (from OAuth redirect) or auth errors
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token");
    const authError = urlParams.get("auth_error");
    
    if (tokenParam) {
      localStorage.setItem("token", tokenParam);
      setToken(tokenParam);
      
      // Remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Google認証成功メッセージを表示
      toast({
        title: "ログイン成功",
        description: "Googleアカウントでログインしました",
        variant: "default"
      });
      
      // すべてのクエリをリフレッシュ
      queryClient.invalidateQueries();
    }
    
    // 認証エラー処理
    if (authError) {
      // URLからauth_errorパラメータを削除
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // エラーメッセージを表示
      toast({
        title: "ログインに失敗しました",
        description: "許可されたメールアドレスでログインしてください。(@kindai.ac.jpまたは@itp.kindai.ac.jpのアドレスのみ使用可能です)",
        variant: "destructive",
        duration: 7000,
      });
    }
  }, [toast]);

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
    // Google認証開始前にトーストメッセージを表示
    toast({
      title: "Google認証に移動します",
      description: "Googleのログイン画面に移動します。近畿大学のメールアドレス (@kindai.ac.jp または @itp.kindai.ac.jp) でログインしてください。",
      duration: 5000,
    });
    
    // Google認証ページへリダイレクト
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
