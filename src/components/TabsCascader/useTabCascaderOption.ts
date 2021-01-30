export type Option=Partial<{
  label: string;
  value: any;
  children: Option[];
  leaf: boolean; // 是否是叶子节点，默认为false
  level: number; // 层级，从1开始
}>

/**
 *  查找option的children
 * @param {Object} option 当前点击的option
 * @param {Array} cacheOptions 缓存选项
 * @param {Number} currentLevel 当前循环的层级
 * @return {Array} 查找到option的子选项
 */
export const getChildrenFromCacheOptions = (option: Option, cacheOptions: Option[]|undefined, currentLevel: number): Option[] | undefined => {
  cacheOptions = cacheOptions || [];
  for (let i = 0; i < cacheOptions.length; i++) {
    const item = cacheOptions[i];
    if (currentLevel < (option.level || 1)) {
      return getChildrenFromCacheOptions(option, item.children, currentLevel + 1);
    }
    if (item.value === option.value) {
      return item.children;
    }
  }
};
