
/**
 * @flow
 */

 import React from "react";
 import {
   Dimensions,
   StyleSheet,
   Text,
   TouchableHighlight,
   View,
   TextInput,
   Button
 } from "react-native";
 import {
   Video
 } from "expo-av";
 

//  async function fetch () {
//   try {
//     const response  = await window.fetch(`https://server.vinciis.in/api/screens/62853c94ec9a944d95de4afd/screenVideos`)
//     // const response  = await window.fetch(`https://server.vinciis.in/api/screens/${this.state.screenId}/screenVideos`)
//     const data = await response.json();
//     console.log(data)
//     return data;
//   } catch (r) {
//     console.error("fetch Error", r)
//     return r
//   }
//  }


// const PLAYLIST = playlist.then(() => {});

// const PLAYLIST = [
//   {
//     name: "Vinciis Demo Video",
//     uri: "https://arweave.net/DGcP1bUjPZ5BKRegD5PFb94C_wO4HPZ2mq236p6Il70",
//     isVideo: true
//    }
//  ]

 const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");
 const LOADING_STRING = "... loading ...";
 const VIDEO_CONTAINER_HEIGHT = DEVICE_HEIGHT;
 
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.index = 0;
    this.playbackInstance = null;
    this.state = {
      showVideo: false,
      playbackInstanceName: LOADING_STRING,
      muted: false,
      shouldPlay: true,
      isPlaying: false,
      isBuffering: false,
      isLoading: true,
      videoWidth: DEVICE_WIDTH,
      videoHeight: VIDEO_CONTAINER_HEIGHT,
      poster: true,
      useNativeControls: false,
      screenId: "",
      updatePlay: false
    };
    this._isMounted = false;
    // this.PLAYLIST = null;
    this.PLAYLIST = [
      {
        name: "Vinciis Demo Video",
        uri: "https://arweave.net/DGcP1bUjPZ5BKRegD5PFb94C_wO4HPZ2mq236p6Il70",
        isVideo: true
      }
    ];
    this.handleChange = this.handleChange.bind(this);

  }
 
  componentDidMount() {
    this._isMounted = true

    // fetch(`https://server.vinciis.in/api/screens/62853c94ec9a944d95de4afd/screenVideos`)
    // .then((response) => response.json())
    // .then((list) => {
    //   this.PLAYLIST = list.map((video) => ({
    //     name: video.title, uri: video.video, isVideo: true
    //   }))
    //   return this.PLAYLIST
    // })

  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidUpdate() {}
 
 
  async _loadNewPlaybackInstance(playing) {
    if (this.playbackInstance !== null) {
      await this.playbackInstance.unloadAsync();
      // this.playbackInstance.setOnPlaybackStatusUpdate(null);
      this.playbackInstance = null;
    }
    console.log("PLAYLIST", this.PLAYLIST)
    const source = { uri: this.PLAYLIST[this.index].uri };
    console.log("source", source)

    const initialStatus = {
      shouldPlay: playing,
      isMuted: this.state.muted,
      // // UNCOMMENT THIS TO TEST THE OLD androidImplementation:
      // androidImplementation: 'MediaPlayer',
    };
    await this._video.loadAsync(source, initialStatus);
    this.playbackInstance = this._video;
    const status = await this._video.getStatusAsync();
    this._updateScreenForLoading(false);
  }
 
  _mountVideo = component => {
    this._video = component;
    this._loadNewPlaybackInstance(false);
  };
 
  _updateScreenForLoading(isLoading) {
    if (isLoading) {
      this.setState({
        showVideo: false,
        isPlaying: false,
        playbackInstanceName: LOADING_STRING,
        isLoading: true
      });
    } else {
      this.setState({
        playbackInstanceName: this.PLAYLIST[this.index].name,
        showVideo: this.PLAYLIST[this.index].isVideo,
        isLoading: false
      });
    }
  }
 
  _onPlaybackStatusUpdate = status => {
    if (status.isLoaded) {
      this.setState({
        shouldPlay: true,
        isPlaying: status.isPlaying,
        isBuffering: status.isBuffering,
        muted: status.isMuted,
      });
      if (status.didJustFinish) {
        this._updatePlaybackInstanceForIndex(true);
        this._advanceIndex();

      }
    } else {
      if (status.error) {
        console.log(`FATAL PLAYER ERROR: ${status.error}`);
      }
    }
  };

  _onLoadStart = async () => {
    console.log(`ON LOAD START`);

  
  };

  _onLoad = status => {
  if (this.playbackInstance !== null) {
    if(this.state.updatePlay) {
      this._video.presentFullscreenPlayer();
    }
    this.playbackInstance.playAsync();
  }
    console.log(`ON LOAD : ${JSON.stringify(status)}`);
  };
 
  _onError = error => {
    console.log(`ON ERROR : ${error}`);
  };

  _onReadyForDisplay = event => {
    const widestHeight =
      (DEVICE_WIDTH * event.naturalSize.height) / event.naturalSize.width;
    if (widestHeight > VIDEO_CONTAINER_HEIGHT) {
      this.setState({
        videoWidth:
          (VIDEO_CONTAINER_HEIGHT * event.naturalSize.width) /
          event.naturalSize.height,
        videoHeight: VIDEO_CONTAINER_HEIGHT
      });
    } else {
      this.setState({
        videoWidth: DEVICE_WIDTH,
        videoHeight:
          (DEVICE_WIDTH * event.naturalSize.height) / event.naturalSize.width
      });
    }
  };
 

  _advanceIndex() {
  if(this.index === (this.PLAYLIST.length - 1 )) {
    this.index = 0
  } else {
    this.index = (this.index + 1);
  }
  }
 
  async _updatePlaybackInstanceForIndex(playing) {
    this._updateScreenForLoading(true);

    this.setState({
      videoWidth: DEVICE_WIDTH,
      videoHeight: VIDEO_CONTAINER_HEIGHT
    });

    this._loadNewPlaybackInstance(playing);
  }

  _onPlayPausePressed = () => {
    if (this.playbackInstance !== null) {
      if (this.state.isPlaying) {
        this.playbackInstance.pauseAsync();
      } else {
        this.playbackInstance.playAsync();
      }
    }
  };

  handleChange (text){
    const screenId = text;
    console.log("screenId", screenId);
    this.setState({ screenId }, () => {
      if(!this._isMounted) return;
      fetch(`https://server.vinciis.in/api/screens/${screenId}/screenVideos`)
      .then((response) => 
         response.json()
      ).then((data) => {
        if(!this._isMounted) return;
        console.log("dataa", data)
        this.PLAYLIST = data.map((video) => ({
          name: video.title, uri: video.video, isVideo: true
        }));
        console.log("PLAYLIST 2", this.PLAYLIST);
        this.setState({
          updatePlay: true
        })
      });
    })
    
  }
 
  render() {
    
    return (
      <View>
        {!this.state.updatePlay && (
            <View style={styles.container}>
              <Text style={styles.text}>Please enter your screenId</Text>
              <TextInput autoFocus={true} style={styles.input} value={this.state.screenId} onChangeText={(text) => this.setState({screenId: text})}/>
              <View style={styles.button}>
                <Button title="Let the ADS begin..." onPress={() => this.handleChange(this.state.screenId)}/>
              </View>
            </View>
          )
        }
        {this.state.updatePlay && (
          <View style={styles.container}>
            {this.PLAYLIST.map((playlist, index) => 
              <Text key={index} style={styles.text}>{playlist.name}</Text>
            )}
          </View>
        )}
        <View style={styles.videoContainer}>
          <TouchableHighlight
            onPress={this._onPlayPausePressed} 
            disabled={this.state.isLoading}
          >
            <Video
              ref={this._mountVideo}
              style={[
                styles.video,
                {
                  opacity: this.state.showVideo ? 1.0 : 0.0,
                  width: this.state.videoWidth,
                  height: this.state.videoHeight
                }
              ]}
              // resizeMode={ResizeMode.STRETCH}
              resizeMode= {"cover"}
              posterResizeMode = {"cover"}
              pictureInPicture= {true}
              onPlaybackStatusUpdate={this._onPlaybackStatusUpdate}
              onLoadStart={this._onLoadStart}
              onLoad={this._onLoad}
              onError={this._onError}
              onReadyForDisplay={this._onReadyForDisplay}
              useNativeControls={this.state.useNativeControls}
              poster="https://arweave.net/LCJquQMG4IsY7UJkY2oBnPrZY4vj-QTF17R8ojTbLKY"
            />
          </TouchableHighlight>
        </View>
      </View>
    );
  }

 }
 
 const styles = StyleSheet.create({
  container: {
    margin: 100,
    padding: 50
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
   videoContainer: {
    flex: 1,
    height: VIDEO_CONTAINER_HEIGHT,
   },
   video: {
    alignSelf: "stretch",
    maxWidth: DEVICE_WIDTH
   },
 });