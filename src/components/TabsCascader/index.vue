<template>
  <el-popover placement="bottom" :width="width" trigger="manual" v-model:visible="visible">
    <template #reference>
      <div v-clickoutside:[contentRef]="() => togglePopperVisible(false)" class="input-container" @mouseenter="inputHover=true" @mouseleave="inputHover=false" @click.stop="togglePopperVisible(true)">
        <el-input v-model.trim="inputValue" :placeholder="placeholder" :readonly="readonly" @input="handleInput" size="medium">
          <template #suffix>
            <i v-if="clearBtnVisible" key="clear" class="el-input__icon el-icon-circle-close" @click.stop="clearInput"></i>
            <i v-else key="arrow-down" :class="['el-input__icon','el-icon-arrow-down',visible && 'is-reverse']" @click.stop="togglePopperVisible(!visible)"></i>
          </template>
        </el-input>
      </div>
    </template>
    <div class="content" ref="contentRef">
      <el-tabs v-show="!showSuggestionResult" v-model="currentTabName" @tab-click="clickTab">
        <el-tab-pane v-for="(tab,index) in tabs" :key="index" :label="tab.selectedOption&&tab.selectedOption.label ||'请选择' " :name="index+''">
          <ul class="item-wrap">
            <li v-for="item in tab.options" :key="item.label" @click="clickItem(item,index)">{{item.label}}</li>
          </ul>
        </el-tab-pane>
      </el-tabs>
      <div v-show="showSuggestionResult" class="search-result">
        <el-scrollbar wrap-class="scrollbar-wrapper">
          <ul>
            <li v-if="!suggestions||suggestions.length<1" class="empty-text">无匹配数据</li>
            <template v-else>
              <li v-for="(item,index) in suggestions" :key="index" @click="suggestionItemClick(item)">
                {{`${item.displayText}`}}
              </li>
            </template>
          </ul>
        </el-scrollbar>
      </div>
    </div>
  </el-popover>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  reactive,
  toRefs,
  ref,
  nextTick,
  watch,
  onMounted,
  PropType,
} from 'vue';
import { clickoutside } from '@/directives';
import { debounce } from '@/utils/common';
import { getChildrenFromCacheOptions, Option } from './useTabCascaderOption';

  type Data = {
    cacheOptions: Option[];
    visible: boolean;
    loading: boolean;
    clearBtnVisible: boolean;
    inputHover: boolean;
    inputValue: string;
    currentTabIndex: number;
    tabs: Tab[];
    selectedOptions: Option[];
    suggestions: string[]; // 搜索结果
    showSuggestionResult: boolean;
  };

  type Tab = {
    selectedOption?: Option; // 为当前面板选择的option
    options: Option[]; // 为上一级option.children
  };

  type SuggestionItem = {
    labelList: string[]; // 每一级的选项文本
    displayText: string; // 显示文本
  };

  type FetchSuggestionCB = (data: string[]) => void;
  type FetchSuggestion = (queryString: string, cb: FetchSuggestionCB) => void;

