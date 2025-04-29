<template>
	<view class="container">
		<!-- 搜索框部分 - 可以返回并重新搜索 -->
		<view class="search-header">
			<view class="search-box">
				<uv-search
					v-model="keyword"
					:showAction="true"
					actionText="取消"
					@search="handleSearch"
					@custom="goBack"
					:clearabled="true"
					searchIconSize="17"
					:focus="false"
				></uv-search>
			</view>
		</view>
		
		<!-- 标签切换 -->
		<uv-tabs
			:list="tabList"
			:current="currentTab"
			@change="tabChange"
			itemStyle="padding-left: 30rpx; padding-right: 30rpx; height: 80rpx;"
			lineColor="#2979ff"
			:activeStyle="{
				color: '#303133',
				fontWeight: 'bold'
			}"
			:inactiveStyle="{
				color: '#606266',
				fontSize: '28rpx'
			}"
			lineWidth="30"
		></uv-tabs>
		
		<!-- 加载状态 -->
		<view class="loading-box" v-if="loading">
			<uv-loading size="24" mode="circle" color="#2979ff"></uv-loading>
			<text class="loading-text">正在加载中...</text>
		</view>
		
		<!-- 无搜索结果提示 -->
		<view class="empty-box" v-else-if="showEmptyResult">
			<uv-empty
				mode="search"
				text="没有找到相关内容"
				marginTop="100"
			></uv-empty>
		</view>
		
		<!-- 搜索结果区域 -->
		<swiper class="swiper-box" :current="currentTab" @change="swiperChange" :style="{height: swiperHeight + 'px'}">
			<!-- 日常搜索结果 -->
			<swiper-item>
				<scroll-view scroll-y class="swiper-scroll" @scrolltolower="loadMore('note')" @scroll="handleScroll">
					<!-- 日常瀑布流 -->
					<view class="waterfall-container">
						<uv-waterfall 
							ref="noteWaterfall"
							v-model="noteList"
							:add-time="10"
							:left-gap="gapSize"
							:right-gap="gapSize"
							:column-gap="columnGap"
							@changeList="changeNoteList"
						>
							<!-- 第一列数据 -->
							<template v-slot:list1>
								<view>
									<view v-for="(item, index) in noteList1"
										:key="item.id"
										class="flow-item"
										@click="toNoteDetail(item)"
									>
										<view class="flow-item__image" v-if="item.image" :style="[imageStyle(item)]">
											<image :src="item.image" mode="widthFix" :style="{width:item.width+'px'}"></image>
										</view>
										<view class="flow-item__ft">
											<view class="flow-item__ft__title">
												<text class="value">{{item.title}}</text>
											</view>
											<view class="flow-item__ft__desc uv-line-2">
												<text class="value">{{item.desc}}</text>
											</view>
											<view class="flow-item__ft__author">
												<view class="author-info" @click.stop="navigateToUserLook(item.uid)">
													<image class="avatar" :src="item.avatar" mode="aspectFill"></image>
													<text class="nickname">{{item.nickname}}</text>
												</view>
												<view class="like-area" @click.stop="handleNoteLike(item)">
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
								<view>
									<view v-for="(item, index) in noteList2"
										:key="item.id"
										class="flow-item"
										@click="toNoteDetail(item)"
									>
										<view class="flow-item__image" v-if="item.image" :style="[imageStyle(item)]">
											<image :src="item.image" mode="widthFix" :style="{width:item.width+'px'}"></image>
										</view>
										<view class="flow-item__ft">
											<view class="flow-item__ft__title">
												<text class="value">{{item.title}}</text>
											</view>
											<view class="flow-item__ft__desc uv-line-2">
												<text class="value">{{item.desc}}</text>
											</view>
											<view class="flow-item__ft__author">
												<view class="author-info" @click.stop="navigateToUserLook(item.uid)">
													<image class="avatar" :src="item.avatar" mode="aspectFill"></image>
													<text class="nickname">{{item.nickname}}</text>
												</view>
												<view class="like-area" @click.stop="handleNoteLike(item)">
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
						<view class="load-more" v-if="noteLoadMoreStatus === 'loading'">加载中...</view>
						<view class="load-more" v-if="noteLoadMoreStatus === 'nomore'">没有更多了</view>
					</view>
				</scroll-view>
			</swiper-item>
			
			<!-- 名片搜索结果 -->
			<swiper-item>
				<scroll-view scroll-y class="swiper-scroll" @scrolltolower="loadMore('card')" @scroll="handleScroll">
					<!-- 名片瀑布流 -->
					<view class="waterfall-container">
						<uv-waterfall 
							ref="cardWaterfall"
							v-model="cardList"
							:add-time="10"
							:left-gap="gapSize"
							:right-gap="gapSize"
							:column-count="1"
							@changeList="changeCardList"
						>
							<!-- 名片列表 -->
							<template v-slot:list1>
								<view>
									<view v-for="(item, index) in cardList1"
										:key="item.id"
										class="card-item"
										@click="toCardDetail(item)"
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
											<view class="stat-item" @click.stop="handleCardLike(item)">
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
						<view class="load-more" v-if="cardLoadMoreStatus === 'loading'">加载中...</view>
						<view class="load-more" v-if="cardLoadMoreStatus === 'nomore'">没有更多了</view>
					</view>
				</scroll-view>
			</swiper-item>
			
			<!-- 用户搜索结果 -->
			<swiper-item>
				<scroll-view scroll-y class="swiper-scroll" @scrolltolower="loadMore('user')" @scroll="handleScroll">
					<view class="user-list">
						<view 
							class="user-item" 
							v-for="(item, index) in userList" 
							:key="item.id" 
							@click="navigateToUserLook(item.uid)"
						>
							<view class="user-avatar">
								<image :src="item.avatar" mode="aspectFill"></image>
							</view>
							<view class="user-info">
								<view class="user-name">{{item.nickname}}</view>
								<view class="user-bio">{{item.bio || '暂无简介'}}</view>
							</view>
							<view class="follow-btn" @click.stop="followUser(item)">
								<text>{{item.isFollowed ? '已关注' : '关注'}}</text>
							</view>
						</view>
					</view>
					
					<!-- 加载更多提示 -->
					<view class="load-more" v-if="userLoadMoreStatus === 'loading'">加载中...</view>
					<view class="load-more" v-if="userLoadMoreStatus === 'nomore'">没有更多了</view>
				</scroll-view>
			</swiper-item>
		</swiper>
		
		<uv-toast ref="uToast"></uv-toast>
	</view>
