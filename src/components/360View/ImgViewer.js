// WebApp.js
//Entry file
import React, {useEffect, useState} from "react";
import {
  webViewRender,
  emit,
  useNativeMessage,
} from "react-native-react-bridge/lib/web";
// Importing css is supported
// import "./example.css";
// Images are loaded as base64 encoded string
// import image from "./real-time-render.jpg";

// import img from './encoded-20221007101014.txt'

const ImgViewer = () => {

  const [data, setData] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {

    emit({
      type: "ready",
      data: "ready"
    });

  }, []);



  // useNativeMessage hook receives message from React Native
  useNativeMessage((message) => {

    if (message.type === "success") {
      setData(message.data);
    }

    else if (message.type === "openImage") {
      // setData(message.data);
      logData("Image to Open: " + message.data)
      setImage(message.data)
    }

  });

  const logData = (elements) => {
    // window.ReactNativeWebView.postMessage(
    //   JSON.stringify({type: "loggingData", data: elements})
    // );
    emit({
      type: "loggingData",
      data: elements
    });
  }


  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: "center"

    }}>

      {/*<img src={image} width={200} height={200}/>*/}
      <img src={`data:image/jpeg;base64,${image}`} width={200} height={200}/>


      <div>{data}</div>

      {/*<button
        onClick={() => {
          // emit sends message to React Native
          //   type: event name
          //   data: some data which will be serialized by JSON.stringify
          emit({
            type: "hello",
            data: 123
          });
        }}
      />*/}

    </div>
  );
};

// This statement is detected by babelTransformer as an entry point
// All dependencies are resolved, compressed and stringified into one file
export default webViewRender(<ImgViewer/>);