import { apiLoadPath } from "./constants";
import { CHANNEL, CANVAS, CANVAS_OBJECTS, USER_CLAIMS } from "./stores";
import { channelJoin } from "./core/socket";
import { createObject, markObjectClaimed } from "./core/canvas";

export const loadInitialState = () => {
  fetch(apiLoadPath)
    .then((response) => response.json())
    .then((data) => {
      if ("board" in data) {
        const state = data["board"];
        Object.keys(state)
          .sort()
          .forEach((objId) => {
            let objParams = state[objId];
            objParams["id"] = objId;
            const canvasObj = createObject(CANVAS, objParams);
            CANVAS_OBJECTS.update(objId, canvasObj);
          });
      }
      if ("claims" in data) {
        const state = data["claims"];
        Object.keys(state).forEach((userId) => {
          const objId = state[userId];
          USER_CLAIMS.update(userId, objId);
          markObjectClaimed(CANVAS, CANVAS_OBJECTS.get(objId));
        });
      }
      channelJoin(CHANNEL);
    });
};
