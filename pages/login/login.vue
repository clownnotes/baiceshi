<template>
  <view class="container">
    <view class="login-container">
      <view class="header">
        <text class="title">欢迎使用</text>
        <text class="subtitle">请登录您的账号以继续</text>
      </view>
      
      <view class="tab-container">
        <view :class="['tab-item', currentTab === 0 ? 'active' : '']" @click="switchTab(0)">登录</view>
        <view :class="['tab-item', currentTab === 1 ? 'active' : '']" @click="switchTab(1)">注册</view>
      </view>
      
      <!-- 登录表单 -->
      <view class="form-container" v-if="currentTab === 0">
        <view class="input-item">
          <uv-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefixIcon="account"
            clearable
          ></uv-input>
        </view>
        <view class="input-item">
          <uv-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefixIcon="lock"
            clearable
          ></uv-input>
        </view>
        <view class="btn-container">
          <uv-button type="primary" text="登录" @click="handleLogin" :loading="isLoading"></uv-button>
        </view>
        
        <!-- 微信登录按钮 -->
        <view class="wechat-login-container">
          <view class="divider">
            <view class="divider-line"></view>
            <view class="divider-text">其他登录方式</view>
            <view class="divider-line"></view>
          </view>
          <view class="wechat-btn" @click="handleWechatLogin">
            <image src="/static/images/wechat.png" mode="aspectFit" class="wechat-icon"></image>
            <text>微信登录</text>
          </view>
        </view>
      </view>
      
      <!-- 注册表单 -->
      <view class="form-container" v-else>
        <view class="input-item">
          <uv-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            prefixIcon="account"
            clearable
          ></uv-input>
        </view>
        <view class="input-item">
          <uv-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            prefixIcon="lock"
            clearable
          ></uv-input>
        </view>
        <view class="input-item">
          <uv-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            prefixIcon="lock"
            clearable
          ></uv-input>
        </view>
        <view class="btn-container">
          <uv-button type="primary" text="注册" @click="handleRegister" :loading="isLoading"></uv-button>
        </view>
      </view>
    </view>
    
    <uv-toast ref="uToast"></uv-toast>
  </view>
</template>

<script>
import userService from '../../services/user';

