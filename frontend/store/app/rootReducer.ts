import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import articleReducer from '../features/ghweb/article/articleSlice';
import reviewReducer from '../features/ghweb/review/reviewSlice';
import featureReducer from '../features/ghweb/feature/featureSlice';
import movieReducer from '../features/ghweb/movie/movieSlice';
import musicReducer from '../features/ghweb/music/musicSlice';
import opinionReducer from '../features/ghweb/opinion/opinionSlice';
import afrobeatsrepArticleReducer from '../features/afrobeatsrep/article/articleSlice';
import afroscoreArticleReducer from '../features/afroscore/article/articleSlice';
import afroscoreOpinionReducer from '../features/afroscore/opinion/opinionSlice';
import { authApi } from '../features/auth/authAPI';
import { articleApi } from '../features/ghweb/article/articleAPI';
import { reviewApi } from '../features/ghweb/review/reviewAPI';
import { featureApi } from '../features/ghweb/feature/featureAPI';
import { movieApi } from '../features/ghweb/movie/movieAPI';
import { musicApi } from '../features/ghweb/music/musicAPI';
import { opinionApi } from '../features/ghweb/opinion/opinionAPI';
import { afrobeatsrepArticleApi } from '../features/afrobeatsrep/article/articleAPI';
import { afroscoreArticleApi } from '../features/afroscore/article/articleAPI';
import { afroscoreOpinionApi } from '../features/afroscore/opinion/opinionAPI';

const rootReducer = combineReducers({
  auth: authReducer,
  article: articleReducer,
  review: reviewReducer,
  feature: featureReducer,
  movie: movieReducer,
  music: musicReducer,
  opinion: opinionReducer,
  afrobeatsrepArticle: afrobeatsrepArticleReducer,
  afroscoreArticle: afroscoreArticleReducer,
  afroscoreOpinion: afroscoreOpinionReducer,
  [authApi.reducerPath]: authApi.reducer,
  [articleApi.reducerPath]: articleApi.reducer,
  [reviewApi.reducerPath]: reviewApi.reducer,
  [featureApi.reducerPath]: featureApi.reducer,
  [movieApi.reducerPath]: movieApi.reducer,
  [musicApi.reducerPath]: musicApi.reducer,
  [opinionApi.reducerPath]: opinionApi.reducer,
  [afrobeatsrepArticleApi.reducerPath]: afrobeatsrepArticleApi.reducer,
  [afroscoreArticleApi.reducerPath]: afroscoreArticleApi.reducer,
  [afroscoreOpinionApi.reducerPath]: afroscoreOpinionApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;