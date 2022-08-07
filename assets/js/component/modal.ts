const textModalContent = `
    <div class="overlay">
      <div class="modal-container">
        <section class="title">
        </section>
        <section class="content">
        </section>
        <section class="buttons">
          <div class="btn" attr-action="save">CONTINUE</div>
          <div class="btn" attr-action="cancel">&nbsp;CANCEL&nbsp;</div>
        </section>
      </div>
    </div>`;

class Modal {
  text: string;
  align: string = "left";
  node: HTMLElement;
  saveCallback: () => void;
  cancelCallback: () => void;

  constructor(
    containerId: string,
    title: string,
    content: string,
    saveCallback: () => void,
    cancelCallback: () => void,
  ) {
    this.saveCallback = saveCallback;
    this.cancelCallback = cancelCallback;

    this.node = document.createElement("div");
    this.node.classList.add("modal");
    this.node.innerHTML = textModalContent;
    this.node.getElementsByClassName("title")[0].innerHTML = title;
    this.node.getElementsByClassName("content")[0].innerHTML = content;

    this.node.addEventListener("click", this.clickEventHandler.bind(this));

    document.getElementById(containerId).appendChild(this.node);
  }

  clickEventHandler(e) {
    if (e.target.getAttribute("attr-action") === "save") {
      this.saveCallback();
      this.delete();
    }

    if (e.target.getAttribute("attr-action") === "cancel") {
      this.cancelCallback();
      this.delete();
    }
  }

  delete() {
    return this.node.remove();
  }
}

/**
 * Create and show text input modal
 */
export const createModal = (
  containerId: string,
  title: string,
  content: string,
  saveCallback: () => void,
  cancelCallback: () => void,
) => {
  new Modal(containerId, title, content, saveCallback, cancelCallback);
};
