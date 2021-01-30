<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
   <i class="el-icon-edit" ></i>
   <el-input v-model="input" placeholder="请输入内容" clearable v-inputRestrict:input.float></el-input>{{input}}
   <!-- <input type="text" v-model="input2" v-focus  clearable v-inputRestrict.float>{{input2}} -->
   <div v-clipboard="input">复制</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  props: {
    msg: String,
  },
  setup() {
    return {
      input: ref(''),
      input2: ref(''),
    };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
