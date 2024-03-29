import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
    if (canvasRef) canvasRef.current = ref.current;
    if (ref.current) {
      setContext(ref.current.getContext('2d'));
      var {offsetWidth, offsetHeight} = ref.current;
    }

    if (context) {
      context.fillStyle = "#eeeeee";
      context.fillRect(0, 0, offsetWidth, offsetHeight);
    }
  }, [canvasRef, context]);

  const onMouseMove = useCallback((e) => {
    let eventX = e.type === "touchmove" || e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    let eventY = e.type === "touchmove" || e.type === "touchstart" ? e.touches[0].clientY : e.clientY;

    setPosX(eventX + window.scrollX - brushSize / 2);
    setPosY(eventY + window.scrollY - brushSize / 2);
    
    var {left, top} = ref.current.getBoundingClientRect();
    var offsetX = left + window.scrollX;
    var offsetY = top + window.scrollY;
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
      {
        useMemo(() => <canvas
          ref={ref}
          height={Math.min(300, window.innerWidth * 0.72)}
          width={Math.min(400, window.innerWidth * 0.96)}
        />, [])
      }
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