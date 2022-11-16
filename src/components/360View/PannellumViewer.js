/* eslint-disable */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
} from "react-native";
import WebView from "react-native-webview";
import { useWebViewMessage } from "react-native-react-bridge";
import Viewer from "./Viewer";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import Feather from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import axios from "axios";

const PannellumViewer = ({ image, navigation, route, showOptions = false }) => {

  const [property, setProperty] = useState(null);
  const [inEditor, setInEditor] = useState(showOptions);
  const [selectImage, setSelectImage] = useState(false);
  const [writeInfo, setWriteInfo] = useState(false);
  const [scenes, setScenes] = useState([]);
  const [enableSaving, setEnableSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [currentSceneDetails, setCurrentSceneDetails] = useState({});
  const [showDetails, setShowDetails] = useState(false);


  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ["20%", "5%", "50%", "90%"], []);

  useEffect(() => {
    if (route) {
      setProperty(route?.params.item);
      //Current scene would always be the first scene
      setCurrentSceneDetails({
        sceneName: route?.params.item.scenes[0].sceneName,
        sceneDetail: route?.params.item.scenes[0].sceneDetail,
      });
      setInEditor(route?.params.showOptions ?? false);
    } else {
      setProperty(image);
    }

    return () => {
      setProperty(null);
    };

  }, []);

  const renderItem = useCallback(({ item }) => {

      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            emit({
              type: "sceneSelected",
              data: item.index,
            });
            setSelectImage(false);
          }}
          style={styles.sceneListItem}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              // marginVertical: 5
            }}>
            <Image
              style={{
                width: 60,
                height: 40,
                borderRadius: 15,
              }}
              source={{ uri: `data:image/png;base64,${item.scenePanoImg}` }}
            />
            <Text
              style={{
                fontSize: 18,
                marginHorizontal: 10,
                color: "#000",
              }}>
              {item.sceneName}
            </Text>
            {/*<Button title={"Edit Name"} onPress={()=>{*/}
            {/*  console.log("Item: ", item.sceneName);*/}
            {/*}}/>*/}
          </View>
        </TouchableOpacity>
      );

    }
    , []);

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

  const { ref, onMessage, emit } = useWebViewMessage(message => {
    // emit sends message to React
    //   type: event name
    //   data: some data which will be serialized by JSON.stringify

    if (message.type === "hello" && message.data === 123) {
      emit({
        type: "success",
        data: "succeeded!",
      });
    }

    if (message.type === "ready" && message.data === "ready") {
      emit({
        type: "openImage",
        data: property,
      });
    }

    if (message.type === "loggingData") {
      console.log(
        "**************************Logging Data**************************",
      );
      console.log("---> ", message.data);
    }

    if (message.type === "selectImageForCustomHotspot") {
      setSelectImage(true);
      setEnableSaving(true);
    }

    if (message.type === "saveProperty") {
      saveProperty(message.data);
    }

    if (message.type === "writeTextForInfoHotspot") {
      setWriteInfo(true);
    }

    if (message.type === "sceneChanged") {
      //Scene is changed, so I need to update details of the current scene


      property.scenes.forEach((scene) => {
        if (scene.id === message.data) {
          setCurrentSceneDetails({
            sceneName: scene.sceneName,
            sceneDetail: scene.sceneDetail,
          });
        }
      });

    }


  });

  function placeHotSpots(type) {
    if (type === "custom") {
      emit({
        type: "selectImagesForPlacingHotspots",
        data: null,
      });
    } else {
      emit({
        type: "enterTextForPlacingHotspots",
        data: null,
      });
    }
  }

  const randomKeyGenerator = () => {
    let res = "";
    for (let i = 0; i < 5; i++) {
      const random = Math.floor(Math.random() * 27);
      res += String.fromCharCode(97 + random);
    }
    return res;
  };

  const uploadProperty = async (pictures, property) => {

    const key = randomKeyGenerator();

    try {

      const formData = new FormData();

      pictures.forEach((picture, index) => {
        let uriParts = picture.uri.split(".");
        let fileType = uriParts[uriParts.length - 1];
        formData.append("photo",
          {
            uri: picture.uri,
            name: `${key}-${picture.name}.${fileType}`,
            type: `image/${fileType}`,
          },
        );
      });

      formData.append("property", JSON.stringify(property));
      formData.append("key", JSON.stringify(key));

      const config = {
        headers: {
          Accept: "multipart/form-data",
          "content-type": "multipart/form-data",
        },
      };
      // const result = await axios.post("http://192.168.18.138:8082/addproperty", formData, config);
      // const result = await axios.post("http://192.168.18.43:8082/addproperty", formData, config);
      const result = await axios.post("http://192.168.18.17:8082/addproperty", formData, config);
      console.log("Result: ", result);
      return result.status;
    } catch (error) {

      console.error("Error while Uploading Image: ", error);
    }
  };

  async function saveProperty(property) {
    // dispatch(addProperty(property));

    const pictures = [];
    //Removing Base64 of Images & also pushing images into separate array
    console.log("Property Before: ", Object.keys(property.scenes[0]));

    property.scenes.forEach((scene, index) => {
      //Pushing picture into array
      const newImage = {
        uri: scene.scenePanoURI,
        name: index,
      };
      pictures.push(newImage);
      //Placing index instead of image for matching at serverside
      scene.scenePanoImg = index;
      delete scene.scenePanoURI;
      delete scene.id;
      if (scene.index)
        delete scene.index;
    });

    const response = await uploadProperty(pictures, property);
    console.log("Saved Successfully");
    setEnableSaving(false);
    navigation.navigate("Home");
  }

  function getLatestProperty() {
    emit({
      type: "getLatestProperty",
      data: null,
    });
  }

  function placeInfoHotspot() {
    emit({
      type: "placeInfoHotspot",
      data: title,
    });
  }

  return (
    <View style={styles.container}>

      <View
        style={{
          alignItems: "center",
          zIndex: 10,
          position: "absolute",
          top: 10,
          width: "100%",
        }}>

        <TouchableOpacity onPress={() => {
          navigation.goBack();
        }} style={styles.backButton}>
          <Feather name="chevron-left" size={32} color="white" />
        </TouchableOpacity>

        {/*Scene Details Box*/}
        <View style={{
          borderRadius: 10,
          padding: 1,
          backgroundColor: "#fff",
          // borderColor: "#000",
          // borderWidth: 1,
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: "column",
          width: "90%",
          elevation: 10,
        }}>


          <View style={{
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
          }}>

            {/*Scene Title*/}
            <View style={{
              width: "85%",
              borderRightWidth: 1,
              borderRightColor: "#000000",
            }}>
              <Text style={{ color: "#000000", fontSize: 20, textAlign: "center" }}>
                {
                  currentSceneDetails?.sceneName
                }

              </Text>
            </View>

            {/*Expand Details Button*/}
            <View style={{
              width: "15%",
              alignItems: "center",
              justifyContent: "center",
              padding: 5,
            }}>

              <TouchableOpacity
                style={{
                  zIndex: 10,
                  borderRadius: 50,
                  padding: 1,
                  // backgroundColor: "#fff",
                  // borderColor: "#000",
                  // borderWidth: 1,
                  width: 30,
                  height: 30,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => {
                  setShowDetails(!showDetails);
                }}>
                <Feather name="info" size={20} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          {
            showDetails &&
            <View style={styles.detailsBox}>
              <Text style={{ color: "#000000", fontSize: 14 }}>
                {
                  currentSceneDetails?.sceneDetail
                }
              </Text>
            </View>
          }

        </View>

        {inEditor && (
          <View style={{
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "flex-end",
            width: "90%",
            marginVertical: 10,
            // borderColor: '#000',
            // borderWidth: 1
          }}>
            <TouchableOpacity
              style={styles.editingButton}
              onPress={() => {
                placeHotSpots("custom");
              }}>
              <Feather name="crosshair" size={40} color="black" />
            </TouchableOpacity>

            {/*
          <TouchableOpacity
            style={{
              zIndex: 10,
              borderRadius: 50,
              position: 'absolute',
              top: 80,
              right: 10,
              padding: 10,
              backgroundColor: '#fff',
              borderColor: '#000',
              borderWidth: 1,
              width: 50,
              height: 50,
              alignItems: 'center'
            }}
            onPress={() => {
              console.log("Placing text")
              placeHotSpots('text')
            }}
          >
            <Text style={{fontSize: 20}}>TX</Text>
          </TouchableOpacity>
*/}

            {enableSaving && (
              <TouchableOpacity
                style={styles.editingButton}
                onPress={() => {
                  getLatestProperty();
                }}>
                <MaterialIcons name="save-alt" size={35} color="black" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      <View
        style={{
          // borderWidth: 2,
          // borderColor: 'blue',
          height: Dimensions.get("window").height,
          width: Dimensions.get("window").width,
          position: "absolute",
        }}>
        <WebView
          // ref, source and onMessage must be passed to react-native-webview
          ref={ref}
          // Pass the source code of React app
          source={{ html: Viewer }}
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
            backgroundColor: "#fff",
          }}
          // onChange={handleSheetChange}
        >
          <FlatList
            ListFooterComponent={() => {
              return (
                <View style={{ marginVertical: 10 }}>
                  <Text style={{ fontSize: 15, textAlign: "center" }}>
                    No More Scenes
                  </Text>
                </View>
              );
            }}
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
            backgroundColor: "#fff",
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
              placeholder={"Information"}
              value={title}
              onChangeText={setTitle}
            />

            <View
              style={{
                alignItems: "center",
              }}>
              <TouchableOpacity
                style={{
                  paddingVertical: 5,
                  paddingHorizontal: 15,
                  marginVertical: 5,
                  marginHorizontal: 5,
                  borderColor: "#000",
                  borderWidth: 1,
                  borderRadius: 10,
                  backgroundColor: "lightblue",
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
    borderColor: "lightgrey",
    borderWidth: 1,
    backgroundColor: "#fff",
    borderRadius: 15,
    elevation: 5,
    marginVertical: 5,
    marginHorizontal: 10,
    padding: 5,
  },
  editingButton: {
    borderRadius: 50,
    padding: 1,
    backgroundColor: "#fff",
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 2,
  },
  detailsBox: {
    padding: 10,
    // borderColor: "#000000",
    // borderWidth: 1,
    width: "100%",
  },
  backButton: {
    // borderRadius: 50,
    // borderColor: '#ffffff',
    // borderWidth: 1,
    alignSelf: "flex-start",
    marginHorizontal: 10,
    marginBottom: 10,
  },
});
