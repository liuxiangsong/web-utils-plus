const focus = {
  mounted(el: HTMLInputElement) {
    const elInput: HTMLInputElement = el.querySelector('input') || el;
    elInput.focus();
  },
};

export default focus;
