<script>
import CONFIG from './config/config.js';
import userService from './services/user.js';

export default {
  onLaunch: function() {
    console.log('App Launch');
    
    // 将API基础URL存储到本地，以便全局使用
    uni.setStorageSync('API_BASE_URL', CONFIG.API_BASE_URL);
    
    // 检查登录状态
    this.checkLoginStatus();

    try {
      // 读取本地存储的用户信息和token
      const userInfo = uni.getStorageSync('userInfo');
      const token = uni.getStorageSync('token');
      
      if (userInfo && token) {
        // 如果有登录信息，更新状态
        if (this.$store && this.$store.commit) {
          this.$store.commit('updateUserInfo', JSON.parse(userInfo));
          this.$store.commit('updateToken', token);
        }
      } else {
        // 尝试微信自动登录（如在小程序中）
        this.autoWechatLogin();
      }
    } catch (e) {
      console.log(e);
    }
  },
  onShow: function() {
    console.log('App Show');
  },
  onHide: function() {
    console.log('App Hide');
  },
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const token = uni.getStorageSync('token');
      if (!token) {
        console.log('用户未登录');
        // 如果需要强制登录，可以在这里跳转到登录页
      } else {
        console.log('用户已登录');
        // 验证token有效性，可以发送请求到服务器验证
        userService.checkLogin().then(() => {
          console.log('登录状态有效');
        }).catch(() => {
          console.log('登录已过期');
          // 清除登录信息
          uni.removeStorageSync('token');
          uni.removeStorageSync('userInfo');
          
          // 提示用户重新登录，短暂显示后消失
          uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none',
            duration: 2000
          });
        });
      }
    },
    
    // 尝试微信自动登录
    autoWechatLogin() {
      // 检查是否在小程序环境
      if (uni.canIUse('getAccountInfoSync')) {
        const accountInfo = uni.getAccountInfoSync();
        // 仅在微信环境下尝试自动登录
        if (accountInfo && accountInfo.miniProgram && accountInfo.miniProgram.appId) {
          // 获取当前环境下支持的登录方式
          uni.getProvider({
            service: 'oauth',
            success: (res) => {
              if (~res.provider.indexOf('weixin')) {
                // 不直接调用登录，而是获取登录态信息，需要用户主动登录
                console.log('当前环境支持微信登录');
              }
            }
          });
        }
      }
    }
  }
};
</script>

<style>
	/* 字体修改考虑 */
	/* @font-face {
		font-family: 'HarmonyOS Sans';
		src: url('/static/fonts/HarmonyOS_Sans_SC_Regular.ttf') format('truetype');
		font-weight: normal;
		font-style: normal;
	}
	
	@font-face {
		font-family: 'HarmonyOS Sans';
		src: url('/static/fonts/HarmonyOS_Sans_SC_Bold.ttf') format('truetype');
		font-weight: bold;
		font-style: normal;
	}
	
	@font-face {
		font-family: 'HarmonyOS Sans';
		src: url('/static/fonts/HarmonyOS_Sans_SC_Medium.ttf') format('truetype');
		font-weight: 500;
		font-style: normal;
	}
	
	@font-face {
		font-family: 'HarmonyOS Sans';
		src: url('/static/fonts/HarmonyOS_Sans_SC_Light.ttf') format('truetype');
		font-weight: 300;
		font-style: normal;
	}
	
	page, view, text, button, input, textarea, uni-input, uni-textarea {
		font-family: 'HarmonyOS Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
	} */
</style>
