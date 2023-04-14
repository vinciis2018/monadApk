/* eslint-disable prettier/prettier */
// React Native Video Library to Play Video in Android and IOS
// https://aboutreact.com/react-native-video/

// import React in our code
import React, {useState, useRef, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';

// import all the components we are going to use
import {Dimensions, StyleSheet, Text, View, TouchableHighlight} from 'react-native';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';

//Import React Native Video to play video
import Video from 'react-native-video';
import { getFiles, checkPlaylist, getScreenDetails, getSyncedScreen } from '../Actions';


const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const VIDEO_CONTAINER_HEIGHT = DEVICE_HEIGHT;
const VIDEO_CONTAINER_WIDTH = DEVICE_WIDTH;
// const VIDEO_CONTAINER_HEIGHT = 1080;
// const VIDEO_CONTAINER_WIDTH = 1920;

export const VideoPlayer = ({ navigation }) => {
  const _video = useRef(null);
  const posterImg = useRef({uri: 'https://ipfs.io/ipfs/QmXQs8D4PJTdZ1xWFuU32FTFT2DU2JaXbsTnM4waHTAyzr'});
  const [screenName, setScreenName] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [playerState, setPlayerState] = useState(false);
  const [verify, setVerify] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [deviceId, setDeviceId] = useState(null);
  const [deviceIp, setDeviceIp] = useState(null);
  const [deviceMaac, setDeviceMaac] = useState(null);
  const [deviceDisplay, setDeviceDisplay] = useState(null);
  const [repeat, setRepeat] = useState(false);

  const [syncCode, setSyncCode] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [index, setIndex] = useState(0);
  const [vid, setVid] = useState(
    // files?.map(file => file)[index] ||
    // 'https://ipfs.io/ipfs/QmNmC8fghVBMuWmrf1QXeiuznYCaYQC7AcX4kNYGKJz1iT'
    'https://ipfs.io/ipfs/QmT6oYBAWBVe3GC8onUerr5SDn2YxYL3gBWKbv22152zmb'
    // 'https://ipfs.io/ipfs/bafybeicncq7nbgewlj6sxbzewxl5dqbzqswyaxezu5inazk6rlf5bj2zca?filename=Renaissance.mp4'
  );

  const screenUpdate = useSelector((state) => state.screenUpdate);
  const {data: screenPlaylist} = screenUpdate;

  const syncedScreen = useSelector(state => state.syncedScreen);
  const {
    // loading: loadingSyncedScreen,
    error: errorSyncedScreen,
    // data: screenSynced,
  } = syncedScreen;

  const screenDetails = useSelector(state => state.screenDetails);
  const {
    data: screen,
    // loading: loadingScreen,
    error: errorScreen,
  } = screenDetails;

  const filesGet = useSelector((state) => state.filesGet);
  const {
    data: files,
    // loading: loadingFiles,
    error: errorFiles,
  } = filesGet;

  const playlistCheck = useSelector((state) => state.playlistCheck);
  const {
    data: checkScreenData,
    // loading: loadingCheckScreen,
    error: errorCheckScreen,
  } = playlistCheck;

  const dispatch = useDispatch();

  useEffect(() => {
    // if (!success) {
    //   navigation.replace('ScreenName');
    // }
    if (!screenName || screenName === null) {
      AsyncStorage.getItem('playlist').then((res) => {
          setScreenName(res);
      });
    }
    if (!screen && screenName !== null) {
      dispatch(getScreenDetails(screenName));
    }
    if (!files && screenName !== null) {
      dispatch(getFiles(RNFS.DownloadDirectoryPath, screenName));
    // } else {
    //    if (playlist.length === 0 && files.length !== 0) {
    //   }
    }
    if (files) {
      setPlaylist(files.map(file => file));
    }

    AsyncStorage.getItem('syncCode').then((res) => {
      setSyncCode(res);
    });
    DeviceInfo.getIpAddress().then((res) => {
      setDeviceIp(res);
    });
    DeviceInfo.getMacAddress().then((res) => {
      setDeviceMaac(res);

    });
    DeviceInfo.getDisplay().then((res) => {
      setDeviceDisplay(res);
    });
    DeviceInfo.getAndroidId().then((res) => {
      setDeviceId(res);
    });
    setTimeout(() => {
      if (!verify) {
        setIsPlaying(false);
      }
    }, 120000);

    if (files && files.length === 0) {
      navigation.replace('ScreenName');
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, files, screenName, screen, index, isPlaying, verify, screenPlaylist]);

  // const onReplay = () => {
  //   //Handler for Replay
  //   setPlayerState(true);
  //   _video.current.seek(0);
  //   console.log('Replay');
  // };

  const onProgress = data => {
    setIsPlaying(true);
    // Video Player will progress continue even if it ends
    if (!isLoading && playerState !== false) {
      setCurrentTime(data.currentTime);
    }

    if (index === 0 && (data.seekableDuration - data.currentTime) < 0.2) {
      onEnd();
    }
    if (errorSyncedScreen) {
      navigation.replace('ScreenName');
    }
  };

  const onEnd = () => {

    setPlayerState(true);
    const currentVid = vid.split('/').slice(-1);
    const timeNow = new Date();
    const deviceInfo = {
      deviceId: deviceId,
      deviceIp: deviceIp,
      deviceMaac: deviceMaac,
      deviceDisplay: deviceDisplay,
    };
    // console.log(syncCode);
    // if (!files && screenName !== null) {
    //   dispatch(getFiles(RNFS.DownloadDirectoryPath, screenName));
    // } else {
      if (files) {
        console.log('files: ', files.length);
        if (!playlist || playlist.length === 0 || playlist.length !== files.length) {
          setPlaylist(files.map(file => file));
        }
        console.log('playlist: ', playlist.length);
        dispatch(checkPlaylist({screenName: screenName, timeNow, currentVid, deviceInfo}));
        setVid(files.map((video) => video)[index]);
        // console.log(checkScreenData);
        if (checkScreenData) {
          verifyPlaylist();
          console.log('DONE PLAYING');
        }
      }
    // }

    if (files && screenPlaylist && files.length === screenPlaylist.length) {
      const filesCid = files.map((file) => {
        return file.split('/').slice(-1)[0].split('.').slice(0)[0];
      });
      const playlistCid = screenPlaylist.map((pl) => {
        return pl.video.split('/').slice(-1)[0];
      });

      let sameCid = 0;
      for (var i = 0; i < filesCid.length; i++) {
        if (playlistCid.includes(filesCid[i])) {
          sameCid = sameCid + 1;
        }
      }
      if (sameCid !== files.length && sameCid !== screenPlaylist.length) {
        console.log('ONENDWALA', sameCid);
        navigation.replace('ScreenName');
      }

    }
    dispatch(getSyncedScreen(syncCode));
  };

  const onLoadStart = data => {
    console.log(screenName);
    // _video.current.unloadAsync()
    if (data.src.uri !== 'https://ipfs.io/ipfs/QmT6oYBAWBVe3GC8onUerr5SDn2YxYL3gBWKbv22152zmb') {
      const vidUrl = `https://ipfs.io/ipfs/${data.src.uri.split('/').slice(-1)[0]?.split('.')?.slice(0)[0]}`;
      // console.log(vidUrl)
      const options = {
        method: 'HEAD',
      };
      fetch(vidUrl, options)
        .then((res) => {
          if (!res.ok) {throw res.statusText;}
          const realSize = res.headers.get('content-length');
          RNFS.stat(data.src.uri).then((response) => {
            console.log('res', response);
            const fileSize = response;

            if (Math.floor(fileSize.size) !== Math.floor(realSize)) {
              console.log('downloaded size', Math.floor(fileSize.size));
              console.log('real size', Math.floor(realSize));
              return RNFS.unlink(data.src.uri).then(() => {
                console.log('Deleting File', data.src.uri);
                RNFS.readDir(RNFS.DownloadDirectoryPath).then((fl) => {
                    if (fl.length >= playlist.length) {
                      fl.map((f) => {
                        RNFS.unlink(f).then(() => {});
                      });
                    }
                }).catch((e) => {
                  console.log('e', e);
                });
                navigation.replace('ScreenName');
              }).catch((error) => {
                console.log('error loadstart: ', error.message);
              });


            }
          }).catch((err) => {
            console.log('err loadstart: ', err.message);
          });
        });
    }

    setIsLoading(true);
    console.log('ON LOAD START', data.src.uri);
    if (errorCheckScreen) {
      setVerify(false);
    }

    if (files && playlist && screen) {
      setTimeout(() => {
        if (screen.length !== files.length) {
          files.map(async file => {
            // console.log(file);
            RNFS.exists(file).then((res) => {
              console.log('exists', res);
              if (res) {
                RNFS.unlink(file).then(() => {});
              }
            });
          });
          navigation.replace('ScreenName');
        }
        setPlaylist(files.map(file => file));
      }, 2000);
    } else {
      if (screenName !== null) {
        dispatch(getScreenDetails(screenName));
      } else {
        AsyncStorage.getItem('playlist').then((res) => {
          setScreenName(res);
      });
      }
    }
  };

  const onLoad = data => {
    // setVid(playlist.map(file => file)[index]);
    setDuration(data.duration);
    setIsLoading(false);
    setIsFullScreen(true);

    console.log(`ON LOAD : ${JSON.stringify(data)}`);
    if (!files && screenName !== null) {
      dispatch(getFiles(RNFS.DownloadDirectoryPath, screenName));
    } else {
      if (!playlist && files) {
        setPlaylist(files.map(file => file));
      } else {
        if (playlist.length === 1) {
          setIndex(0);
          setRepeat(true);
          console.log('__index', index);
          console.log('__playlist', playlist.map((video) => video)[index]);
        } else {
          setRepeat(false);
          if (playlist.length !== 1 && playlist.length === index + 1 ) {
            setIndex(0);
            console.log('index', index);
          } else {
            setIndex(index + 1);
            console.log('index__', index);
          }
        }
      }
    }
  };

  const onError = error => {
    console.log(`ON ERROR : ${error}`);
    setTimeout(() => {
      navigation.replace('ScreenName');
    }, 10000); // 30 seconds
  };

  const onPause = () => {
    setPlayerState(false);
    setTimeout(() => {
      navigation.replace('ScreenName');
    }, 10000);
  };

  const onReadyForDisplay = () => {
    setIsFullScreen(isFullScreen);
  };

  const verifyPlaylist = () => {
    setVerify(true);
    const screenPlayData = checkScreenData.map((video) => video.video);
    console.log('Screenplaydata', screenPlayData.length);
    console.log('playlist here', playlist.length);
    if (screenPlayData.length !== playlist.length && files && playlist && playlist.length !== 0) {
      files.map(file => {
        // console.log(file);
        RNFS.exists(file).then((res) => {
          if (res) {
            // setPaused(true);
            setPlaylist(files.map(fl => fl));
            navigation.replace('ScreenName');
          }
        });
      });
    }
  };

  return (
    <View style={styles.container}>
      {errorCheckScreen && <Text>Screen Playlist Check Error {errorCheckScreen}</Text>}
      {errorFiles && (
        <Text style={styles.heading}>Local file read error {errorFiles}</Text>
      )}
      {errorScreen && (
        <Text style={styles.heading}>screen details error {errorScreen}</Text>
      )}
      {!verify && (
        <Text style={styles.heading}>Server Connection Issue, please check the internet connection or connect moderators</Text>
      )}
      <TouchableHighlight style={styles.card} onPress={() => navigation.replace('ScreenName')} >
        <Video
          onEnd={onEnd}
          onLoad={onLoad}
          onLoadStart={onLoadStart}
          onProgress={onProgress}
          omError={onError}
          onPause={onPause}
          onReadyForDisplay={onReadyForDisplay}
          // onReplay={onReplay}
          paused={paused}
          ref={_video}
          resizeMode={'stretch'}
          fullscreen={isFullScreen}
          source={{
            uri: vid,
          }}
          repeat={repeat}
          // source={{
          //   uri: '/storage/emulated/0/Download/QmNubs7ShhWUDcUN2kSmTxp6HvLE4zdz5UnFRKDdF9i1n8.mp4',
          // }}
          // source={{
          //   uri: 'https://ipfs.io/ipfs/QmT6oYBAWBVe3GC8onUerr5SDn2YxYL3gBWKbv22152zmb',
          // }}
          style={styles.mediaPlayer}
          volume={0}
          controls={false}
          playInBackground={false}
          poster={posterImg.current.uri}
          posterResizeMode = {'stretch'}
        />
      </TouchableHighlight>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  card: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
  heading: {
    alignSelf: 'center',
    fontSize: 20,
  },
  mediaPlayer: {
    position: 'absolute',
    aspectRatio: VIDEO_CONTAINER_WIDTH / VIDEO_CONTAINER_HEIGHT,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    // backgroundColor: 'black',
    // justifyContent: 'center',
    flex: 1,
    height: VIDEO_CONTAINER_HEIGHT,
    // alignSelf: 'stretch',
    maxWidth: VIDEO_CONTAINER_WIDTH,
  },
});
