import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../app/store';
import {
  createStart,
  createSuccess,
  createFailure,
  updateStart,
  updateSuccess,
  updateFailure,
} from './articleSlice';

interface Article {
  _id: string;
  title: string;
  description: string;
  label: string;
  content: string;
  category: string;
  creator: string;
  tags: string[];
  thumbnail: string | null;
  breaking: boolean;
  live: boolean;
  slug: string;
  published_at: Date;
  meta_title?: string;
  meta_description?: string;
}

interface CreateArticlePayload extends Omit<Article, '_id'> {}
interface UpdateArticlePayload extends Partial<Article> {
  id: string;
}

export const afrobeatsrepArticleApi = createApi({
  reducerPath: 'afrobeatsrepArticleApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://bolt.21centurynews.com/api/article/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Article'],
  endpoints: (builder) => ({
    createArticle: builder.mutation<Article, FormData>({
      query: (formData) => ({
        url: '',
        method: 'POST',
        body: formData,
      }),
      async onQueryStarted(payload, { dispatch, queryFulfilled }) {
        dispatch(createStart());
        try {
          const { data } = await queryFulfilled;
          dispatch(createSuccess());
        } catch (error: any) {
          const message =
            error?.error ||
            error?.data?.message ||
            error?.data?.messages?.[0] ||
            'Failed to create article.';
          dispatch(createFailure(message));
        }
      },
      invalidatesTags: ['Article'],
    }),

   updateArticle: builder.mutation<Article, { slug: string; formData: FormData }>({
  query: ({ slug, formData }) => ({
    url: `${slug}`,  
    method: 'PUT',
    body: formData,
  }),
  async onQueryStarted({ slug, formData }, { dispatch, queryFulfilled }) {
    dispatch(updateStart());
    try {
      const { data } = await queryFulfilled;
      dispatch(updateSuccess());
    } catch (error: any) {
      const message =
        error?.error ||
        error?.data?.message ||
        error?.data?.messages?.[0] ||
        'Failed to update article.';
      dispatch(updateFailure(message));
    }
  },
  invalidatesTags: ['Article'],
}),

    getArticles: builder.query<Article[], void>({
      query: () => '',
      providesTags: ['Article'],
    }),

    getArticleById: builder.query<Article, string>({
      query: (slug) => `${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Article', slug }],
    }),

    getArticlesByCategory: builder.query<Article[], string>({
      query: (category) => `category/${category}`,
      providesTags: (result, error, category) => [{ type: 'Article', category }],
    }),

    getSimilarArticles: builder.query<Article[], string>({
      query: (id) => `similar/${id}`,
    }),
    deleteArticle: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Article'],
    }),
  }),
});

export const {
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useGetArticlesQuery,
  useGetArticleByIdQuery,
  useGetArticlesByCategoryQuery,
  useGetSimilarArticlesQuery,
  useDeleteArticleMutation
} = afrobeatsrepArticleApi;