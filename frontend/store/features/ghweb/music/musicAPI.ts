import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../app/store';
import {
  createMusicStart,
  createMusicSuccess,
  createMusicFailure,
  updateMusicStart,
  updateMusicSuccess,
  updateMusicFailure,
  deleteMusicStart,
  deleteMusicSuccess,
  deleteMusicFailure,
} from './musicSlice';

interface Music {
  _id: string;
  title: string;
  label: string;
  description: string;
  content: string;
  genre: string;
  tags: string[];
  creator: string;
  rating: number;
  author: string;
  boomplay: boolean;
  boomplay_url?: string;
  spotify: boolean;
  spotify_url?: string;
  applemusic: boolean;
  applemusic_url?: string;
  audiomack: boolean;
  audiomack_url?: string;
  image_url?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateMusicPayload extends Omit<Music, '_id' | 'createdAt' | 'updatedAt'> {
  thumbnail?: File;
}

interface UpdateMusicPayload extends Partial<Omit<Music, '_id' | 'createdAt' | 'updatedAt'>> {
  id: string;
  thumbnail?: File;
}

export const musicApi = createApi({
  reducerPath: 'musicApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://bolt.21centurynews.com/api/music/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Music'],
  endpoints: (builder) => ({
    createMusic: builder.mutation<Music, FormData>({
      query: (payload) => ({
        url: '',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Music'],
      async onQueryStarted(payload, { dispatch, queryFulfilled }) {
        dispatch(createMusicStart());
        try {
          const { data } = await queryFulfilled;
          dispatch(createMusicSuccess());
        } catch (error: any) {
          const message =
            error?.error ||
            error?.data?.message ||
            error?.data?.messages?.[0] ||
            'Failed to create music.';
          dispatch(createMusicFailure(message));
        }
      },
    }),

    updateMusic: builder.mutation<Music, { slug: string; formData: FormData }>({
  query: ({ slug, formData }) => ({
    url: `${slug}`,
    method: 'PUT',
    body: formData,
  }),
  invalidatesTags: ['Music'],
  async onQueryStarted({ slug, formData }, { dispatch, queryFulfilled }) {
    dispatch(updateMusicStart());
    try {
      const { data } = await queryFulfilled;
      dispatch(updateMusicSuccess());
    } catch (error: any) {
      const message =
        error?.error ||
        error?.data?.message ||
        error?.data?.messages?.[0] ||
        'Failed to update music.';
      dispatch(updateMusicFailure(message));
    }
  },
}),

    getAllMusic: builder.query<Music[], void>({
      query: () => '',
      providesTags: ['Music'],
    }),

    getSingleMusic: builder.query<Music, string>({
      query: (slug) => `${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Music', slug }],
    }),

    getAllMusicByGenre: builder.query<Music[], string>({
      query: (genre) => `genre/${genre}`,
      providesTags: (result, error, genre) => [{ type: 'Music', genre }],
    }),

    deleteMusic: builder.mutation<void, string>({
      query: (id) => ({
        url: `${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Music'],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        dispatch(deleteMusicStart());
        try {
          await queryFulfilled;
          dispatch(deleteMusicSuccess());
        } catch (error: any) {
          const message =
            error?.error ||
            error?.data?.message ||
            error?.data?.messages?.[0] ||
            'Failed to delete music.';
          dispatch(deleteMusicFailure(message));
        }
      },
    }),
  }),
});

export const {
  useCreateMusicMutation,
  useUpdateMusicMutation,
  useGetAllMusicQuery,
  useGetSingleMusicQuery,
  useGetAllMusicByGenreQuery,
  useDeleteMusicMutation,
} = musicApi;