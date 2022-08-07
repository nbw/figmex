/**
 * Callbacks for DOM events
 */

import { CH_PUSH, DOM, USER_ACTION } from "./constants";
import { CANVAS, CHANNEL, SESSION } from "./stores";
import { domEventListener, throttledDomEventListener } from "./core/dom";
import * as Menu from "./component/menu";
import { createModal } from "./component/modal";
import * as TextInput from "./component/text";

/**
 * Reset Menu and Text Input
 */
export const resetDomElements = () => {
  TextInput.deleteTextInput();
  Menu.resetMenuItems();
};

export const setup = () => {
  /**
   * DOM: Send cursor position to backend
   */
  domEventListener(DOM.APP, DOM.MOUSE_EVENT, (event) => {
    if (!CHANNEL.canPush()) return;
    /**
     * Implicit contract: the data passed through the socket
     * should implement the `SerializedCanvasObj` interface
     */
    CHANNEL.push(CH_PUSH.OBJECT_UPDATE, {
      id: SESSION.id(),
      type: "cursor",
      x: event.pageX,
      y: event.pageY,
    });
  });

  domEventListener(DOM.MENU, DOM.CLICK_EVENT, (event) => {
    const target = event.target;
    const action = target.getAttribute("action") || USER_ACTION.Blank;
    if (action === USER_ACTION.Blank) {
      return;
    }

    resetDomElements();

    switch (action) {
      case USER_ACTION.Delete:
        const activeObj = CANVAS.getActiveObject();
        if (activeObj) {
          CHANNEL.push(CH_PUSH.OBJECT_DELETE, { obj_id: activeObj.id });
        }
        SESSION.update("action", USER_ACTION.Blank);
        break;
      case USER_ACTION.Reset:
        createModal(
          DOM.APP,
          "Reset",
          "Are you sure you want to reset the entire board? This action will affect all other users.",
          () => {
            CHANNEL.push(CH_PUSH.RESET, {});
          },
          () => {},
        );
        break;
      case USER_ACTION.Info:
        document.getElementById(DOM.INFO).classList.remove("hide");
        break;
      default:
        SESSION.update("action", action);
        Menu.activeButton(target);
    }
  });

  /**
   * Info modal
   *  */
  domEventListener(DOM.INFO, DOM.CLICK_EVENT, (event) => {
    const t = event.target;
    if (t.classList.contains("overlay") || t.classList.contains("btn")) {
      document.getElementById(DOM.INFO).classList.add("hide");
    }
  });
};
