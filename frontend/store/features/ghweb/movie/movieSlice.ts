import { createSlice } from '@reduxjs/toolkit';

interface MovieState {
  loading: boolean;
  error: string | null;
}

const initialState: MovieState = {
  loading: false,
  error: null,
};

const movieSlice = createSlice({
  name: 'movie',
  initialState,
  reducers: {
    createMovieStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createMovieSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    createMovieFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateMovieStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateMovieSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    updateMovieFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteMovieStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteMovieSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    deleteMovieFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  createMovieStart,
  createMovieSuccess,
  createMovieFailure,
  updateMovieStart,
  updateMovieSuccess,
  updateMovieFailure,
  deleteMovieStart,
  deleteMovieSuccess,
  deleteMovieFailure,
} = movieSlice.actions;

export default movieSlice.reducer;