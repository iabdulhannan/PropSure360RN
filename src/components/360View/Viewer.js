import React, {useState, useRef, useEffect} from 'react';
import {
  emit,
  useNativeMessage,
  webViewRender,
} from 'react-native-react-bridge/lib/web';
import Pannellum from 'pannellum-react/lib/elements/Pannellum';
import './style.css';

function Viewer() {
  const [scene, setScene] = useState(null);

  const sceneIndex = useRef(0);

  const [image, setImage] = useState(null);
  const [property, setProperty] = useState(null);

  let addingHotspot = useRef(false);
  let addingInfo = useRef(false);

  const [selectImage, setSelectImage] = useState(false);
  const [writeInfo, setWriteInfo] = useState(false);

  const panImage = useRef(null);
  const hotSpot = useRef();

  useEffect(() => {
    emit({
      type: 'ready',
      data: 'ready',
    });
  }, []);

  useEffect(() => {
    if (property) {
      setScene(property.scenes[sceneIndex.current]);
    }
  }, [property]);

  useEffect(() => {
    if (selectImage) {
      //Opening bottom sheet
      emit({
        type: 'selectImageForCustomHotspot',
        data: null,
      });
    }
  }, [selectImage]);

  useEffect(() => {
    if (writeInfo) {
      //Opening bottom sheet
      emit({
        type: 'writeTextForInfoHotspot',
        data: null,
      });
    }
  }, [writeInfo]);

  const addCustomHotspot = selectedSceneIndex => {
    // hotSpot.current.transition = event.target.id;

    //Provide the index of desired scene here
    // hotSpot.current.transition = sceneIndex.current == 0 ? 1 : sceneIndex.current == 1 ? 2 : 0;
    hotSpot.current.transition = selectedSceneIndex;
    logData(
      'property.scenes[sceneIndex].hotSpotsArr: ' +
        JSON.stringify(property.scenes[sceneIndex.current].hotSpotsArr),
    );

/*
    const updatedScene = {
      id: property.scenes[sceneIndex.current].id,
      sceneName: property.scenes[sceneIndex.current].sceneName,
      scenePanoURI: property.scenes[sceneIndex.current].scenePanoURI,
      scenePanoImg: property.scenes[sceneIndex.current].scenePanoImg,
      hotSpotsArr: [
        ...property.scenes[sceneIndex.current].hotSpotsArr,
        hotSpot.current,
      ],
    };
*/


    const updatedScene = {
      ...property.scenes[sceneIndex.current],
      hotSpotsArr: [
        ...property.scenes[sceneIndex.current].hotSpotsArr,
        hotSpot.current,
      ],
    };

    setProperty(prev => {
      return {
        ...prev,
        scenes: property.scenes.map((item, index) => {
          if (index === sceneIndex.current) {
            logData("Updating Scene on index: " + sceneIndex.current)
            return updatedScene;
          }
          return item;
        }),
      };
    });

    setSelectImage(false);
  };

  const addInfoHotspot = text => {
    hotSpot.current.text = text;
    logData(hotSpot.current);
    // logData("property.scenes[sceneIndex].hotSpotsArr: " + JSON.stringify(property.scenes[sceneIndex.current].hotSpotsArr))
/*
    const updatedScene = {
      id: property.scenes[sceneIndex.current].id,
      sceneName: property.scenes[sceneIndex.current].sceneName,
      sceneDetail: property.scenes[sceneIndex.current].sceneDetail,
      scenePanoURI: property.scenes[sceneIndex.current].scenePanoURI,
      scenePanoImg: property.scenes[sceneIndex.current].scenePanoImg,
      hotSpotsArr: [
        ...property.scenes[sceneIndex.current].hotSpotsArr,
        hotSpot.current,
      ],
    };
    */
    const updatedScene = {
      ...property.scenes[sceneIndex.current],
      hotSpotsArr: [
        ...property.scenes[sceneIndex.current].hotSpotsArr,
        hotSpot.current,
      ],
    };

    setProperty(prev => {
      return {
        ...prev,
        scenes: property.scenes.map((item, index) => {
          if (index === sceneIndex.current) {
            // logData("Updating Scene on index: " + sceneIndex.current)
            return updatedScene;
          }
          return item;
        }),
      };
    });

    setWriteInfo(false);
  };

  useNativeMessage(message => {
    if (message.type === 'success') {
      // setData(message.data);
    } else if (message.type === 'openImage') {
      logData('Property to Open: ' + message.data.title);
      // setImage(message.data)
      setProperty(message.data);
    } else if (message.type === 'selectImagesForPlacingHotspots') {
      // logData("Total Scenes Available:" + property?.scenes.length)
      // setAddingHotspot(true)
      addingHotspot.current = true;
    } else if (message.type === 'sceneSelected') {
      logData('Selected Scene: ' + message.data);
      addCustomHotspot(message.data);
    } else if (message.type === 'getLatestProperty') {
      emit({
        type: 'saveProperty',
        data: property,
      });
    } else if (message.type === 'enterTextForPlacingHotspots') {
      addingInfo.current = true;
    } else if (message.type === 'placeInfoHotspot') {
      addInfoHotspot(message.data);
    }
  });

  const logData = elements => {
    // window.ReactNativeWebView.postMessage(
    //   JSON.stringify({type: "loggingData", data: elements})
    // );
    emit({
      type: 'loggingData',
      data: elements,
    });
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
      }}>
      {property && scene && (
        <Pannellum
          ref={panImage}
          // image={`data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`}
          // image={`data:image/jpeg;base64,${scene.scenePanoImg}`}
          image={`data:image/jpeg;base64,${scene.scenePanoImg}`}
          width="100%"
          height="100%"
          autoLoad
          showControls={false}
          // autoRotate={18}
          onMouseup={evt => {
            if (addingHotspot.current) {
              logData('Adding Hotspot');
              setSelectImage(true);

              hotSpot.current = {
                pitch: panImage.current.getViewer().mouseEventToCoords(evt)[0],
                yaw: panImage.current.getViewer().mouseEventToCoords(evt)[1],
                type: 'custom',
                transition: null,
              };

              // logData("Created Hotspot: " + JSON.stringify(hotSpot.current))
              // setAddingHotspot(false)
              addingHotspot.current = false;
            } else if (addingInfo.current) {
              logData('Adding Info Hotspot');
              setWriteInfo(true);

              hotSpot.current = {
                pitch: panImage.current.getViewer().mouseEventToCoords(evt)[0],
                yaw: panImage.current.getViewer().mouseEventToCoords(evt)[1],
                type: 'info',
                text: 'no information',
              };

              // setAddingInfo(false)
              addingInfo.current = false;
            } else {
              logData('Just Viewing' + addingHotspot.current);
            }
          }}>
          {scene.hotSpotsArr.map((hotSpot, index) => {
            logData(scene.hotSpotsArr.length);
            logData('Hotspot found' + JSON.stringify(hotSpot));
            // logData("Logged All")
            return (
              <Pannellum.Hotspot
                type={hotSpot.type}
                // type={'info'}
                pitch={hotSpot.pitch}
                yaw={hotSpot.yaw}
                text={hotSpot.text}
                handleClick={(evt, name) => {
                  sceneIndex.current = hotSpot.transition;
                  setScene(property.scenes[hotSpot.transition]);
                  // logData(`Next Scene: ${Object.values(property.scenes[hotSpot.transition])[1]}`)
                  logData(`Next Scene: ${property.scenes[hotSpot.transition].id}`)
                  // logData(`Next Scene: ${Object.keys(property.scenes[hotSpot.transition])}`)
                  emit({
                    type: 'sceneChanged',
                    data: property.scenes[hotSpot.transition].id,
                  });

                }}
                name="image info"
              />
            );
          })}
        </Pannellum>
      )}
    </div>
  );
}

// This statement is detected by babelTransformer as an entry point
// All dependencies are resolved, compressed and stringified into one file
export default webViewRender(<Viewer />);
