import CONFIG from '../config/config.js';

/**
 * 格式化时间
 */
function formatTime(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':');
}

/**
 * 格式化数字
 */
function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : '0' + n;
}

/**
 * 封装请求函数
 */
function request(url, data = {}, method = "GET") {
  return new Promise(function(resolve, reject) {
    const API_BASE_URL = uni.getStorageSync('API_BASE_URL') || CONFIG.API_BASE_URL;
    
    uni.request({
      url: API_BASE_URL + url,
      data: data,
      method: method,
      header: {
        'Content-Type': 'application/json',
        'X-Nideshop-Token': uni.getStorageSync('token')
      },
      success: function(res) {
        if (res.statusCode === 200) {
          // 这里需要修改，后端返回的是errno而不是code
          if (res.data.errno === 401) {
            // 需要登录后才可以操作
            // 清除登录相关信息
            uni.removeStorageSync('token');
            uni.removeStorageSync('userInfo');
            
            // 跳转到登录页面
            uni.navigateTo({
              url: '/pages/login/login'
            });
            reject(res.data);
          } else {
            resolve(res.data);
          }
        } else {
          reject(res.errMsg);
        }
      },
      fail: function(err) {
        reject(err);
      }
    });
  });
}

/**
 * GET请求
 */
function get(url, data = {}) {
  return request(url, data, 'GET');
}

/**
 * POST请求
 */
function post(url, data = {}) {
  return request(url, data, 'POST');
}

/**
 * 检查登录会话是否过期
 */
function checkSession() {
  return new Promise(function(resolve, reject) {
    if (uni.getStorageSync('token')) {
      // 这里可以增加对token有效性的检查
      // 例如向服务器发起请求验证token是否仍然有效
      resolve(true);
    } else {
      reject(false);
    }
  });
}

/**
 * 显示错误提示
 */
function showErrorToast(msg) {
  uni.showToast({
    title: msg,
    icon: 'none',
    duration: 2000
  });
}

export default {
  formatTime,
  formatNumber,
  request,
  get,
  post,
  checkSession,
  showErrorToast
};
