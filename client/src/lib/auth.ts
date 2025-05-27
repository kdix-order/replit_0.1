import { useState, useEffect } from 'react';

// Check if the user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  // Here you could also check token expiration
  // by decoding the JWT token if needed
  
  return true;
};

// Get the authentication token
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Set the authentication token
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Remove the authentication token
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// Get user info from token (simplified)
export const getUserFromToken = (): any => {
  const token = getToken();
  if (!token) return null;
  
  try {
    // This is a simplified version
    // In a real app, you'd decode the JWT token
    // but for now we'll just get the user via an API call
  } catch (error) {
    console.error('トークンの解析中にエラーが発生しました:', error);
  }
  return null;
};

// Parse a token from URL query params (used after OAuth redirect)
export const getTokenFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  return token;
};

// Clear token from URL
export const clearTokenFromUrl = (): void => {
  if (window.history.replaceState) {
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
};
