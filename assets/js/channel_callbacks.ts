/**
 * Phoenix Channel (websocket) callbacks
 */

import {
  CANVAS,
  CHANNEL,
  SESSION,
  USERS,
  CANVAS_OBJECTS,
  USER_CLAIMS,
} from "./stores";
import { CH_EVENT, DOM } from "./constants";
import { channelCallback } from "./core/socket";
import * as Cursor from "./component/cursor";
import * as Menu from "./component/menu";
import * as UsersCount from "./component/users_count";
import {
  canvasRefresh,
  createObject,
  deleteFromCanvas,
  isActiveObject,
  markObjectClaimed,
  markObjectReleased,
  updateObject,
  setCanvasObjectActive,
} from "./core/canvas";
import { CanvasObj, CanvasObjType } from "./core/canvas/canvas_object";

export const setup = () => {
  /**
   * Channel: Presence callback handler
   * - add/remove cursors for users
   * - increment/decrement user count
   */
  channelCallback(CHANNEL, CH_EVENT.USERS_UPDATE, (payload) => {
    const joins = payload["joins"];
    const leaves = payload["leaves"];
    const updates = {};
    Object.keys(joins).forEach((joinerId) => {
      // If  a user is simply updated, they appear in both
      if (joinerId in leaves) {
        updates[joinerId] = joins[joinerId];
        delete joins[joinerId];
        delete leaves[joinerId];
      }
    });

    Object.keys(joins).forEach((joinerId) => {
      USERS.update(joinerId, joins[joinerId]);
      const region = joins[joinerId].metas[0].region;
      Cursor.createCursor(
        joinerId,
        DOM.APP,
        region,
        SESSION.isCurrentUser(joinerId),
      );
    });

    Object.keys(leaves).forEach((leaverId) => {
      USERS.delete(leaverId);
      handleClaim(leaverId, null);
      Cursor.deleteCursor(leaverId);
    });

    Object.keys(updates).forEach((userId) => {
      updates[userId]["metas"].forEach((meta) => {
        handleClaim(userId, meta["claim"]);
      });
    });

    UsersCount.refreshUserCounts(DOM.USERS_COUNT, USERS);
  });

  /**
   * Channel: Users
   * - load users (on page load)
   */
  channelCallback(CHANNEL, CH_EVENT.USERS, (payload) => {
    Object.keys(payload).forEach((user_id) => {
      USERS.update(user_id, payload[user_id]);
    });

    UsersCount.refreshUserCounts(DOM.USERS_COUNT, USERS);
  });

  /**
   * Channel: Create Object
   */
  channelCallback(CHANNEL, CH_EVENT.CREATE_OBJECT, (payload) => {
    // Return if already exists
    if (CANVAS_OBJECTS.exists(payload["id"])) {
      return;
    }
    const obj = createObject(CANVAS, payload);
    CANVAS_OBJECTS.update(obj.id, obj);
    USER_CLAIMS.update(payload.user_id, obj.id);
    markObjectClaimed(CANVAS, obj);
  });

  /**
   * Channel: an object was deleted from the canvas.
   */
  channelCallback(CHANNEL, CH_EVENT.DELETE_OBJECT, (payload) => {
    const objId = payload["obj_id"];
    if (objId) {
      deleteFromCanvas(CANVAS, CANVAS_OBJECTS.get(objId));
      CANVAS_OBJECTS.delete(objId);
    }
  });

  /**
   * Channel: update message from backend
   */
  channelCallback(CHANNEL, CH_EVENT.UPDATE, (payload) => {
    Object.keys(payload).forEach((id) => {
      const item = payload[id];

      switch (item["type"]) {
        case "cursor":
          const user = USERS.get(id);
          if (user) {
            const region = user.metas[0].region;
            Cursor.createCursor(id, DOM.APP, region, SESSION.isCurrentUser(id));
            Cursor.updatePosition(id, item["x"], item["y"]);
          }
          break;

        case CanvasObjType.Arrow:
        case CanvasObjType.Rect:
        case CanvasObjType.Text:
          const canvasObj = CANVAS_OBJECTS.get(id);
          if (canvasObj === undefined || canvasObj.obj === undefined) {
            return;
          }

          if (isActiveObject(CANVAS, id)) {
            return;
          }

          updateObject(canvasObj.obj, item);
          canvasRefresh(CANVAS);

          break;
        default:
          console.log(`unhandled update type '${item["type"]}'`);
      }
    });
  });

  /*
   * Channel: Reset the board
   * - delete objects
   * - reset stores
   */
  channelCallback(CHANNEL, CH_EVENT.RESET, (_payload) => {
    CANVAS_OBJECTS.values().forEach((canvasObj: CanvasObj) => {
      deleteFromCanvas(CANVAS, canvasObj);
    });
    USER_CLAIMS.reset();
    CANVAS_OBJECTS.reset();
  });

  /*
   * Channel: Updates the remaing time until auto reset
   */
  channelCallback(CHANNEL, CH_EVENT.UPDATE_TIMER, (payload) => {
    const mins = Math.floor(
      (Date.now() - Date.parse(payload.reset_at)) / 60000,
    );
    const el = document.getElementById(DOM.TIMER);
    el.innerHTML = `${60 - mins}`;
  });
};

/**
 * Channel: Handle a new claim
 * - Option 1: Activate the object for the claimer to edit
 * - Option 2: Mark the object as claimed and unselectable
 * - Option 3: Clear an claimed objects on the canvas by the user
 */
const handleClaim = (targetUserId, objId) => {
  if (CANVAS_OBJECTS.exists(objId)) {
    USER_CLAIMS.update(targetUserId, objId);
    CANVAS_OBJECTS.update(targetUserId, objId);
    if (SESSION.isCurrentUser(targetUserId)) {
      setCanvasObjectActive(CANVAS, CANVAS_OBJECTS.get(objId));
      Menu.showTrash();
    } else {
      markObjectClaimed(CANVAS, CANVAS_OBJECTS.get(objId));
    }
  } else {
    // clear any claims for user
    const objId = USER_CLAIMS.get(targetUserId);
    if (objId) {
      USER_CLAIMS.delete(targetUserId);
      const canvasObj = CANVAS_OBJECTS.get(objId);
      if (canvasObj) {
        markObjectReleased(CANVAS, canvasObj);
      }
    }
  }
};
