import "../css/app.css";
import { setup } from "./stores"
import {setup as setupCanvasCallbacks } from "./canvas_callbacks";
import {setup as setupChannelCallbacks } from "./channel_callbacks";
import {setup as setupDomCallbacks } from "./dom_callbacks";
import { loadInitialState } from "./load"

/**
 * Setup 1: Grab some things and resize canvas to main.
 */
const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content");
const channelName = document.querySelector("meta[name='ch-name']").getAttribute("content");
if (csrfToken === null) {
  throw 'missing csrf token!'
}
const main = document.querySelector("main");
const c = document.querySelector("canvas");
c.setAttribute("height", main.offsetHeight);
c.setAttribute("width", main.offsetWidth);

/**
 * Setup 2: CHANNEL and CANVAS
 */
setup(csrfToken, channelName);

/**
 * Setup 3: Activate callbacks
 */
setupChannelCallbacks();
setupDomCallbacks();
setupCanvasCallbacks()

/**
 * Setup 4: Join channel and start connection
 */
loadInitialState()



