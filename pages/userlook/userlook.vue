<template>
	<view class="user-container">
		<!-- 顶部个人信息区域 -->
		<view class="user-header">
			<!-- 背景图 - 点击展示全图 -->
			<view class="user-bg" :style="{ height: expandedBg ? '600rpx' : '250rpx' }" @click="toggleBgExpand">
				<image :src="userInfo.background || backgroundImage" mode="aspectFill"></image>
			</view>

			<!-- 用户信息区  -->
			<view class="user-info">
				<view class="user-info-header">
					<view class="avatar-box">
						<image class="avatar"
							:src="userInfo.avatar || 'https://zoj.oss-cn-shanghai.aliyuncs.com/peo/default_avatar.jpg'"
							mode="aspectFill"></image>
					</view>
					<view class="info-header-content">
						<view class="username-row">
							<text class="username">{{ userInfo.nickname || '未知用户' }}</text>
						</view>
						<text class="user-id" v-if="userInfo.uid">{{ 'UID: ' + userInfo.uid || 'UID: UID'}}</text>
					</view>
				</view>

				<view class="signature">
					<text>{{ userInfo.bio || '暂无简介' }}</text>
				</view>
			</view>

			<!-- 用户数据 -->
			<view class="user-data">
				<view class="data-item" @click="navigateTo('/pages/follows/follows?uid=' + uid)">
					<text class="data-count">{{ userData.followings_count }}</text>
					<text class="data-label">关注</text>
				</view>
				<view class="data-item" @click="navigateTo('/pages/fans/fans?uid=' + uid)">
					<text class="data-count">{{ userData.fans_count }}</text>
					<text class="data-label">粉丝</text>
				</view>
				<view class="data-item" @click="navigateTo('/pages/likes/likes?uid=' + uid)">
					<text class="data-count">{{ userData.likes_count }}</text>
					<text class="data-label">获赞</text>
				</view>
			</view>

			<!-- 名片板块 -->
			<view class="user-card" v-if="cardInfo.id">
				<view class="card-content">
					<view class="card-header">
						<text class="card-title-text">名片展示</text>
					</view>
					
					<view class="card-divider"></view>

					<view class="card-item__image-container" v-if="cardInfo.image">
						<image class="card-item__image" :src="cardInfo.image" mode="aspectFill"
							@click.stop="previewImage(cardInfo.image)"></image>
					</view>

					<view class="card-details">
						<view class="card-item__title">
							<text class="value">{{ cardInfo.title || '个人名片' }}</text>
						</view>
						<view class="card-item__desc uv-line-2">
							<text class="value">{{ cardInfo.desc || '暂无描述' }}</text>
						</view>
					</view>

					<!-- 标签区域 -->
					<view class="tags-container" v-if="cardInfo.tags && cardInfo.tags.length > 0">
						<view class="tag" v-for="(tag, tagIndex) in cardInfo.tags" :key="tagIndex">
							<text># {{ tag.name || tag }}</text>
						</view>
					</view>
				</view>
			</view>
			<!-- 如果没有名片数据则显示占位符 -->
			<view class="user-card" v-else>
				<view class="card-content">
					<view class="card-header">
						<text class="card-title-text">名片展示</text>
					</view>
					<view class="card-divider"></view>
					<view class="card-details">
						<text>该用户暂未创建名片</text>
					</view>
				</view>
			</view>

			<!-- 信息栏 - 手机号和微信号 -->
			<view class="user-contact">
				<uv-row gutter="10">
					<uv-col span="6">
						<view class="contact-item" @click="copyContent(userInfo.mobile)">
							<uv-icon name="phone-fill" size="18" color="#666"></uv-icon>
							<text>{{ userInfo.mobile || '未公开' }}</text>
						</view>
					</uv-col>
					<view class="contact-divider"></view>
					<uv-col span="6">
						<view class="contact-item" @click="copyContent(userInfo.wechat_id)">
							<uv-icon name="weixin-fill" size="18" color="#666"></uv-icon>
							<text>{{ userInfo.wechat_id || '未公开' }}</text>
						</view>
					</uv-col>
				</uv-row>
			</view>
		</view>

		<!-- 底部安全区域 -->
		<view class="safe-area-bottom"></view>

		<uv-toast ref="uToast"></uv-toast>
	</view>
