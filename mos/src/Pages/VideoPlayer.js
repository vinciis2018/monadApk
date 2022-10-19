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
import { getFiles, checkPlaylist, getScreenDetails } from '../Actions';


const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const VIDEO_CONTAINER_HEIGHT = DEVICE_HEIGHT;

export const VideoPlayer = ({ navigation }) => {
  const _video = useRef(null);
  const posterImg = useRef({uri: 'https://arweave.net/pziELbF_OhcQUgJbn_d1j_o_3ASHHHXA3_GoTdJSnlg'});

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

  const [playlist, setPlaylist] = useState([]);
  const [index, setIndex] = useState(0);
  const [vid, setVid] = useState(
    // files?.map(file => file)[index] ||
    'https://ipfs.io/ipfs/QmNmC8fghVBMuWmrf1QXeiuznYCaYQC7AcX4kNYGKJz1iT'
  );

  const screenUpdate = useSelector((state) => state.screenUpdate);
  const {data: screenPlaylist, success} = screenUpdate;

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
    if (!screenName) {
      AsyncStorage.getItem('playlist').then((res) => {
          setScreenName(res);
      });
    } else {
      if (!files) {
        dispatch(getFiles(RNFS.DownloadDirectoryPath, screenName));
      // } else {
      //   setPlaylist(files.map(file => file));
      }
      if (!screen) {
        // console.log(screenName);
        dispatch(getScreenDetails(screenName));
      }
    }
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
  }, [dispatch, files, screenName, screen, index, playlist, isPlaying, verify, screenPlaylist]);

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
    // console.log(screenName);
    if (!files) {
      dispatch(getFiles(RNFS.DownloadDirectoryPath, screenName));
    } else {
      if (!playlist) {
        setPlaylist(files.map(file => file));
      } else {
        dispatch(checkPlaylist({screenName: screenName, timeNow, currentVid, deviceInfo}));
        setVid(playlist.map((video) => video)[index]);
        if (checkScreenData) {
          verifyPlaylist();
          dispatch(getScreenDetails(screenName));
        }
        console.log('DONE PLAYING');
      }
    }
  };

  const onLoadStart = data => {
    // _video.current.unloadAsync()
    setIsLoading(true);
    console.log('ON LOAD START', data.src.uri);
    if (errorCheckScreen) {
      setVerify(false);
    }

    if (files && playlist && screen) {
      setTimeout(() => {
        if (screen.length !== files.length) {
          navigation.replace('ScreenName');
        }
        if (files.length !== playlist.length) {
          setPlaylist(files.map(file => file));
        }
      }, 5000);
    }
  };

  const onLoad = data => {
    // setVid(playlist.map(file => file)[index]);
    setDuration(data.duration);
    setIsLoading(false);
    setIsFullScreen(true);

    console.log(`ON LOAD : ${JSON.stringify(data)}`);
    if (files) {
      if (!playlist) {
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
    } else {
      dispatch(getFiles(RNFS.DownloadDirectoryPath, screenName));
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

  const verifyPlaylist = async () => {
    setVerify(true);
    const screenPlayData = checkScreenData.map((video) => video.video);
    if (screenPlayData.length !== playlist.length) {
      setPaused(true);
      navigation.replace('ScreenName');
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
          //   uri: 'https://ipfs.io/ipfs/QmNmC8fghVBMuWmrf1QXeiuznYCaYQC7AcX4kNYGKJz1iT',
          // }}
          style={styles.mediaPlayer}
          // volume={10}
          controls={true}
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
    aspectRatio: DEVICE_WIDTH / VIDEO_CONTAINER_HEIGHT,
    // top: 0,
    left: 0,
    // bottom: 0,
    right: 0,
    // backgroundColor: 'black',
    // justifyContent: 'center',
    flex: 1,
    height: VIDEO_CONTAINER_HEIGHT,
    // alignSelf: 'stretch',
    maxWidth: DEVICE_WIDTH,
  },
});