export default defineComponent({
  name: 'TabsCascader',
  directives: {
    clickoutside,
  },
  props: {
    placeholder: { type: String, default: '请选择' },
    width: { type: [Number, String], default: 450 },
    separator: { type: String, default: ' / ' },
    options: { type: Array }, // 非懒加载时的数据源 [{value,label,children:options,leaf,level}] level从1开始
    valueList: { type: Array }, // 选中项的值
    labelList: { type: Array as PropType<string[]> }, // 选中项的文本
    filterable: { type: Boolean, default: true }, // 是否启用搜索功能
    fetchSuggestions: { type: Function as PropType<FetchSuggestion> },
    lazyLoadProps: { // 懒加载选项
      type: Object as PropType<{ lazy: boolean; lazyLoad: Function }>,
      default: () => ({ lazy: false, lazyLoad: null }),
    },
  },
  emits: ['value-change'],
  setup(props, { emit }) {
    const data: Data = reactive({
      cacheOptions: [],
      visible: false,
      loading: false,
      // popoverVisible: false,
      clearBtnVisible: false,
      inputHover: false,
      inputValue: '',
      currentTabIndex: 0,
      tabs: [],
      selectedOptions: [],
      suggestions: [], // 搜索结果
      showSuggestionResult: false,
    });
    const contentRef = ref(null);
    const readonly = computed(() => !props.filterable);
    const clearBtnVisible = computed(() => data.inputValue && data.inputHover);
    const currentTabName = computed(() => `${data.currentTabIndex}`);
    watch([() => data.selectedOptions, () => data.visible], () => {
      data.inputValue = data.selectedOptions
        .map((o) => o.label)
        .join(props.separator);
    });

    const togglePopperVisible = (isVisible?: boolean) => {
      // console.log('isVisible :>> ', isVisible);
      if (isVisible === false) {
        data.visible = false;
        return;
      }
      // console.log('target :>> ', target);
      data.visible = isVisible ?? !data.visible;
      // data.visible = !data.visible;
    };
    const clearInput = () => {
      data.selectedOptions = [];
      nextTick(() => { emit('value-change', []); });
    };
    const clickTab = (tab: any) => {
      const tabIndex = Number(tab.index);
      data.currentTabIndex = tabIndex;
      data.tabs.splice(tabIndex + 1, data.tabs.length - tabIndex + 1);
    };

    // 通过valueList加载数据
    const loadDataByValueList = (valueList: any[]) => {
      let currentOptions = props.options as Option[];
      if (!valueList || valueList.length < 1) {
        data.tabs = [{ options: currentOptions }];
        return;
      }
      valueList.forEach((v) => {
        const option = currentOptions.find((o) => o.value === v);
        if (option) {
          data.tabs.push({ selectedOption: option, options: currentOptions });
          currentOptions = option.children as Option[];
        }
      });
      if (!currentOptions || currentOptions.length < 1) {
        data.selectedOptions = data.tabs.map(
          (t) => t.selectedOption,
        ) as Option[];
      }
      data.currentTabIndex = data.tabs.length - 1;
    };

    // 加载option的children
    const loadChildrenOfOption = (option: Option, isManualClick: boolean) => {
      const theLastTab = data.tabs[data.tabs.length - 1];
      const tabOption = theLastTab.options.find(
        (o) => o.value === option.value,
      );
      Object.assign(option, tabOption);
      theLastTab.selectedOption = option;
      const isLeafNode = props.lazyLoadProps.lazy && option.leaf;
      if (isLeafNode || !option.children || option.children.length < 1) {
        data.selectedOptions = data.tabs.map(
          (t) => t.selectedOption,
        ) as Option[];
        data.visible = false;
        isManualClick && emit('value-change', data.selectedOptions);
        return;
      }
      data.tabs.push({ options: option.children });
      data.currentTabIndex = data.tabs.length - 1;
    };
    const loadChildrenOfOptionInLazy = (
      option: Option,
      isManualClick = false,
    ) => new Promise<void>((resolve, reject) => {
      if (option && option.value) {
        const children = getChildrenFromCacheOptions(
          option,
          data.cacheOptions,
          1,
        );
        if (children && children.length > 0) {
          option.children = children;
          loadChildrenOfOption(option, isManualClick);
          resolve();
          return;
        }
      }
      if (option && option.leaf) {
        loadChildrenOfOption(option, isManualClick);
        resolve();
        return;
      }
      data.loading = true;
      try {
        props.lazyLoadProps.lazyLoad(option, (children: Option[]) => {
          if (!children) {
            data.loading = false;
            resolve();
            return;
          }
          if (data.tabs.length < 1 || !data.tabs[0]) {
            if (data.cacheOptions.length < 1) {
              data.cacheOptions.push(...children);
            }
            data.tabs = [{ options: children }];
          }
          if (option && option.value) {
            if (!option.leaf) {
              option.children = children;
            }
            loadChildrenOfOption(option, isManualClick);
          }
          data.loading = false;
          resolve();
        });
      } catch (ex) {
        console.log('loadChildrenOfOptionInLazy :>> ', ex);
        data.loading = false;
        reject();
      }
    });
      // 通过valueList或labelList加载数据
    const loadDataByListInLazy = async (
      list: any[],
      byOptionValue = true,
      isManualClick = false,
    ) => {
      if (!list || list.length < 1) {
        data.selectedOptions = [];
        return;
      }
      // list = list || [null]
      if (!props.lazyLoadProps.lazy) {
        return;
      }
      for (let index = 0; index < list.length; index++) {
        const option = { value: list[index], level: index + 1 };
        if (!data.tabs[index]) {
          return;
        }
        if (!byOptionValue) {
          const tabOption = data.tabs[index].options.find(
            (f) => f.label === list[index],
          );
          Object.assign(option, tabOption);
        }
        await loadChildrenOfOptionInLazy(option, isManualClick);
      }
    };

    const clickItem = (option: Option, tabIndex: number) => {
      if (props.lazyLoadProps.lazy) {
        option.level = tabIndex + 1;
        loadChildrenOfOptionInLazy(option, true);
      } else {
        loadChildrenOfOption(option, true);
      }
    };

    const initByList = async (list: any[]|undefined, byOptionValue = true, isManualClick = false) => {
      if (data.tabs.length > 1) {
        clickTab({ index: 0 });
      }
      list = list || [];
      if (props.lazyLoadProps.lazy) {
        if (data.tabs.length < 1) {
          await loadChildrenOfOptionInLazy({ value: '', level: 1 });
        }
        loadDataByListInLazy(list, byOptionValue, isManualClick);
      } else {
        loadDataByValueList(list);
      }
    };
    const handleInput = (queryString: string) => {
      debounce(() => {
        if (!props.fetchSuggestions) {
          console.warn("props fetchSuggestions can't be undefined");
          return;
        }
        if (!queryString) {
          data.suggestions = [];
          return;
        }
        data.loading = true;
        data.showSuggestionResult = true;
        props.fetchSuggestions(queryString, (dataList: string[]) => {
          data.suggestions = dataList;
          data.loading = false;
        });
      }, 500);
    };
    const suggestionItemClick = async (item: SuggestionItem) => {
      initByList(item.labelList, false, true);
      data.visible = false;
      setTimeout(() => {
        data.showSuggestionResult = false;
      }, 100);
    };
    watch(() => props.labelList || [], (val: string[]) => { initByList(val, false); }, { deep: true });
    onMounted(() => {
      const byOptionValue = !props.labelList || props.labelList.length < 1;
      const list = byOptionValue ? props.valueList : props.labelList;
      initByList(list, byOptionValue);
    });
    return {
      contentRef,
      ...toRefs(data),
      readonly,
      currentTabName,
      clearBtnVisible,
      togglePopperVisible,
      clearInput,
      clickTab,
      clickItem,
      handleInput,
      suggestionItemClick,
    };
  },
});
</script>

<style lang="scss" scoped>
  .input-container {
    :deep(.is-reverse) {
      transform: rotateZ(180deg);
      top: -1px;
    }
  }
  .el-tabs {
    padding: 5px 12px;
    :deep(.item-wrap) {
      display: flex;
      flex-wrap: wrap;
      list-style: none;
      li {
        width: 96px;
        height: 30px;
        line-height: 30px;
        margin: 2px 5px;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;

        &:hover {
          background: #f0ebff;
        }
      }
    }
  }
   .search-result {
    max-height: 300px;
    ul {
      padding-bottom: 15px;
      .empty-text {
        color: #c0c4cc;
        text-align: center;
        cursor: auto;
      }
      li {
        height: 34px;
        line-height: 34px;
        padding: 0 12px;
        cursor: pointer;
        &:hover {
          background: #f5f7fa;
        }
      }
    }
      // .el-scrollbar {
      //   height: calc(100% + 20px);
      //   //隐藏横行包裹滚动条
      //   .scrollbar-wrapper {
      //     max-height: 300px;
      //     overflow-x: hidden !important;
      //   }
      //   //隐藏横行滚动条
      //   .is-horizontal {
      //     display: none;
      //   }
      // }
  }
</style>
