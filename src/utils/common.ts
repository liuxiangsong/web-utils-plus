export function debounce(fn: Function, delay: number) {
  let timer: any = null;
  return function (this: void, ...args: any[]) {
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

export function throttle(fn: Function, delay: number) {
  let timer: any = null;
  return function (this: void, ...args: any[]) {
    if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        fn.apply(this, args);
      }, delay);
    }
  };
}
