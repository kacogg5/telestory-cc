import { useCallback, useEffect, useRef, useState } from "react";
import { BrushType } from "../../../models/artTool";

function Toolbox({brushState, brushDispatch}) {
  const ref = useRef();
  const isVertical = window.matchMedia('(max-width: 700px)').matches;
  const [top, setTop] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const slider = ref.current;
    var { top, left } = slider.getBoundingClientRect();
    setTop(isVertical ? left : top);
  }, [isVertical]);

  const onClickBrush = useCallback(() => {
    brushDispatch({
      type: "setBrushType",
      payload: BrushType.brush,
    }
  )}, [brushDispatch]);

  const onClickEraser = useCallback(() => {
    brushDispatch({
      type: "setBrushType",
      payload: BrushType.eraser,
    }
  )}, [brushDispatch]);

  const onMouseMoveSlider = useCallback((e) => {
    if (dragging){
      const size = Math.max(3,
        Math.min(
          Math.round((103 - (isVertical ? e.clientX : e.clientY) + top) / 100 * 27 + 3),
          30,
        ),
      );
      brushDispatch({
        type: "setBrushSize",
        payload: size,
      });
    }
  }, [brushDispatch, isVertical, top, dragging]);

  const onMouseDownSlider = useCallback((e) => {
    setDragging(true);
    onMouseMoveSlider(e);
  }, [onMouseMoveSlider]);

  const onMouseUpSlider = useCallback(() => {
    setDragging(false);
  }, []);

  return (
    <div className="toolbox">
      <div className="backdrop">
        <img
          className={"toolbox-button" + (brushState?.brushType === BrushType.brush ? " selected": "")}
          onClick={onClickBrush}
          src="/pencil.png"
          alt="brush"
        />
        <hr style={{width: 25, padding: 0, margin: "6px auto"}} />
        <img
          className={"toolbox-button" + (brushState?.brushType === BrushType.eraser ? " selected": "")}
          onClick={onClickEraser}
          src="/eraser.png"
          alt="erase"
        />
      </div>
      <div />
      <div className="backdrop">
        <div className="preview">
          <div
            className="preview-fill"
            style={{
              width: brushState.brushSize,
              height: brushState.brushSize,
              backgroundColor: brushState.brushColor,
            }}
          />
        </div>
        <div
          className="slider-container"
          onMouseDown={onMouseDownSlider}
          onMouseMove={onMouseMoveSlider}
          onMouseUp={onMouseUpSlider}
          onMouseLeave={onMouseUpSlider}
        >
          <div className="slider" ref={ref}>
            <div
              className="slider-thumb"
              style={isVertical ? {
                right: 100 * (brushState.brushSize - 3) / 27,
              } : {
                bottom: 100 * (brushState.brushSize - 3) / 27,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Toolbox;