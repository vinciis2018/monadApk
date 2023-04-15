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
  GET_SYNCED_SCREEN_REQUEST,
  GET_SYNCED_SCREEN_SUCCESS,
  GET_SYNCED_SCREEN_FAIL,
} from '../Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import ReactNativeBlobUtil from 'react-native-blob-util';

const APP_SERVER_URL = 'https://servermonad.vinciis.in/api/screens';
// const APP_SERVER_URL = "http://localhost:3333/api/screens"

export const getSyncedScreen = (syncCode) => async (dispatch) => {
  dispatch({
    type: GET_SYNCED_SCREEN_REQUEST,
    payload: syncCode,
  });

  try {
    const { data } = await Axios.get(
      `${APP_SERVER_URL}/syncCode/${syncCode}`
    );
    // console.log(data);
    dispatch({
      type: GET_SYNCED_SCREEN_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: GET_SYNCED_SCREEN_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
  }
};

// get screen Data
export const getScreenDetails = screenName => async dispatch => {
  dispatch({
    type: SCREEN_DETAILS_REQUEST,
  });

  try {
    const {data} = await Axios.get(
      `${APP_SERVER_URL}/${screenName}/screenName`,
      {}
    );
    dispatch({
      type: SCREEN_DETAILS_SUCCESS,
      payload: data,
    });
    await AsyncStorage.setItem('playlist', screenName);
  } catch (error) {
    dispatch({
      type: SCREEN_DETAILS_FAIL,
      payload: error.response && error.response.data.message
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
      {}
    );
    await AsyncStorage.setItem('playlist', screenName);
    dispatch({
      type: SCREEN_NAME_EDIT_SUCCESS,
      payload: data,
    });
    // await AsyncStorage.setItem("playlist", JSON.stringify({"sources" : data.map(video => video.video)}))
    // console.log('action', await AsyncStorage.getItem("playlist"))
  } catch (error) {
    console.log('Screen Update error ' + error);
    dispatch({
      type: SCREEN_NAME_EDIT_FAIL,
      payload: error.response && error.response.data.message
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
      // console.log({screenName, timeNow, currentVid, deviceInfo});
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
        payload: error?.response && error?.response?.data?.message
          ? error?.response?.data?.message
          : error?.message,
      });
    }
  };
//  get local files
export const getFiles = (path, screenName) => async (dispatch) => {
  dispatch({
    type: GET_LOCAL_MEDIA_REQUEST,
  });
  // console.log('screenNameandPath: ', path, screenName);
  try {
    const {data} = await Axios.get(`${APP_SERVER_URL}/${screenName}/screenName`);
    // console.log('data', data.length);
    const files = await RNFS.readDir(path);

    // console.log(files);
    const playFiles = files.map(video => video.path).map(v => v.split('/').splice(-1)[0]);
    const playlist = data.map(video => video.video).map(v => v.split('/').splice(-1)[0]).map(f => f + '.mp4');

    const sameData = playFiles.filter(item => playlist.includes(item));
    const playingData = sameData.map(dataP => path + '/' + dataP);
    // console.log('playFiles: ', playFiles);
    // console.log('playlist: ', playlist);
    // console.log('sameData: ', sameData);

    // var array3 = playFiles.concat(playlist);
    // var array2 = array3.sort((a, b) => { return a > b; });
    // var array1 = array2.filter((num, index) => { return num !== array2[index + 1]; });
    // console.log(array2);

    dispatch({
      type: GET_LOCAL_MEDIA_SUCCESS,
      payload: playingData,
    });

  } catch (error) {
    console.log('Files getting ' + error);
    dispatch({
      type: GET_LOCAL_MEDIA_FAIL,
      payload: 'Files getting ' + error,
    });
  }
};
// download screen playlist to local
export const downloadCampaigns =
  ({url, index}) =>
  async (dispatch) => {
    let jobId;
    // console.log(url);
    // let video_id = id;
    let video_url = url;
    let ext = '.mp4';
    let dirs =
    ReactNativeBlobUtil.fs.dirs.DownloadDir.split('/')
      .splice(0, 4)
      .join('/') + '/Download';
    // console.log(dirs);
    // console.log(video_url);

    // RNFS.downloadFile({
    //   fromUrl: video_url,
    //   toFile: dirs + '/' + video_url.split('/').slice(4) + ext,
    //   connectionTimeout: 1000 * 10,
    //   background: true,
    //   discretionary: true,
    //   progressDivider: 1,
    //   cacheable: true,
    //   resumable: (res) => {
    //     console.log('# resumable :', res);
    //   },
    //   begin: (res) => {
    //       // start event
    //       console.log('#begin download :', res);
    //   },
    //   progress: (data) => {
    //       const percentage = ((100 * data.bytesWritten) / data.contentLength) || 0;
    //       console.log('# percentage :', index, percentage);
    //     dispatch({
    //       type: DOWNLOAD_CAMPAIGNS_REQUEST,
    //       payload: (index, percentage),
    //     });
    //   },
    //   end: (res) => {
    //     console.log('Download finished.', res.path());
    //     dispatch({
    //       type: DOWNLOAD_CAMPAIGNS_SUCCESS,
    //       payload: res.path(),
    //     });
    //   },
    // });
    // }).catch((err) => {
    //   console.log('error', err);
    //   dispatch({
    //     type: DOWNLOAD_CAMPAIGNS_FAIL,
    //     payload: 'Download error ' +  err,
    //   });
    // });

    ReactNativeBlobUtil.config({
      path: dirs + '/' + video_url.split('/').slice(4) + ext,
      fileCache: true,
      overwrite: false,
      indicator: true,
      // addAndroidDownloads: {
      //   useDownloadManager: true, // <-- this is the only thing required
      // //   // Optional, override notification setting (default to true)
      // //   notification: true,
      //   // // Title of download notification
      //   // title: 'Great ! Download Success ! :O ',
      //   // // File description (not notification description)
      //   // description: 'A video file.',
      //   // mime: 'video/mp4',
      //   // Make the file scannable  by media scanner
      //   // mediaScannable: true,
      // },
    })
    .fetch('GET', video_url)
    .progress({count: 10}, (received, total,) => {
      console.log(`progress ${index} video`, received / total);
      dispatch({
        type: DOWNLOAD_CAMPAIGNS_REQUEST,
        payload: (index, received / total),
      });
    })
    .then(async res => {
      // console.log(res.path());
      // await ReactNativeBlobUtil.MediaCollection.copyToMediaStore({
      //   name: video_url + ext, // name of the file
      //   parentFolder: dirs, // subdirectory in the Media Store, e.g. HawkIntech/Files to create a folder HawkIntech with a subfolder Files and save the image within this folder
      //   mimeType: 'video/mp4', // MIME type of the file
      //   },
      //     'Download', // Media Collection to store the file in ("Audio" | "Image" | "Video" | "Download")
      //     res.path() // Path to the file being copied in the apps own storage
      // );
      dispatch({
        type: DOWNLOAD_CAMPAIGNS_SUCCESS,
        payload: res.path(),
      });
      console.log('Video downloading');
    })
    .then(() => {
      console.log('Video Downloaded Successfully');
      return;
    })
    .catch((errorMessage, statusCode) => {
      console.log('Downloading error', statusCode, errorMessage);
      dispatch({
        type: DOWNLOAD_CAMPAIGNS_FAIL,
        payload: 'Download error ' +  errorMessage,
      });
    });
  };
