import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../app/store';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  signupStart,
  signupSuccess,
  signupFailure,
  logout as logoutAction,
  refreshToken as refreshTokenAction,
} from './authSlice';

interface User {
  id: string;
  _id: string;
  email: string;
  role: 'admin' | 'customer'; 
}

interface LoginResponse {
  user: User;
  accessToken: string,       
  refreshToken: string
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://bolt.21centurynews.com/api/auth/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/admin/login',
        method: 'POST',
        body: credentials,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      async onQueryStarted(credentials, { dispatch, queryFulfilled }) {
        dispatch(loginStart());
        try {
          const { data } = await queryFulfilled;
          dispatch(loginSuccess({
            accessToken: data.accessToken,      
            refreshToken: data.refreshToken || '', 
            user: data.user
          }));
      
          localStorage.setItem('auth_token', data.accessToken);
          localStorage.setItem('auth_user', JSON.stringify(data.user));
        } catch (error: any) {
          const message =
            error?.error ||
            error?.data?.message ||
            error?.data?.messages?.[0] ||
            'Login failed.';
          dispatch(loginFailure(message));
        }
      },
    }),

    register: builder.mutation<LoginResponse, RegisterPayload>({
      query: (userData) => ({
        url: '/admin/register',
        method: 'POST',
        body: userData,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      async onQueryStarted(userData, { dispatch, queryFulfilled }) {
        dispatch(signupStart());
        try {
          const { data } = await queryFulfilled;
          dispatch(signupSuccess({
            user: data.user,
            token: data.accessToken
          }));

          localStorage.setItem('auth_token', data.accessToken);
          localStorage.setItem('auth_user', JSON.stringify(data.user));
        } catch (error: any) {
          const message =
            error?.error ||
            error?.data?.message ||
            error?.data?.messages?.[0] ||
            'Registration failed.';
          dispatch(signupFailure(message));
        }
      },
    }),

    logout: builder.mutation<void, void>({
      queryFn: () => {
        return { data: undefined };
      },
      async onQueryStarted(_, { dispatch }) {
        dispatch(logoutAction());
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      },
    }),

    refreshToken: builder.query<{ token: string }, void>({
      query: () => 'refresh',
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(refreshTokenAction(data.token));

          localStorage.setItem('auth_token', data.token);
        } catch (err) {
          console.error('Token refresh failed', err);
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenQuery,
} = authApi;
