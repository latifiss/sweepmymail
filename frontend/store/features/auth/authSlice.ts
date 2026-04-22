import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

interface User {
  id: string;
  email: string;
  role: 'customer' | 'admin';
  name?: string;
  picture?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signupData: {
    email: string;
    password: string;
    phone: string;
  } | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  signupData: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateAuthFromStorage: (state) => {
      try {
        const token = localStorage.getItem('auth_token');
        const refreshToken = localStorage.getItem('auth_refresh_token');
        const userStr = localStorage.getItem('auth_user');

        if (token) state.token = token;
        if (refreshToken) state.refreshToken = refreshToken;
        if (userStr) state.user = JSON.parse(userStr);

        state.isAuthenticated = !!token;
      } catch (err) {
        console.error('Auth hydration failed:', err);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_refresh_token');
      }
    },

    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ accessToken: string; refreshToken: string; user: User }>) => {
      const { accessToken, refreshToken, user } = action.payload;
      state.token = accessToken;
      state.refreshToken = refreshToken;
      state.user = user;
      state.isAuthenticated = true;
      state.isLoading = false;

      localStorage.setItem('auth_token', accessToken);
      localStorage.setItem('auth_refresh_token', refreshToken);
      localStorage.setItem('auth_user', JSON.stringify(user));
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    signupStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setSignupData: (state, action: PayloadAction<AuthState['signupData']>) => {
      state.signupData = action.payload;
    },
    signupSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.signupData = null;

      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_token', token);
    },
    signupFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;

      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_refresh_token');
    },

    refreshToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('auth_token', action.payload);
    },

    clearError: (state) => {
      state.error = null;
    }
  },
});

export const { 
  hydrateAuthFromStorage,
  loginStart, loginSuccess, loginFailure,
  signupStart, setSignupData, signupSuccess, signupFailure,
  logout, refreshToken, clearError 
} = authSlice.actions;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectSignupData = (state: RootState) => state.auth.signupData;

export default authSlice.reducer;
