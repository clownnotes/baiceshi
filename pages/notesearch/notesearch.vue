<template>
	<view class="container">
		 <!-- 使用sticky组件实现搜索框吸顶 -->
		<uv-sticky>
			<view class="search-header">
				<view class="search-box">
					<uv-search
						v-model="keyword"
						:show-action="false"
						placeholder="搜索内容"
						:clearabled="true"
						@search="handleSearch"
						@clear="handleClear"
						:focus="true"
					></uv-search>
				</view>
			</view>
		</uv-sticky>
		
		<!-- 搜索内容区域 -->
		<view class="search-content">
			<!-- 搜索历史 -->
			<view class="section history-section" v-if="searchHistory.length > 0">
				<view class="section-header">
					<text class="section-title">搜索历史</text>
					<view class="section-action" @click="clearHistory">
						<uv-icon name="trash" size="16"></uv-icon>
					</view>
				</view>
				<view class="section-body">
					<view class="tag-list">
						<view 
							class="tag-item" 
							v-for="(item, index) in searchHistory" 
							:key="index" 
							@click="searchByHistory(item)"
						>
							<text>{{item}}</text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 搜索推荐 -->
			<view class="section recommend-section">
				<view class="section-header">
					<text class="section-title">搜索推荐</text>
					<view class="section-action" @click="refreshRecommend">
						<uv-icon name="reload" size="16"></uv-icon>
					</view>
				</view>
				<view class="section-body">
					<view class="tag-list">
						<view 
							class="tag-item" 
							v-for="(item, index) in recommendList" 
							:key="index" 
							@click="searchByKeyword(item.keyword)"
						>
							<text>{{item.keyword}}</text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 搜索排行 -->
			<view class="section rank-section">
				<view class="section-header">
					<text class="section-title">搜索排行</text>
				</view>
				<view class="section-body">
					<view class="rank-list">
						<view 
							class="rank-item" 
							v-for="(item, index) in rankList" 
							:key="index" 
							@click="searchByKeyword(item.keyword)"
						>
							<view class="rank-item__index" :class="{'top-rank': index < 3}">
								<text>{{index + 1}}</text>
							</view>
							<view class="rank-item__content">
								<text class="rank-item__keyword">{{item.keyword}}</text>
								<text class="rank-item__count">{{item.count}}次搜索</text>
							</view>
							<view class="rank-item__trend">
								<uv-icon :name="item.trend > 0 ? 'arrow-up' : 'arrow-down'" :color="item.trend > 0 ? '#ff5500' : '#2979ff'" size="14"></uv-icon>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			 <!-- 增加底部安全距离 -->
			<view class="safe-bottom"></view>
		</view>
	</view>
</template>

