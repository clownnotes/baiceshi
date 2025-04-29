<template>
	<view class="container">
		<!-- 轮播图部分 - 添加动态样式控制显示隐藏 -->
		<view class="banner-container" :style="{
			opacity: bannerOpacity,
			height: bannerHeight + 'rpx',
			overflow: 'hidden',
			transition: 'all 0.1s'
		}">
			<uv-swiper 
				:list="bannerList" 
				keyName="image" 
				:height="220" 
				:radius="5" 
				:interval="3000"
				indicator
				indicatorMode="line"
				circular
			></uv-swiper>
		</view>
		
		<!-- 搜索框部分 -->
		<view class="search-box">
			<uv-search
				v-model="keyword"
				:show-action="false"
				placeholder="搜索内容"
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
				:column-gap="columnGap"
				@changeList="changeList"
			>
				<!-- 第一列数据 -->
				<template v-slot:list1>
					<!-- 为了磨平部分平台的BUG，必须套一层view -->
					<view>
						<view v-for="(item, index) in list1"
							:key="item.id"
							class="flow-item"
							@click="toDetail(item)"
						>
							<view class="flow-item__image" :style="[imageStyle(item)]">
								<image :src="item.image" mode="widthFix" :style="{width:item.width+'px'}"></image>
							</view>
							<view class="flow-item__ft">
								<view class="flow-item__ft__title">
									<text class="value">{{item.title}}</text>
								</view>
								<view class="flow-item__ft__desc uv-line-2">
									<text class="value">{{item.desc}}</text>
								</view>
								<!-- 添加作者信息和点赞区域 -->
								<view class="flow-item__ft__author">
									<view class="author-info" @click.stop="navigateToUserLook(item.uid)">
										<image class="avatar" :src="item.avatar" mode="aspectFill"></image>
										<text class="nickname">{{item.nickname}}</text>
									</view>
									<view class="like-area" @click.stop="handleLike(item)">
										<uv-icon 
											:name="item.isLiked ? 'heart-fill' : 'heart'" 
											:color="item.isLiked ? '#ff5500' : '#666'" 
											size="20"
										></uv-icon>
										<text class="like-count">{{item.likes}}</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</template>
				<!-- 第二列数据 -->
				<template v-slot:list2>
					<!-- 为了磨平部分平台的BUG，必须套一层view -->
					<view>
						<view v-for="(item, index) in list2"
							:key="item.id"
							class="flow-item"
							@click="toDetail(item)"
						>
							<view class="flow-item__image" :style="[imageStyle(item)]">
								<image :src="item.image" mode="widthFix" :style="{width:item.width+'px'}"></image>
							</view>
							<view class="flow-item__ft">
								<view class="flow-item__ft__title">
									<text class="value">{{item.title}}</text>
								</view>
								<view class="flow-item__ft__desc uv-line-2">
									<text class="value">{{item.desc}}</text>
								</view>
								<!-- 添加作者信息和点赞区域 -->
								<view class="flow-item__ft__author">
									<view class="author-info" @click.stop="navigateToUserLook(item.uid)">
										<image class="avatar" :src="item.avatar" mode="aspectFill"></image>
										<text class="nickname">{{item.nickname}}</text>
									</view>
									<view class="like-area" @click.stop="handleLike(item)">
										<uv-icon 
											:name="item.isLiked ? 'heart-fill' : 'heart'" 
											:color="item.isLiked ? '#ff5500' : '#666'" 
											size="20"
										></uv-icon>
										<text class="like-count">{{item.likes}}</text>
									</view>
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
				current: 0, // 当前选中的底部导航项
				keyword: '', // 搜索关键词
				bannerList: [], // 轮播图数据改为空数组，将通过API动态获取
				flowList: [], // 瀑布流数据列表
				list1: [], // 瀑布流第一列数据
				list2: [], // 瀑布流第二列数据
				loading: false, // 是否正在加载数据
				page: 1, // 当前页码
				pageSize: 10, // 每页数据量
				scrollTop: 0, // 页面滚动距离
				bannerOpacity: 1, // 轮播图透明度
				bannerHeight: 220, // 轮播图高度
				originalBannerHeight: 220, // 轮播图原始高度
				gapSize: 8, // 左右边距
				columnGap: 8, // 列间距
				userInfo: null, // 用户信息
				isLoggedIn: false, // 登录状态
				loadMoreStatus: 'loadmore', // 加载更多状态：loadmore-加载更多，loading-加载中，nomore-没有更多了
				hasMore: true // 是否还有更多数据
			}
		},
		computed: {
			imageStyle() {
				return item => {
					// 计算水平可用空间并均匀分配
					const screenWidth = uni.upx2px(750); // 获取屏幕宽度
					const availableWidth = screenWidth - (this.gapSize * 2) - this.columnGap; // 减去左右边距和列间距
					const columnWidth = availableWidth / 2; // 平均分配给两列
					
					// 根据图片原始比例计算高度
					const rate = columnWidth / item.w;
					const h = rate * item.h;
					
					return {
						width: columnWidth + 'px',
						height: h + 'px'
					}
				}
			}
		},
		onLoad() {
			// 页面加载时获取轮播图数据
			this.getBannerData();
			// 页面加载时获取瀑布流数据
			this.getFlowData();
			// 检查登录状态
			this.checkLoginStatus();
		},
		onReachBottom() {
			// 页面滚动到底部时加载更多数据
			if (this.hasMore && !this.loading) {
				this.getFlowData();
			}
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
			// 根据滚动位置计算轮播图的透明度和高度
			this.calculateBannerStyle();
		},
		onShow() {
			// 每次显示页面时检查登录状态
			this.checkLoginStatus();
		},
		methods: {
			// 获取轮播图数据
			getBannerData() {
				uni.request({
					url: ENV_CONFIG.API_BASE_URL + '/api/public/image',
					method: 'GET',
					data: {
						category: 'banner',
						mode: 'order',
						limit: 10
					},
					success: (res) => {
						if (res.statusCode === 200 && res.data && res.data.data && res.data.data.images) {
							// 提取轮播图URL并更新bannerList
							this.bannerList = res.data.data.images.map(item => ({
								image: item.image_url
							}));
						} else {
							console.error('获取轮播图数据失败:', res);
							this.bannerList = [];
						}
					},
					fail: (err) => {
						console.error('获取轮播图网络请求失败:', err);
						this.bannerList = [];
					}
				});
			},
			
			// 计算轮播图样式
			calculateBannerStyle() {
				// 设定滚动多少距离时轮播图完全隐藏
				const maxScrollDistance = 200;
				
				// 计算不透明度: 1 到 0
				this.bannerOpacity = Math.max(0, 1 - this.scrollTop / maxScrollDistance);
				
				// 计算高度: 从原始高度到0
				this.bannerHeight = Math.max(0, this.originalBannerHeight * this.bannerOpacity);
			},
			
			// 切换底部导航栏
			tabChange(index) {
				this.current = index;
				// 根据index处理对应的页面逻辑
				switch(index) {
					case 0: // 日常
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
						uni.redirectTo({
							url: '/pages/user/user'
						});
						break;
				}
			},
			
			// 跳转到搜索页面
			toSearch() {
				uni.navigateTo({
					url: "/pages/notesearch/notesearch",
					animationType: 'slide-in-top', // 添加过渡动画效果
					animationDuration: 300
				});
			},
			
			// 跳转到详情页面
			toDetail(item) {
				uni.navigateTo({
					url: '/pages/note/note?id=' + item.id
				});
			},
			
			// 这点非常重要：e.name在这里返回是list1或list2，要手动将数据追加到相应列
			changeList(e) {
				this[e.name].push(e.value);
			},
			
			// 获取瀑布流数据
			getFlowData() {
				if (this.loading || !this.hasMore) return;
				this.loading = true;
				this.loadMoreStatus = 'loading';
				
				// 使用实际API请求
				uni.request({
					url: ENV_CONFIG.API_BASE_URL + '/api/note/note',
					method: 'GET',
					data: {
						page: this.page,
						size: this.pageSize
					},
					success: (res) => {
						if (res.statusCode === 200 && res.data) {
							const noteData = res.data.data || [];
							
							if (noteData.length > 0) {
								const processedData = this.processNoteData(noteData);
								this.flowList = [...this.flowList, ...processedData];
								this.page++;
								
								// 判断是否还有更多数据
								if (noteData.length < this.pageSize) {
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
						console.error('获取笔记数据失败:', err);
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
			
			// 处理API返回的笔记数据
			processNoteData(noteData) {
				return noteData.map(item => {
					let tags = [];
					try {
						tags = JSON.parse(item.tags || '[]');
					} catch (e) {
						console.error('解析标签失败:', e);
					}
					
					// 使用API返回的图片URL和尺寸
					let imageUrl = item.top_pic_url || 'https://picsum.photos/200/200?random=' + item.id;
					// 确保width和height是数字类型
					let imageWidth = item.top_pic_width ? parseInt(item.top_pic_width) : 200;
					let imageHeight = item.top_pic_length ? parseInt(item.top_pic_length) : 200;
					
					// 确保宽高有效
					if (imageWidth <= 0) imageWidth = 200;
					if (imageHeight <= 0) imageHeight = 200;
					
					return {
						id: item.id,
						uid: item.uid,
						image: imageUrl,
						w: imageWidth,
						h: imageHeight,
						title: item.title || '无标题',
						desc: item.content || '无内容',
						avatar: item.avatar || 'https://picsum.photos/40/40?random=' + item.id,
						nickname: item.nickname || '匿名用户',
						likes: parseInt(item.like_count) || 0,
						isLiked: false,
						tags: tags
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
					
					// 同时更新对应列中的数据
					const list1Index = this.list1.findIndex(i => i.id === item.id);
					if (list1Index !== -1) {
						this.list1[list1Index] = {
							...this.list1[list1Index],
							isLiked: !isLiked,
							likes: this.list1[list1Index].likes + (isLiked ? -1 : 1)
						};
					}
					
					const list2Index = this.list2.findIndex(i => i.id === item.id);
					if (list2Index !== -1) {
						this.list2[list2Index] = {
							...this.list2[list2Index],
							isLiked: !isLiked,
							likes: this.list2[list2Index].likes + (isLiked ? -1 : 1)
						};
					}
					
					this.$forceUpdate();
				}
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
			}
		}
	}
</script>

<style lang="scss">
	.container {
		padding-bottom: 100rpx; /* 为底部导航栏留出空间 */
	}
	
	.banner-container {
		/* 占位，防止轮播图消失时布局突变 */
		will-change: opacity, height;
	}
	
	.search-box {
		padding: 20rpx;
		/* 固定搜索框位置，使轮播图隐藏不影响搜索框 */
		background-color: #fff;
		position: sticky;
		top: 0;
		z-index: 999;
	}
	
	.waterfall-container {
		padding: 0rpx; // 移除内边距，由瀑布流组件的gap属性控制边距
	}
	
	.flow-item {
		overflow: hidden;
		margin-top: 10px;
		border-radius: 6px;
		background-color: #fff;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
		
		&__image {
			width: 100%;
			overflow: hidden;
		}
		
		&__ft {
			padding: 20rpx;
			
			&__title {
				margin-bottom: 10rpx;
				line-height: 48rpx;
				font-weight: 700;
				
				.value {
					font-size: 32rpx;
					color: #333;
				}
			}
			
			&__desc {
				.value {
					font-size: 28rpx;
					color: #666;
					text-overflow: ellipsis;
					overflow: hidden;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
				}
			}
			
			/* 添加作者和点赞区域样式 */
			&__author {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-top: 6rpx; // 减小上边距，使布局更紧凑
				// 移除分割线
				
				.author-info {
					display: flex;
					align-items: center;
					cursor: pointer;
					
					.avatar {
						width: 40rpx;
						height: 40rpx;
						border-radius: 50%;
						margin-right: 10rpx;
					}
					
					.nickname {
						font-size: 24rpx;
						color: #666;
						max-width: 130rpx;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}
				}
				
				.like-area {
					display: flex;
					align-items: center;
					padding: 6rpx 12rpx;
					
					&:active {
						background-color: rgba(0,0,0,0.05);
						border-radius: 20rpx;
					}
					
					.like-count {
						font-size: 24rpx;
						color: #666;
						margin-left: 8rpx;
					}
				}
			}
		}
	}
	
	.load-more {
		text-align: center;
		padding: 20rpx 0;
	}
</style>
