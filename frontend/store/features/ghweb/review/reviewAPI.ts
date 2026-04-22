import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../app/store';
import {
  createReviewStart,
  createReviewSuccess,
  createReviewFailure,
  updateReviewStart,
  updateReviewSuccess,
  updateReviewFailure,
  deleteReviewStart,
  deleteReviewSuccess,
  deleteReviewFailure,
} from './reviewSlice';

interface Review {
  _id: string;
  title: string;
  label: string;
  description: string;
  content: string;
  venue: string;
  tags: string[];
  rating: number;
  image_url?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateReviewPayload extends Omit<Review, '_id' | 'createdAt' | 'updatedAt'> {
  thumbnail?: File;
}

interface UpdateReviewPayload extends Partial<Omit<Review, '_id' | 'createdAt' | 'updatedAt'>> {
  id: string;
  thumbnail?: File;
}

export const reviewApi = createApi({
  reducerPath: 'reviewApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://bolt.21centurynews.com/api/review/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Review'],
  endpoints: (builder) => ({
    createReview: builder.mutation<Review, FormData>({
      query: (payload) => ({
        url: '',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Review'],
      async onQueryStarted(payload, { dispatch, queryFulfilled }) {
        dispatch(createReviewStart());
        try {
          const { data } = await queryFulfilled;
          dispatch(createReviewSuccess());
        } catch (error: any) {
          const message =
            error?.error ||
            error?.data?.message ||
            error?.data?.messages?.[0] ||
            'Failed to create review.';
          dispatch(createReviewFailure(message));
        }
      },
    }),

   updateReview: builder.mutation<Review, { slug: string; formData: FormData }>({
  query: ({ slug, formData }) => ({
    url: `${slug}`,
    method: 'PUT',
    body: formData,
  }),
  invalidatesTags: ['Review'],
  async onQueryStarted({ slug, formData }, { dispatch, queryFulfilled }) {
    dispatch(updateReviewStart());
    try {
      const { data } = await queryFulfilled;
      dispatch(updateReviewSuccess());
    } catch (error: any) {
      const message =
        error?.error ||
        error?.data?.message ||
        error?.data?.messages?.[0] ||
        'Failed to update review.';
      dispatch(updateReviewFailure(message));
    }
  },
}),

    getAllReviews: builder.query<Review[], void>({
      query: () => '',
      providesTags: ['Review'],
    }),

    getReviewById: builder.query<Review, string>({
      query: (slug) => `${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Review', slug }],
    }),

    getReviewsByTag: builder.query<Review[], string>({
      query: (tag) => `tag/${tag}`,
      providesTags: (result, error, tag) => [{ type: 'Review', tag }],
    }),

    getReviewsByVenue: builder.query<Review[], string>({
      query: (venue) => `venue/${venue}`,
      providesTags: (result, error, venue) => [{ type: 'Review', venue }],
    }),

    deleteReview: builder.mutation<void, string>({
      query: (id) => ({
        url: `${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Review'],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        dispatch(deleteReviewStart());
        try {
          await queryFulfilled;
          dispatch(deleteReviewSuccess());
        } catch (error: any) {
          const message =
            error?.error ||
            error?.data?.message ||
            error?.data?.messages?.[0] ||
            'Failed to delete review.';
          dispatch(deleteReviewFailure(message));
        }
      },
    }),
  }),
});

export const {
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useGetAllReviewsQuery,
  useGetReviewByIdQuery,
  useGetReviewsByTagQuery,
  useGetReviewsByVenueQuery,
  useDeleteReviewMutation,
} = reviewApi;