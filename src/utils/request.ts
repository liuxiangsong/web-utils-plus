import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * @description 为false时，会提示接口返回的错误信息，反之则不提示
     */
    hideErrMsg?: boolean;
  }
}

export const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
});

// request拦截器
service.interceptors.request.use(
  (config) => config,
  (error) => {
    console.log('请求报错', error); // for debug
    Promise.reject(error);
  },
);

// respone拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    // 如果code等于0，则表示请求成功
    if (res.code === 0) {
      return res;
    }

    if (!response.config.hideErrMsg) {
      ElMessage({
        message: res.msg || '接口请求出错',
        type: 'error',
        duration: 3 * 1000,
      });
    }
    // 6001：无效的token；6002：被其他用户挤出；6003：token过期
    if (res.code === 6001 || res.code === 6002 || res.code === 6003) {
      ElMessageBox.confirm('用户信息已失效，请重新登录', '确定登出', {
        showCancelButton: false,
        showClose: false,
        confirmButtonText: '重新登录',
        type: 'warning',
      }).then(() => {
        // removeToken()
        // removeCustomCode()
        // removeLoginData()
        window.location.reload();
      });
    }
    return Promise.reject(res);
  },
  (error) => {
    ElMessage({
      message: error.message,
      type: 'error',
      duration: 1000,
    });
    return Promise.reject(error);
  },
);

export default service;