</template>

<script>
import config from '../../config/config';

export default {
	data() {
		return {
			uid: null,
			expandedBg: false,
			userInfo: {
				nickname: '',
				avatar: 'https://zoj.oss-cn-shanghai.aliyuncs.com/peo/default_avatar.jpg',
				uid: '',
				bio: '',
				mobile: '',
				wechat_id: '',
				background: ''
			},
			userData: {
				followings_count: 0,
				fans_count: 0,
				likes_count: 0
			},
			cardInfo: {
				id: null, // 添加 id 用于检查名片数据是否存在
				title: '',
				desc: '',
				image: null,
				tags: []
			},
			backgroundImage: '' // 新增：背景图URL
		}
	},
	onLoad(options) {
		// 从页面参数获取目标用户ID，如果不存在则默认为 '1'
		this.uid = options.uid || '1';
		this.fetchTargetUserData(this.uid);
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
		
		// 从API获取目标用户数据和名片数据
		fetchTargetUserData(uid) {
			uni.showLoading({ title: '加载中...' });
			// 获取用户信息
			uni.request({
				url: `${config.API_BASE_URL}/api/card/card?uid=${uid}`,
				method: 'GET',
				success: (res) => {
					if (res.data && res.data.errno === 0) {
						const apiData = res.data.data;
						
						// 更新用户信息
						this.userInfo = {
							id: apiData.id,
							uid: apiData.uid,
							username: apiData.username,
							nickname: apiData.nickname || '用户',
							avatar: apiData.avatar || 'https://zoj.oss-cn-shanghai.aliyuncs.com/peo/default_avatar.jpg',
							bio: apiData.personal_intro || '暂无简介',
							mobile: apiData.phone || '未公开',
							wechat_id: apiData.wechat || '未公开',
							gender: apiData.gender || 0,
							birthday: apiData.birthday || 0,
							background: apiData.background_image || this.backgroundImage // 修改：使用API或随机背景图
						};
						
						// 更新统计数据
						this.userData = {
							followings_count: apiData.followings_count || 0,
							fans_count: apiData.fans_count || 0,
							likes_count: apiData.likes_count || 0
						};

						this.fetchCardData(uid);
					} else {
						uni.hideLoading();
						this.$refs.uToast.show({ title: res.data.errmsg || '加载用户数据失败', type: 'error' });
					}
				},
				fail: (err) => {
					uni.hideLoading();
					console.error('获取用户数据失败', err);
					this.$refs.uToast.show({ title: '网络错误，请稍后重试', type: 'error' });
				}
			});
		},

		// 获取名片数据
		fetchCardData(uid) {
			// 使用页面参数中的 uid 作为名片 API 的 uid
			uni.request({
				url: `${config.API_BASE_URL}/api/card/card?uid=${uid}`,
				method: 'GET',
				success: (cardRes) => {
					uni.hideLoading();
					if (cardRes.data && cardRes.data.errno === 0 && cardRes.data.data) {
						const cardApiData = cardRes.data.data;
						this.cardInfo = {
							id: cardApiData.id,
							title: cardApiData.title || '个人名片',
							desc: cardApiData.content || '暂无描述',
							image: cardApiData.top_pic_url || null,
							tags: cardApiData.sub_tags || []
						};
					} else if (cardRes.data && cardRes.data.errno !== 0) {
						console.warn('获取名片数据失败:', cardRes.data.errmsg);
						this.cardInfo = { id: null, title: '', desc: '', image: null, tags: [] };
					} else {
						console.warn('获取名片数据：返回格式不正确或无数据');
						this.cardInfo = { id: null, title: '', desc: '', image: null, tags: [] };
					}
				},
				fail: (cardErr) => {
					uni.hideLoading();
					console.error('获取名片数据失败', cardErr);
					this.cardInfo = { id: null, title: '', desc: '', image: null, tags: [] }; 
				}
			});
		},
		
		toggleBgExpand() {
			this.expandedBg = !this.expandedBg;
		},
		
		navigateTo(url) {
			uni.navigateTo({
				url: url
			});
		},
		
		// 预览图片
		previewImage(image) {
			if (!image) return;
			uni.previewImage({
				urls: [image],
				current: image
			});
		},
		
		// 复制内容到剪贴板
		copyContent(content) {
			if (!content || content === '未公开' || content === '未填写' || content === '未绑定') {
				uni.showToast({ title: '没有可复制的内容', icon: 'none' });
				return;
			}
			uni.setClipboardData({
				data: content,
				success: () => {
					uni.showToast({
						title: '已复制到剪贴板',
						icon: 'none'
					});
				}
			});
		}
	}
}
</script>