<script>
	import ENV_CONFIG from '@/config/config.js';
	const HISTORY_KEY = 'search_history_key';
	const MAX_HISTORY_LENGTH = 10;
	
	export default {
		data() {
			return {
				keyword: '', // 搜索关键词
				searchHistory: [], // 搜索历史
				recommendList: [], // 搜索推荐
				rankList: [], // 搜索排行
				statusBarHeight: 0, // 状态栏高度
			}
		},
		onLoad() {
			// 加载搜索历史
			this.loadSearchHistory();
			// 获取搜索推荐
			this.getRecommendList();
			// 获取搜索排行
			this.getRankList();
			// 获取状态栏高度，适配不同平台
			this.getSystemInfo();
		},
		methods: {
			// 获取系统信息，用于适配不同平台的顶部高度
			getSystemInfo() {
				uni.getSystemInfo({
					success: (res) => {
						// 状态栏高度
						this.statusBarHeight = res.statusBarHeight || 0;
					}
				});
			},
			
			// 搜索操作
			handleSearch() {
				if (!this.keyword.trim()) {
					uni.showToast({
						title: '请输入搜索内容',
						icon: 'none'
					});
					return;
				}
				
				// 保存搜索历史
				this.saveSearchHistory(this.keyword);
				
				// 执行搜索操作，跳转到搜索结果页面
				this.navigateToSearchResult(this.keyword);
			},
			
			// 点击返回按钮返回上一页
			handleBack() {
				uni.navigateBack();
			},
			
			// 清空输入框
			handleClear() {
				this.keyword = '';
			},
			
			// 使用历史记录搜索
			searchByHistory(keyword) {
				this.keyword = keyword;
				this.handleSearch();
			},
			
			// 使用关键词搜索
			searchByKeyword(keyword) {
				this.keyword = keyword;
				this.handleSearch();
			},
			
			// 加载搜索历史
			loadSearchHistory() {
				try {
					const history = uni.getStorageSync(HISTORY_KEY);
					this.searchHistory = history ? JSON.parse(history) : [];
				} catch (e) {
					console.error('读取搜索历史失败', e);
					this.searchHistory = [];
				}
			},
			
			// 保存搜索历史
			saveSearchHistory(keyword) {
				if (!keyword.trim()) return;
				
				// 过滤掉重复的关键词
				const index = this.searchHistory.findIndex(item => item === keyword);
				if (index !== -1) {
					this.searchHistory.splice(index, 1);
				}
				
				// 将新的关键词添加到数组头部
				this.searchHistory.unshift(keyword);
				
				// 限制历史记录长度
				if (this.searchHistory.length > MAX_HISTORY_LENGTH) {
					this.searchHistory = this.searchHistory.slice(0, MAX_HISTORY_LENGTH);
				}
				
				// 保存到本地存储
				try {
					uni.setStorageSync(HISTORY_KEY, JSON.stringify(this.searchHistory));
				} catch (e) {
					console.error('保存搜索历史失败', e);
				}
			},
			
			// 清空搜索历史
			clearHistory() {
				uni.showModal({
					title: '提示',
					content: '确定要清空搜索历史吗？',
					success: (res) => {
						if (res.confirm) {
							this.searchHistory = [];
							uni.removeStorageSync(HISTORY_KEY);
							uni.showToast({
								title: '已清空搜索历史',
								icon: 'none'
							});
						}
					}
				});
			},
			
			// 刷新推荐列表
			refreshRecommend() {
				this.getRecommendList();
				uni.showToast({
					title: '已刷新推荐',
					icon: 'none'
				});
			},
			
			// 获取搜索推荐列表
			getRecommendList() {
				uni.request({
					url: `${ENV_CONFIG.API_BASE_URL}/api/search/helper`,
					method: 'GET',
					success: (res) => {
						if (res.data && res.data.errno === 0 && res.data.data) {
							this.recommendList = res.data.data.map((item, index) => {
								return {
									id: index,
									keyword: item.Keyword
								}
							});
						} else {
							uni.showToast({
								title: '获取推荐数据失败',
								icon: 'none'
							});
							// 使用备用数据
							this.getBackupRecommendList();
						}
					},
					fail: (err) => {
						console.error('获取搜索推荐失败:', err);
						this.getBackupRecommendList();
					}
				});
			},
			
			// 获取搜索排行榜
			getRankList() {
				uni.request({
					url: `${ENV_CONFIG.API_BASE_URL}/api/search/hotranks`,
					method: 'GET',
					success: (res) => {
						if (res.data && res.data.errno === 0 && res.data.data) {
							this.rankList = res.data.data.map(item => {
								return {
									keyword: item.keyword,
									count: item.count,
									trend: item.trend
								}
							});
						} else {
							uni.showToast({
								title: '获取热搜排行失败',
								icon: 'none'
							});
							this.getBackupRankList();
						}
					},
					fail: (err) => {
						console.error('获取热搜排行失败:', err);
						this.getBackupRankList();
					}
				});
			},
			
			getBackupRankList() {
				this.rankList = [
					{ keyword: '前端开发', count: 9872, trend: 1 },
					{ keyword: 'UI设计', count: 8654, trend: 1 },
					{ keyword: '产品经理', count: 7560, trend: -1 },
					{ keyword: '数据分析', count: 6832, trend: 1 },
					{ keyword: '人工智能', count: 5943, trend: 1 },
					{ keyword: '营销策略', count: 4873, trend: -1 },
					{ keyword: '职场技能', count: 3782, trend: -1 },
					{ keyword: '创业指南', count: 2891, trend: 1 },
					{ keyword: '项目管理', count: 2453, trend: -1 },
					{ keyword: '内容创作', count: 1932, trend: 1 }
				];
			},
			
			// 跳转到搜索结果页面
			navigateToSearchResult(keyword) {
				uni.navigateTo({
					url: `/pages/searchresult/searchresult?keyword=${keyword}`,
					animationType: 'slide-in-right',
					animationDuration: 300
				});
			}
		}
	}
