
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Dimensions, FlatList, Text, View, SafeAreaView, StyleSheet, TextInput, Button } from 'react-native';
import { Card } from 'react-native-paper';
import { Video } from 'expo-av';

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");
const VIDEO_CONTAINER_HEIGHT = DEVICE_HEIGHT;

export default function App() {
  const [videoPlaying, setVideoPlaying] = useState();
  const [screenId, setScreenId] = useState();
  const onVideoPlaying = useCallback((videoRef) => {
    // Stop the video that's currently playing, if another video is started
    if (videoPlaying && videoPlaying !== videoRef.current) {
      videoPlaying.stopAsync();
    }

    setVideoPlaying(videoRef.current);
  }, [videoPlaying]);

  return (
    <SafeAreaView style={styles.container}>
       
      <FlatList
        style={styles.list}
        data={getVideos()}
        // Not the best key, but there is no id...
        keyExtractor={video => video.thumb} 
        renderItem={({ item }) => (
          <VideoCard
            video={item} 
            // screenId={"62853c94ec9a944d95de4afd"}
            // Disable the line below if you want videos to play simultaneously
            onStartPlaying={onVideoPlaying}
          />
        )}
      />
    </SafeAreaView>
  );
}

function VideoCard({ video, onStartPlaying = () => {} }) {
  const videoRef = useRef();
  const [isPlaying, setPlaying] = useState(false);
  const [vid, setVid] = useState(video.sources[0]);
  const [playlist, setPlaylist] = useState(video.sources);
  const [posterImg, setPosterImg] = useState("https://arweave.net/LCJquQMG4IsY7UJkY2oBnPrZY4vj-QTF17R8ojTbLKY")
  const [index, setIndex] = useState(1);
  const [screenName, setScreenName] = useState("New Demo Screen Admin");
  
  useEffect(() => {

    // fetch(`https://servermonad.vinciis.in/api/screens/62853c94ec9a944d95de4afd/screenVideos`)
    fetch(`https://servermonad.vinciis.in/api/screens/${screenName}/screenName`)
    .then((response) => response.json())
    .then((list) => {
      setPlaylist(list.map((video) => ({
        title: video.title, sources: [video.video]
      })))
      return playlist
    })
    .catch((err) => {
      console.log(err.message, err.code);
      return err.message
    });
    console.log(playlist);
  }, [
    playlist.length, 
    screenName
  ]);

  const onPlaybackStatus = useCallback((event) => {
    setPlaying(event.isPlaying);
   
    if (event.isPlaying) {
      onStartPlaying(videoRef);
      setPlaying(false)
    } else {
      setPlaying(true)
    }
    if (event.didJustFinish) {
      // The player has just finished playing and will stop. Maybe you want to play something else?
      console.log(event.didJustFinish)
      // if(playlist.length > 0) {
        // console.log(playlist.length)
        if(index === playlist.length) {
          setIndex(1)
          // console.log("index", index)
        } else {
          setIndex(index+1)
          // console.log("index__", index)
        }
        setVid(playlist.map((video) => video.sources[0])[index-1])
        // console.log(vid)
      }
    // }
  }, [onStartPlaying, index]);
  
  const updateScreen = async () => {
    console.log(screenName)
    // console.log(screenId)

    fetch(`https://servermonad.vinciis.in/api/screens/${screenName}/screenName`)
    .then((res) => res.json())
    .then((list) => {
      setPlaylist(list.map((video) => ({
        title: video.title, sources: [video.video]
      })))
      return playlist
    })
    .catch((err) => {
      console.log(err.message, err.code);
      return err.message
    });
    setPlaying(false)
    console.log(playlist);
  }
  return (
    <Card style={styles.card}>
      {isPlaying && (
        <View style={styles.container}>
          <Text style={styles.text}>Please enter your screen name</Text>
          <TextInput 
            autoFocus={true} 
            style={styles.input} 
            value={screenName} 
            onChangeText={(text) => setScreenName(text)}
            />
          <View style={styles.button}>
            <Button title="Let the ADS begin..." 
            onPress={updateScreen}
            />
          </View>
        </View>
      )}
     
      <Video
        style={styles.cardVideo}
        ref={videoRef}
        source={{ uri: vid }}
        onPlaybackStatusUpdate={onPlaybackStatus}
        isLooping
        useNativeControls
        shouldPlay={!isPlaying}
        posterSource= {posterImg}
        resizeMode= {"cover"}
        posterResizeMode = {"cover"}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  text: {
    alignSelf: "center",
    fontSize: 20
  }, 
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10
  },
  button: {
    margin: 10,
  },
  list: {
    paddingVertical: 0,
  },
  card: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
  cardVideo: {
    flex: 1,
    height: VIDEO_CONTAINER_HEIGHT,
    alignSelf: "stretch",
    maxWidth: DEVICE_WIDTH
  },
  cardDescription: {
    marginTop: 12,
  },
});

function getVideos() {
  return [
    {
      "description": "Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself. When one sunny day three rodents rudely harass him, something snaps... and the rabbit ain't no bunny anymore! In the typical cartoon tradition he prepares the nasty rodents a comical revenge.\n\nLicensed under the Creative Commons Attribution license\nhttp://www.bigbuckbunny.org",
      "sources": [
        "https://arweave.net/DGcP1bUjPZ5BKRegD5PFb94C_wO4HPZ2mq236p6Il70",
      ],
      "subtitle": "By Blender Foundation",
      "thumb": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
      "title": "Big Buck Bunny"
    },
  ]
}
