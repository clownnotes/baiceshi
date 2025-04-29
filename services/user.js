/**
 * 用户相关服务
 */
import util from '../utils/util';

/**
 * 登录
 */
function login(username, password) {
  return new Promise(function(resolve, reject) {
    util.request('/api/auth/login', {
      username: username,
      password: password
    }, 'POST').then(res => {
      // 修改判断条件，使用errno代替code
      if (res.errno === 0) {
        // 存储用户信息
        uni.setStorageSync('userInfo', res.data.userInfo);
        uni.setStorageSync('token', res.data.token);
        resolve(res);
      } else {
        reject(res);
      }
    }).catch(err => {
      reject(err);
    });
  });
}

/**
 * 微信登录
 */
function loginByWeixin() {
  return new Promise(function(resolve, reject) {
    uni.login({
      provider: 'weixin',
      success: function(loginRes) {
        if (loginRes.code) {
          // 获取用户信息
          uni.getUserInfo({
            provider: 'weixin',
            success: function(infoRes) {
              // 请求服务端登录接口
              util.request('/api/auth/loginByWeixin', {
                code: loginRes.code,
                userInfo: infoRes
              }, 'POST').then(res => {
                // 修改判断条件，使用errno代替code
                if (res.errno === 0) {
                  // 存储用户信息
                  uni.setStorageSync('userInfo', res.data.userInfo);
                  uni.setStorageSync('token', res.data.token);
                  resolve(res);
                } else {
                  reject(res);
                }
              }).catch(err => {
                reject(err);
              });
            },
            fail: function(err) {
              reject(err);
            }
          });
        } else {
          reject(loginRes);
        }
      },
      fail: function(err) {
        reject(err);
      }
    });
  });
}

/**
 * 注册
 */
function register(username, password) {
  return new Promise(function(resolve, reject) {
    util.request('/api/auth/register', {
      username: username,
      password: password
    }, 'POST').then(res => {
      if (res.code === 0) {
        // 存储用户信息
        uni.setStorageSync('userInfo', res.data.userInfo);
        uni.setStorageSync('token', res.data.token);
        resolve(res);
      } else {
        reject(res);
      }
    }).catch(err => {
      reject(err);
    });
  });
}

/**
 * 判断用户是否登录
 */
function checkLogin() {
  return new Promise(function(resolve, reject) {
    if (uni.getStorageSync('userInfo') && uni.getStorageSync('token')) {
      util.checkSession().then(() => {
        resolve(true);
      }).catch(() => {
        reject(false);
      });
    } else {
      reject(false);
    }
  });
}

/**
 * 退出登录
 */
function logout() {
  uni.removeStorageSync('token');
  uni.removeStorageSync('userInfo');
}

export default {
  login,
  loginByWeixin,
  register,
  checkLogin,
  logout
};
