<template>
	<view class="container">
		<!-- 搜索框部分 -->
		<view class="search-box">
			<uv-search
				v-model="keyword"
				:show-action="false"
				placeholder="搜索名片"
				:clearabled="true"
				@focus="toSearch"
			></uv-search>
		</view>
		
		<!-- 瀑布流部分 -->
		<view class="waterfall-container">
			<uv-waterfall 
				ref="waterfall"
				v-model="flowList"
				:add-time="10"
				:left-gap="gapSize"
				:right-gap="gapSize"
				:column-count="1"
				@changeList="changeList"
			>
				<!-- 单列数据 -->
				<template v-slot:list1>
					<!-- 为了磨平部分平台的BUG，必须套一层view -->
					<view>
						<view v-for="(item, index) in list1"
							:key="item.id"
							class="card-item"
							@click="toDetail(item)"
						>
							<view class="card-header">
								<view class="user-info" @click.stop="navigateToUserLook(item.uid)">
									<image class="avatar" :src="item.avatar" mode="aspectFill"></image>
									<view class="user-details">
										<text class="nickname">{{item.nickname}}</text>
									</view>
								</view>
								<view class="action-btn" @click.stop="addContact(item)">
									<text class="btn-text">关注</text>
								</view>
							</view>
							
							<view class="card-content">
								<view class="card-item__image-container" v-if="item.image">
									<image 
										class="card-item__image" 
										:src="item.image" 
										mode="aspectFill"
										@click.stop="previewImage(item.image)" 
									></image>
								</view>
								
								<view class="card-details">
									<view class="card-item__title">
										<text class="value">{{item.title || '个人名片'}}</text>
									</view>
									<view class="card-item__desc uv-line-2">
										<text class="value">{{item.desc || '暂无描述'}}</text>
									</view>
								</view>
								
								<!-- 联系信息区域-->
								<view class="contact-info">
									<uv-row gutter="10">
										<uv-col span="6">
											<view class="contact-item" @click.stop="copyContent(item.phone)">
												<uv-icon name="phone-fill" size="18" color="#666"></uv-icon>
												<text class="contact-text">{{item.phone || '未填写'}}</text>
											</view>
										</uv-col>
										<view class="contact-divider"></view>
										<uv-col span="6">
											<view class="contact-item" @click.stop="copyContent(item.wechat)">
												<uv-icon name="weixin-fill" size="18" color="#666"></uv-icon>
												<text class="contact-text">{{item.wechat || '未填写'}}</text>
											</view>
										</uv-col>
									</uv-row>
								</view>
								
								<!-- 标签区域 -->
								<view class="tags-container" v-if="item.tags && item.tags.length > 0">
									<view class="tag" v-for="(tag, tagIndex) in item.tags" :key="tagIndex">
										<text># {{tag}}</text>
									</view>
								</view>
							</view>
							
							<view class="card-footer">
								<view class="stat-item" @click.stop="handleLike(item)">
									<uv-icon 
										:name="item.isLiked ? 'heart-fill' : 'heart'" 
										:color="item.isLiked ? '#ff5500' : '#666'" 
										size="20"
									></uv-icon>
									<text class="stat-count">{{item.likes}}</text>
								</view>
								<view class="stat-item">
									<uv-icon name="eye" color="#666" size="20"></uv-icon>
									<text class="stat-count">{{item.views || 0}}</text>
								</view>
							</view>
						</view>
					</view>
				</template>
			</uv-waterfall>
			<!-- 加载更多提示 -->
			<view class="load-more" v-if="loadMoreStatus === 'loading'">加载中...</view>
			<view class="load-more" v-if="loadMoreStatus === 'nomore'">没有更多了</view>
		</view>
		
		<!-- 底部导航栏 -->
		<uv-tabbar 
			:value="current" 
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
	</view>
</template>

