import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Home from './Home';
import PannellumViewer from './360View/PannellumViewer';

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
      <Stack.Screen name="PannellumViewer" component={PannellumViewer} />
      {/*<Stack.Screen name="UploadScreen" component={UploadScreen} />*/}
    </Stack.Navigator>
  );
}

export default RootStack;