<style lang="scss" scoped>
.user-container {
	min-height: 100vh;
	background-color: #f8f8f8;
}

.user-header {
	background-color: #fff;
	border-radius: 0 0 30rpx 30rpx;
	padding-bottom: 40rpx;
	margin-bottom: 30rpx;
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

.user-info {
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
		font-size: 30rpx;
		color: #666;
		margin: 0 20rpx;
		line-height: 1.5;
		margin-bottom: 30rpx;
	}
}

/* 用户联系信息 */
.user-contact {
	padding: 20rpx 30rpx;
	margin: 0rpx 30rpx 1rpx;
	background-color: #f9f9f9;
	border-radius: 35rpx;
	
	.contact-item {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 12rpx 0;
		
		text {
			font-size: 30rpx;
			color: #666;
			margin-left: 12rpx;
		}
	}
	
	.contact-divider {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 2rpx;
		height: 45rpx;
		background-color: #ddd;
	}
}

.user-data {
	display: flex;
	padding: 0 64rpx;
	margin-bottom: 40rpx;
	
	.data-item {
		margin-right: 70rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		
		.data-count {
			font-size: 34rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 6rpx;
		}
		
		.data-label {
			font-size: 26rpx;
			color: #999;
		}
	}
}

/* 新增名片板块样式 */
.user-card {
	padding: 35rpx 20rpx;
	margin: 0 30rpx 25rpx;
	background-color: #f9f9f9;
	border-radius: 35rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);

	.card-content {
			padding: 2rpx;

			.card-header {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 12rpx;
				
				.card-title-text {
					font-weight: 700;
					font-size: 32rpx;
					color: #333;
				}
			}
			
			.card-divider {
				height: 1rpx;
				background-color: #eeeeee;
				margin: 0 0 20rpx 0;
			}
			
			.card-item__image-container {
				width: 100%;
				position: relative;
				padding-top: 56.25%;
				margin-bottom: 20rpx;
				overflow: hidden;
				border-radius: 16rpx;
				background-color: #f0f0f0;
			}
			
			.card-item__image {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				object-fit: cover;
				display: block;
			}
			
			.card-details {
				margin-bottom: 15rpx;
				
				.card-item__title {
					margin-bottom: 10rpx;
					line-height: 48rpx;
					font-weight: 700;
					
					.value {
						font-size: 34rpx;
						color: #333;
					}
				}
				
				.card-item__desc {
					.value {
						font-size: 28rpx;
						color: #666;
						line-height: 1.6;
					}
				}
			}
			
			.tags-container {
				display: flex;
				flex-wrap: wrap;
				margin-top: 12rpx;
				
				.tag {
					background-color: #ecf5ff;
					color: #3c9cff;
					font-size: 24rpx;
					padding: 8rpx 20rpx;
					border-radius: 20rpx;
					margin-right: 16rpx;
					margin-bottom: 12rpx;
				}
			}
	}
}

.safe-area-bottom {
	height: 30rpx;
}
</style>
