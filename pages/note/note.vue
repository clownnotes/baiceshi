<template>
	<view class="note-container">
		<!-- 轮播图部分 -->
		<view class="swiper-container">
			<uv-swiper 
				:list="noteData.images" 
				keyName="url" 
				:height="swiperHeight" 
				:radius="0" 
				:interval="3000"
				:autoplay="false"
				indicator
				indicatorMode="dot"
				circular
				@change="onSwiperChange"
				@click="previewImage"
			></uv-swiper>
		</view>
		
		<!-- 用户信息栏 -->
		<view class="author-bar">
			<view class="author-info" @click="navigateToUserLook(noteData.uid)">
				<image class="avatar" :src="noteData.authorAvatar" mode="aspectFill"></image>
				<text class="nickname">{{noteData.authorName}}</text>
			</view>
			<view class="follow-btn" :class="{'followed': noteData.isFollowed}" @click="toggleFollow">
				<text>{{noteData.isFollowed ? '已关注' : '关注'}}</text>
			</view>
		</view>
		
		<!-- 笔记内容 -->
		<view class="note-content">
			<!-- 标题 -->
			<view class="note-title">
				<text>{{noteData.title}}</text>
			</view>
			
			<!-- 正文 -->
			<view class="note-text">
				<text>{{noteData.content}}</text>
			</view>
			
			<!-- 标签 -->
			<view class="note-tags">
				<view class="tag-item" v-for="(tag, index) in noteData.tags" :key="index">
					<text># {{tag}}</text>
				</view>
			</view>
			
			<!-- 发布时间 -->
			<view class="publish-time">
				<text>{{noteData.publishTime}}</text>
			</view>
		</view>
		
		<!-- 底部操作栏 -->
		<view class="action-bar">
			<!-- 评论输入框 -->
			<view class="comment-input" @click="focusComment">
				<text>说点什么...</text>
			</view>
			
			<!-- 操作按钮 -->
			<view class="action-buttons">
				<view class="action-item" @click="toggleCollect">
					<uv-icon :name="noteData.isCollected ? 'star-fill' : 'star'" :color="noteData.isCollected ? '#ff5500' : '#333'" size="24"></uv-icon>
					<text>{{noteData.collectCount}}</text>
				</view>
				<view class="action-item" @click="toggleLike">
					<uv-icon :name="noteData.isLiked ? 'heart-fill' : 'heart'" :color="noteData.isLiked ? '#ff5500' : '#333'" size="24"></uv-icon>
					<text>{{noteData.likeCount}}</text>
				</view>
				<view class="action-item" @click="shareNote">
					<uv-icon name="share" color="#333" size="24"></uv-icon>
					<text>分享</text>
				</view>
			</view>
		</view>
		
		<!-- 返回按钮 -->
		<view class="back-btn" @click="goBack">
			<uv-icon name="arrow-left" color="#ffffff" size="20"></uv-icon>
		</view>
	</view>
</template>

<script>
import ENV_CONFIG from '@/config/config.js'

