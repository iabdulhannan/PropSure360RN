import {createSlice} from '@reduxjs/toolkit';

console.log('Using Property Slice');

const initialState = {
  // title: 'Title in Store',
  // scenes: [
  //   {
  //     sceneName: 'Scene in Store',
  //     scenePanoImg: 'Scene Image in Store',
  //     hotSpotsArr: []
  //   }
  // ]
  properties: [],
};

export const propertySlice = createSlice({
  name: 'propertySlice',
  initialState,
  reducers: {
    addProperty: (state, action) => {
      // console.log("In Store: ", action.payload)
      state.properties = [...state.properties, action.payload];
    },
    removeAllProperties: (state, action) => {
      state.properties = [];
    },
  },
});

// Action creators are generated for each case reducer function
export const {addProperty, removeAllProperties} = propertySlice.actions;

export default propertySlice.reducer;
