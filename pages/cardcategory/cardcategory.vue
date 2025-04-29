<template>
	<view class="category-picker-container">		
		<!-- 加载状态显示 -->
		<view class="loading-container" v-if="loading">
			<uv-loading mode="circle" color="#3c9cff"></uv-loading>
			<text class="loading-text">加载中...</text>
		</view>
		
		<!-- 分类列表区域 - 两列网格布局 -->
		<view class="category-grid-container" v-else>
			<view 
				class="category-grid-item" 
				v-for="(section, sectionIndex) in categories" 
				:key="sectionIndex"
				@click="selectCategory(section)"
			>
				<view class="category-content">
					<text class="category-title">{{section.title}}</text>
				</view>
			</view>
		</view>
		
		<!-- 底部安全区域 -->
		<view class="safe-area-bottom"></view>
	</view>
</template>

<script>
	import ENV_CONFIG from '../../config/config.js';
	
	export default {
		data() {
			return {
				// 分类数据
				categories: [],
				
				// 加载状态
				loading: true,
				
				// 错误状态
				error: null
			}
		},
		onLoad() {
			this.fetchCategories();
		},
		methods: {
			// 获取分类数据
			fetchCategories() {
				this.loading = true;
				
				uni.request({
					url: ENV_CONFIG.API_BASE_URL + '/api/card/cardcategory',
					method: 'GET',
					success: (res) => {
						if (res.statusCode === 200 && res.data && res.data.errno === 0) {
							this.categories = res.data.data;
							this.error = null;
						} else {
							this.error = res.data?.errmsg || '获取分类数据失败';
							this.categories = [];
							uni.showToast({
								title: this.error,
								icon: 'none'
							});
						}
					},
					fail: (err) => {
						console.error('获取分类数据失败:', err);
						this.error = '网络请求失败';
						this.categories = [];
						uni.showToast({
							title: '网络请求失败',
							icon: 'none'
						});
					},
					complete: () => {
						this.loading = false;
					}
				});
			},
			
			// 返回上一页
			goBack() {
				uni.navigateBack();
			},
			
			// 选择大分类
			selectCategory(section) {
				const eventChannel = this.getOpenerEventChannel();
				
				// 将选中的分类信息传回（包括ID、标题和所有子项）
				eventChannel.emit('selectCategory', {
					id: section.id,
					title: section.title,
					items: section.items
				});
				
				// 返回上一页
				uni.navigateBack();
			}
		}
	}
</script>

<style lang="scss" scoped>
	.category-picker-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background-color: #f9f9f9;
		padding: 30rpx;
	}
	
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80rpx 0;
		
		.loading-text {
			margin-top: 20rpx;
			font-size: 28rpx;
			color: #666;
		}
	}
	
	.category-grid-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		padding: 10rpx 0;
		
		.category-grid-item {
			width: 48%;
			margin-bottom: 30rpx;
			aspect-ratio: 1/1;
			
			.category-content {
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				background-color: #fff;
				border-radius: 35rpx;
				box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
				
				.category-title {
					font-size: 40rpx;
					font-weight: 600;
					color: #333;
					text-align: center;
					padding: 20rpx;
				}
			}
			
			&:active {
				.category-content {
					background-color: #f6f6f6;
				}
			}
		}
	}
	
	.safe-area-bottom {
		height: 50rpx;
	}
</style>
