<template>
	<view class="user-container">
		<!-- 顶部个人信息区域 -->
		<view class="user-header">
			<!-- 背景图 - 点击展示全图 -->
			<view class="user-bg" :style="{ height: expandedBg ? '600rpx' : '250rpx' }" @click="toggleBgExpand">
				<image :src="backgroundImage" mode="aspectFill"></image>
				<!-- 设置按钮 -->
				<view class="setting-btn" @click.stop="toSetting">
					<uv-icon name="setting" color="#ffffff" size="22"></uv-icon>
				</view>
			</view>
			
			<!-- 用户信息区  -->
			<view class="user-info">
				<view class="user-info-header">
					<view class="avatar-box" @click="isLoggedIn ? toEditProfile() : handleWechatLogin()">
						<image class="avatar" :src="userInfo.avatar || '/static/images/default-avatar.png'" mode="aspectFill"></image>
					</view>
					<view class="info-header-content" @click="isLoggedIn ? toEditProfile() : handleWechatLogin()">
						<view class="username-row">
							<text class="username">{{ userInfo.nickname || '点击登录' }}</text>
						</view>
						<text class="user-id" v-if="userInfo.nickname && userInfo.uid">{{ 'UID: ' + userInfo.uid }}</text>
					</view>
				</view>
				
				<view class="signature">
					<text>{{userInfo.bio}}</text>
				</view>
			</view>
			
			<!-- 用户数据 -->
			<view class="user-data">
				<view class="data-item" @click="navigateTo('/pages/follows/follows')">
					<text class="data-count">{{ userData.followings_count }}</text>
					<text class="data-label">关注</text>
				</view>
				<view class="data-item" @click="navigateTo('/pages/fans/fans')">
					<text class="data-count">{{ userData.fans_count }}</text>
					<text class="data-label">粉丝</text>
				</view>
				<view class="data-item" @click="navigateTo('/pages/likes/likes')">
					<text class="data-count">{{ userData.likes_count }}</text>
					<text class="data-label">获赞</text>
				</view>
			</view>
			
			 <!-- 信息栏 - 手机号和微信号 -->
			<view class="user-contact">
					<uv-row gutter="10">
						<uv-col span="6">
							<view class="contact-item" @click="copyContent(userInfo.mobile)">
								<uv-icon name="phone-fill" size="18" color="#666"></uv-icon>
								<text>{{ userInfo.mobile }}</text>
							</view>
						</uv-col>
							<view class="contact-divider"></view>
						<uv-col span="6">
							<view class="contact-item" @click="copyContent(userInfo.wechat_id)">
								<uv-icon name="weixin-fill" size="18" color="#666"></uv-icon>
								<text>{{ userInfo.wechat_id }}</text>
							</view>
						</uv-col>
					</uv-row>
				</view>
			
			<!-- 操作按钮区 -->
			<view class="action-btns">
				<view class="edit-btn" @click="isLoggedIn ? toEditProfile() : handleWechatLogin()">
					<text>编辑资料</text>
				</view>
				<view class="share-btn" @click="shareProfile">
					<uv-icon name="share" size="18" color="#666"></uv-icon>
					<text>分享</text>
				</view>
			</view>
		</view>
		
		<!-- 设置列表区域  -->
		 
		<view class="settings-section">
			<uv-list border-color="#eeeeee" :border="true">
				<uv-list-item :border="true"
					title="账号设置"
					clickable
					@click="navigateTo('/pages/account-settings/account-settings')"
					:show-extra-icon="true" 
					:extra-icon="{icon: 'setting-fill', color: '#606266', size: '22'}"
					show-arrow
				>
				</uv-list-item>

				<uv-list-item :border="true"
					title="我的钱包"
					clickable
					@click="navigateTo('/pages/wallet/wallet')"
					:show-extra-icon="true"
					:extra-icon="{icon: 'red-packet', color: '#606266', size: '22'}"
					show-arrow
				>
				</uv-list-item>
				
				<uv-list-item :border="true"
					title="获取邀请码"
					clickable
					@click="navigateTo('/pages/invite/invite')"
					:show-extra-icon="true"
					:extra-icon="{icon: 'gift-fill', color: '#606266', size: '22'}"
					show-arrow
					right-text="有奖励"
				>
				</uv-list-item>
				
				<uv-list-item :border="true"
					title="认证中心"
					clickable
					@click="navigateTo('/pages/auth-center/auth-center')"
					:show-extra-icon="true"
					:extra-icon="{icon: 'checkmark-circle-fill', color: '#606266', size: '22'}"
					show-arrow
				>
				</uv-list-item>
				
				<uv-list-item :border="true"
					title="用户协议"
					clickable
					@click="navigateTo('/pages/agreement/agreement')"
					:show-extra-icon="true"
					:extra-icon="{icon: 'file-text-fill', color: '#606266', size: '22'}"
					show-arrow
				>
				</uv-list-item>
				
				<uv-list-item :border="true"
					title="联系客服"
					clickable
					@click="contactCustomerService"
					:show-extra-icon="true"
					:extra-icon="{icon: 'server-man', color: '#606266', size: '22'}"
					show-arrow
					right-text="9:00-18:00"
				>
				</uv-list-item>
				
			</uv-list>
		</view>
		
		<view class="button-wrapper submit-bar" v-if="!isLoggedIn">
			<uv-button 
				type="success" 
				icon="weixin-fill" 
				iconColor="#ffffff"
				@click="handleWechatLogin"
				size="large"
				shape="circle"
				:customStyle="{ height: '90rpx', fontWeight: '600' }"
			>
				微信一键登录
			</uv-button>
		</view>
		
		<view class="button-wrapper submit-bar" v-if="isLoggedIn">
			<view 
				class="logout-btn" 
				@click.stop="handleLogout"
			>
				退出登录
			</view>
		</view>
		
		<!-- 底部安全区域 -->
		<view class="safe-area-bottom"></view>
		
		<!-- 底部导航栏 -->
		<uv-tabbar 
			:value="4" 
			:fixed="true" 
			:safeAreaInsetBottom="true"
			@change="tabChange"
			:height="50"
		>
			<uv-tabbar-item text="日常" icon="account" ></uv-tabbar-item>
			<uv-tabbar-item text="人脉" icon="grid"></uv-tabbar-item>
			<uv-tabbar-item text="发布" icon="plus-circle-fill"></uv-tabbar-item>
			<uv-tabbar-item text="消息" icon="chat"></uv-tabbar-item>
			<uv-tabbar-item text="个人" icon="account-fill"></uv-tabbar-item>
		</uv-tabbar>
		
		<uv-toast ref="uToast"></uv-toast>
		<uv-modal
			:show="showLogoutConfirm"
			title="退出登录"
			content="确定要退出登录吗？"
			showCancelButton
			@confirm="confirmLogout"
			@cancel="showLogoutConfirm = false"
		></uv-modal>
	</view>
