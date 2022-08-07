import uuid from "./core/uuid";
import Store from "./core/store";
import SessionStore from "./core/store/session_store";
import { USER_ACTION, DOM } from "./constants";
import { setupChannel } from "./core/socket";
import { setupCanvas } from "./core/canvas";

/**
 * STORE: Current User's Session
 * [id]: User's ID
 * [action]: User's current selected intent
 */
export const SESSION = new SessionStore({
  id: uuid(),
  action: USER_ACTION.Blank,
});

/**
 * STORE: Users on the board
 * [key]: User ID
 * [value]: User info returned from Phoenix Presence
 */
export const USERS = new Store();

/**
 * STORE: Claims by Users
 * [key]: User ID
 * [value]: Object ID
 */
export const USER_CLAIMS = new Store();

/**
 * STORE: Objects on the board
 * [key]: Object ID
 * [value]: CanvasObj
 */
export const CANVAS_OBJECTS = new Store();

/**
 * CHANNEL: Websocket connection to backend
 * - not a "store" persay, but this is the best place for it
 */
export let CHANNEL = undefined;

/**
 * Canvas: Fabricjs Canvas instance
 * - not a "store" persay, but this is the best place for it
 */
export let CANVAS = undefined;

export const setup = (csrfToken, channelName) => {
  CHANNEL = setupChannel(SESSION.id(), csrfToken, channelName);
  CANVAS = setupCanvas(DOM.CANVAS);
};
