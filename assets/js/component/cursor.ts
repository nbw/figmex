import { deleteElement, updateElementPosition } from "../core/dom";

export const createCursor = (
  id: string,
  containerId: string,
  region: string,
  currentUser: boolean,
) => {
  let container = document.getElementById(containerId);
  if (container === null) {
    return;
  }

  if (document.getElementById(id) !== null) {
    return;
  }

  let cursor = document.createElement("div");
  cursor.setAttribute("region", region);

  cursor.id = id;
  cursor.classList.add("cursor");
  if (currentUser) {
    cursor.classList.add("self");
  }

  container.appendChild(cursor);
};

export const deleteCursor = (id: string) => {
  deleteElement(id);
};

export const updatePosition = (id: string, x: number, y: number) => {
  updateElementPosition(id, x, y);
};