</template>

<script>
import userService from '../../services/user';
import config from '../../config/config';

export default {
	data() {
		return {
			expandedBg: false, // 控制背景图是否展开
			userInfo: {},
			isLoggedIn: false,
			showLogoutConfirm: false,
			userData: {
				followings_count: 0,
				fans_count: 0,
				likes_count: 0
			},
			backgroundImage: '' // 新增：背景图URL
		}
	},
	onShow() {
		this.getUserInfo();
		this.getRandomBackgroundImage(); // 新增：获取随机背景图
	},
	methods: {
		// 获取随机背景图
		getRandomBackgroundImage() {
			uni.request({
				url: `${config.API_BASE_URL}/api/public/image?category=profile&mode=random`,
				method: 'GET',
				success: (res) => {
					if (res.data && res.data.errno === 0 && res.data.data.images && res.data.data.images.length > 0) {
						this.backgroundImage = res.data.data.images[0].image_url;
					} else {
						// 使用默认背景图
						this.backgroundImage = 'https://zoj.oss-cn-shanghai.aliyuncs.com/public/profile3.jpg';
					}
				},
				fail: () => {
					// 请求失败时使用默认背景图
					this.backgroundImage = 'https://zoj.oss-cn-shanghai.aliyuncs.com/public/profile3.jpg';
				}
			});
		},
		
		// 获取用户信息
		getUserInfo() {
			try {
				const userInfoStr = uni.getStorageSync('userInfo');
				if (userInfoStr) {
					this.userInfo = typeof userInfoStr === 'string' ? JSON.parse(userInfoStr) : userInfoStr;
					this.isLoggedIn = true;
					
					// 登录状态，从API获取最新用户数据
					this.fetchUserData();
				} else {
					this.userInfo = {
						nickname: '点击登录',
						avatar: 'https://zoj.oss-cn-shanghai.aliyuncs.com/peo/default_avatar.jpg'
					};
					this.isLoggedIn = false;
				}
			} catch (e) {
				this.isLoggedIn = false;
				this.userInfo = {
					nickname: '点击登录',
					avatar: 'https://zoj.oss-cn-shanghai.aliyuncs.com/peo/default_avatar.jpg'
				};
			}
		},
		
		// 从API获取用户数据
		fetchUserData() {
			uni.request({
				url: `${config.API_BASE_URL}/api/user/user?ishome=1`,
				method: 'GET',
				header: {
					'X-Nideshop-Token': uni.getStorageSync('token') || ''
				},
				success: (res) => {
					if (res.data && res.data.errno === 0) {
						const apiData = res.data.data;
						
						// 更新用户信息
						this.userInfo = {
							...this.userInfo,
							id: apiData.id,
							uid: apiData.uid,
							username: apiData.username,
							// 修改：如果返回的昵称为"微信用户"，则替换成"点击编辑昵称"
							nickname: apiData.nickname === '微信用户' ? '点击编辑昵称' : (apiData.nickname || '点击编辑昵称'),
							// 修改：确保从API获取数据失败或无头像时，使用新的默认头像
							avatar: apiData.avatar || 'https://zoj.oss-cn-shanghai.aliyuncs.com/peo/default_avatar.jpg',
							bio: apiData.personal_intro || '暂无签名',
							mobile: apiData.mobile || '未绑定',
							wechat_id: apiData.wechat_id || '未绑定',
							gender: apiData.gender || 0,
							birthday: apiData.birthday || 0
						};
						
						// 更新统计数据
						this.userData = {
							followings_count: apiData.followings_count || 0,
							fans_count: apiData.fans_count || 0,
							likes_count: apiData.likes_count || 0
						};
						
						// 更新本地存储的用户信息
						uni.setStorageSync('userInfo', JSON.stringify(this.userInfo));
					}
				},
				fail: (err) => {
					console.error('获取用户数据失败', err);
				}
			});
		},
		
		// 切换背景图展开/收起状态
		toggleBgExpand() {
			this.expandedBg = !this.expandedBg;
		},
		
		// 前往设置页面
		toSetting() {
			uni.navigateTo({
				url: '/pages/settings/settings'
			});
		},
		
		// 前往编辑资料页面
		toEditProfile() {
			uni.navigateTo({
				url: '/pages/edit-profile/edit-profile'
			});
		},
		
		// 分享个人主页
		shareProfile() {
			uni.showToast({
				title: '分享功能开发中',
				icon: 'none'
			});
		},
		
		// 联系客服
		contactCustomerService() {
			uni.showActionSheet({
				itemList: ['在线客服', '电话咨询'],
				success: (res) => {
					if (res.tapIndex === 0) {
						// 跳转到在线客服页面
						this.navigateTo('/pages/customer-service/online-service');
					} else if (res.tapIndex === 1) {
						// 拨打客服电话
						uni.makePhoneCall({
							phoneNumber: '400-123-4567',
							fail: () => {
								uni.showToast({
									title: '拨打失败',
									icon: 'none'
								});
							}
						});
					}
				}
			});
		},
		
		// 通用导航方法
		navigateTo(url) {
			uni.navigateTo({
				url: url
			});
		},
		
		// 导航到登录页面
		navigateToLogin() {
			if (!this.isLoggedIn) {
				uni.navigateTo({
					url: '/pages/login/login'
				});
			}
		},
		
		// 处理微信登录
		handleWechatLogin() {
			// 检查小程序的API环境
			uni.getProvider({
				service: 'oauth',
				success: (res) => {
					if (~res.provider.indexOf('weixin')) {
						userService.loginByWeixin()
							.then(res => {
								// 登录成功后，关闭所有页面，跳转到首页
								uni.reLaunch({
									url: '/pages/index/index',
									success: () => {
									},
									fail: (err) => {
										this.$refs.uToast.show({
											message: '登录成功，但页面跳转失败',
											type: 'warning'
										});
										this.getUserInfo(); 
									}
								});
							})
							.catch(err => {
								this.$refs.uToast.show({
									message: err.message || '微信登录失败',
									type: 'error'
								});
							});
					} else {
						this.$refs.uToast.show({
							message: '当前环境不支持微信登录',
							type: 'warning'
						});
					}
				},
				fail: () => {
					this.$refs.uToast.show({
						message: '获取登录服务供应商失败',
						type: 'error'
					});
				}
			});
		},
		
		tabChange(index) {
			this.current = index;
			// 根据index处理对应的页面逻辑
			switch(index) {
				case 0: // 日常
					uni.redirectTo({
						url: '/pages/index/index'
					});
					break;
				case 1: // 人脉
					uni.redirectTo({
						url: '/pages/peocard/peocard'
					});
					break;
				case 2: // 发布
					uni.redirectTo({
						url: '/pages/notepublish/notepublish'
					});
					break;
				case 3: // 消息
					uni.redirectTo({
						url: '/pages/notifications/notifications'
					});
					break;
				case 4: // 个人
					break;
			}
		},
		
		// 点击退出登录
		handleLogout() {
			console.log('退出登录按钮被点击');
			this.doLogout(); // 执行退出登录操作
		},
		
		// 执行实际退出操作
		doLogout() {	
			console.log('开始执行退出登录');
			
			uni.showLoading({
				title: '退出中...'
			});
			
			// 1. 移除本地存储
			try {
				uni.removeStorageSync('token');
				uni.removeStorageSync('userInfo');
				console.log('Token和用户信息已移除');
			} catch (e) {
				console.error('移除本地存储失败:', e);
			}
			
			try {
				// 确保 userService.logout() 被正确调用
				userService.logout(); 
				console.log('登出服务调用成功');
			} catch (e) {	
				console.error('登出服务调用失败:', e);
			}
			
			uni.hideLoading();
					
			this.$refs.uToast.show({
				message: '已退出登录',
				type: 'success',
				duration: 1500
			});
			
			this.userInfo = {
				nickname: '点击登录',
				avatar: 'https://zoj.oss-cn-shanghai.aliyuncs.com/peo/default_avatar.jpg'
			};
			this.isLoggedIn = false;
			
			this.userData = {
				followings_count: 0,
				fans_count: 0,
				likes_count: 0
			};
			

			console.log('退出登录流程完成，isLoggedIn:', this.isLoggedIn);
		}
	}
}
</script>

