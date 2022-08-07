/**
 * Handles canvas related tasks:
 * - drawing
 * - canvas event callbacks
 *
 * Effectively a wrapper for fabric.js
 */

import {
  CanvasObj,
  CanvasObjType,
  SerializedCanvasObj,
  FabricObject,
} from "./canvas/canvas_object";
import { Color } from "./color";
import { fabric } from "fabric";
import { Canvas } from "fabric/fabric-impl";
import uuid from "./uuid";
fabric.Object.prototype["id"] = undefined;
fabric.Group.prototype["id"] = undefined;
fabric.Text.prototype["id"] = undefined;

const OBJECT_DEFAULTS = {
  selectable: false,
  stroke: Color.Black,
  strokeWidth: 1,
  strokeUniform: true,
  fill: Color.Black,
  padding: 10,
  cornerSize: 5,
  cornerColor: Color.Gray,
  cornerStrokeColor: Color.Gray,
  transparentCorners: false,
  borderColor: Color.Gray,
  strokeDashArray: [],
  opacity: 1,
};

const TRI_WIDTH = 6;
const TRI_DEFAULTS = {
  angle: 90,
  width: TRI_WIDTH,
  height: 10,
};

const LINE_LENGTH = 200;

const TEXT_DEFAULTS = {
  ...OBJECT_DEFAULTS,
  fontFamily: "monospace",
  fontSize: 20,
  fontWeight: "normal",
  textAlign: "left",
};

const RECT_DEFAULTS = {
  ...OBJECT_DEFAULTS,
  width: 75,
  height: 75,
  lockRotation: true,
  fill: Color.White,
  cornerColor: Color.Black,
  cornerStrokeColor: Color.Black,
  borderColor: Color.Black,
  padding: 0,
  controls: {
    ...fabric.Text.prototype.controls,
    mtr: new fabric.Control({ visible: false }),
  },
};

const LOADING_DEFAULTS = {
  opacity: 0.7,
  fill: Color.LightGray,
  strokeDashArray: [1],
  strokeDashOffset: 1,
};

const ACTIVE_DEFAULTS = {
  selectable: true,
  fill: Color.White,
  stroke: Color.Black,
  opacity: 1.0,
  strokeWidth: 1,
  strokeDashArray: [],
};

/**
 * Initialize Fabricjs Canvas
 */
export const setupCanvas = (canvasId: string): fabric.Canvas => {
  const canvas = new fabric.Canvas(canvasId);
  canvas.hoverCursor = "pointer";
  canvas.selection = false;
  return canvas;
};

/**
 * Set canvas callback
 */
export const canvasCallback = (
  canvas: fabric.Canvas,
  callback: string,
  fn: (e) => void,
) => {
  canvas.on(callback, fn);
};

/**
 * Create an Object on this canvas
 */
export const createObject = (
  canvas: fabric.Canvas,
  params: SerializedCanvasObj,
): CanvasObj => {
  let obj: CanvasObj;

  if (!("id" in params)) {
    params.id = `${Date.now()}${uuid()}`;
  }

  switch (params.type) {
    case CanvasObjType.Rect:
      obj = createCanvasRect(canvas, params.id, params.x, params.y);
      break;
    case CanvasObjType.Arrow:
      obj = createCanvasArrow(canvas, params.id, params.x, params.y);
      break;
    case CanvasObjType.Text:
      obj = createText(
        canvas,
        params.id,
        params.x,
        params.y,
        params.t,
        params.ta,
      );
      break;
    default:
      console.log(`unknown create type ${params["type"]}`);
  }
  updateObject(obj.obj, params);
  return obj;
};

const createCanvasArrow = (
  canvas: fabric.Canvas,
  id: string,
  x: number,
  y: number,
): CanvasObj => {
  const tri = new fabric.Triangle({
    ...TRI_DEFAULTS,
    left: x + LINE_LENGTH + TRI_WIDTH / 2,
    top: y,
  });
  const line = new fabric.Line(
    [x, y + TRI_WIDTH / 2, x + LINE_LENGTH, y + TRI_WIDTH / 2],
    {
      ...OBJECT_DEFAULTS,
      left: x,
      top: y + TRI_WIDTH / 2,
    },
  );

  const obj = new fabric.Group([line, tri], {
    ...OBJECT_DEFAULTS,
    left: x,
    top: y,
    id: id,
  });

  _addToCanvas(canvas, obj);
  return new CanvasObj(id, CanvasObjType.Arrow, obj);
};

/**
 * Create Text object
 */
