import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import ListItem from "./ListItem";
import { windowWidth } from "../Utils/Constants";
import { useDispatch, useSelector } from "react-redux";
import NoDataImage from "../../assets/2953962.jpg";
import PaperCutLine from "../../assets/paperCutLine.png";
import { removeAllProperties } from "../slices/PropertySlice";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { launchImageLibrary } from "react-native-image-picker";
import { Image as IMRNC } from "react-native-compressor";
import axios from "axios";
import { Buffer } from "@craftzdog/react-native-buffer";

function Home(props) {

  const BASE_URL = "http://192.168.18.17:8082";
  // const BASE_URL = "http://192.168.18.138:8082";
  // const BASE_URL = "http://192.168.18.43:8082";
  const [title, setTitle] = useState("Floor Title");
  const [scenes, setScenes] = useState([]);
  const [newProperty, setNewProperty] = useState(null);
  // const properties = useSelector(state => state.property.properties);
  const [properties, setProperties] = useState([]);
  const [compressing, setCompressing] = useState(false);
  const [compressingNumber, setCompressingNumber] = useState("");

  const MAX_IMAGE_SIZE_IN_KBS = 2000;

  // const window = useWindowDimensions();
  // const [image, setImage] = useState(null);

  const getProperties = async () => {
    const response = await axios
      .get(`${BASE_URL}/properties`);
    return response;
  };

  const getImage = async url => {
    const response = await axios
      .get(url, {
        responseType: "arraybuffer",
      })
      .then(async response => new Buffer.from(response.data, "binary").toString("base64"));

    // return await compressImage(response, false, true);
    return response;
  };

  const compressImage = async (image, autoCompression = false, base64output = false, compressSize = false) => {

    const resultant = await IMRNC.compress(image, {
      compressionMethod: autoCompression ? "auto" : "manual",
      maxWidth: 4096,
      quality: compressSize ? 0.8 : 1,
      returnableOutputType: base64output ? "base64" : "uri",
      input: "base64",
    })
      .then(res => {
        // console.log("Response of Compression: ", res);
        if (compressSize) {
          console.log("Image Size after Compression for Size: ", getImageSize(res));
        } else {
          console.log("Image Size after Compression for width.");
        }
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
      let propertiesRcvd = r.data;

      // Converting Images fetched from Server to Base64 equivalents
      for (const property of propertiesRcvd) {
        for (const scene of property.scenes) {
          if (scene.scenePanoImg) {
            getImage(`${BASE_URL}\\${scene.scenePanoImg}`)
              .then(res => {
                scene.scenePanoImg = res;
                return res;
              });
          }
        }
      }

      setProperties(propertiesRcvd);
    });
  }


  /*Fetching Properties on first load*/
  useEffect(() => {
    updateProperties();
  }, []);

  /*Creating new property*/
  useEffect(() => {

    if (scenes?.length) {

      setNewProperty({
        title: title,
        scenes: [...scenes],
      });

      setCompressing(false);
    }


  }, [scenes]);

  /*After new property is created, move to next screen*/
  useEffect(() => {
    if (newProperty?.scenes.length) {
      console.log("Number of Scenes in New Property: ", newProperty?.scenes.length);
      props.navigation.navigate("SceneInformation", {
        item: newProperty,
      });
    }

    return () => {
      setNewProperty(null);
      setScenes(null);
    };

  }, [newProperty]);

  const dispatch = useDispatch();

/*  useFocusEffect(() => {
    console.log("Properties in Store: ", properties.length);
  });*/

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
      setCompressing(true);

      let newScenes = [];
      let imgNumber = 1;
      let sceneIndex = 0;
      for (const item of result.assets) {
        setCompressingNumber(`[${imgNumber}/${result.assets.length}]`);

        let resultant = {};
        let image = item;


        /*No need to loop for image width compression*/
        if (image.width > 4096) {
          resultant.uri = await compressImage(image.uri, true, false);
          resultant.base64 = await compressImage(image.uri, true, true);
          image.uri = resultant.uri;
          image.base64 = resultant.base64;
        }

        while (getImageSize(image.base64) > MAX_IMAGE_SIZE_IN_KBS) {
          console.log("--------Compressing for Size--------- ");
          resultant.uri = await compressImage(image.uri, true, false, true);
          resultant.base64 = await compressImage(image.uri, true, true, true);
          image.uri = resultant.uri;
          image.base64 = resultant.base64;
        }

        // console.log("resultant.uri: ", resultant.uri);
        // console.log("item.uri: ", item.uri);

        var newScene = {
          id: sceneIndex,
          sceneName: "Name of Scene",
          sceneDetail: "Detail of Scene",
          scenePanoURI: resultant.uri ?? item.uri,
          scenePanoImg: resultant.base64 ?? item.base64,
          hotSpotsArr: [],
        };
        newScenes.push(newScene);
        imgNumber++;
        sceneIndex++;
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
          <ListItem item={item} navigation={props.navigation} setCompressing={setCompressing}/>
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



      {/*{newProperty?.scenes.length > 0 &&*/}
      {/*  props.navigation.navigate("PannellumViewer", {*/}
      {/*    item: newProperty,*/}
      {/*    showOptions: true,*/}
      {/*  })*/}
      {/*}*/}


      {/*Spinner*/}
      {
        compressing &&
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#71a3f5" />
          <Text style={{ color: "#000000" }}>Getting things ready {compressingNumber}</Text>
        </View>
      }


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

  loadingBox: {
    // borderColor: "#000000",
    // borderWidth: 1,
    height: 130,
    width: 300,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    elevation: 5,
    backgroundColor: "#ffffff",
    position: "absolute",
  },
});