</template>

<script>
	import ENV_CONFIG from '@/config/config.js';
	import userService from '../../services/user';
	
	export default {
		data() {
			return {
				keyword: '',
				currentTab: 0,
				tabList: [
					{name: '日常', count: 0},
					{name: '名片', count: 0},
					{name: '用户', count: 0}
				],
				
				// 日常笔记相关
				noteList: [], // 瀑布流数据列表
				noteList1: [], // 瀑布流第一列数据
				noteList2: [], // 瀑布流第二列数据
				notePage: 1,
				noteHasMore: true,
				noteLoadMoreStatus: 'loadmore',
				
				// 名片相关
				cardList: [], // 瀑布流数据列表
				cardList1: [], // 瀑布流第一列数据
				cardPage: 1,
				cardHasMore: true,
				cardLoadMoreStatus: 'loadmore',
				
				// 用户相关
				userList: [],
				userPage: 1,
				userHasMore: true,
				userLoadMoreStatus: 'loadmore',
				
				// 通用设置
				pageSize: 10,
				gapSize: 8,
				columnGap: 8,
				swiperHeight: 500,
				loading: false,
				loadingCounts: false,
			}
		},
		computed: {
			// 图片样式计算
			imageStyle() {
				return item => {
					const screenWidth = uni.upx2px(750);
					const availableWidth = screenWidth - (this.gapSize * 2) - this.columnGap;
					const columnWidth = availableWidth / 2;
					
					// 根据图片原始比例计算高度
					const rate = columnWidth / item.w;
					const h = rate * item.h;
					
					return {
						width: columnWidth + 'px',
						height: h + 'px'
					}
				}
			},
			
			// 判断是否显示空结果
			showEmptyResult() {
				if (this.loading) return false;
				
				switch (this.currentTab) {
					case 0: return this.noteList.length === 0;
					case 1: return this.cardList.length === 0;
					case 2: return this.userList.length === 0;
					default: return false;
				}
			}
		},
		onLoad(options) {
			// 获取搜索关键词
			this.keyword = options.keyword || '';
			if (this.keyword) {
				this.executeSearch();
			}
			
			this.calcSwiperHeight();
		},
		methods: {
			calcSwiperHeight() {
				uni.getSystemInfo({
					success: (res) => {
						this.swiperHeight = res.windowHeight - uni.upx2px(160); // 搜索框和标签栏高度约为160rpx
					}
				});
			},
			
			// 执行搜索
			executeSearch() {
				this.loading = true;
				
				// 重置搜索结果计数
				if (!this.loadingCounts) {
					this.getResultCounts();
				}
				
				// 根据当前tab执行对应的搜索
				switch (this.currentTab) {
					case 0: this.searchNotes(); break;
					case 1: this.searchCards(); break;
					case 2: this.searchUsers(); break;
				}
			},
			
			// 获取搜索结果各类型的数量
			getResultCounts() {
				this.loadingCounts = true;
				
				uni.request({
					url: `${ENV_CONFIG.API_BASE_URL}/api/search/count`,
					method: 'GET',
					data: {
						query: this.keyword
					},
					success: (res) => {
						if (res.data && res.data.errno === 0 && res.data.data) {
							const countData = res.data.data;
							// 更新标签计数
							this.tabList[0].count = countData.note_count || 0;
							this.tabList[1].count = countData.card_count || 0;
							this.tabList[2].count = countData.user_count || 0;
						}
					},
					complete: () => {
						this.loadingCounts = false;
					}
				});
			},
			
			// 搜索日常笔记
			searchNotes() {
				if (!this.noteHasMore || this.noteLoadMoreStatus === 'loading') return;
				
				this.noteLoadMoreStatus = 'loading';
				
				uni.request({
					url: `${ENV_CONFIG.API_BASE_URL}/api/search/search`,
					method: 'GET',
					data: {
						query: this.keyword,
						type: 'note',
						page: this.notePage,
						size: this.pageSize
					},
					success: (res) => {
						if (res.data && res.data.errno === 0 && res.data.data) {
							const searchData = res.data.data;
							const noteData = searchData.notes || [];
							
							if (noteData.length > 0) {
								const processedData = this.processNoteData(noteData);
								this.noteList = [...this.noteList, ...processedData];
								this.notePage++;
								
								// 更新标签计数
								if (this.notePage === 2) {
									this.tabList[0].count = searchData.total_count || noteData.length;
								}
								
								// 判断是否还有更多数据
								if (noteData.length < this.pageSize) {
									this.noteHasMore = false;
									this.noteLoadMoreStatus = 'nomore';
								} else {
									this.noteLoadMoreStatus = 'loadmore';
								}
							} else {
								this.noteHasMore = false;
								this.noteLoadMoreStatus = 'nomore';
							}
						} else {
							uni.showToast({
								title: '搜索数据加载失败',
								icon: 'none'
							});
							this.noteLoadMoreStatus = 'loadmore';
						}
					},
					fail: (err) => {
						console.error('搜索笔记失败:', err);
						uni.showToast({
							title: '网络请求失败',
							icon: 'none'
						});
						this.noteLoadMoreStatus = 'loadmore';
					},
					complete: () => {
						this.loading = false;
					}
				});
			},
			
			// 搜索名片
			searchCards() {
				if (!this.cardHasMore || this.cardLoadMoreStatus === 'loading') return;
				
				this.cardLoadMoreStatus = 'loading';
				
				uni.request({
					url: `${ENV_CONFIG.API_BASE_URL}/api/search/search`,
					method: 'GET',
					data: {
						query: this.keyword,
						type: 'card',
						page: this.cardPage,
						size: this.pageSize
					},
					success: (res) => {
						if (res.data && res.data.errno === 0 && res.data.data) {
							const searchData = res.data.data;
							const cardData = searchData.cards || [];
							
							if (cardData.length > 0) {
								const processedData = this.processCardData(cardData);
								this.cardList = [...this.cardList, ...processedData];
								this.cardPage++;
								
								// 更新标签计数
								if (this.cardPage === 2) {
									this.tabList[1].count = searchData.total_count || cardData.length;
								}
								
								// 判断是否还有更多数据
								if (cardData.length < this.pageSize) {
									this.cardHasMore = false;
									this.cardLoadMoreStatus = 'nomore';
								} else {
									this.cardLoadMoreStatus = 'loadmore';
								}
							} else {
								this.cardHasMore = false;
								this.cardLoadMoreStatus = 'nomore';
							}
						} else {
							uni.showToast({
								title: '搜索数据加载失败',
								icon: 'none'
							});
							this.cardLoadMoreStatus = 'loadmore';
						}
					},
					fail: (err) => {
						console.error('搜索名片失败:', err);
						uni.showToast({
							title: '网络请求失败',
							icon: 'none'
						});
						this.cardLoadMoreStatus = 'loadmore';
					},
					complete: () => {
						this.loading = false;
					}
				});
			},
			
			// 搜索用户
			searchUsers() {
				if (!this.userHasMore || this.userLoadMoreStatus === 'loading') return;
				
				this.userLoadMoreStatus = 'loading';
				
				uni.request({
					url: `${ENV_CONFIG.API_BASE_URL}/api/search/search`,
					method: 'GET',
					data: {
						query: this.keyword,
						type: 'user',
						page: this.userPage,
						size: this.pageSize
					},
					success: (res) => {
						if (res.data && res.data.errno === 0 && res.data.data) {
							const searchData = res.data.data;
							const userData = searchData.users || [];
							
							if (userData.length > 0) {
								const processedData = this.processUserData(userData);
								this.userList = [...this.userList, ...processedData];
								this.userPage++;
								
								// 更新标签计数
								if (this.userPage === 2) {
									this.tabList[2].count = searchData.total_count || userData.length;
								}
								
								// 判断是否还有更多数据
								if (userData.length < this.pageSize) {
									this.userHasMore = false;
									this.userLoadMoreStatus = 'nomore';
								} else {
									this.userLoadMoreStatus = 'loadmore';
								}
							} else {
								this.userHasMore = false;
								this.userLoadMoreStatus = 'nomore';
							}
						} else {
							uni.showToast({
								title: '搜索数据加载失败',
								icon: 'none'
							});
							this.userLoadMoreStatus = 'loadmore';
						}
					},
					fail: (err) => {
						console.error('搜索用户失败:', err);
						uni.showToast({
							title: '网络请求失败',
							icon: 'none'
						});
						this.userLoadMoreStatus = 'loadmore';
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
					let imageUrl = item.top_pic_url || '';
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
						avatar: item.avatar || 'https://zoj.oss-cn-shanghai.aliyuncs.com/peo/default_avatar.jpg',
						nickname: item.nickname || '匿名用户',
						likes: parseInt(item.like_count) || 0,
						isLiked: Boolean(item.is_liked),
						tags: tags
					};
				});
			},
			
			// 处理API返回的名片数据
			processCardData(cardData) {
				return cardData.map(item => {
					let tags = [];
					if (item.sub_tags && Array.isArray(item.sub_tags)) {
						if (item.sub_tags.length > 4) {
							const shuffled = [...item.sub_tags].sort(() => 0.5 - Math.random());
							tags = shuffled.slice(0, 4).map(tag => tag.name);
						} else {
							tags = item.sub_tags.map(tag => tag.name);
						}
					}
					
					// 使用API返回的头像
					const avatarUrl = item.avatar || 'https://zoj.oss-cn-shanghai.aliyuncs.com/peo/default_avatar.jpg';
					
					return {
						id: item.id,
						avatar: avatarUrl,
						nickname: item.nickname || item.name || `用户${item.uid}`,
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
			
			// 处理API返回的用户数据
			processUserData(userData) {
				return userData.map(item => {
					return {
						id: item.id,
						uid: item.uid,
						nickname: item.nickname || '匿名用户',
						avatar: item.avatar || 'https://zoj.oss-cn-shanghai.aliyuncs.com/peo/default_avatar.jpg',
						bio: item.personal_intro || '暂无简介',
						isFollowed: Boolean(item.is_followed),
						followings_count: parseInt(item.followings_count) || 0,
						fans_count: parseInt(item.fans_count) || 0
					};
				});
			},
			
			// 改变日常笔记的瀑布流列表
			changeNoteList(e) {
				this[`noteList${e.name.slice(-1)}`].push(e.value);
			},
			
			// 改变名片的瀑布流列表
			changeCardList(e) {
				this[`cardList${e.name.slice(-1)}`].push(e.value);
			},
			
			// 处理日常点赞
			handleNoteLike(item) {
				// 找到对应的项
				const index = this.noteList.findIndex(i => i.id === item.id);
				if (index !== -1) {
					const isLiked = this.noteList[index].isLiked;
					
					this.noteList[index] = {
						...this.noteList[index],
						isLiked: !isLiked,
						likes: this.noteList[index].likes + (isLiked ? -1 : 1)
					};
					
					// 同时更新对应列中的数据
					const list1Index = this.noteList1.findIndex(i => i.id === item.id);
					if (list1Index !== -1) {
						this.noteList1[list1Index] = {
							...this.noteList1[list1Index],
							isLiked: !isLiked,
							likes: this.noteList1[list1Index].likes + (isLiked ? -1 : 1)
						};
					}
					
					const list2Index = this.noteList2.findIndex(i => i.id === item.id);
					if (list2Index !== -1) {
						this.noteList2[list2Index] = {
							...this.noteList2[list2Index],
							isLiked: !isLiked,
							likes: this.noteList2[list2Index].likes + (isLiked ? -1 : 1)
						};
					}
					
					this.$forceUpdate();
				}
			},
			
			// 处理名片点赞
			handleCardLike(item) {
				// 找到对应的项
				const index = this.cardList.findIndex(i => i.id === item.id);
				if (index !== -1) {
					const isLiked = this.cardList[index].isLiked;
					
					this.cardList[index] = {
						...this.cardList[index],
						isLiked: !isLiked,
						likes: this.cardList[index].likes + (isLiked ? -1 : 1)
					};
					
					// 同时更新列中的数据
					const list1Index = this.cardList1.findIndex(i => i.id === item.id);
					if (list1Index !== -1) {
						this.cardList1[list1Index] = {
							...this.cardList1[list1Index],
							isLiked: !isLiked,
							likes: this.cardList1[list1Index].likes + (isLiked ? -1 : 1)
						};
					}
					
					this.$forceUpdate();
				}
			},
			
			// 关注用户
			followUser(item) {
				// 检查登录状态
				userService.checkLogin().then(() => {
					const index = this.userList.findIndex(i => i.id === item.id);
					if (index !== -1) {
						const isFollowed = this.userList[index].isFollowed;
						
						// 更新状态
						this.userList[index].isFollowed = !isFollowed;
						
						// 这里可以添加API请求来保存关注状态
						uni.showToast({
							title: !isFollowed ? '已关注' : '已取消关注',
							icon: 'none'
						});
					}
				}).catch(() => {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					});
				});
			},
			
			// 添加为联系人
			addContact(item) {
				userService.checkLogin().then(() => {
					uni.showToast({
						title: '关注成功',
						icon: 'none'
					});
				}).catch(() => {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					});
				});
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
			
			// 预览图片
			previewImage(imageUrl) {
				if (!imageUrl) return;
				uni.previewImage({
					urls: [imageUrl],
					current: imageUrl
				});
			},
			
			// 处理搜索
			handleSearch() {
				if (!this.keyword.trim()) {
					uni.showToast({
						title: '请输入搜索内容',
						icon: 'none'
					});
					return;
				}
				
				// 重置搜索数据
				this.resetSearchData();
				
				// 执行搜索
				this.executeSearch();
			},
			
			// 重置搜索数据
			resetSearchData() {
				// 日常笔记重置
				this.noteList = [];
				this.noteList1 = [];
				this.noteList2 = [];
				this.notePage = 1;
				this.noteHasMore = true;
				this.noteLoadMoreStatus = 'loadmore';
				
				// 名片重置
				this.cardList = [];
				this.cardList1 = [];
				this.cardPage = 1;
				this.cardHasMore = true;
				this.cardLoadMoreStatus = 'loadmore';
				
				// 用户重置
				this.userList = [];
				this.userPage = 1;
				this.userHasMore = true;
				this.userLoadMoreStatus = 'loadmore';
				
				// 重置加载状态
				this.loading = true;
				
				// 强制重新计算瀑布流
				this.$nextTick(() => {
					if (this.$refs.noteWaterfall) {
						this.$refs.noteWaterfall.clear();
					}
					if (this.$refs.cardWaterfall) {
						this.$refs.cardWaterfall.clear();
					}
				});
			},
			
			// 加载更多
			loadMore(type) {
				switch (type) {
					case 'note':
						if (this.noteHasMore && this.noteLoadMoreStatus !== 'loading') {
							this.searchNotes();
						}
						break;
					case 'card':
						if (this.cardHasMore && this.cardLoadMoreStatus !== 'loading') {
							this.searchCards();
						}
						break;
					case 'user':
						if (this.userHasMore && this.userLoadMoreStatus !== 'loading') {
							this.searchUsers();
						}
						break;
				}
			},
			
			// 返回上一页
			goBack() {
				uni.navigateBack();
			},
			
			// Tab切换
			tabChange(e) {
				const index = e.index;
				this.currentTab = index;
				
				// 如果该类型还没有加载数据，则加载数据
				switch (index) {
					case 0:
						if (this.noteList.length === 0 && this.noteHasMore) {
							this.searchNotes();
						}
						break;
					case 1:
						if (this.cardList.length === 0 && this.cardHasMore) {
							this.searchCards();
						}
						break;
					case 2:
						if (this.userList.length === 0 && this.userHasMore) {
							this.searchUsers();
						}
						break;
				}
			},
			
			// Swiper滑动切换
			swiperChange(e) {
				this.currentTab = e.detail.current;
				
				// 如果该类型还没有加载数据，则加载数据
				switch (this.currentTab) {
					case 0:
						if (this.noteList.length === 0 && this.noteHasMore) {
							this.searchNotes();
						}
						break;
					case 1:
						if (this.cardList.length === 0 && this.cardHasMore) {
							this.searchCards();
						}
						break;
					case 2:
						if (this.userList.length === 0 && this.userHasMore) {
							this.searchUsers();
						}
						break;
				}
			},
			
			// 跳转到用户详情页
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
			
			// 跳转到日常详情页
			toNoteDetail(item) {
				uni.navigateTo({
					url: '/pages/note/note?id=' + item.id
				});
			},
			
			// 跳转到名片详情页
			toCardDetail(item) {
				uni.navigateTo({
					url: '/pages/carddetail/carddetail?id=' + item.id
				});
			},
			
			// 处理滚动事件，可以用来做下拉刷新等
			handleScroll(e) {
				// 可以添加滚动处理逻辑
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f8f8f8;
	}
	
	.search-header {
		background-color: #ffffff;
		padding: 20rpx 0;
		border-bottom: 1px solid #f0f0f0;
		width: 100%;
		z-index: 999;
		
		.search-box {
			width: 94%;
			margin: 0 auto;
		}
	}
	
	.loading-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60rpx 0;
		
		.loading-text {
			font-size: 28rpx;
			color: #999;
			margin-top: 20rpx;
		}
	}
	
	.swiper-box {
		flex: 1;
	}
	
	.swiper-scroll {
		height: 100%;
	}
	
	/* 日常瀑布流样式 */
	.waterfall-container {
		padding: 0rpx;
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
				margin-top: 6rpx;
				
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
	
	/* 名片样式 */
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
	
	/* 用户列表样式 */
	.user-list {
		padding: 20rpx;
	}
	
	.user-item {
		display: flex;
		align-items: center;
		padding: 30rpx 20rpx;
		background-color: #fff;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
		
		.user-avatar {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
			overflow: hidden;
			margin-right: 20rpx;
			
			image {
				width: 100%;
				height: 100%;
			}
		}
		
		.user-info {
			flex: 1;
			
			.user-name {
				font-size: 32rpx;
				color: #333;
				font-weight: bold;
				margin-bottom: 10rpx;
			}
			
			.user-bio {
				font-size: 26rpx;
				color: #666;
				line-height: 1.5;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}
		
		.follow-btn {
			padding: 14rpx 30rpx;
			background-color: #3c9cff;
			border-radius: 40rpx;
			margin-left: 20rpx;
			
			text {
				color: #fff;
				font-size: 26rpx;
				line-height: 1;
			}
		}
	}
	
	.load-more {
		text-align: center;
		padding: 20rpx 0;
		color: #999;
		font-size: 26rpx;
	}
</style>
