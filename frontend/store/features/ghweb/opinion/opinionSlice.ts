import { createSlice } from '@reduxjs/toolkit';

interface OpinionState {
  loading: boolean;
  error: string | null;
}

const initialState: OpinionState = {
  loading: false,
  error: null,
};

const opinionSlice = createSlice({
  name: 'opinion',
  initialState,
  reducers: {
    createOpinionStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createOpinionSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    createOpinionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateOpinionStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateOpinionSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    updateOpinionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteOpinionStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteOpinionSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    deleteOpinionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  createOpinionStart,
  createOpinionSuccess,
  createOpinionFailure,
  updateOpinionStart,
  updateOpinionSuccess,
  updateOpinionFailure,
  deleteOpinionStart,
  deleteOpinionSuccess,
  deleteOpinionFailure,
} = opinionSlice.actions;

export default opinionSlice.reducer;