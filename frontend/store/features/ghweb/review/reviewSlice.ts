import { createSlice } from '@reduxjs/toolkit';

interface ReviewState {
  loading: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  loading: false,
  error: null,
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    createReviewStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createReviewSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    createReviewFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateReviewStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateReviewSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    updateReviewFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteReviewStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteReviewSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    deleteReviewFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  createReviewStart,
  createReviewSuccess,
  createReviewFailure,
  updateReviewStart,
  updateReviewSuccess,
  updateReviewFailure,
  deleteReviewStart,
  deleteReviewSuccess,
  deleteReviewFailure,
} = reviewSlice.actions;

export default reviewSlice.reducer;