export default {
	data() {
		return {
			id: null,
			noteData: {
				uid: null,
				title: '',
				content: '',
				authorName: '',
				authorAvatar: '',
				isFollowed: false,
				publishTime: '',
				commentCount: 0,
				isCollected: false,
				collectCount: 0,
				isLiked: false,
				likeCount: 0,
				tags: [],
				images: [] // 轮播图数据
			},
			// 轮播图设置
			swiperHeight: 350, // 默认高度
			maxSwiperHeight: 450, // 轮播图最大高度（rpx）
			minSwiperHeight: 300, // 轮播图最小高度（rpx）
			currentSwiperIndex: 0, // 当前显示的轮播图索引
			imageRatios: [], // 存储图片的宽高比
			screenWidth: 375 // 默认屏幕宽度
		}
	},
	onLoad(options) {
		// 获取从首页传递的笔记ID
		if (options.id) {
			this.id = options.id;
			// 获取屏幕宽度
			uni.getSystemInfo({
				success: (res) => {
					this.screenWidth = res.windowWidth;
				}
			});
			this.getNoteDetail();
		}
	},
	methods: {
		// 返回上一页
		goBack() {
			uni.navigateBack();
		},
		
		// 获取笔记详情
		getNoteDetail() {
				// 显示加载提示
				uni.showLoading({
					title: '加载中...'
				});
				
				// 请求API获取笔记详情
				uni.request({
					url: `${ENV_CONFIG.API_BASE_URL}/api/note/note`,
					method: 'GET',
					data: {
						id: this.id
					},
					success: (res) => {
						// 隐藏加载提示
						uni.hideLoading();
						
						if (res.data && res.data.errno === 0 && res.data.data) {
							const apiData = res.data.data;
							
							// 处理图片数据，将top_pic放在第一位
							const images = [];
							const imageRatios = [];
							
							// 首先添加顶部图片
							if (apiData.top_pic_url) {
								const topPicRatio = apiData.top_pic_width / apiData.top_pic_length;
								imageRatios.push(topPicRatio);
								
								images.push({
									url: apiData.top_pic_url,
									width: apiData.top_pic_width,
									height: apiData.top_pic_length,
									ratio: topPicRatio
								});
							}
							
							// 然后添加其他图片
							if (apiData.pic_url_list && apiData.pic_url_list.length > 0) {
								for (let i = 0; i < apiData.pic_url_list.length; i++) {
									const picUrl = apiData.pic_url_list[i];
									const picWidth = apiData.pic_width_list[i] || 0;
									const picLength = apiData.pic_length_list[i] || 0;
									const ratio = picWidth / picLength || 1;
									
									imageRatios.push(ratio);
									images.push({
										url: picUrl,
										width: picWidth,
										height: picLength,
										ratio: ratio
									});
								}
							}
							
							// 确保至少有一张图片
							if (images.length === 0) {
								images.push({
									url: 'https://zoj.oss-cn-shanghai.aliyuncs.com/peo/default_note_image.jpg',
									width: 750,
									height: 500,
									ratio: 1.5
								});
								imageRatios.push(1.5);
							}
							
							// 处理发布时间和更新时间
							let publishTime = '';
							if (apiData.add_time) {
								const addTime = new Date(apiData.add_time);
								const updateTime = apiData.update_time ? new Date(apiData.update_time) : null;
								
								// 判断发布时间和更新时间是否相同
								const isSameTime = updateTime && 
									addTime.getFullYear() === updateTime.getFullYear() && 
									addTime.getMonth() === updateTime.getMonth() && 
									addTime.getDate() === updateTime.getDate() && 
									addTime.getHours() === updateTime.getHours() && 
									addTime.getMinutes() === updateTime.getMinutes();
								
								// 如果时间相同则显示发布时间，否则显示更新时间
								const timeToShow = isSameTime ? addTime : (updateTime || addTime);
								const prefix = isSameTime ? '发布于 ' : '更新于 ';
								
								publishTime = prefix + this.formatTime(timeToShow);
							}
							
							// 更新笔记数据
							this.noteData = {
								uid: apiData.uid,
								title: apiData.title || '无标题',
								content: apiData.content || '无内容',
								authorName: apiData.nickname || '匿名用户',
								authorAvatar: apiData.avatar || 'https://zoj.oss-cn-shanghai.aliyuncs.com/peo/default_avatar.jpg',
								isFollowed: false,
								publishTime: publishTime,
								commentCount: 0, // API未返回评论数
								isCollected: false,
								collectCount: 0, // API未返回收藏数
								isLiked: false,
								likeCount: apiData.like_count || 0,
								tags: apiData.tags || [], // 添加标签处理
								images: images
							};
							
							this.imageRatios = imageRatios;
							
							// 计算并设置轮播图高度
							this.calculateSwiperHeight();
						} else {
							uni.showToast({
								title: '获取笔记详情失败',
								icon: 'none'
							});
						}
					},
					fail: (err) => {
						uni.hideLoading();
						uni.showToast({
							title: '网络请求失败',
							icon: 'none'
						});
						console.error('获取笔记详情失败:', err);
					}
				});
			},
		
		// 格式化时间
		formatTime(date) {
			if (!date) return '';
			
			const now = new Date();
			const diffMs = now - date;
			const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
			
			// 获取时间部分
			const hours = date.getHours();
			const minutes = date.getMinutes();
			const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
			
			// 24小时内，显示具体小时
			if (diffDays === 0) {
				// 今天
				return `今天 ${timeStr}`;
			} else if (diffDays === 1) {
				// 昨天
				return `昨天 ${timeStr}`;
			} else {
				// 不在24小时内
				const year = date.getFullYear();
				const month = date.getMonth() + 1;
				const day = date.getDate();
				
				// 如果不是今年，则显示年份
				if (year !== now.getFullYear()) {
					return `${year}-${month}-${day}`;
				} else {
					// 今年内，只显示月和日
					return `${month}-${day}`;
				}
			}
		},
		
		// 计算轮播图高度
		calculateSwiperHeight() {
			if (!this.noteData.images || this.noteData.images.length === 0) {
				this.swiperHeight = this.minSwiperHeight;
				return;
			}

			// 将屏幕宽度转换为rpx (750是标准设计稿宽度)
			const screenWidthRpx = 750;
			
			// 找出所有图片中宽高比最小的（即最高的图片）
			const minRatio = Math.min(...this.noteData.images.map(img => img.ratio || img.width / img.height));
			
			// 计算当前轮播索引的图片高度
			const currentImage = this.noteData.images[this.currentSwiperIndex];
			const currentRatio = currentImage.ratio || (currentImage.width / currentImage.height);
			
			// 根据比例计算高度
			let calculatedHeight = screenWidthRpx / minRatio;
			
			// 限制高度范围
			if (calculatedHeight > this.maxSwiperHeight) {
				calculatedHeight = this.maxSwiperHeight;
			} else if (calculatedHeight < this.minSwiperHeight) {
				// 如果最高的图片高度都低于最小高度，则使用自适应宽度模式
				calculatedHeight = screenWidthRpx / currentRatio;
				if (calculatedHeight < this.minSwiperHeight) {
					calculatedHeight = this.minSwiperHeight;
				}
			}
			
			this.swiperHeight = calculatedHeight;
		},
		
		// 轮播图切换事件处理
		onSwiperChange(e) {
			this.currentSwiperIndex = e.current;
			// 切换图片时重新计算高度
			this.calculateSwiperHeight();
		},
		
		// 预览图片
		previewImage(index) {
			// 获取所有图片URL列表
			const urls = this.noteData.images.map(item => item.url);
			
			// 使用uni.previewImage全屏预览图片
			uni.previewImage({
				current: this.noteData.images[index].url, // 当前显示图片的链接
				urls: urls, // 需要预览的图片链接列表
				longPressActions: {
					itemList: ['保存图片', '分享'],
					success: (data) => {
						// 根据用户选择处理长按操作
						if (data.tapIndex === 0) {
							// 保存图片到相册
							uni.saveImageToPhotosAlbum({
								filePath: urls[index],
								success: () => {
									uni.showToast({
										title: '图片已保存',
										icon: 'success'
									});
								},
								fail: () => {
									uni.showToast({
										title: '保存失败',
										icon: 'none'
									});
								}
							});
						} else if (data.tapIndex === 1) {
							// 分享图片
							this.shareNote();
						}
					}
				}
			});
		},
		
		// 切换关注状态
		toggleFollow() {
			this.noteData.isFollowed = !this.noteData.isFollowed;
			uni.showToast({
				title: this.noteData.isFollowed ? '已关注' : '已取消关注',
				icon: 'none'
			});
		},
		
		// 聚焦评论输入框
		focusComment() {
			uni.showToast({
				title: '评论功能开发中',
				icon: 'none'
			});
		},
		
		// 收藏笔记
		toggleCollect() {
			this.noteData.isCollected = !this.noteData.isCollected;
			this.noteData.collectCount += this.noteData.isCollected ? 1 : -1;
			uni.showToast({
				title: this.noteData.isCollected ? '已收藏' : '已取消收藏',
				icon: 'none'
			});
		},
		
		// 点赞笔记
		toggleLike() {
			this.noteData.isLiked = !this.noteData.isLiked;
			this.noteData.likeCount += this.noteData.isLiked ? 1 : -1;
			uni.showToast({
				title: this.noteData.isLiked ? '已点赞' : '已取消点赞',
				icon: 'none'
			});
		},
		
		// 分享笔记
		shareNote() {
			uni.showToast({
				title: '分享功能开发中',
				icon: 'none'
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
		}
	}
}
</script>

<style lang="scss" scoped>
.note-container {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	background-color: #ffffff;
	padding-bottom: 120rpx; /* 为底部操作栏留出空间 */
	position: relative;
}

.swiper-container {
	width: 100%;
	height: auto;
}

/* 返回按钮样式修改，保持在页面左上角固定位置 */
.back-btn {
	position: fixed;
	top: 80rpx; /* 适应状态栏高度 */
	left: 30rpx;
	z-index: 100;
	width: 64rpx;
	height: 64rpx;
	background-color: rgba(0, 0, 0, 0.3);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.author-bar {
	padding: 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1px solid #f5f5f5;
	width: 100%;
	box-sizing: border-box;
	background-color: #fff;
	
	.author-info {
		display: flex;
		align-items: center;
		cursor: pointer;
		
		.avatar {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			margin-right: 20rpx;
		}
		
		.nickname {
			font-size: 32rpx;
			font-weight: 500;
			color: #333;
		}
	}
	
	.follow-btn {
		padding: 10rpx 30rpx;
		background-color: #ff4d4f;
		border-radius: 30rpx;
		
		text {
			font-size: 26rpx;
			color: #ffffff;
		}
		
		&.followed {
			background-color: #f5f5f5;
			
			text {
				color: #666;
			}
		}
	}
}

.note-content {
	padding: 30rpx;
	
	.note-title {
		margin-bottom: 20rpx;
		
		text {
			font-size: 36rpx;
			font-weight: 600;
			color: #333;
			line-height: 1.4;
		}
	}
	
	.note-text {
		margin-bottom: 30rpx;
		
		text {
			font-size: 30rpx;
			color: #333;
			line-height: 1.6;
		}
	}
	
	.note-tags {
		display: flex;
		flex-wrap: wrap;
		margin-bottom: 20rpx;
		
		.tag-item {
			padding: 6rpx 20rpx;
			background-color: #f9f9f9;
			border-radius: 20rpx;
			margin-right: 16rpx;
			margin-bottom: 16rpx;
			
			text {
				font-size: 24rpx;
				color: #007aff;
			}
		}
	}
	
	.publish-time {
		text {
			font-size: 24rpx;
			color: #999;
		}
	}
}

.action-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 100rpx;
	background-color: #ffffff;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
	display: flex;
	align-items: center;
	padding: 0 30rpx;
	z-index: 100;
	
	.comment-input {
		flex: 1;
		height: 70rpx;
		background-color: #f5f5f5;
		border-radius: 35rpx;
		padding: 0 30rpx;
		display: flex;
		align-items: center;
		
		text {
			font-size: 28rpx;
			color: #999;
		}
	}
	
	.action-buttons {
		display: flex;
		margin-left: 30rpx;
		
		.action-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			margin-left: 40rpx;
			
			text {
				font-size: 22rpx;
				color: #666;
				margin-top: 4rpx;
			}
		}
	}
}
</style>
