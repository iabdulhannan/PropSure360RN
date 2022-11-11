import React from 'react';
import type {Node} from 'react';
import {SafeAreaView, StyleSheet, useWindowDimensions} from 'react-native';

import {Provider} from 'react-redux';
import {persistor, store} from './store';
import {PersistGate} from 'redux-persist/integration/react';
import {NavigationContainer} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import RootStack from './src/components/RootStack';

const App: () => Node = () => {
  const {height, width} = useWindowDimensions();

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <NavigationContainer>
          <SafeAreaView style={styles.container}>
            <GestureHandlerRootView style={{height, width, flex: 1}}>
              <RootStack />
            </GestureHandlerRootView>
          </SafeAreaView>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#000',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});

export default App;
