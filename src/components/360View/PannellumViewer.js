/* eslint-disable */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Button,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import WebView from 'react-native-webview';
import {useWebViewMessage} from 'react-native-react-bridge';
import Viewer from './Viewer';
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {useDispatch} from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { addProperty } from "../../slices/PropertySlice";

const PannellumViewer = ({image, navigation, route, showOptions = false}) => {
  const [property, setProperty] = useState(null);
  const [inEditor, setInEditor] = useState(showOptions);
  const [selectImage, setSelectImage] = useState(false);
  const [writeInfo, setWriteInfo] = useState(false);
  const [scenes, setScenes] = useState([]);
  const [enableSaving, setEnableSaving] = useState(false);
  const [title, setTitle] = useState('');

  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ['20%', '5%', '50%', '90%'], []);
  const dispatch = useDispatch();

  useEffect(() => {
    // ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
    if (route) {
      // property = route?.params.item
      setProperty(route?.params.item);
      setInEditor(route?.params.showOptions ?? false);
    } else {
      // property = image
      setProperty(image);
    }

    return () => {
      // ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      setProperty(null);
      // property = null
    };
    // eslint-disable-next-line
  }, []);

  const renderItem = useCallback(
    ({item}) => (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          console.log('Index: ', item.index);
          emit({
            type: 'sceneSelected',
            data: item.index,
          });
          setSelectImage(false);
        }}
        style={styles.sceneListItem}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            // marginVertical: 5
          }}>
          <Image
            style={{
              width: 60,
              height: 40,
              borderRadius: 15,
            }}
            source={{uri: `data:image/png;base64,${item.scenePanoImg}`}}
          />
          <Text
            style={{
              fontSize: 18,
              marginHorizontal: 10,
              color: '#000'
            }}>
            {item.sceneName}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    // eslint-disable-next-line
    [],
  );

  useEffect(() => {
    if (property && inEditor) {
      let index = 0;
      setScenes(
        property.scenes.map(scene => {
          scene.index = index++;
          // console.log(scene)
          return scene;
        }),
      );
    }
  }, [property]);

  // useWebViewMessage hook create props for WebView and handle communication
  // The argument is callback to receive message from React

  const {ref, onMessage, emit} = useWebViewMessage(message => {
    // emit sends message to React
    //   type: event name
    //   data: some data which will be serialized by JSON.stringify

    if (message.type === 'hello' && message.data === 123) {
      emit({
        type: 'success',
        data: 'succeeded!',
      });
    }

    if (message.type === 'ready' && message.data === 'ready') {
      emit({
        type: 'openImage',
        data: property,
      });
    }

    if (message.type === 'loggingData') {
      console.log(
        '**************************Logging Data**************************',
      );
      console.log('---> ', message.data);
    }

    if (message.type === 'selectImageForCustomHotspot') {
      setSelectImage(true);
      setEnableSaving(true);
    }

    if (message.type === 'saveProperty') {
      saveProperty(message.data);
    }

    if (message.type === 'writeTextForInfoHotspot') {
      setWriteInfo(true);
    }
  });

  function placeHotSpots(type) {
    if (type === 'custom') {
      emit({
        type: 'selectImagesForPlacingHotspots',
        data: null,
      });
    } else {
      emit({
        type: 'enterTextForPlacingHotspots',
        data: null,
      });
    }
  }


  function sendPropertyToServer(property) {

  }


  function saveProperty(property) {
    console.log('Property To be Saved');
    console.log('Scenes: ', property.scenes.length);
    dispatch(addProperty(property));
    // dispatch(addProperty({title: 'hello'}))
    setEnableSaving(false);
    navigation.navigate('Home');
  }

  function getLatestProperty() {
    emit({
      type: 'getLatestProperty',
      data: null,
    });
  }

  function placeInfoHotspot() {
    emit({
      type: 'placeInfoHotspot',
      data: title,
    });
  }

  return (
    <View style={styles.container}>
      {inEditor && (
        <>
          <TouchableOpacity
            style={{
              zIndex: 10,
              borderRadius: 50,
              position: 'absolute',
              top: 20,
              right: 10,
              padding: 1,
              backgroundColor: '#fff',
              // borderColor: '#000',
              // borderWidth: 1,
              width: 50,
              height: 50,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => {
              placeHotSpots('custom');
            }}>
            {/*<Text style={{fontSize: 20}}>PH</Text>*/}
            <Feather name="crosshair" size={40} color="black" />
          </TouchableOpacity>

          {/*<TouchableOpacity*/}
          {/*  style={{*/}
          {/*    zIndex: 10,*/}
          {/*    borderRadius: 50,*/}
          {/*    position: 'absolute',*/}
          {/*    top: 80,*/}
          {/*    right: 10,*/}
          {/*    padding: 10,*/}
          {/*    backgroundColor: '#fff',*/}
          {/*    borderColor: '#000',*/}
          {/*    borderWidth: 1,*/}
          {/*    width: 50,*/}
          {/*    height: 50,*/}
          {/*    alignItems: 'center'*/}
          {/*  }}*/}
          {/*  onPress={() => {*/}
          {/*    console.log("Placing text")*/}
          {/*    placeHotSpots('text')*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <Text style={{fontSize: 20}}>TX</Text>*/}
          {/*</TouchableOpacity>*/}

          {enableSaving && (
            <TouchableOpacity
              style={{
                zIndex: 10,
                borderRadius: 50,
                position: 'absolute',
                // top: 140,
                top: 80,
                right: 10,
                padding: 1,
                backgroundColor: '#fff',
                // borderColor: '#000',
                // borderWidth: 1,
                width: 50,
                height: 50,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                getLatestProperty();
              }}>
              {/*<Text style={{fontSize: 20}}>Save</Text>*/}
              <MaterialIcons name="save-alt" size={35} color="black" />
            </TouchableOpacity>
          )}
        </>
      )}

      <View
        style={{
          // borderWidth: 2,
          // borderColor: 'blue',
          height: Dimensions.get('window').height,
          width: Dimensions.get('window').width,
          position: 'absolute',
        }}>
        <WebView
          // ref, source and onMessage must be passed to react-native-webview
          ref={ref}
          // Pass the source code of React app
          source={{html: Viewer}}
          onMessage={onMessage}
        />
      </View>

      {selectImage && (
        <BottomSheet
          style={{
            zIndex: 10,
            flex: 1,
            borderRadius: 15,
          }}
          ref={sheetRef}
          snapPoints={snapPoints}
          backgroundStyle={{
            backgroundColor: '#fff',
          }}
          // onChange={handleSheetChange}
        >
          <FlatList
            ListFooterComponent={() => {
              return (
                <View style={{marginVertical: 10}}>
                  <Text style={{fontSize: 15, textAlign: 'center'}}>
                    No More Scenes
                  </Text>
                </View>
              );
            }}
            // data={property.scenes}
            data={scenes}
            keyExtractor={item => {
              // return index.current++
              return item.index;
            }}
            renderItem={renderItem}
          />
        </BottomSheet>
      )}

      {writeInfo && (
        <BottomSheet
          style={{
            zIndex: 10,
            flex: 1,
            borderRadius: 15,
          }}
          ref={sheetRef}
          snapPoints={snapPoints}
          backgroundStyle={{
            backgroundColor: '#fff',
          }}
          // onChange={handleSheetChange}
        >
          <BottomSheetScrollView>
            <TextInput
              style={{
                paddingVertical: 5,
                paddingHorizontal: 15,
                marginVertical: 5,
                marginHorizontal: 10,
                // borderColor: '#000',
                // borderWidth: 1,
                borderRadius: 10,
              }}
              placeholder={'Information'}
              value={title}
              onChangeText={setTitle}
            />

            <View
              style={{
                alignItems: 'center',
              }}>
              <TouchableOpacity
                style={{
                  paddingVertical: 5,
                  paddingHorizontal: 15,
                  marginVertical: 5,
                  marginHorizontal: 5,
                  borderColor: '#000',
                  borderWidth: 1,
                  borderRadius: 10,
                  backgroundColor: 'lightblue',
                }}
                onPress={() => {
                  setWriteInfo(false);
                  placeInfoHotspot();
                }}>
                <Text>Add Hotspot</Text>
              </TouchableOpacity>
            </View>
          </BottomSheetScrollView>
        </BottomSheet>
      )}
    </View>
  );
};

export default PannellumViewer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#000000',
    // width: Dimensions.get('screen').width * 2,
    // borderColor: 'green',
    // borderWidth: 10
  },
  sceneListItem: {
    borderColor: 'lightgrey',
    borderWidth: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 5,
    marginVertical: 5,
    marginHorizontal: 10,
    padding: 5,
  },
});
