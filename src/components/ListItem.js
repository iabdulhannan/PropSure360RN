import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image as IMRNC } from "react-native-compressor";

const ListItem = ({ item, navigation, setCompressing }) => {

  const compressImage = async (image, autoCompression = false, base64output = false) => {

    const resultant = await IMRNC.compress(image, {
      compressionMethod: autoCompression ? "auto" : "manual",
      maxWidth: 4096,
      quality: 1,
      returnableOutputType: base64output ? "base64" : "uri",
      input: "base64",
    })
      .then(res => {
        console.log("Image Size after Compression for width.");
        return res;
      })
      .catch(err => {
        console.log("Error While Compression: ", err);
        return err;
      });

    return resultant;
  };


  const viewProperty = async () => {

    setCompressing(true)
    for (const scene of item.scenes) {
      if (scene.scenePanoImg) {
        scene.scenePanoImg = await compressImage(scene.scenePanoImg, false, true);
      }
    }
    setCompressing(false)
    navigation.navigate("PannellumViewer", { item: { ...item } });
  };


  return (
    <TouchableOpacity
      style={styles.itemContainer}

      onPress={() => {
        viewProperty();
      }}

      activeOpacity={0.8}>
      <Text style={{ color: "#000" }}>{item.title}</Text>
    </TouchableOpacity>
  );
};

export default ListItem;

const styles = StyleSheet.create({
  itemContainer: {
    padding: 20,
    borderRadius: 25,
    backgroundColor: "#fff",
    marginHorizontal: 8,
    marginVertical: 6,
    elevation: 5,
  },
});
