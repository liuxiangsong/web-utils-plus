/*! *****************************************************************************
与类型对象相关等方法
***************************************************************************** */

/**
 * 移除字符串中的指定字符
 * @param {String} text 需要移除首尾指定字符的字符串
 * @param {String\char} char 指定移除的字符，为空时表示移除空格
 */
export function trim(text: string, char: string) {
  if (!char) {
    char = 's';
  }
  const exp = new RegExp(`^\\${char}+|\\${char}+$`, 'g');
  return text.replace(exp, '');
}

/**
 * 将jsonString转化为json对象
 * @param {string} jsonString
 */
export function convertStringToJson(jsonString: string) {
  if (typeof jsonString !== 'string') {
    return;
  }
  try {
    const obj = JSON.parse(jsonString);
    if (typeof obj === 'object' && obj) {
      return obj;
    }
  } catch (e) {
    console.log('e :>> ', e);
  }
}

/**
 * 将对象中字段为空的值格式化空字符串
 * @param {Object} obj
 */
export function formatEmptyOfObject(obj: Record<string, any>) {
  Object.keys(obj).forEach((k) => {
    if (!obj[k]) {
      obj[k] = '';
    }
  });
}
/**
 * 将相同属性名的值赋值给另一个对象
 * @param {Object} targetObject  目标对象，被赋值的对象
 * @param {Object} originObject  源对象
 */
export function copyTheSameProperty(targetObject: Record<string, any>, originObject: Record<string, any>) {
  Object.keys(targetObject).forEach((key) => { targetObject[key] = originObject[key]; });
}
