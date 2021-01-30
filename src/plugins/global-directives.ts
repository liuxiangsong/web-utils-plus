import { App } from 'vue';
import { inputRestrict, clipboard, focus } from '@/directives';

const install = function (app: App<Element>) {
  app.directive('focus', focus);
  app.directive('inputRestrict', inputRestrict);
  app.directive('clipboard', clipboard);
};
export default install;
