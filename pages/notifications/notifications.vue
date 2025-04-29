<template>
	<view class="container">
		<!-- 消息类型选择器 -->
		<view class="message-tabs">
			<view 
				class="tab-item" 
				v-for="(item, index) in tabList" 
				:key="index"
				:class="{ active: currentTab === index }"
				@click="switchTab(index)"
			>
				<view class="icon-circle">
					<uv-icon :name="item.icon" size="24" :color="currentTab === index ? '#ffffff' : '#666666'"></uv-icon>
				</view>
				<text class="tab-text">{{ item.name }}</text>
			</view>
		</view>
		
		<!-- 消息列表 -->
		<view class="message-list">			
			<!-- 消息项目 -->
			<view class="message-item" v-for="(item, index) in messageList" :key="index" @click="viewMessageDetail(item)">
				<view class="message-avatar">
					<image :src="item.avatar" mode="aspectFill"></image>
					<!-- uvui的Badge组件自定义红点 -->
					<uv-badge v-if="!item.isRead" :isDot="true" :absolute="true" :offset="[-8, 5]"></uv-badge>
				</view>
				<view class="message-content">
					<view class="message-top">
						<text class="message-name">{{ item.name }}</text>
						<text class="message-time">{{ item.time }}</text>
					</view>
					<view class="message-text">{{ item.content }}</view>
				</view>
			</view>
			
			<uv-load-more 
				:status="loadMoreStatus" 
				:loading-text="'努力加载中...'" 
				:loadmore-text="'轻轻上拉加载更多'" 
				:nomore-text="'没有更多消息了'"
				margin-top="20"
				margin-bottom="20"
			></uv-load-more>
			
			<!-- 底部安全距离 -->
			<view class="safe-bottom"></view>
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
export default {
	data() {
		return {
			current: 3,
			tabList: [
				{ name: '全部', type: 'all', icon: 'list' },
				{ name: '粉丝', type: 'fans', icon: 'account-fill' },
				{ name: '点赞', type: 'like', icon: 'heart-fill' },
				{ name: '服务', type: 'service', icon: 'server-fill' }
			],
			currentTab: 0,
			messageList: [],
			page: 1,
			pageSize: 10,
			loading: false,
			hasMore: false,
			// 添加loadMoreStatus属性控制loadmore组件状态
			loadMoreStatus: 'nomore'
		}
	},
	onLoad() {
		// 初始加载消息
		this.getMessageList();
	},
	// 添加页面的上拉触底事件处理函数
	onReachBottom() {
	},
	methods: {
		// 切换消息类型标签
		switchTab(index) {
			if (this.currentTab === index) return;
			this.currentTab = index;
			this.messageList = [];
			this.page = 1;
			// 加载对应类型的消息
			this.getMessageList();
		},
		
		// 获取消息列表
		getMessageList() {
			if (this.loading) return;
			
			this.loading = true;
			
			// 模拟请求延迟
			setTimeout(() => {
				const type = this.tabList[this.currentTab].type;
				
				// 获取固定的单条消息
				const mockData = this.getMockData(type);
				
				// 设置列表
				this.messageList = mockData;
				
				// 更新状态
				this.loading = false;
				this.loadMoreStatus = 'nomore';
			}, 300);
		},
		
		// 查看消息详情
		viewMessageDetail(item) {
			// 标记为已读
			const index = this.messageList.findIndex(msg => msg.id === item.id);
			if (index !== -1) {
				this.messageList[index].isRead = true;
			}
			
			// 弹窗提示
			uni.showToast({
				title: `消息功能开发中`,
				icon: 'none'
			});
		},
		
		// 生成单条固定消息
		getMockData(type) {
			// 根据类型返回不同的单条提示消息
			const avatar = 'https://zoj.oss-cn-shanghai.aliyuncs.com/peo/default_avatar.jpg';
			const content = '消息功能待上线';
			const time = '刚刚';
			
			return [
				{
					id: 1,
					type: type,
					avatar: avatar,
					name: '系统消息',
					content: content,
					time: time,
					isRead: false
				}
			];
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
	background-color: #f8f8f8;
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	padding-top: 0;
	padding-bottom: 100rpx;
}

.message-tabs {
	display: flex;
	flex-direction: row;
	background-color: #fff;
	padding: 20rpx 30rpx 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	width: 100%;
	box-sizing: border-box;
	justify-content: space-around; /* 使用 space-around 让选项分散开 */
	
	.tab-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 24rpx;
		color: #666;
		transition: all 0.3s;
		
		.icon-circle {
			width: 100rpx; /* 圆形尺寸 */
			height: 100rpx;
			border-radius: 50%;
			background-color: #f5f7fa;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 10rpx;
			transition: all 0.3s;
		}
		
		.tab-text {
			margin-top: 6rpx;
			font-size: 26rpx;
		}
		
		&.active {
			color: #007aff;
			
			.icon-circle {
				background-color: #007aff;
				box-shadow: 0 4rpx 8rpx rgba(0, 122, 255, 0.2);
			}
		}
	}
}

.message-list {
	flex: 1;
	padding-top: 0rpx;
}

.message-item {
	display: flex;
	padding: 30rpx;
	background-color: #fff;
	margin-bottom: 2rpx; /* 改为bottom margin，避免第一个item与顶部有间距 */
	position: relative;
	
	&:active {
		background-color: #f2f2f2;
	}
	
	.message-avatar {
		width: 90rpx;
		height: 90rpx;
		border-radius: 50%;
		overflow: hidden;
		position: relative;
		margin-right: 20rpx;
		
		image {
			width: 100%;
			height: 100%;
		}
		
		/* 移除了自定义badge样式，因为现在使用uvui的Badge组件 */
	}
	
	.message-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	
	.message-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8rpx;
	}
	
	.message-name {
		font-size: 30rpx;
		font-weight: 500;
		color: #333;
	}
	
	.message-time {
		font-size: 24rpx;
		color: #999;
	}
	
	.message-text {
		font-size: 28rpx;
		color: #666;
		line-height: 1.5;
	}
}

.empty-tips {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 400rpx;
}

.loading-box {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40rpx 0;
	
	.loading-text {
		font-size: 28rpx;
		color: #999;
		margin-top: 20rpx;
	}
}

// 删除原有的loading-more样式，因为使用uvui组件替代

.safe-bottom {
	height: 120rpx;
}
</style>
