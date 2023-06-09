/* eslint-disable prettier/prettier */
// React Native Video Library to Play Video in Android and IOS
// https://aboutreact.com/react-native-video/

import React, { Component } from 'react';
import { WebView } from 'react-native-webview';

export class LiveScreen extends Component {
  render() {
    return (
      <WebView
        originWhitelist={['*']}
        // source={{ uri: 'https://testing-video-player.vercel.app/playList/63f9240a898af98cb93158c0' }}
        // source={{ uri: 'https://testing-video-player.vercel.app/screen/63f9240a898af98cb93158c0' }}
        source={{ uri: 'https://google.com/' }}
      />
    );
  }
}
