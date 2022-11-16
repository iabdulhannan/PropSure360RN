import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Home from './Home';
import PannellumViewer from './360View/PannellumViewer';
import SceneInformation from "./SceneInformation";

function RootStack(props) {
  const Stack = createStackNavigator();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="PannellumViewer" component={PannellumViewer} options={{
        headerShown: false
      }}/>
      <Stack.Screen name="SceneInformation" component={SceneInformation} options={{
        headerShown: false
      }} />
      {/*<Stack.Screen name="UploadScreen" component={UploadScreen} />*/}
    </Stack.Navigator>
  );
}

export default RootStack;
