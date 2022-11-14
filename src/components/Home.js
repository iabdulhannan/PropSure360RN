import React, { useEffect, useState } from "react";
import {
  Button,
  Dimensions,
  FlatList,
  PixelRatio,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ListItem from "./ListItem";
import { useFocusEffect } from "@react-navigation/native";
import { windowWidth } from "../Utils/Constants";
import { useDispatch, useSelector } from "react-redux";
import NoDataImage from "../../assets/2953962.jpg";
import PaperCutLine from "../../assets/paperCutLine.png";
import { removeAllProperties } from "../slices/PropertySlice";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { launchImageLibrary } from "react-native-image-picker";
import { Image as IMRNC } from "react-native-compressor";
import ImgToBase64 from "react-native-image-base64";
import axios from "axios";
import { Buffer } from "@craftzdog/react-native-buffer";

function Home(props) {

  const BASE_URL = "http://192.168.18.17:8082";
  const [title, setTitle] = useState("Floor Title");
  const [scenes, setScenes] = useState([]);
  const [newProperty, setNewProperty] = useState(null);
  // const properties = useSelector(state => state.property.properties);
  const [properties, setProperties] = useState([]);


  const MAX_IMAGE_SIZE_IN_KBS = 2000;

  const window = useWindowDimensions();

  const [image, setImage] = useState(null);

  const getProperties = async () => {
    const response = await axios
      // .get("http://192.168.18.138:8082/properties");
      .get("http://192.168.18.17:8082/properties");
    return response;
  };

  const getImage = async url => {
    const response = await axios
      .get(url, {
        responseType: "arraybuffer",
      })
      .then(async response => new Buffer.from(response.data, "binary").toString("base64"));

    return await compressImage(response, false, true);
  };

  const compressImage = async (image, autoCompression = false, base64output = false) => {
    const resultant = await IMRNC.compress(image, {
      compressionMethod: autoCompression ? "auto" : "manual",
      maxWidth: 4096,
      quality: 1,
      returnableOutputType: base64output ? "base64" : "uri",
      input: "base64",
    })
      .then(res => {
        // console.log("Response of Compression: ", res);
        console.log("Image Size after Compression: ", getImageSize(res));
        return res;
      })
      .catch(err => {
        console.log("Error While Compression: ", err);
        return err;
      });

    return resultant;
  };


  function updateProperties() {
    getProperties().then(r => {
      console.log("Response: ", r);
      // console.log('Scene in response: ', r.data[0].scenes);

      let propertiesRcvd = r.data;

      // Converting Images fetched from Server to Base64 equivalents
      for (const property of propertiesRcvd) {
        for (const scene of property.scenes) {
          if (scene.scenePanoImg) {
            getImage(`${BASE_URL}\\${scene.scenePanoImg}`).then(res => {
              scene.scenePanoImg = res;
              return res;
            });
          }
        }
      }
      setProperties(propertiesRcvd);
    });
  }

  useEffect(() => {

    updateProperties();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setNewProperty({
      title: title,
      scenes: [...scenes],
    });

    if (scenes.length)
      console.log("New Scenes: ", Object.keys(scenes[0]));
    // eslint-disable-next-line
  }, [scenes]);

  const dispatch = useDispatch();

  useFocusEffect(() => {
    console.log("Properties in Store: ", properties.length);

    return () => {
      setNewProperty(null);
    };
  });

  const getImageSize = (imageBase64) => {

    var stringLength = imageBase64.length;
    // var sizeInBytes = 4 * Math.ceil((stringLength / 3))*0.5624896334383812;
    var sizeInBytes = 3 * Math.ceil((stringLength / 4));
    var sizeInKb = sizeInBytes / 1000;
    return sizeInKb;
  };

  async function pickImage() {
    setNewProperty(null);
    setScenes([]);

    const result = await launchImageLibrary({
      mediaType: "photo",
      quality: 1,
      selectionLimit: 20,
      // maxWidth: 4096,
      // maxHeight: 4096,
      includeBase64: true,
    })
      .then(res => {
        return res;
      })
      .catch(err => {
        console.log("Error Occurred: ", err);
        return err;
      });

    if (!result.didCancel) {
      let newScenes = [];
      for (const item of result.assets) {
        let resultant = {};

        if (item.width > 4096 || getImageSize(item.base64) > MAX_IMAGE_SIZE_IN_KBS) {
          resultant.base64 = await compressImage(item.uri, true, true);
          resultant.uri = await compressImage(item.uri, true, false);
          while (getImageSize(resultant) > MAX_IMAGE_SIZE_IN_KBS) {
            resultant = await compressImage(item.uri, true, true);
            console.log("Compressing because of size");
          }

          /*resultant = await IMRNC.compress(item.uri, {
            compressionMethod: "auto",
            maxWidth: 4096,
            quality: 0.8,
            returnableOutputType: "base64",
            // returnableOutputType: 'uri',
          })
            .then(res => {
              // console.log('Response of Compression: ', res);
              // setImage(res);
              // console.log("Image Size: ", getImageSize(resultant));
              console.log("Image Size: ", getImageSize(res));
              return res;
            })
            .catch(err => {
              console.log("Error While Compression: ", err);
              return err;
            });*/
        }

        console.log("resultant.uri: ", resultant.uri);
        console.log("item.uri: ", item.uri);

        var newScene = {
          sceneName: "Name of Scene",
          scenePanoURI: resultant.uri ?? item.uri,
          // scenePanoImg: item.base64 ?? item.uri,
          scenePanoImg: resultant.base64 ?? item.base64,
          hotSpotsArr: [],
        };
        newScenes.push(newScene);
      }

      // setImage(result.assets[0].uri);
      setScenes(oldScenes => [...oldScenes, ...newScenes]);
    }
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          height: 60,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          elevation: 5,
          width: Dimensions.get("window").width,
        }}>
        <Text
          style={{
            fontSize: 25,
            color: "#71a3f5",
            fontWeight: "bold",
          }}>
          PropSure 360
        </Text>
      </View>

      <FlatList
        style={{
          width: windowWidth,
          // borderColor: '#000',
          // borderWidth: 1
        }}
        data={properties}
        renderItem={({ item }) => (
          <ListItem item={item} navigation={props.navigation} />
        )}

        ListEmptyComponent={() => {
          return (
            <View
              style={{
                // borderColor: '#000',
                // borderWidth: 2,
                height: Dimensions.get("window").height - 20,
                justifyContent: "center",
                alignItems: "center",
              }}>
              <Image
                source={NoDataImage}
                style={{
                  width: 350,
                  height: 300,
                }}
              />

              {/*{image && (*/}
              {/*  <Image*/}
              {/*    source={{uri: image}}*/}
              {/*    style={{*/}
              {/*      width: 350,*/}
              {/*      height: 300,*/}
              {/*    }}*/}
              {/*  />*/}
              {/*)}*/}

              <Text
                style={{
                  color: "gray",
                  fontSize: 18,
                }}>
                No floor plans to show
              </Text>
            </View>
          );
        }}
        ListFooterComponent={() => {
          if (properties.length) {
            return (
              <View
                style={{
                  // borderColor: '#000',
                  // borderWidth: 2,
                  // height: Dimensions.get('window').height - 20,
                  justifyContent: "center",
                  alignItems: "center",
                  // marginTop: 20
                }}>
                <Image
                  source={PaperCutLine}
                  style={{
                    width: Dimensions.get("window").width - 100,
                    height: 1,
                    marginVertical: 10,
                  }}
                />

                <Text
                  style={{
                    color: "gray",
                    fontSize: 18,
                  }}>
                  That's All
                </Text>
              </View>
            );
          } else {
            return null;
          }
        }}
        onRefresh={() => updateProperties()}
        refreshing={false}
      />

      <TouchableOpacity
        style={{
          borderRadius: 30,
          borderWidth: 1,
          borderColor: "#71a3f5",
          position: "absolute",
          bottom: 80,
          right: 20,
          padding: 1,
        }}
        onPress={() => pickImage()}>
        <View
          style={{
            borderRadius: 30,
            backgroundColor: "#71a3f5",
            padding: 5,
          }}>
          <AntDesign name={"plus"} size={40} color={"#ffffff"} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          borderRadius: 30,
          borderWidth: 1,
          borderColor: "#c3011f",
          position: "absolute",
          bottom: 20,
          right: 20,
          padding: 1,
        }}
        onPress={() => {
          dispatch(removeAllProperties());
        }}>
        <View
          style={{
            borderRadius: 30,
            borderWidth: 1,
            borderColor: "#c3011f",
            backgroundColor: "#c3011f",
            padding: 5,
          }}>
          <MaterialCommunityIcons
            name="delete-outline"
            size={40}
            color="#fff"
          />
        </View>
      </TouchableOpacity>

      {newProperty?.scenes.length > 0 &&
        props.navigation.navigate("PannellumViewer", {
          item: newProperty,
          showOptions: true,
        })}
    </View>
  );
}

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  border: {
    borderColor: "#000000",
    borderWidth: 1,
  },
});
