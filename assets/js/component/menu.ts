export const activeButton = (target) => {
  target.classList.add("active");
};

export const resetMenuItems = () => {
  document
    .querySelectorAll(".menu-item")
    .forEach((e) => e.classList.remove("active"));
};

export const showTrash = () => {
  document
    .querySelectorAll(".menu-item[action='trash']")
    .forEach((e) => e.classList.add("active"));
};
