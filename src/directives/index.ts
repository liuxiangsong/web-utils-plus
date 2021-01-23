import { App } from 'vue';
import myrestrict from './inputRestrict';
import clipboard from './clipboard';
import focus from './focus';

const install = function (app: App<Element>) {
  app.directive('focus', focus);
  app.directive('myrestrict', myrestrict);
  app.directive('clipboard', clipboard);
};
export default install;
