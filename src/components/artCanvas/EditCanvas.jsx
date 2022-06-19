import { useReducer } from "react";
import { artToolReducer, initialArtToolState } from "../../models/artTool";
import ArtCanvas from "./sub/ArtCanvas";
import Palette from "./sub/Palette";
import Toolbox from "./sub/Toolbox";

function EditCanvas({ canvasRef }) {
  const [state, dispatch] = useReducer(artToolReducer, initialArtToolState);

  return (
    <div className="edit-canvas">
      <Palette
        brushState={state}
        brushDispatch={dispatch}
        colors={[
          "maroon"    , "red"       ,
          "brown"     , "orange"    ,
          "gold"      , "yellow"    ,
          "green"     , "lime"      ,
          "blue"      , "skyblue"   ,
          "purple"    , "magenta"   ,
          "violet"    , "pink"      ,
          "lightgray" , "white"     ,
          "black"     , "gray"      ,
        ]}
      />
      <ArtCanvas
        brushState={state}
        brushDispatch={dispatch}
        canvasRef={canvasRef}
      />
      <Toolbox
        brushState={state}
        brushDispatch={dispatch}
      />
    </div>
  );
}

export default EditCanvas;