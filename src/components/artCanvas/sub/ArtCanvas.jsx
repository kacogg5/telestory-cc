import { useCallback, useEffect, useRef, useState } from 'react';
import { BrushType } from '../../../models/artTool';

function ArtCanvas({brushState, brushDispatch, canvasRef}) {
  const brushSize = brushState.brushSize;
  const ref = useRef();
  const [context, setContext] = useState(null);
  const [posX, setPosX] = useState(-50);
  const [posY, setPosY] = useState(-50);
  const [last, setLast] = useState(false);
  const [lastX, setLastX] = useState(false);
  const [lastY, setLastY] = useState(false);
  const [cursorVisibility, setCursorVisibility] = useState("none");

  useEffect(() => {
    const canvas = ref.current
    if (canvasRef) canvasRef.current = ref.current;

    setContext(canvas.getContext('2d'));
    var {offsetWidth, offsetHeight} = ref.current.getBoundingClientRect();
    if (context) {
      context.fillStyle = "#eeeeee";
      context.fillRect(0, 0, offsetWidth, offsetHeight);
    }
  }, [canvasRef, context]);

  const onMouseMove = useCallback((e) => {
    let eventX = e.type === "touchmove" || e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    let eventY = e.type === "touchmove" || e.type === "touchstart" ? e.touches[0].clientY : e.clientY;

    setPosX(eventX - brushSize / 2);
    setPosY(eventY - brushSize / 2);

    var {left: offsetX, top: offsetY} = ref.current.getBoundingClientRect();
    var flags = e.buttons !== undefined ? e.buttons : e.which;
    var primaryMouseButtonDown = (flags & 1) === 1;
    if (primaryMouseButtonDown || e.type === "touchmove") {
      context.fillStyle = context.strokeStyle = brushState.brushType === BrushType.brush
        ? brushState.brushColor
        : "#eeeeee";
      var currX = posX - offsetX + brushSize / 2;
      var currY = posY - offsetY + brushSize / 2;
      if (last) {
        context.lineWidth = brushSize;
        context.beginPath();
        context.moveTo(lastX, lastY);
        context.lineTo(currX, currY);
        context.stroke();
      }
      context.beginPath();
      context.arc(currX, currY, brushSize / 2, 0, 2 * Math.PI);
      context.fill();

      setLast(true);
      setLastX(currX);
      setLastY(currY);
    } else {
      setLast(false);
    }
  }, [context, posX, posY, last, lastX, lastY, brushSize, brushState]);

  const onMouseEnter = useCallback((e) => {
    setCursorVisibility("unset");
    onMouseMove(e);
  }, [setCursorVisibility, onMouseMove]);

  const onMouseLeave = useCallback(() => {
    setCursorVisibility("none");
  }, [setCursorVisibility]);

  return (
    <div
      className="art-canvas"
      onMouseMove={onMouseMove}
      onTouchMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onTouchStart={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onTouchEnd={onMouseLeave}
    >
      <canvas ref={ref} height={300} width={400} />
      <svg
        className='canvas-cursor'
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          mixBlendMode: 'difference',
          filter: 'invert(1)',
          display: cursorVisibility,
          left: posX,
          top: posY,
        }}
        height={brushSize + 0.2}
        viewBox={`-0.2 -0.2 ${brushSize + 0.2} ${brushSize + 0.2}`}
        stroke='black' 
        strokeWidth={0.2}
        fill="transparent"
      >
        <circle cx={brushSize / 2} cy={brushSize / 2} r={brushSize / 2} />
      </svg>
    </div>
  );
}

export default ArtCanvas;