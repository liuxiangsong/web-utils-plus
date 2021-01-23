function handleInput(el: any, binding: any, reg: any, max: number) {
  function handle() {
    // console.log(`new(${el.value}) , old(${el.oldValue})`)
    if (reg.test(el.value) && (!max || el.value === '' || parseFloat(el.value) <= max)) {
      // console.log(`match:new(${el.value}) , old(${el.oldValue})`)
      el.oldValue = el.value;
      el.oldSelectionStart = el.selectionStart;
      el.oldSelectionEnd = el.selectionEnd;
    } else if (Object.prototype.hasOwnProperty.call(el, 'oldValue')) {
      // console.log(`un:new(${el.value}) , old(${el.oldValue})`)
      el.value = el.oldValue;
      el.setSelectionRange(el.oldSelectionStart, el.oldSelectionEnd);
    } else {
      el.value = '';
    }
    // 处理model值与input的value不一致的问题
    binding.instance[binding.arg] = el.value;
    // console.log('vnode :>> ', vnode);
    // if (vnode.componentInstance) {
    //   vnode.componentInstance.$emit('input', el.value);
    // } else {
    //   vnode.el.dispatchEvent(new CustomEvent('input', { detail: el.value }));
    // }
  }
  return handle;
}

/**
 * v-restrict
 * @desc 输入框只允许输入指定字符
 * @example
 * ```vue
 * <input v-myrestrict:modelValue.float maxlength=10 placeholder="只允许输入浮点类型数据"/>
 * <input v-myrestrict:字段名.regular="/^[0-9a-f]*$/i" placeholder="只允许输入符合正则表达式的数据"/>
 * ```
 */
const myrestrict = {
  beforeMount(elinput: HTMLInputElement, binding: any, vnode: any) {
    console.log('binding :>> ', binding);
    if (Object.keys(binding.modifiers).length === 0) {
      return;
    }
    // console.log(vnode.data.attrs,vnode)
    const el: any = elinput.querySelector('input') || elinput;

    const regExpes: {[key: string]: any} = {
      integer: /^-?\d*$/,
      positive: /^\d*$/,
      float: /^-?\d*[.,]?\d*$/,
      currency: /^-?\d*[.,]?\d{0,2}$/,
      alphabet: /^[a-z]*$/i,
      text: /^[\u4e00-\u9fa5a-zA-Z0-9-()（）*,，\u0020\u3000－]+$/, // 字母、中文、数字、括号、-和\u3000 全角空格，\u0020 半角空格
      regular: binding.value,
    };
    const key = Object.keys(binding.modifiers)[0];
    const reg = regExpes[key];
    const max = parseFloat(el.max);

    if (vnode.componentInstance && vnode.componentInstance.clearable) {
      vnode.componentInstance.$on('clear', () => { el.oldValue = ''; });
    }
    el.addEventListener('focus', () => {
      if (el.oldValue !== el.value) {
        el.oldValue = el.value;
        el.oldSelectionStart = el.oldSelectionEnd = el.oldValue.length;
      }
    });
    // el.addEventListener('input', handleInput(el, vnode, reg, max));
    el.addEventListener('input', handleInput(el, binding, reg, max));
  },
};

export default myrestrict;
