/**
 * Callbacks for Canvas (Fabricjs) events
 */

import {
  CANVAS,
  CANVAS_OBJECTS,
  CHANNEL,
  USER_CLAIMS,
  SESSION,
} from "./stores";
import { CANVAS_EVENT, CH_PUSH, DOM, USER_ACTION } from "./constants";
import {
  createObject,
  deactivateObject,
  canvasCallback,
  isActiveObject,
  markObjectLoading,
  setCanvasObjectActive,
} from "./core/canvas";
import {
  CanvasObjType,
  SerializedCanvasObj,
} from "./core/canvas/canvas_object";
import * as TextInput from "./component/text";
import * as Menu from "./component/menu";
import { resetDomElements } from "./dom_callbacks";

/**
 * Canvas: Handle an object being selected
 * - create a "claim" and await approval (va CH_EVENT.USERS_UPDATE)
 */
const handleObjectSelected = (objId) => {
  // if already selected, do nothing
  if (isActiveObject(CANVAS, objId)) {
    return;
  }

  // if already claimed by someone else
  if (USER_CLAIMS.values().includes(objId)) {
    return;
  }

  CHANNEL.push(CH_PUSH.CLAIM_NEW, { obj_id: objId });
  markObjectLoading(CANVAS, CANVAS_OBJECTS.get(objId));
};

export const setup = () => {
  /**
   * Canvas: Handle a click on the canvas
   * - Option 1: create an object
   * - Option 2: select an object
   * - Option 3: nothing
   * - etc.
   */
  canvasCallback(CANVAS, CANVAS_EVENT.MOUSE_UP, (e) => {
    const pointer = e.absolutePointer;

    if (SESSION.action() === USER_ACTION.Blank) {
      if (e.target) {
        handleObjectSelected(e.target.id);
      } else {
        resetDomElements();
      }
      return;
    }

    const create = (params: SerializedCanvasObj) => {
      const obj = createObject(CANVAS, params);
      CHANNEL.push(CH_PUSH.OBJECT_CREATE, obj.serialize());
      CANVAS_OBJECTS.update(obj.id, obj);
      setCanvasObjectActive(CANVAS, obj);
      resetDomElements();
      Menu.showTrash();
    };

    let action = SESSION.action();
    action = action[0].toUpperCase() + action.slice(1);

    const params = {
      x: pointer.x as number,
      y: pointer.y as number,
      type: CanvasObjType[action],
    };

    switch (SESSION.action()) {
      case USER_ACTION.Rect:
      case USER_ACTION.Arrow:
        create(params);
        break;
      case USER_ACTION.Text:
        TextInput.createTextInput(
          DOM.APP,
          pointer.x,
          pointer.y,
          (text: string, align: string) => {
            create({ t: text, ta: align, ...params });
          },
          () => resetDomElements(),
        );
        break;
      default:
        console.log("unhandled action!");
    }
    SESSION.update("action", USER_ACTION.Blank);
  });

  /**
   * Canvas: When an object is unselected
   * - notify others that the object is selectable
   * - deactivate the object (on the frontend)
   */
  canvasCallback(CANVAS, CANVAS_EVENT.BEFORE_UNSELECTED, (e) => {
    deactivateObject(e.target);
    CHANNEL.push(CH_PUSH.CLAIM_DELETE, { obj_id: e.target.id });
  });

  /** Handler for sending canvas events to backend */
  const canvasUpdate = (e) => {
    const obj = CANVAS_OBJECTS.get(e.target.id);
    CHANNEL.push(CH_PUSH.OBJECT_UPDATE, obj.serialize());
  };

  /**
   * Canvas: Object is being moved/resized/rotated
   */
  canvasCallback(CANVAS, CANVAS_EVENT.MOVE, canvasUpdate);
  canvasCallback(CANVAS, CANVAS_EVENT.SCALE, canvasUpdate);
  canvasCallback(CANVAS, CANVAS_EVENT.ROTATE, canvasUpdate);
};
