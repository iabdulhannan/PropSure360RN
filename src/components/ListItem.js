import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

const ListItem = ({item, navigation}) => {
  // const [state, setState] = useState(item);

  console.log("In List: ", item.title);
  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        navigation.navigate('PannellumViewer', {item: {...item}});
        // navigation.navigate('PannellumViewer', {item: Object.assign({}, item)})
      }}
      activeOpacity={0.8}>
      <Text style={{color: '#000'}}>{item.title}</Text>
    </TouchableOpacity>
  );
};

export default ListItem;

const styles = StyleSheet.create({
  itemContainer: {
    padding: 20,
    borderRadius: 25,
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginVertical: 6,

    elevation: 5,
  },
});
