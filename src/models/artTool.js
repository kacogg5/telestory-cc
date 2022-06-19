export const BrushType = {
  brush: 0,
  eraser: 1,
};

export const initialArtToolState = {
  brushType: BrushType.brush,
  brushSize: 10,
  brushColor: "black",
};

export function artToolReducer(state, action) {
  switch (action.type) {
    case 'setBrushType':
      return {
        ...state,
        brushType: action.payload,
      };
    case 'setBrushSize':
      return {
        ...state,
        brushSize: action.payload,
      };
    case 'setBrushColor':
      return {
        ...state,
        brushColor: action.payload,
      };
    default:
      throw new Error();
  }
}