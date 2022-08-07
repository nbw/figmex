/**
 * PUSH Websocket/Channel events
 */
export enum CH_PUSH {
  CLAIM_DELETE = "claim:delete",
  CLAIM_NEW = "claim:new",
  OBJECT_CREATE = "object:create",
  OBJECT_UPDATE = "object:update",
  OBJECT_DELETE = "object:delete",
  RESET = "reset",
}

/**
 * RECEIVED Websocket/Channel events
 */
export enum CH_EVENT {
  CREATE_OBJECT = "create:object",
  DELETE_OBJECT = "delete:object",
  UPDATE = "update",
  USERS = "users:load",
  USERS_UPDATE = "presence_diff",
  RESET = "reset",
  UPDATE_TIMER = "update_timer",
}

export enum DOM {
  APP = "app",
  CANVAS = "board",
  CLICK_EVENT = "click",
  INFO = "info",
  INFO_CLOSE = "info-close",
  MENU = "menu",
  MOUSE_EVENT = "mousemove",
  TIMER = "timer",
  USERS_COUNT = "counts",
}

export enum CANVAS_EVENT {
  BEFORE_UNSELECTED = "before:selection:cleared",
  MOUSE_UP = "mouse:up",
  MOVE = "object:moving",
  SCALE = "object:scaling",
  ROTATE = "object:rotating",
}

export enum USER_ACTION {
  Arrow = "arrow",
  Blank = "",
  Delete = "trash",
  Info = "info",
  Rect = "rect",
  Reset = "reset",
  Text = "text",
}

export const apiLoadPath = "/api/load";
