// features/article/articleSlice.ts

import { createSlice } from '@reduxjs/toolkit';

interface ArticleState {
  loading: boolean;
  error: string | null;
}

const initialState: ArticleState = {
  loading: false,
  error: null,
};

const articleSlice = createSlice({
  name: 'article',
  initialState,
  reducers: {
    createStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    createFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    updateFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  createStart,
  createSuccess,
  createFailure,
  updateStart,
  updateSuccess,
  updateFailure,
} = articleSlice.actions;

export default articleSlice.reducer;
