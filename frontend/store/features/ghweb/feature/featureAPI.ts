import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../app/store';
import {
  createFeatureStart,
  createFeatureSuccess,
  createFeatureFailure,
  updateFeatureStart,
  updateFeatureSuccess,
  updateFeatureFailure,
  deleteFeatureStart,
  deleteFeatureSuccess,
  deleteFeatureFailure,
} from './featureSlice';

interface Feature {
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

interface CreateFeaturePayload extends Omit<Feature, '_id' | 'createdAt' | 'updatedAt'> {
  thumbnail?: File;
}

interface UpdateFeaturePayload extends Partial<Omit<Feature, '_id' | 'createdAt' | 'updatedAt'>> {
  id: string;
  thumbnail?: File;
}

export const featureApi = createApi({
  reducerPath: 'featureApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://bolt.21centurynews.com/api/feature/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Feature'],
  endpoints: (builder) => ({
    createFeature: builder.mutation<Feature, FormData>({
      query: (payload) => ({
        url: '',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Feature'],
      async onQueryStarted(payload, { dispatch, queryFulfilled }) {
        dispatch(createFeatureStart());
        try {
          const { data } = await queryFulfilled;
          dispatch(createFeatureSuccess());
        } catch (error: any) {
          const message =
            error?.error ||
            error?.data?.message ||
            error?.data?.messages?.[0] ||
            'Failed to create feature.';
          dispatch(createFeatureFailure(message));
        }
      },
    }),

    updateFeature: builder.mutation<Feature, { slug: string; formData: FormData }>({
  query: ({ slug, formData }) => ({
    url: `${slug}`,  
    method: 'PUT',
    body: formData,
  }),
  invalidatesTags: ['Feature'],
  async onQueryStarted({ slug, formData }, { dispatch, queryFulfilled }) { 
    dispatch(updateFeatureStart());
    try {
      const { data } = await queryFulfilled;
      dispatch(updateFeatureSuccess());
    } catch (error: any) {
      const message =
        error?.error ||
        error?.data?.message ||
        error?.data?.messages?.[0] ||
        'Failed to update feature.';
      dispatch(updateFeatureFailure(message));
    }
  },
}),

    getAllFeatures: builder.query<Feature[], void>({
      query: () => '',
      providesTags: ['Feature'],
    }),

    getFeatureById: builder.query<Feature, string>({
      query: (slug) => `${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Feature', slug }],
    }),

    getFeaturesByTag: builder.query<Feature[], string>({
      query: (tag) => `tag/${tag}`,
      providesTags: (result, error, tag) => [{ type: 'Feature', tag }],
    }),

    getFeaturesByVenue: builder.query<Feature[], string>({
      query: (venue) => `venue/${venue}`,
      providesTags: (result, error, venue) => [{ type: 'Feature', venue }],
    }),

    deleteFeature: builder.mutation<void, string>({
      query: (id) => ({
        url: `${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Feature'],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        dispatch(deleteFeatureStart());
        try {
          await queryFulfilled;
          dispatch(deleteFeatureSuccess());
        } catch (error: any) {
          const message =
            error?.error ||
            error?.data?.message ||
            error?.data?.messages?.[0] ||
            'Failed to delete feature.';
          dispatch(deleteFeatureFailure(message));
        }
      },
    }),
  }),
});

export const {
  useCreateFeatureMutation,
  useUpdateFeatureMutation,
  useGetAllFeaturesQuery,
  useGetFeatureByIdQuery,
  useGetFeaturesByTagQuery,
  useGetFeaturesByVenueQuery,
  useDeleteFeatureMutation,
} = featureApi;