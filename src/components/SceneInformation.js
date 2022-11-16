import React, { useEffect, useRef, useState } from "react";
import { FlatList, Text, View, StyleSheet, Image, TextInput, TouchableOpacity, Dimensions } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import PaperCutLine from "../../assets/paperCutLine.png";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";

function SceneInformation({ route, navigation }) {

  const [property, setProperty] = useState(route?.params.item);

  /*
  editorCount would increase when a scene is being edited,
  and would decrement when scene is edited
  State editing would only be turned false when editing count is ZERO
  */
  const [editorCount, setEditorCount] = useState(0);


  const proceed = () => {

    console.log("Proceeding");
    navigation.navigate("PannellumViewer", {
      item: property,
      showOptions: true,
    });
  };

  return (
    property.scenes.length && (
      <View style={styles.container}>

        <View style={styles.header}>

          <TouchableOpacity onPress={() => {
            navigation.goBack();
          }} style={styles.backButton}>
            <Feather name="chevron-left" size={32} color="#000000" />
          </TouchableOpacity>

          <Text style={{
            color: "#000000",
            fontSize: 25,
            fontWeight: "semibold",
            textAlign: "center",
            width: "80%",
          }}>
            Details
          </Text>

        </View>

        <FlatList
          data={property?.scenes}

          renderItem={({ item }) => (
            <SceneItem scene={item} setEditorCount={setEditorCount} />
          )}

          keyExtractor={item => item.id}
          ListFooterComponent={() => {
            if (property.scenes.length) {
              return (
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
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
                      marginBottom: 20,
                    }}>
                    That's All
                  </Text>
                </View>
              );
            } else {
              return null;
            }
          }}
        />

        <TouchableOpacity style={[styles.proceedBtn, { backgroundColor: editorCount !== 0 ? "gray" : "#71a3f5" }]}
                          onPress={proceed} disabled={editorCount !== 0}>
          <Text style={{ color: "#ffffff", fontSize: 20, textAlign: "center", marginHorizontal: 15 }}>Proceed</Text>
          <Feather name="chevron-right" size={22} color="#ffffff" />
        </TouchableOpacity>

      </View>
    )
  );


}

const SceneItem = ({ scene, setEditorCount }) => {

  const [sceneName, setSceneName] = useState(scene?.sceneName);
  const [sceneDetail, setSceneDetail] = useState(scene?.sceneDetail);
  const [inEditingMode, setInEditingMode] = useState(false);

  useEffect(() => {
    if (!sceneName) {
      setSceneName("Name of Scene");
    } else {
      scene.sceneName = sceneName;
    }
  }, [sceneName]);

  useEffect(() => {
    if (!sceneName) {
      setSceneDetail("Detail of Scene");
    } else {
      scene.sceneDetail = sceneDetail;
    }
  }, [sceneDetail]);


  return (
    <View style={styles.item}>
      <Image
        style={{
          width: "100%",
          height: 100,
          borderRadius: 15,
        }}
        source={{ uri: `data:image/png;base64,${scene?.scenePanoImg}` }}
      />

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>

        <View style={[styles.detailBox, { width: inEditingMode ? "100%" : "80%" }]}>
          <View style={{ flexDirection: "column" }}>

            <Text style={[styles.title, { fontWeight: "bold" }]}>Name: </Text>
            {
              !inEditingMode ?
                <Text style={styles.title}>{sceneName}</Text>
                :
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.input}
                    onChangeText={setSceneName}
                    value={sceneName}
                    placeholder={scene?.sceneName}
                    selectTextOnFocus
                  />
                </View>
            }

          </View>
          <View style={{ flexDirection: "column" }}>

            <Text style={[styles.title, { fontWeight: "bold" }]}>Detail: </Text>
            {
              !inEditingMode ?
                <Text style={styles.title}>{sceneDetail}</Text>
                :
                <View style={styles.inputBox}>
                  <TextInput
                    style={[styles.input, { height: 80 }]}
                    onChangeText={setSceneDetail}
                    value={sceneDetail}
                    placeholder={scene?.sceneName}
                    multiline
                    selectTextOnFocus
                  />
                </View>
            }
          </View>

          {
            inEditingMode &&
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginTop: 15 }}>
              <Pressable hitSlop={20} onPress={() => {
                setEditorCount(prev => prev - 1);
                setInEditingMode(false);
              }}>
                <Text style={{ color: "grey" }}>
                  Done
                </Text>
              </Pressable>
            </View>
          }
        </View>

        {
          !inEditingMode &&
          <View style={styles.editIconBox}>
            <Pressable hitSlop={20} onPress={() => {
              setEditorCount(prev => prev + 1);
              setInEditingMode(true);
            }} >
              <Feather name="edit" size={20} color="black"/>
            </Pressable>
          </View>
        }

      </View>

    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: "#ffffff",
    elevation: 10,
    borderRadius: 15,
  },
  title: {
    fontSize: 16,
    color: "#000000",
    // width: '80%',

  },
  detailBox: {
    padding: 10,
  },
  input: {
    color: "#000000",
    paddingVertical: 2,
    width: "100%",
  },
  inputBox: {
    borderRadius: 8,
    color: "#000000",
    elevation: 5,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    marginTop: 3,
    marginBottom: 6,
  },

  editIconBox: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderLeftColor: "lightgrey",
    borderLeftWidth: 1,
    height: "80%",
    width: "20%",
    paddingLeft: 20,
  },
  proceedBtn: {
    padding: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    width: "10%",
  },
  header: {
    padding: 10,
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    elevation: 5,
  },

});

export default SceneInformation;