</script>

<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		min-height: 100vh; /* 使用min-height确保内容较少时也能撑满屏幕 */
		background-color: #f8f8f8;
		position: relative;
		box-sizing: border-box;
	}
	
	.search-header {
		background-color: #ffffff;
		padding: 20rpx 0;
		border-bottom: 1px solid #f0f0f0;
		width: 100%;
		z-index: 999;
		
		/* 内容居中并设置合适边距 */
		.search-box {
			width: 94%; /* 稍微增加宽度 */
			margin: 0 auto;
		}
	}
	
	.search-content {
		flex: 1;
		padding: 15rpx 0 0; /* 减少顶部padding，缩小与搜索框的距离 */
		
		/* uniapp规范推荐的容器样式 */
		width: 94%;
		margin-left: auto;
		margin-right: auto;
		box-sizing: border-box;
	}
	
	/* 增加底部安全区域，确保内容完全显示 */
	.safe-bottom {
		height: 100rpx; /* 增加底部空白高度 */
		width: 100%;
	}
	
	.section {
		margin-bottom: 30rpx;
		background-color: #ffffff;
		border-radius: 12rpx;
		padding: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		width: 100%;
		box-sizing: border-box;
		
		/* 最后一个区域增加额外底部间距 */
		&:last-of-type {
			margin-bottom: 50rpx;
		}
		
		.section-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20rpx;
			
			.section-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333333;
			}
			
			.section-action {
				padding: 10rpx;
			}
		}
		
		.section-body {
			padding: 10rpx 0;
		}
	}
	
	.tag-list {
		display: flex;
		flex-wrap: wrap;
		
		.tag-item {
			padding: 12rpx 24rpx;
			background-color: #f5f5f5;
			border-radius: 30rpx;
			margin-right: 20rpx;
			margin-bottom: 20rpx;
			font-size: 28rpx;
			color: #333;
			
			&:active {
				background-color: #e0e0e0;
			}
		}
	}
	
	.rank-list {
		.rank-item {
			display: flex;
			align-items: center;
			padding: 20rpx 0;
			border-bottom: 1px solid #f5f5f5;
			
			&:last-child {
				border-bottom: none;
			}
			
			&__index {
				width: 60rpx;
				height: 60rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 32rpx;
				color: #999;
				font-weight: bold;
				
				&.top-rank {
					color: #ff5500;
				}
			}
			
			&__content {
				flex: 1;
				margin-left: 20rpx;
				display: flex;
				flex-direction: column;
			}
			
			&__keyword {
				font-size: 30rpx;
				color: #333;
				margin-bottom: 6rpx;
			}
			
			&__count {
				font-size: 24rpx;
				color: #999;
			}
			
			&__trend {
				margin-right: 20rpx;
			}
		}
	}
	
	/* 添加媒体查询，适配不同屏幕尺寸 */
	@media screen and (min-width: 768px) {
		.search-content, 
		.search-header .search-box {
			width: 85%;
			max-width: 800rpx;
		}
	}
</style>
