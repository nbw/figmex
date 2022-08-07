const textModalContent = `
  <div>
    <div class="row">
      <textarea placeholder="enter text"></textarea>
    </div>
    <div class="row">
      <span class="align" attr-align="left">
        <svg width="15" height="15" viewBox="0 0 100 92" xmlns="http://www.w3.org/2000/svg">
          <rect stroke-width="4" fill="transparent" x="0" y="0"  width="98" height="8" />
          <rect stroke-width="4" fill="transparent" x="0" y="25" width="68" height="8" />
          <rect stroke-width="4" fill="transparent" x="0" y="50" width="98" height="8" />
          <rect stroke-width="4" fill="transparent" x="0" y="75" width="68" height="8" />
        </svg>
      </span>
      <span class="align" attr-align="center">
        <svg width="15" height="15" viewBox="0 0 100 92" xmlns="http://www.w3.org/2000/svg">
          <rect stroke-width="4" fill="transparent" x="0" y="0"  width="98" height="8" />
          <rect stroke-width="4" fill="transparent" x="15" y="25" width="68" height="8" />
          <rect stroke-width="4" fill="transparent" x="0" y="50" width="98" height="8" />
          <rect stroke-width="4" fill="transparent" x="15" y="75" width="68" height="8" />
        </svg>
      </span>
      <span class="align" attr-align="right">
        <svg width="15" height="15" viewBox="0 0 100 92" xmlns="http://www.w3.org/2000/svg">
          <rect stroke-width="4" fill="transparent" x="0" y="0"  width="98" height="8" />
          <rect stroke-width="4" fill="transparent" x="30" y="25" width="68" height="8" />
          <rect stroke-width="4" fill="transparent" x="0" y="50" width="98" height="8" />
          <rect stroke-width="4" fill="transparent" x="30" y="75" width="68" height="8" />
        </svg>
      </span>
    </div>
    <div class="row bottom">
      <div class="btn" attr-action="save">CREATE</div>
      <div class="btn" attr-action="cancel">CANCEL</div>
    </div>
  </div>`;

const createModal = (x: number, y: number): HTMLElement => {
  const node = document.createElement("div");
  node.id = "text";
  node.innerHTML = textModalContent;
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  return node;
};

class Text {
  text: string;
  align: string = "left";
  node: HTMLElement;
  saveCallback: (text: string, align: string) => void;
  cancelCallback: () => void;

  constructor(
    containerId: string,
    x: number,
    y: number,
    saveCallback: (text: string, align: string) => void,
    cancelCallback: () => void,
  ) {
    this.saveCallback = saveCallback;
    this.cancelCallback = cancelCallback;

    this.node = createModal(x, y);
    this.node.addEventListener("click", this.clickEventHandler.bind(this));
    this.node.addEventListener("input", this.inputEventHandler.bind(this));

    document.getElementById(containerId).appendChild(this.node);
  }

  clickEventHandler(e) {
    if (e.target.hasAttribute("attr-align")) {
      this.align = e.target.getAttribute("attr-align");
      this.node.querySelector("textarea").style.textAlign = this.align;
    }

    if (e.target.getAttribute("attr-action") === "save") {
      this.saveCallback(this.text, this.align);
      this.delete();
    }

    if (e.target.getAttribute("attr-action") === "cancel") {
      this.cancelCallback();
      this.delete();
    }
  }

  inputEventHandler(e) {
    this.text = e.target.value;
  }

  delete() {
    return this.node.remove();
  }
}

/**
 * Create and show text input modal
 */
export const createTextInput = (
  containerId: string,
  x: number,
  y: number,
  saveCallback: (text: string, align: string) => void,
  cancelCallback: () => void,
) => {
  new Text(containerId, x, y, saveCallback, cancelCallback);
};

/**
 * Delete text input element from dom.
 */
export const deleteTextInput = () => {
  const modal = document.getElementById("text");
  if (modal) {
    modal.remove();
  }
};
