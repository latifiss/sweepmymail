import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer, { RootState } from './rootReducer';
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

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], 
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const setupStore = () => {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
          ignoredPaths: ['auth.token' ],
        },
      }).concat(
        authApi.middleware,
        articleApi.middleware,
        reviewApi.middleware,
        featureApi.middleware,
        movieApi.middleware,
        musicApi.middleware,
        opinionApi.middleware,
        afrobeatsrepArticleApi.middleware,
        afroscoreArticleApi.middleware,
        afroscoreOpinionApi.middleware,
      ),
    devTools: process.env.NODE_ENV !== 'production',
  });
};

export const store = setupStore();
export const persistor = persistStore(store);

export type { RootState };

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export default store;