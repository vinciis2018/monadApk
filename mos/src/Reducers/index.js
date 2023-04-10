/* eslint-disable prettier/prettier */
import {
  SCREEN_NAME_EDIT_REQUEST,
  SCREEN_NAME_EDIT_SUCCESS,
  SCREEN_NAME_EDIT_FAIL,
  GET_LOCAL_MEDIA_REQUEST,
  GET_LOCAL_MEDIA_SUCCESS,
  GET_LOCAL_MEDIA_FAIL,
  DOWNLOAD_CAMPAIGNS_REQUEST,
  DOWNLOAD_CAMPAIGNS_SUCCESS,
  DOWNLOAD_CAMPAIGNS_FAIL,
  CHECK_PLAYLIST_REQUEST,
  CHECK_PLAYLIST_SUCCESS,
  CHECK_PLAYLIST_FAIL,
  SCREEN_DETAILS_REQUEST,
  SCREEN_DETAILS_SUCCESS,
  SCREEN_DETAILS_FAIL,
  SCREEN_NAME_EDIT_RESET,
  GET_SYNCED_SCREEN_REQUEST,
  GET_SYNCED_SCREEN_SUCCESS,
  GET_SYNCED_SCREEN_FAIL,
} from '../Constants';

export function syncedScreenReducer(state = {}, action) {
  switch (action.type) {
    case GET_SYNCED_SCREEN_REQUEST:
      return { loading: true };
    case GET_SYNCED_SCREEN_SUCCESS:
      return { loading: false, data: action.payload };
    case GET_SYNCED_SCREEN_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
}
export function screenDetailsReducer(state = {}, action) {
  switch (action.type) {
    case SCREEN_DETAILS_REQUEST:
      return {loading: true};
    case SCREEN_DETAILS_SUCCESS:
      return {loading: false, success: true, data: action.payload};
    case SCREEN_DETAILS_FAIL:
      return {loading: false, success: false, error: action.payload};
    default:
      return state;
  }
}

export function screenUpdateReducer(state = {}, action) {
  switch (action.type) {
    case SCREEN_NAME_EDIT_REQUEST:
      return {loading: true};
    case SCREEN_NAME_EDIT_SUCCESS:
      return {loading: false, success: true, data: action.payload};
    case SCREEN_NAME_EDIT_FAIL:
      return {loading: false, success: false, error: action.payload};
    case SCREEN_NAME_EDIT_RESET:
      return {};
    default:
      return state;
  }
}

export function playlistCheckReducer(state = {}, action) {
  switch (action.type) {
    case CHECK_PLAYLIST_REQUEST:
      return {loading: true};
    case CHECK_PLAYLIST_SUCCESS:
      return {loading: false, data: action.payload};
    case CHECK_PLAYLIST_FAIL:
      return {loading: false, error: action.payload};
    default:
      return state;
  }
}

export function filesGetReducer(state = {}, action) {
  switch (action.type) {
    case GET_LOCAL_MEDIA_REQUEST:
      return {loading: true};
    case GET_LOCAL_MEDIA_SUCCESS:
      return {loading: false, data: action.payload};
    case GET_LOCAL_MEDIA_FAIL:
      return {loading: false, error: action.payload};
    default:
      return state;
  }
}

export function campaignsDownloadReducer(state = {}, action) {
  switch (action.type) {
    case DOWNLOAD_CAMPAIGNS_REQUEST:
      return {loading: true, progress: action.payload};
    case DOWNLOAD_CAMPAIGNS_SUCCESS:
      return {loading: false, data: action.payload};
    case DOWNLOAD_CAMPAIGNS_FAIL:
      return {loading: false, error: action.payload};
    default:
      return state;
  }
}
