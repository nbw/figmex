import uuid from "../uuid";

export enum CanvasObjType {
  Rect = "rect",
  Arrow = "arrow",
  Text = "text",
}

export type FabricObject = fabric.Object | fabric.Text | fabric.Group;

interface CanvasObjInterface {
  id: string;
  type: CanvasObjType;
  lock: boolean;
  obj?: FabricObject;
}

export interface SerializedCanvasObj {
  id?: string;
  type: CanvasObjType;
  x: number;
  y: number;
  w?: number;
  h?: number;
  a?: number; // angle
  t?: string;
  ta?: string;
  c_at: number;
}

export class CanvasObj implements CanvasObjInterface {
  id: string = `${Date.now()}${uuid()}`;
  type: CanvasObjType;
  lock: boolean;
  obj?: FabricObject;
  c_at: number;

  constructor(id: string, type: CanvasObjType, obj: FabricObject) {
    this.id = id;
    this.type = type;
    this.obj = obj;
  }

  /**
   *  Serialized CanvasObj to be sent over a websocket
   * @returns Object (SerializedCanvasObj)
   */
  serialize(): SerializedCanvasObj {
    const data = {
      id: this.id,
      type: this.type,
    } as SerializedCanvasObj;

    if (typeof this.obj !== undefined) {
      data.x = this.obj.left;
      data.y = this.obj.top;
      data.w = this.obj.getScaledWidth();
      data.h = this.obj.getScaledHeight();
      data.a = this.obj.angle;

      if ("text" in this.obj) {
        data.t = this.obj.text;
        data.ta = this.obj.textAlign;
      }
    }

    return data;
  }
}