<script>
	import { guid } from '@/uni_modules/uv-ui-tools/libs/function/index.js';
	import userService from '../../services/user';
	import ENV_CONFIG from '../../config/config.js';
	
	export default {
		data() {
			return {
				current: 1,
				keyword: '', // 搜索关键词
				flowList: [], // 瀑布流数据列表
				list1: [], // 瀑布流单列数据
				loading: false, // 是否正在加载数据
				page: 1,
				pageSize: 10,
				gapSize: 10, // 左右边距
				userInfo: null, // 用户信息
				isLoggedIn: false, // 登录状态
				loadMoreStatus: 'loadmore', // 加载更多状态：loadmore-加载更多，loading-加载中，nomore-没有更多了
				hasMore: true, // 是否还有更多数据
				columnGap: 100 // 列间距，有问题
			}
		},
		computed: {
			// Remove the imageStyle computed property if it's no longer needed
		},
		onLoad() {
			this.getCardData();
			this.checkLoginStatus();
		},
		onReachBottom() {
			// 页面滚动到底部时加载更多数据
			if (this.hasMore && !this.loading) {
				this.getCardData();
			}
		},
		onShow() {
			// 每次显示页面时检查登录状态
			this.checkLoginStatus();
		},
		methods: {
			// 跳转到搜索页面
			toSearch() {
				uni.navigateTo({
					url: "/pages/notesearch/notesearch",
					animationType: 'slide-in-top',
					animationDuration: 300
				});
			},
			
			// 跳转到详情页面
			toDetail(item) {
				uni.navigateTo({
					url: '/pages/carddetail/carddetail?id=' + item.id
				});
			},
			
			// 跳转到用户查看页面
			navigateToUserLook(uid) {
				if (!uid) {
					console.warn('User ID is missing, cannot navigate.');
					uni.showToast({ title: '无法查看该用户', icon: 'none' });
					return;
				}
				uni.navigateTo({
					url: `/pages/userlook/userlook?uid=${uid}`
				});
			},
			
			// 这点非常重要：e.name在这里返回是list1，要手动将数据追加到相应列
			changeList(e) {
				this[e.name].push(e.value);
			},
			
			// 获取名片瀑布流数据
			getCardData() {
				if (this.loading || !this.hasMore) return;
				this.loading = true;
				this.loadMoreStatus = 'loading';
				
				// 使用实际API请求
				uni.request({
					url: ENV_CONFIG.API_BASE_URL + '/api/card/card',
					method: 'GET',
					data: {
						page: this.page,
						size: this.pageSize
					},
					success: (res) => {
						if (res.statusCode === 200 && res.data && res.data.errno === 0) {
							const cardData = res.data.data || [];
							
							// 确保返回的数据是数组
							const dataArray = Array.isArray(cardData) ? cardData : [cardData];
							
							if (dataArray.length > 0) {
								const processedData = this.processCardData(dataArray);
								this.flowList = [...this.flowList, ...processedData];
								this.page++;
								
								// 判断是否还有更多数据
								if (dataArray.length < this.pageSize) {
									this.hasMore = false;
									this.loadMoreStatus = 'nomore';
								} else {
									this.loadMoreStatus = 'loadmore';
								}
							} else {
								this.hasMore = false;
								this.loadMoreStatus = 'nomore';
							}
						} else {
							uni.showToast({
								title: '数据加载失败',
								icon: 'none'
							});
							this.loadMoreStatus = 'loadmore';
						}
					},
					fail: (err) => {
						console.error('获取名片数据失败:', err);
						uni.showToast({
							title: '网络请求失败',
							icon: 'none'
						});
						this.loadMoreStatus = 'loadmore';
					},
					complete: () => {
						this.loading = false;
					}
				});
			},
			
			// 获取随机标签
			getRandomTags() {
				const allTags = ['技术', '管理', '营销', '设计', '产品', '销售', '咨询', '教育', '金融', '医疗', '法律', '媒体'];
				const tagCount = Math.floor(Math.random() * 4) + 1;  // 1-4个标签
				const tags = [];
				
				for (let i = 0; i < tagCount; i++) {
					const tagIndex = Math.floor(Math.random() * allTags.length);
					if (!tags.includes(allTags[tagIndex])) {
						tags.push(allTags[tagIndex]);
					}
				}
				
				return tags;
			},
			
			// 处理API返回的名片数据
			processCardData(cardData) {
				// 处理API返回的数据，格式化为组件需要的结构
				return cardData.map(item => {
					// 处理标签，从sub_tags数组中提取name属性
					let tags = [];
					if (item.sub_tags && Array.isArray(item.sub_tags)) {
						// 如果标签超过4个，随机选择4个
						if (item.sub_tags.length > 4) {
							const shuffled = [...item.sub_tags].sort(() => 0.5 - Math.random());
							tags = shuffled.slice(0, 4).map(tag => tag.name);
						} else {
							tags = item.sub_tags.map(tag => tag.name);
						}
					}
					
					// 使用API返回的头像，若无则生成默认头像URL
					const avatarUrl = item.avatar || `https://zoj.oss-cn-shanghai.aliyuncs.com/peo/default_avatar.jpg`;
					
					// 处理职位和公司信息
					const position = item.position || '未填写职位';
					const company = item.company || '未填写公司';
					
					return {
						id: item.id,
						avatar: avatarUrl, // 使用处理后的头像
						nickname: item.nickname || item.name || `用户${item.uid}`, // 优先使用nickname，然后name，最后是默认值
						position: position,
						company: company,
						title: item.title || '未填写',
						desc: item.content || '暂无描述',
						phone: item.phone || '未填写',
						wechat: item.wechat || '未填写',
						image: item.top_pic_url || null,
						w: item.top_pic_width || 600,
						h: item.top_pic_length || 400,
						likes: parseInt(item.likes) || 0,
						views: parseInt(item.views) || 0,
						isLiked: Boolean(item.is_liked),
						tags: tags,
						uid: item.uid
					};
				});
			},
			
			// 添加点赞处理方法
			handleLike(item) {
				// 找到对应的项
				const index = this.flowList.findIndex(i => i.id === item.id);
				if (index !== -1) {
					const isLiked = this.flowList[index].isLiked;
					
					// 创建一个新对象来替换原来的对象，确保触发Vue的响应式更新
					this.flowList[index] = {
						...this.flowList[index],
						isLiked: !isLiked,
						likes: this.flowList[index].likes + (isLiked ? -1 : 1)
					};
					
					// 同时更新列中的数据
					const list1Index = this.list1.findIndex(i => i.id === item.id);
					if (list1Index !== -1) {
						this.list1[list1Index] = {
							...this.list1[list1Index],
							isLiked: !isLiked,
							likes: this.list1[list1Index].likes + (isLiked ? -1 : 1)
						};
					}
					
					this.$forceUpdate();
					
					// 实际开发中，这里可以添加API请求来保存点赞状态
				}
			},
			
			// 添加为联系人
			addContact(item) {
				if (!this.isLoggedIn) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					});
					setTimeout(() => {
						this.navigateToLogin();
					}, 1500);
					return;
				}
				
				// 模拟API请求
				setTimeout(() => {
					// 保留
					console.log('模拟添加联系人:', item.nickname);
				}, 100);
				
				// 实际开发中，这里应该调用API保存联系人
			},
			
			// 复制内容到剪贴板
			copyContent(content) {
				if (!content || content === '未填写') {
					uni.showToast({
						title: '没有可复制的内容',
						icon: 'none'
					});
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
			},
			
			// 添加图片预览方法
			previewImage(imageUrl) {
				if (!imageUrl) return;
				uni.previewImage({
					urls: [imageUrl],
					current: imageUrl
				});
			},
			
			// 检查登录状态
			checkLoginStatus() {
				userService.checkLogin().then(() => {
					try {
						const userInfoStr = uni.getStorageSync('userInfo');
						this.userInfo = typeof userInfoStr === 'string' ? JSON.parse(userInfoStr) : userInfoStr;
						this.isLoggedIn = true;
					} catch (e) {
						this.isLoggedIn = false;
					}
				}).catch(() => {
					this.isLoggedIn = false;
					this.userInfo = null;
				});
			},
			
			// 跳转到登录页
			navigateToLogin() {
				if (!this.isLoggedIn) {
					uni.navigateTo({
						url: '/pages/login/login'
					});
				}
			},
			
			// 切换底部导航栏
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
						uni.redirectTo({
							url: '/pages/user/user'
						});
						break;
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		padding-bottom: 120rpx; /* 底部导航栏预留空间 */
		background-color: #f8f8f8;
	}
	
	.header {
		padding: 30rpx 20rpx;
		background-color: #fff;
		text-align: center;
		border-bottom: 2rpx solid #f2f2f2;
		
		.title {
			font-size: 36rpx;
			font-weight: bold;
			color: #333;
		}
	}
	
	.search-box {
		padding: 20rpx;
		background-color: #fff;
		position: sticky;
		top: 0;
		z-index: 999;
	}
	
	.waterfall-container {
		padding: 0rpx;
	}
	
	.card-item {
		overflow: hidden;
		margin-top: 16rpx;
		margin-bottom: 4rpx;
		border-radius: 16rpx;
		background-color: #fff;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
		
		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20rpx;
			border-bottom: 2rpx solid #f8f8f8;
			
			.user-info {
				display: flex;
				align-items: center;
				cursor: pointer;
				
				.avatar {
					width: 80rpx;
					height: 80rpx;
					border-radius: 50%;
					margin-right: 20rpx;
				}
				
				.user-details {
					display: flex;
					flex-direction: column;
					justify-content: center;
					
					.nickname {
						font-size: 32rpx;
						color: #333;
						font-weight: bold;
					}
				}
			}
			
			.action-btn {
				padding: 16rpx 30rpx;
				background-color: #3c9cff;
				border-radius: 30rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				
				.btn-text {
					font-size: 26rpx;
					color: #fff;
					line-height: 1;
				}
			}
		}
		
		.card-content {
			padding: 20rpx;
			
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
				margin-bottom: 20rpx;
				
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
			
			.contact-info {
				margin-top: 0rpx;
				margin-bottom: 10rpx;
				padding: 20rpx;
				background-color: #f9f9f9;
				border-radius: 28rpx;
				position: relative;
				
				.contact-item {
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 4rpx 0;
					
					&:active {
						background-color: #f2f2f2;
						border-radius: 8rpx;
					}
					
					.contact-text {
						margin-left: 12rpx;
						font-size: 22rpx;
						color: #666;
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
			
			.tags-container {
				display: flex;
				flex-wrap: wrap;
				margin-top: 16rpx;
				
				.tag {
					background-color: #ecf5ff;
					color: #3c9cff;
					font-size: 24rpx;
					padding: 8rpx 20rpx;
					border-radius: 20rpx;
					margin-right: 16rpx;
					margin-bottom: 16rpx;
				}
			}
		}
		
		.card-footer {
			display: flex;
			padding: 20rpx;
			border-top: 2rpx solid #f8f8f8;
			
			.stat-item {
				display: flex;
				align-items: center;
				margin-right: 40rpx;
				padding: 8rpx 16rpx;
				border-radius: 30rpx;
				
				&:active {
					background-color: rgba(0,0,0,0.05);
				}
				
				.stat-count {
					font-size: 24rpx;
					color: #666;
					margin-left: 8rpx;
				}
			}
		}
	}
	
	.load-more {
		text-align: center;
		padding: 20rpx 0;
		color: #999;
		font-size: 26rpx;
	}
	
	.safe-area-bottom {
		height: 30rpx;
	}
</style>
