/**
 * DOM manipulation related tasks
 */

export const deleteElement = (id: string) => {
  document.getElementById(id)?.remove();
};

// credit: https://stackoverflow.com/questions/67434871/reduce-mousemove-events
const throttle = (callback, wait) => {
  let timeout;
  return (e) => {
    if (timeout) return;
    timeout = setTimeout(() => (callback(e), (timeout = undefined)), wait);
  };
};

export const domEventListener = (
  elementId,
  callback: string,
  fn: (event) => void,
) => {
  const el = document.getElementById(elementId);
  if (el === null) return;
  el.addEventListener(callback, fn);
};

export const throttledDomEventListener = (
  elementId,
  callback: string,
  fn: (event) => void,
  throttleMs: number,
) => {
  const el = document.getElementById(elementId);
  if (el === null) return;
  el.addEventListener(callback, throttle(fn, throttleMs));
};

export const updateElementPosition = (id: string, x: number, y: number) => {
  let el = document.getElementById(id);
  if (el !== null) {
    translate(el, x, y);
  }
};

/** credit: https://stackoverflow.com/questions/7454983/javascript-smooth-animation-from-x-y-to-x1-y1 */
const translate = (elem, x, y) => {
  const left = parseInt(css(elem, "left"), 10),
    top = parseInt(css(elem, "top"), 10),
    delay = 1,
    count = 10;

  let dx = left - x;
  let dy = top - y;
  let i = 0;

  const loop = () => {
    if (i >= count) return;

    i += 1;
    elem.style.left = `${(left - (dx * i) / count).toFixed(0)}px`;
    elem.style.top = `${(top - (dy * i) / count).toFixed(0)}px`;
    setTimeout(loop, delay);
  };

  loop();
};

const css = (element, property) => {
  return window.getComputedStyle(element, null).getPropertyValue(property);
};
