/* eslint-disable prettier/prettier */
import React, {useState, useEffect, useCallback} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Button,
  PermissionsAndroid,
} from 'react-native';

import {
  downloadCampaigns,
  getFiles,
  updateScreen,
  getScreenDetails,
} from '../Actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { SCREEN_NAME_EDIT_RESET } from '../Constants';

export function ScreenPage({navigation}) {
  const [screenName, setScreenName] = useState(null);
  const [editScreen, setEditScreen] = useState(false);
  const [screenDb, setScreenDb] = useState([]);
  const [granted, setGranted] = useState(PermissionsAndroid.RESULTS.GRANTED);

  const screenDetails = useSelector(state => state.screenDetails);
  const {
    data: screen,
    // loading: loadingScreen,
    // error: errorScreen,
  } = screenDetails;

  const screenUpdate = useSelector(state => state.screenUpdate);
  const {data, success, loading, error} = screenUpdate;

  const filesGet = useSelector(state => state.filesGet);
  const {data: files, loading: loadingFiles, error: errorFiles} = filesGet;

  const campaignsDownload = useSelector(state => state.campaignsDownload);
  const {
    data: path,
    loading: loadingPath,
    error: errorPath,
  } = campaignsDownload;

  const dispatch = useDispatch();

  useEffect(() => {
    // console.log("useEffect", screenName)
    if (success || !screen) {
      dispatch({
        type: SCREEN_NAME_EDIT_RESET,
      });
    }
    if (!screenName) {
      AsyncStorage.getItem('playlist').then((res) => {
        if (res) {
          setScreenName(res);
          // if (!editScreen) {
          //   updateScreenPlaylist(res);
          // }
        } else {
          console.log('Playing Default Screen');
          setScreenName('New Demo Screen Admin');
        }
      });
    } else {
      if (files && data) {
        console.log('DOING HERE NOW');
        updateCampaign();
      }
      dispatch(getScreenDetails(screenName));
      dispatch(getFiles(RNFS.DownloadDirectoryPath, screenName));
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

    if (!files || files === undefined) {
      RNFS.mkdir(RNFS.DownloadDirectoryPath).then(() => {
        return;
      });
    }

    // dispatch(updateScreen(screenName));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, screenName, granted, path]);

  setTimeout(() => {
    if (
      files &&
      screen &&
      files.length === screen.length &&
      !editScreen
    ) {
      navigation.replace('VideoPlayer');
    }

  }, 6000);

  const updateScreenPlaylist = async (screenN) => {
    // console.log(screenName);
    dispatch(updateScreen(screenN));

    if (data && files) {
      // setScreenPlaylist(files);
      setScreenDb(data);
      // console.log('Here', data);
    }
  };

  const updateCampaign = useCallback(async () => {
    console.log('JEAADSDS', files);
    if (files && files.length !== 0 && files.length > data.length) {
      deleteDownloads(files);
    }
    try {
      if (!RNFS.DownloadDirectoryPath) {
        await RNFS.mkdir(RNFS.DownloadDirectoryPath);
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
        console.log('Storage Permission Granted.');
        if (files.length === 0 && data) {
          data.map(video => {
            if (!loadingPath) {
              dispatch(downloadCampaigns({id: video._id, url: video.video}));
              console.log('Storage Done.');
            }
          });
        } else {
          console.log('Herer');
        }
      } else {
        // eslint-disable-next-line no-alert
        alert('Storage Permission Not Granted');
      }
    } catch (err) {
      console.warn(err);
      // eslint-disable-next-line no-alert
      alert(err);
    }
  }, [data, dispatch, files, granted, loadingPath]);

  const deleteDownloads = async (filesD) => {
    filesD.map(async file => {
      // console.log(file);
      const exists = await RNFS.exists(file);
      console.log('exists', exists);
      if (exists) {
        await RNFS.unlink(file);
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.button}>
        <Text style={styles.heading}>
          {
            screen ?
            `Yeah!!! Successfully Changed Screen Name to ${screenName}` :
            'Please Wait'
          }
        </Text>

        <Text style={styles.text}>
          {
            screen && screenDb !== 0 ?
            `${screen.length} media found in the playlist` :
            'Looking for playlist'
          }
        </Text>
        <SafeAreaView>
          {editScreen && (
            <TextInput
              autoFocus={true}
              // onFocus={""}
              style={styles.input}
              // value={screenName}
              placeholder={screenName}
              // onEndEditing={(text) => setScreenName(text)}
              onChangeText={text => setScreenName(text)}
            />
          )}
        </SafeAreaView>
        <View style={styles.button}>
          <Button
            hasTVPreferredFocus={true}
            color="#007AFF"
            title={`Press Here To Change ${screenName} Screen Name `}
            onPress={() => setEditScreen(!editScreen)}
          />
        </View>
        <View style={styles.button}>
          <Button
            hasTVPreferredFocus={true}
            color="#007AFF"
            title="Press Here To Update The Playlist"
            onPress={() => updateScreenPlaylist(screenName)}
          />
        </View>
        {files && files.length !== 0 && (
          <View style={styles.button}>
            <Button
              hasTVPreferredFocus={true}
              color="#007AFF"
              onPress={() => navigation.replace('VideoPlayer')}
              title="Press here to open the video Player"
            />
          </View>
        )}

        <View style={styles.button}>
          <Button onPress={updateCampaign} title="Set Campaign" />
        </View>

        {loading ||
          (loadingFiles && <Text style={styles.text}>Loading...</Text>)}
        {loadingPath && (
          <Text style={styles.text}>
            Please be patient, the campaign is being downloaded and will start
            playing as soon as it is completed
          </Text>
        )}
        {error && <Text style={styles.text}>Error: {error}</Text>}
        {errorFiles && <Text style={styles.text}>Error Files: {errorFiles}</Text>}
        {errorPath && <Text style={styles.text}>Error Path: {errorPath}</Text>}
        {files && (
          <View>
            <Text style={styles.heading}>{files?.length} campaign ready</Text>
            {files.map((file, index) => (
              <Text key={index} style={styles.text}>
                Number {index + 1} File is here...
              </Text>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  text: {
    paddingTop: 20,
    alignSelf: 'center',
    fontSize: 15,
  },
  heading: {
    paddingTop: 10,
    alignSelf: 'center',
    fontSize: 20,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  button: {
    margin: 10,
  },
});
