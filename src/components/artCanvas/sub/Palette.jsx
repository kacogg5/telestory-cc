import { useCallback } from "react";

function ColorOption({color, setSelectedColor, isSelected}) {
  return (
    <div
      className={"color-option" + (isSelected ? " selected" : "")}
      style={{ background: color }}
      onClick={() => setSelectedColor(color)}
    />
  );
}

function Palette({colors, brushState, brushDispatch}) {
  const setSelectedColor = useCallback((color) => {
    brushDispatch({
      type: "setBrushColor",
      payload: color,
    })
  }, [brushDispatch]);
  return (
    <div className="palette backdrop">
      {
        colors.map((c) =>
          <ColorOption
            key={"c"+c}
            color={c}
            setSelectedColor={setSelectedColor}
            isSelected={brushState.brushColor === c}
          />
        )
      }
    </div>
  );
}

export default Palette;