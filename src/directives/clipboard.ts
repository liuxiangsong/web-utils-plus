// Inspired by https://github.com/Inndy/vue-clipboard2
import { ElMessage } from 'element-plus';

const Clipboard = require('clipboard');

if (!Clipboard) {
  throw new Error('you should npm install `clipboard` --save at first ');
}

function clipboardSuccess() {
  ElMessage({
    message: '复制成功',
    type: 'success',
    duration: 1500,
  });
}

function clipboardError() {
  ElMessage({
    message: '复制失败',
    type: 'error',
  });
}

export default {
  beforeMount(el: any, binding: any) {
    const clipboard = new Clipboard(el, {
      text() { return binding.value; },
      action() { return binding.arg === 'cut' ? 'cut' : 'copy'; },
    });
    clipboard.on('success', () => {
      clipboardSuccess();
    });
    clipboard.on('error', () => {
      clipboardError();
    });
    el._v_clipboard = clipboard;
  },
  updated(el: any, binding: any) {
    el._v_clipboard.text = function () { return binding.value; };
    el._v_clipboard.action = function () { return binding.arg === 'cut' ? 'cut' : 'copy'; };
  },
  unmounted(el: any) {
    el._v_clipboard.destroy();
    delete el._v_clipboard;
  },
};
