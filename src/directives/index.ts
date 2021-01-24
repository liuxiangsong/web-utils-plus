import { App } from 'vue';
import inputRestrict from './inputRestrict';
import clipboard from './clipboard';
import focus from './focus';

const install = function (app: App<Element>) {
  app.directive('focus', focus);
  app.directive('inputRestrict', inputRestrict);
  app.directive('clipboard', clipboard);
};
export default install;
