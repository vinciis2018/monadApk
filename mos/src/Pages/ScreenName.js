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
  updateScreenName,
  getScreenDetails,
} from '../Actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

export function ScreenName({navigation}) {
  const [name, setName] = useState(null);
  const [editName, setEditName] = useState(false);
  const [granted, setGranted] = useState(PermissionsAndroid.RESULTS.GRANTED);
  const [updateScreenData, setUpdateScreenData] = useState(false);

  const screenDetails = useSelector(state => state.screenDetails);
  const {
    data: screen,
    loading: loadingScreen,
    error: errorScreen,
  } = screenDetails;

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
  } = campaignsDownload;

  const screenUpdate = useSelector(state => state.screenUpdate);
  const {
    loading: loadingRefresh,
    error: errorRefresh,
  } = screenUpdate;

  setTimeout(() => {
    if (
      files &&
      screen &&
      files.length === screen.length &&
      !editName &&
      !errorScreen &&
      !errorFiles &&
      !errorPath &&
      !updateScreenData
    ) {
      navigation.replace('VideoPlayer');
    }
    if (files && files.length === 0) {
      updateScreenPlaylist(name);
    }
  }, 30000);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!editName) {
      setUpdateScreenData(false);
    }
    if (!name) {
      AsyncStorage.getItem('playlist').then((res) => {
        if (res) {
          setName(res);
          updateScreenPlaylist(res);
        } else {
          console.log('Playing Default Screen');
          setName('New Demo Screen');
        }
      });
    } else {
      if (files && screen && files.length !== screen.length) {
        console.log('DOING HERE NOW');
        updateCampaign();
      }
      dispatch(getScreenDetails(name));
      dispatch(getFiles(RNFS.DownloadDirectoryPath, name));
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
      RNFS.mkdir(RNFS.DownloadDirectoryPath).then(() => {});
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    name,
    granted,
    path,
    editName,
    updateScreenData,
  ]);

  const updateScreenPlaylist = useCallback((screenName) => {

    setEditName(false);
    setName(screenName);
    setUpdateScreenData(true);
    dispatch(updateScreenName(screenName));
  }, [dispatch]);

  const updateCampaign = useCallback(async () => {
    console.log('JEAADSDS', files);
    if (files && files.length !== 0 && files.length > screen.length) {
      files.map(async file => {
        // console.log(file);
        const exists = await RNFS.exists(file);
        console.log('exists', exists);
        if (exists) {
          await RNFS.unlink(file);
        }
      });
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
        if (files.length === 0 && screen) {
          screen.map(video => {
            if (!loadingPath) {
              dispatch(downloadCampaigns({id: video._id, url: video.video}));
              console.log('Storage Done.');
            }
          });
        } else {
          updateScreenPlaylist(name);
          console.log('In Downloading Progress');
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
    setUpdateScreenData(false);
  }, [files, screen, granted, loadingPath, dispatch, updateScreenPlaylist, name]);


  const changeText = (text) => {
    setEditName(true);
    setName(text);
  };


  return (
    <SafeAreaView style={styles.container}>
        {editName ? (
          <View style={styles.button}>
            <TextInput
              hasTVPreferredFocus={true}
              autoFocus={true}
              // onFocus={""}
              style={styles.input}
              // value={screenName}
              placeholder={name}
              onChangeText={(text) => changeText(text)}
            />
            <Button
              hasTVPreferredFocus={true}
              color="#007AFF"
              title="Press Here To Refresh The Playlist"
              onPress={() => updateScreenPlaylist(name)}
            />
          </View>
        ) : (
          <View style={styles.button}>
            {loadingScreen ? (
              <Text style={styles.heading}>Loading Screen Details...</Text>
            ) : errorScreen ? (
              <Text style={styles.heading}>Error Screen Details: {errorScreen}</Text>
            ) : (
              <View>
                <Text style={styles.heading}>
                  {
                    screen ?
                    `Yeah!!! Successfully synced with your screen ${name}` :
                    'Please Wait'
                  }
                </Text>
                <Text style={styles.text}>
                  {
                    screen && screen.length !== 0 ?
                    `${screen.length} media found in the playlist` :
                    'Looking for playlist'
                  }
                </Text>
              </View>
            )}
            <Button
              hasTVPreferredFocus={true}
              color="#007AFF"
              title={`Press Here To Change ${name} Screen Name `}
              onPress={() => setEditName(true)}
            />
          </View>
        )}
        {errorPath && <Text style={styles.text}>Error Path: {errorPath}</Text>}
        {loadingPath && (
          <Text style={styles.text}>
            Please be patient, the campaign is being downloaded and will start
            playing as soon as it is completed
          </Text>
        )}
        {errorRefresh && <Text style={styles.text}>Error Refresh: {errorRefresh}</Text>}
        {loadingRefresh && (
          <Text style={styles.text}>
            Refreshing...
          </Text>
        )}
        {loadingFiles ? (
          <Text style={styles.heading}>Loading Files...</Text>
        ) : errorFiles ? (
          <Text style={styles.heading}>Error Files: {errorScreen}</Text>
        ) : (
          <View>
            <Text style={styles.heading}>{files?.length} campaign ready</Text>
            {/* {files?.length !== 0 && files.map((file, index) => (
              <Text key={index} style={styles.text}>
                Number {index + 1} File is here...
              </Text>
            ))} */}
          </View>
        )}
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
