/* eslint-disable prettier/prettier */
import React from 'react';
import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {ScreenName, LiveScreen, VideoPlayer} from '../Pages';

const Stack = createNativeStackNavigator();

const NavStack = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="ScreenName">
      <Stack.Screen
        name="ScreenName"
        component={ScreenName}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="VideoPlayer"
        component={VideoPlayer}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

const NavigationProvider = () => {
  return <NavStack />;
};

export default NavigationProvider;