<style lang="scss" scoped>
.user-container {
	min-height: 100vh;
	background-color: #f8f8f8;
	padding-bottom: 120rpx; /* 底部导航栏预留空间 */
}

.user-header {
	background-color: #fff;
	border-radius: 0 0 30rpx 30rpx;
	padding-bottom: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.user-bg {
	height: 300rpx;
	position: relative;
	overflow: hidden;
	transition: height 0.3s ease;
	
	image {
		width: 100%;
		height: 100%;
		display: block;
	}
	
	.setting-btn {
		position: absolute;
		top: 60rpx;
		right: 30rpx;
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background-color: rgba(0, 0, 0, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
	}
	
	.expand-hint {
		position: absolute;
		bottom: 20rpx;
		left: 50%;
		transform: translateX(-50%);
		background-color: rgba(0, 0, 0, 0.3);
		padding: 6rpx 20rpx;
		border-radius: 30rpx;
		display: flex;
		align-items: center;
		
		text {
			color: #fff;
			font-size: 24rpx;
			margin-left: 8rpx;
		}
	}
}

.user-info { /* 用户信息区域，头像上边距 */
	margin-top: -48rpx;
	padding: 0 46rpx;
	position: relative;
	z-index: 5;
	
	.user-info-header {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
	}
	
	.avatar-box {
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		border: 6rpx solid #fff;
		overflow: hidden;
		flex-shrink: 0;
	}
	
	.avatar {
		width: 100%;
		height: 100%;
		display: block;
	}
	
	.info-header-content {
		margin-left: 28rpx;
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		height: 130rpx; 
	}
	
	.username-row {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
	}
	
	.username {
		font-size: 39rpx;
		font-weight: 600;
		color: #333;
		margin-right: 15rpx;
	}
	
	.user-id {
		font-size: 24rpx;
		color: #999;
		display: block;
	}
	
	.signature {
		font-size: 28rpx;
		color: #666;
		margin: 0 20rpx;
		line-height: 1.4;
		margin-bottom: 20rpx;
	}
}

.user-contact {
	padding: 14rpx 30rpx 14rpx;
	margin: 0 30rpx 1rpx;
	background-color: #f9f9f9;
	border-radius: 35rpx;
	position: relative;
	
	.contact-item {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 10rpx 0;
		position: relative;
		
		text {
			font-size: 28rpx;
			color: #666;
			margin-left: 8rpx;
		}
		
		.copy-hint {
			position: absolute;
			right: 10rpx;
			font-size: 20rpx;
			color: #999;
			background-color: rgba(0, 0, 0, 0.05);
			padding: 2rpx 10rpx;
			border-radius: 10rpx;
		}
	}
	
	.contact-divider {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 2rpx;
		height: 40rpx;
		background-color: #ddd;
	}
}

.user-data {
	display: flex;
	padding: 0 64rpx;
	margin-bottom: 30rpx;
	
	.data-item {
		margin-right: 60rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		
		.data-count {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 4rpx;
		}
		
		.data-label {
			font-size: 24rpx;
			color: #999;
		}
	}
}

.action-btns {
	display: flex;
	padding: 14rpx 30rpx;
	
	.edit-btn {
		width: 65%;
		height: 76rpx;
		background-color: #f5f5f5;
		border-radius: 35rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
		
		text {
			font-size: 28rpx;
			color: #333;
			font-weight: 500;
		}
	}
	
	.share-btn {
		width: 35%; 
		height: 76rpx;
		background-color: #f5f5f5;
		border-radius: 35rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		
		text {
			font-size: 28rpx;
			color: #333;
		}
	}
}

/* 新增设置列表标题样式 */
.section-title {
	display: flex;
	align-items: center;
	padding: 30rpx 30rpx 10rpx;
	
	text {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		margin-left: 10rpx;
	}
}

/* 设置列表区域样式 */
.settings-section {
	margin: 0 20rpx 20rpx;
	border-radius: 16rpx;
	overflow: hidden;
	background-color: #ffffff;
	
	:deep(.uv-list-item) {
		padding: 15rpx 14rpx;
	}
	
	:deep(.uv-list-item__title) {
		font-size: 30rpx;
		font-weight: 500;
		margin-left: 10rpx;
	}
	
	:deep(.uv-list-item__right-text) {
		font-size: 24rpx;
		color: #999;
	}
	
	:deep(.uv-list-item__extra-icon) {
		margin-right: 12rpx;
	}
	
	/* 增加列表项之间的分割线 */
	:deep(.uv-list--border-bottom) {
		border-bottom: 1px solid #eeeeee;
	}
	
	/* 最后一个列表项不显示分割线 */
	:deep(.uv-list__item:last-child .uv-list--border-bottom) {
		border-bottom: none;
	}
}

.safe-area-bottom {
	height: 30rpx;
}

/* 修改：调整 button-wrapper 样式，添加 submit-bar 样式 */
.button-wrapper {
	// 可以根据需要添加样式
}

.submit-bar {
	padding: 10rpx 30rpx 30rpx; /* 调整padding以匹配notepublish */
}

.logout-btn {
	width: 100%;
	height: 90rpx;
	background-color: #ff4d4f;
	color: #fff;
	font-size: 32rpx;
	font-weight: 600;
	border-radius: 45rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>