export default {
  data() {
    return {
      currentTab: 0, // 0: 登录, 1: 注册
      loginForm: {
        username: '',
        password: ''
      },
      registerForm: {
        username: '',
        password: '',
        confirmPassword: ''
      },
      isLoading: false
    };
  },
  methods: {
    switchTab(index) {
      this.currentTab = index;
    },
    
    // 处理登录
    handleLogin() {
      if (!this.validateLoginForm()) {
        return;
      }
      
      this.isLoading = true;
      userService.login(this.loginForm.username, this.loginForm.password)
        .then(res => {
          this.$refs.uToast.show({
            title: '登录成功',
            type: 'success',
            callback: () => {
              // 跳转到首页或之前的页面
              uni.switchTab({
                url: '/pages/index/index'
              });
            }
          });
        })
        .catch(err => {
          this.$refs.uToast.show({
            title: err.errmsg || '登录失败',  // 使用errmsg代替message
            type: 'error'
          });
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    
    // 处理微信登录
    handleWechatLogin() {
      this.isLoading = true;
      
      // 检查小程序的API环境
      uni.getProvider({
        service: 'oauth',
        success: (res) => {
          if (~res.provider.indexOf('weixin')) {
            userService.loginByWeixin()
              .then(res => {
                this.$refs.uToast.show({
                  title: '登录成功',
                  type: 'success',
                  callback: () => {
                    // 跳转到首页
                    uni.switchTab({
                      url: '/pages/index/index'
                    });
                  }
                });
              })
              .catch(err => {
                this.$refs.uToast.show({
                  title: err.message || '微信登录失败',
                  type: 'error'
                });
              })
              .finally(() => {
                this.isLoading = false;
              });
          } else {
            this.$refs.uToast.show({
              title: '当前环境不支持微信登录',
              type: 'warning'
            });
            this.isLoading = false;
          }
        },
        fail: () => {
          this.$refs.uToast.show({
            title: '获取登录服务供应商失败',
            type: 'error'
          });
          this.isLoading = false;
        }
      });
    },
    
    // 处理注册
    handleRegister() {
      if (!this.validateRegisterForm()) {
        return;
      }
      
      this.isLoading = true;
      userService.register(this.registerForm.username, this.registerForm.password)
        .then(res => {
          this.$refs.uToast.show({
            title: '注册成功',
            type: 'success',
            callback: () => {
              // 跳转到首页
              uni.switchTab({
                url: '/pages/index/index'
              });
            }
          });
        })
        .catch(err => {
          this.$refs.uToast.show({
            title: err.message || '注册失败',
            type: 'error'
          });
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    
    // 验证登录表单
    validateLoginForm() {
      if (!this.loginForm.username) {
        this.$refs.uToast.show({
          title: '请输入用户名',
          type: 'warning'
        });
        return false;
      }
      
      if (!this.loginForm.password) {
        this.$refs.uToast.show({
          title: '请输入密码',
          type: 'warning'
        });
        return false;
      }
      
      return true;
    },
    
    // 验证注册表单
    validateRegisterForm() {
      if (!this.registerForm.username) {
        this.$refs.uToast.show({
          title: '请输入用户名',
          type: 'warning'
        });
        return false;
      }
      
      if (this.registerForm.username.length < 3) {
        this.$refs.uToast.show({
          title: '用户名至少3个字符',
          type: 'warning'
        });
        return false;
      }
      
      if (!this.registerForm.password) {
        this.$refs.uToast.show({
          title: '请输入密码',
          type: 'warning'
        });
        return false;
      }
      
      if (this.registerForm.password.length < 6) {
        this.$refs.uToast.show({
          title: '密码至少6个字符',
          type: 'warning'
        });
        return false;
      }
      
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.$refs.uToast.show({
          title: '两次密码不一致',
          type: 'warning'
        });
        return false;
      }
      
      return true;
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  padding: 60rpx 40rpx;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-image: linear-gradient(to bottom, #f8f8f8, #ffffff);
}

.login-container {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.08);
}

.header {
  text-align: center;
  margin-bottom: 60rpx;
  
  .title {
    display: block;
    font-size: 48rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .subtitle {
    font-size: 28rpx;
    color: #999;
  }
}

.tab-container {
  display: flex;
  justify-content: center;
  margin-bottom: 50rpx;
  border-radius: 12rpx;
  background-color: #f7f7f7;
  padding: 6rpx;
  
  .tab-item {
    flex: 1;
    padding: 20rpx 0;
    font-size: 30rpx;
    text-align: center;
    color: #666;
    border-radius: 10rpx;
    transition: all 0.3s;
    
    &.active {
      color: #ffffff;
      font-weight: 500;
      background-color: #0095f6;
      box-shadow: 0 4rpx 12rpx rgba(0, 149, 246, 0.2);
    }
  }
}

.form-container {
  .input-item {
    margin-bottom: 30rpx;
    
    :deep(.uv-input) {
      border: 1px solid #eee;
      border-radius: 10rpx;
      padding: 6rpx 0;
    }
  }
  
  .btn-container {
    margin-top: 60rpx;
    
    :deep(.uv-button) {
      border-radius: 10rpx;
      height: 90rpx;
      font-size: 32rpx;
    }
  }
}

.wechat-login-container {
  margin-top: 60rpx;
  
  .divider {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;
    
    .divider-line {
      flex: 1;
      height: 1rpx;
      background-color: #e5e5e5;
    }
    
    .divider-text {
      padding: 0 30rpx;
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .wechat-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #07c160;
    padding: 20rpx 0;
    border-radius: 10rpx;
    
    .wechat-icon {
      width: 45rpx;
      height: 45rpx;
      margin-right: 15rpx;
    }
    
    text {
      font-size: 28rpx;
      color: #fff;
    }
  }
}
</style>