const createText = (
  canvas: fabric.Canvas,
  id: string,
  x: number,
  y: number,
  text: string,
  align: string,
): CanvasObj => {
  if (!text || text === "") {
    return;
  }
  const obj = new fabric.Text(text, {
    ...TEXT_DEFAULTS,
    textAlign: align,
    left: x,
    top: y,
    id: id,
  });
  _addToCanvas(canvas, obj);
  return new CanvasObj(id, CanvasObjType.Text, obj);
};

const createCanvasRect = (
  canvas: fabric.Canvas,
  id: string,
  x: number,
  y: number,
): CanvasObj => {
  const rect = new fabric.Rect({
    ...RECT_DEFAULTS,
    left: x,
    top: y,
    id: id,
  });

  _addToCanvas(canvas, rect);
  return new CanvasObj(id, CanvasObjType.Rect, rect);
};

export const deleteFromCanvas = (canvas: Canvas, canvasObj: CanvasObj) => {
  canvas.remove(canvasObj.obj);
};

export const setCanvasObjectActive = (
  canvas: fabric.Canvas,
  canvasObj: CanvasObj,
) => {
  if (isActiveObject(canvas, canvasObj.id)) {
    return;
  }
  const obj = _markObject(canvasObj, ACTIVE_DEFAULTS);
  canvas.setActiveObject(obj);
  canvas.renderAll();
};

export const deactivateObject = (obj: FabricObject) => {
  obj.selectable = false;
  obj.dirty = true;
};

/**
 *  Updates an object with serialized params (ex: from backend)
 */
export const updateObject = (
  obj: FabricObject,
  params: SerializedCanvasObj,
) => {
  Object.keys(params).forEach((param) => {
    switch (param) {
      case "x":
        obj.left = params["x"];
        break;
      case "y":
        obj.top = params["y"];
        break;
      case "w":
        obj.scaleX = params["w"] / obj.width;
        break;
      case "h":
        obj.scaleY = params["h"] / obj.height;
        break;
      case "a":
        obj.angle = params["a"];
        break;
      case "t":
        if ("text" in obj) {
          obj.text = params["t"];
          obj.textAlign = params["ta"];
        }
        break;
      default:
        console.log(`unknown update param ${param}`);
    }
  });
  obj.setCoords();
  obj.dirty = true;
};

export const canvasRefresh = (canvas: fabric.Canvas) => {
  canvas.renderAll();
};

export const isActiveObject = (canvas: fabric.Canvas, id: string): Boolean => {
  const obj = canvas.getActiveObject();
  return obj && obj["id"] === id;
};

export const markObjectClaimed = (
  canvas: fabric.Canvas,
  canvasObj: CanvasObj,
) => {
  _markObject(canvasObj, _getClaimedOpts(canvasObj.type));
  canvas.renderAll();
};

export const markObjectReleased = (
  canvas: fabric.Canvas,
  canvasObj: CanvasObj,
) => {
  _markObject(canvasObj, _getDefaultOpts(canvasObj.type));
  canvas.renderAll();
};

export const markObjectLoading = (
  canvas: fabric.Canvas,
  canvasObj: CanvasObj,
) => {
  _markObject(canvasObj, LOADING_DEFAULTS);
  canvas.renderAll();
};

/**
 * Private Functions
 */
const _addToCanvas = (canvas: fabric.Canvas, obj: FabricObject) => {
  canvas.add(obj);
};

const _markObject = (canvasObj: CanvasObj, opts: Object): fabric.Object => {
  const obj = canvasObj.obj;
  if ("getObjects" in obj) {
    obj.getObjects().forEach((o: fabric.Object) => {
      o.setOptions(opts);
    });
  } else {
    obj.setOptions(opts);
  }
  obj.dirty = true;

  return obj;
};

const _getDefaultOpts = (type: CanvasObjType): Object => {
  switch (type) {
    case CanvasObjType.Rect:
      return RECT_DEFAULTS;
    case CanvasObjType.Arrow:
      return OBJECT_DEFAULTS;
    case CanvasObjType.Text:
      return TEXT_DEFAULTS;
  }
};

const _getClaimedOpts = (type: CanvasObjType): Object => {
  let opts = {
    stroke: Color.Blue,
    strokeWidth: 1,
    fill: Color.BlueLight,
    opacity: 1.0,
  };

  // Rectangles get a dashed border
  if (type == CanvasObjType.Rect) {
    opts["strokeDashArray"] = [3];
    opts["strokeDashOffset"] = 2;
  }

  return opts;
};
