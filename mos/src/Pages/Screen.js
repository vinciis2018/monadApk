/* eslint-disable prettier/prettier */
import React, {useState, useEffect, useCallback} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  // TextInput,
  PermissionsAndroid,
  ImageBackground,
  Image,
} from 'react-native';
import {
  downloadCampaigns,
  getFiles,
  updateScreenName,
  getScreenDetails,
  getSyncedScreen,
} from '../Actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import backgroundImage from '../assets/backgroundScreen.png';
import monaLogo from '../assets/monaL.png';
import loadingImage from '../assets/loadingScreen.png';
import errorImage from '../assets/errorScreen.png';
import Randomstring from 'randomstring';
// import RNRestart from 'react-native-restart';
// const backgroundImage = {uri: 'https://ipfs.io/ipfs/QmReP1QDuv1nMdu42cP3YnbxgC6ASQecHGfd12gTEAziL2'};
// const loadingImage = {uri: 'https://ipfs.io/ipfs/QmcoxA7AH1fUxeU17tyf2FUX2sBf8y7xZM1dxuCNZD3Wxu'};
// const errorImage = {uri: 'https://ipfs.io/ipfs/QmVaa91XmU3FsNEqhKsC8DA8NnoYQw1j6ST3dbAaDTS4s5'};

export function ScreenName({navigation}) {

  const syncCode = React.useRef(null);
  const myScreen = React.useRef(null);

  const playFiles = React.useRef([]);
  const playLists = React.useRef([]);
  const dataToPlay = React.useRef([]);

  const [name, setName] = useState(null);
  const [granted, setGranted] = useState(PermissionsAndroid.RESULTS.GRANTED);
  const [updateScreenData, setUpdateScreenData] = useState(false);
  const [screenPlaylist, setScreenPlaylist] = useState(null);
  const [trigger, setTrigger] = useState(false);
  const [screenFiles, setScreenFiles] = useState(null);

  const syncedScreen = useSelector(state => state.syncedScreen);
  const {
    loading: loadingSyncedScreen,
    error: errorSyncedScreen,
    data: screenSynced,
  } = syncedScreen;

  const filesGet = useSelector(state => state.filesGet);
  const {
    data: files,
    loading: loadingFiles,
    error: errorFiles,
  } = filesGet;

  const campaignsDownload = useSelector(state => state.campaignsDownload);
  const {
    data: path,
    loading: loadingPath,
    error: errorPath,
    progress,
  } = campaignsDownload;

  const dispatch = useDispatch();


  useEffect(() => {

    if (errorPath || errorFiles) {
      console.log('error in useEffect :', errorPath || errorFiles);
      RNFS.readDir(RNFS.DownloadDirectoryPath).then((fl) => {
        fl.map((file) => {
          // console.log(file);
          RNFS.exists(file.path).then((res) => {
            if (res) {
            console.log('exists', res);

              RNFS.unlink(file.path).then(() => {});
            }
          });

        });
      });
    }

    if (!name) {
      AsyncStorage.getItem('playlist').then((res) => {
        if (res) {
          setName(res);
        }
      });
    }

    if (!syncCode.current || (syncCode.current === null)) {
      AsyncStorage.getItem('syncCode').then((res) => {
        if (res) {
          syncCode.current = res;
        } else {
          generateCode();
        }
      });
    }

    if (!screenSynced || !myScreen.current || (myScreen.current === null)) {
        dispatch(getSyncedScreen(syncCode.current));
    }

    if (screenSynced) {

      myScreen.current = screenSynced;

      if (screenSynced === myScreen.current) {
        setName(screenSynced.screen.name);
        setScreenPlaylist(screenSynced.myScreenVideos);
        dispatch(getFiles(RNFS.DownloadDirectoryPath, screenSynced.screen.name));
        console.log('screenSynced');

      }

      if (screenSynced !== myScreen.current) {
        setScreenPlaylist(null);
      }
      dispatch(getScreenDetails(screenSynced.screen.name));
    // } else {
    //   dispatch(getSyncedScreen(syncCode.current));
    }


    if (name && files && screenPlaylist && files.length !== screenPlaylist.length) {
      console.log('Updating HERE NOW');
      updateScreenPlaylist(name);

      // updateCampaign();
      console.log(name);

    }
    console.log(syncCode.current);


    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,

      {
        title: 'Storage Permission Required',
        message: 'App needs access to your storage to download photos',
      },
    ).then((res) => {
      setGranted(res);

    });

    if (!files || files === undefined) {
      RNFS.mkdir(RNFS.DownloadDirectoryPath).then(() => {
      });
    } else {
      setScreenFiles(files);
    }

    if (!progress) {
      const interval = setInterval(() => {
        setTrigger(!trigger);
        console.log('screenPlaylist', screenPlaylist?.length);
        console.log('screenFiles', screenFiles?.length);
        if (
          !loadingSyncedScreen &&
          !errorSyncedScreen &&
          !errorFiles &&
          !errorPath &&
          !loadingPath &&
          !loadingFiles &&
          screenFiles && screenPlaylist &&
          screenFiles.length !== 0 &&
          screenFiles.length === screenPlaylist.length
        ) {
          screenFiles.map((file) => {
            RNFS.stat(file).then((res) => {});
          });
          console.log('Redirecting to video player');
          navigation.replace('VideoPlayer');
        }
        console.log(trigger);
      }, 10000);
      return () => {
          clearInterval(interval);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    syncCode.current,
    granted,
    name,
    screenPlaylist,
    trigger,
    updateScreenData,
    path,
    myScreen.current,
    navigation,
    errorPath,
    // errorFiles,
  ]);

  const generateCode = async () => {
    await AsyncStorage.setItem('syncCode', Randomstring.generate({
      length: 6,
    }));
    syncCode.current = await AsyncStorage.getItem('syncCode');
  };

  const updateScreenPlaylist = useCallback((screenName) => {
    console.log('updatescreenplaylist');
    setUpdateScreenData(true);
    dispatch(updateScreenName(screenName));
    dispatch(getScreenDetails(screenName));
    dispatch(getFiles(RNFS.DownloadDirectoryPath, screenName));

    if (screenFiles && screenPlaylist) {
      console.log(screenFiles);
      playFiles.current = screenFiles.map(video => video).map(v => v?.split('/').splice(-1)[0]);
      playLists.current = screenPlaylist.map(video => video.video).map(v => v?.split('/').splice(-1)[0]).map(f => f + '.mp4');
      dataToPlay.current = playFiles.current.filter(item => playLists.current.includes(item));
    }

    if (
      !errorFiles &&
      !errorPath &&
      !loadingPath &&
      !loadingFiles &&
      screenFiles && screenPlaylist &&
      screenFiles.length !== 0 &&
      screenFiles.length > screenPlaylist.length &&
      !progress
      ) {

        RNFS.readDir(RNFS.DownloadDirectoryPath).then((fl) => {
          fl.map((file) => {
            // console.log(file);
            RNFS.exists(file.path).then((res) => {
              if (res) {
                console.log('exists', res);

                RNFS.unlink(file.path).then(() => {});
              }
            });

          });
        });
      }
    if (
      !errorFiles &&
      !progress &&
      !loadingPath &&
      !loadingFiles &&
      updateScreenData &&
      screenFiles &&  screenPlaylist && screenFiles.length !== screenPlaylist.length
      && !progress
    ) {
      updateCampaign();
    }
    // timer();
  }, [dispatch, errorFiles, errorPath, screenFiles, progress, loadingFiles, loadingPath, screenPlaylist, updateCampaign, updateScreenData]);

  const updateCampaign = useCallback(async () => {
    console.log('Updating Campaign', screenFiles.length);
    if (screenFiles && screenFiles.length !== 0 && screenFiles.length > screenPlaylist.length) {
      screenFiles.map(async (file) => {
        // console.log(file);
        RNFS.exists(file).then((res) => {
          console.log('exists', res);
          if (res) {
            RNFS.unlink(file).then(() => {});
          }
        });
      });
    }
    try {
      if (!RNFS.DownloadDirectoryPath) {
        RNFS.mkdir(RNFS.DownloadDirectoryPath).then(() => {});
      }
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message: 'App needs access to your storage to download photos',
        },
      ).then((res) => {
        setGranted(res);
      });
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Storage Permission Granted.', screenPlaylist.length);
        dispatch(getSyncedScreen(syncCode.current));

        if (screenFiles && screenPlaylist && screenFiles.length !== screenPlaylist.length && !loadingPath && !progress) {

          for (let i = 0; i < screenPlaylist.length; i++) {
            screenPlaylist.map((video, index) => {
              if (i === index ) {
                console.log('In Downloading Progress: ', index, 'campaign', video.video.split('/').slice(-1)[0] + '.mp4');

                if (dataToPlay.current.includes(video.video.split('/').slice(-1)[0] + '.mp4')){

                  console.log(dataToPlay.current);
                  console.log('Downloaded: ', index, video.video.split('/').slice(-1)[0]);

                } else {
                  dispatch(downloadCampaigns({url: video.video, index}));
                  console.log(playLists.current.length);
                  console.log(playFiles.current.length);
                }
              }
            });
          }

          dispatch(getFiles(RNFS.DownloadDirectoryPath, name));

          console.log('Storage Done.');
        }

      } else {
        // eslint-disable-next-line no-alert
        alert('Storage Permission Not Granted');
      }
    } catch (err) {
      console.warn('err', err);
      // eslint-disable-next-line no-alert
      alert(err);
    }
    setUpdateScreenData(false);
  }, [screenFiles, screenPlaylist, granted, loadingPath, dispatch, progress, name]);


  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={
        (errorSyncedScreen || errorFiles || errorPath) ? errorImage :
        (loadingSyncedScreen || loadingFiles || loadingPath) ? loadingImage :
        backgroundImage
      } resizeMode="cover" style={styles.background}>
        <View style={styles.logoContainer}>
          <Image source={monaLogo} style={styles.logo}/>
          <Text style={styles.monatv}>MONA TV</Text>
        </View>
            {
            loadingSyncedScreen ||
              loadingFiles ||
              loadingPath ?
              // loadingRefresh ?
            (
              <View style={styles.loadingContainer}>
                <Text style={[ styles.heading, styles.right ]}>
                  {loadingSyncedScreen && 'Waiting for loading the screen... '}{'\n'}
                  {loadingFiles && 'Waiting for syncing campaigns... '}{'\n'}
                  {loadingPath && `Waiting for downloading campaigns...  ${(progress * 100).toFixed(2)} %`}{'\n'}
                </Text>
              </View>
            ) :
            errorSyncedScreen ||
              errorFiles ||
              errorPath ?
              // errorRefresh ?
            (
              <View style={styles.errorContainer}>
                <Text style={[ styles.heading, styles.right]}>Oops! Error found in {name} : {
                  errorSyncedScreen ||
                  errorFiles ||
                  errorPath
                  // errorRefresh
                }</Text>
                <Text style={[ styles.text, styles.right ]}>Please check screen settings : XXX%{syncCode.current}%XXX</Text>
              </View>
            ) : (
              <View style={styles.screenContainer}>
                <Text style={[ styles.heading, styles.left ]}>{name}</Text>
                <Text style={[ styles.text, styles.left ]}>XXX%{syncCode.current}%XXX</Text>
                {files && screenPlaylist && files.length === screenPlaylist.length ? (
                  <Text style={[ styles.heading, styles.left ]}>{files.length} campaign(s) found</Text>
                ) : (
                  <Text style={[ styles.heading, styles.left ]}>{files?.length} campaign(s) found is not synced</Text>
                )}
              </View>
            )}
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    height: '100%',
    width: '100%',
  },
  logoContainer: {
    marginTop: 10,
    marginLeft: 20,
    // flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    resizeMode: 'cover',
    height: 42,
    width: 41,
  },
  loadingImage: {
    height: 100,
    width: 100,
    resizeMode: 'cover',
    margin: 10,
  },
  errorImage: {
    height: 150,
    width: 150,
    resizeMode: 'cover',
  },
  monatv: {
    fontWeight: 'bold',
    fontSize: 35,
    padding: 10,
    width: 300,
    color: '#ffffff',
  },
  loadingContainer: {
    marginTop: 400,
  },
  errorContainer: {
    marginTop: 420,
  },
  screenContainer: {
    marginTop: 380,
  },
  heading: {
    fontSize: 15,
    color: '#CCCCFF',
  },
  text: {
    fontSize: 15,
    color: '#CCCCFF',
    fontFamily: 'serif',
    // fontWeight: 'bold',
  },
  left: {
    textAlign: 'left',
    marginLeft: 10,
  },
  right: {
    textAlign: 'right',
    marginRight: 20,
  },
});
