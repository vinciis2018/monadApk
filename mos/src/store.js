/* eslint-disable prettier/prettier */
import {createStore, compose, applyMiddleware, combineReducers} from 'redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import thunk from 'redux-thunk';

import {
  campaignsDownloadReducer,
  filesGetReducer,
  playlistCheckReducer,
  screenDetailsReducer,
  screenUpdateReducer,
} from './Reducers';

const initialState = {
  screenUpdate: {
    data: AsyncStorage.getItem('playlist'),
  },
};

const reducer = combineReducers({
  screenDetails: screenDetailsReducer,
  screenUpdate: screenUpdateReducer,
  playlistCheck: playlistCheckReducer,
  filesGet: filesGetReducer,
  campaignsDownload: campaignsDownloadReducer,
});

const store = createStore(
  reducer,
  initialState,
  compose(applyMiddleware(thunk)),
);

export default store;
