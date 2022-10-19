/* eslint-disable prettier/prettier */
import Axios from 'axios';
import {
  SCREEN_NAME_EDIT_REQUEST,
  SCREEN_NAME_EDIT_SUCCESS,
  SCREEN_NAME_EDIT_FAIL,
  GET_LOCAL_MEDIA_REQUEST,
  GET_LOCAL_MEDIA_SUCCESS,
  GET_LOCAL_MEDIA_FAIL,
  DOWNLOAD_CAMPAIGNS_FAIL,
  DOWNLOAD_CAMPAIGNS_SUCCESS,
  DOWNLOAD_CAMPAIGNS_REQUEST,
  CHECK_PLAYLIST_REQUEST,
  CHECK_PLAYLIST_SUCCESS,
  CHECK_PLAYLIST_FAIL,
  SCREEN_DETAILS_REQUEST,
  SCREEN_DETAILS_FAIL,
  SCREEN_DETAILS_SUCCESS,
} from '../Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import ReactNativeBlobUtil from 'react-native-blob-util';

const APP_SERVER_URL = 'https://servermonad.vinciis.in/api/screens';
// const APP_SERVER_URL = "http://localhost:3333/api/screens"

// get screen Data
export const getScreenDetails = screenName => async dispatch => {
  dispatch({
    type: SCREEN_DETAILS_REQUEST,
  });

  try {
    const {data} = await Axios.get(
      `${APP_SERVER_URL}/${screenName}/screenName`,
    );
    dispatch({
      type: SCREEN_DETAILS_SUCCESS,
      payload: data,
    });
    await AsyncStorage.setItem('playlist', screenName);
  } catch (error) {
    dispatch({
      type: SCREEN_DETAILS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
// update screen Name
export const updateScreenName = (screenName) => async dispatch => {
  dispatch({
    type: SCREEN_NAME_EDIT_REQUEST,
  });

  try {
    const {data} = await Axios.get(
      `${APP_SERVER_URL}/${screenName}/screenName`,
    );
    await AsyncStorage.setItem('playlist', screenName);
    dispatch({
      type: SCREEN_NAME_EDIT_SUCCESS,
      payload: data,
    });
    // await AsyncStorage.setItem("playlist", JSON.stringify({"sources" : data.map(video => video.video)}))
    // console.log('action', await AsyncStorage.getItem("playlist"))
  } catch (error) {
    dispatch({
      type: SCREEN_NAME_EDIT_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
// check playlist
export const checkPlaylist =
  ({screenName, timeNow, currentVid, deviceInfo}) =>
  async dispatch => {
    dispatch({
      type: CHECK_PLAYLIST_REQUEST,
    });
    // console.log(screenName, timeNow);
    try {
      // console.log(deviceInfo);
      const {data} = await Axios.get(
        `${APP_SERVER_URL}/${screenName}/screenName/${timeNow}/${currentVid}`,
        {
          params: {
            currentVid, deviceInfo,
          },
        }
      );
      dispatch({
        type: CHECK_PLAYLIST_SUCCESS,
        payload: data,
      });
      // console.log('data');
    } catch (error) {
      dispatch({
        type: CHECK_PLAYLIST_FAIL,
        payload: error,
      });
    }
  };
//  get local files
export const getFiles = (path, screenName) => async dispatch => {
  dispatch({
    type: GET_LOCAL_MEDIA_REQUEST,
  });
  const {data} = await Axios.get(`${APP_SERVER_URL}/${screenName}/screenName`);
  // console.log(RNFS);
  let files;
  try {
    files = await RNFS.readDir(path);
  } catch (e) {
    files = [];
  }
  // console.log(files);
  const playlist = data
    .map(video => video.video)
    .map(v => v.split('/').splice(-1)[0])
    .map(f => f + '.mp4');
  const playFiles = files
    .map(video => video.path)
    .map(v => v.split('/').splice(-1)[0]);
  try {
    const sameData = playFiles.filter(item => playlist.includes(item));
    const playingData = sameData.map(dataP => path + '/' + dataP);

    dispatch({
      type: GET_LOCAL_MEDIA_SUCCESS,
      payload: playingData,
    });
  } catch (error) {
    dispatch({
      type: GET_LOCAL_MEDIA_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
// download screen playlist to local
export const downloadCampaigns =
  ({id, url}) =>
  async dispatch => {
    dispatch({
      type: DOWNLOAD_CAMPAIGNS_REQUEST,
    });
    console.log(id);
    try {
      // let video_id = id;
      let video_url = url;
      let ext = '.mp4';
      let dirs =
        ReactNativeBlobUtil.fs.dirs.DownloadDir.split('/')
          .splice(0, 4)
          .join('/') + '/Download';
      console.log(dirs);
      await ReactNativeBlobUtil.config({
        path: dirs + '/' + video_url.split('/').slice(4) + ext,
        fileCache: true,
      })
      .fetch('GET', video_url)
      .progress({count: 10}, (received, total) => {
        console.log('progress', received / total);
        dispatch({
          type: DOWNLOAD_CAMPAIGNS_REQUEST,
        });
      })
      .then(res => {
        console.log(res.path());
        dispatch({
          type: DOWNLOAD_CAMPAIGNS_SUCCESS,
          payload: res.path(),
        });
      })
      .then(async () => {
        console.log('Video downloading');
        return;
      })
      .catch(err => console.log(err));
      console.log('Video Downloaded Successfully');
    } catch (error) {
      console.log(error);
      dispatch({
        type: DOWNLOAD_CAMPAIGNS_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };
