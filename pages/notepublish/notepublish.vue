<template>
	<view class="publish-container">
		<!-- 添加分段器 -->
		<view class="subsection-container">
			<uv-subsection 
				:list="['上传日常', '编辑名片']" 
				:current="currentSection"
				@change="handleSectionChange"
				mode="button"
				:fontSize="15"
				:activeColor="'#000000'"
				:inactiveColor="'#999999'"
				:bgColor="'#f2f2f2'"
				customStyle="margin-bottom: 40rpx; border-radius: 40rpx; height: 80rpx;"
				customItemStyle="border-radius: 40rpx;"
			></uv-subsection>
		</view>
		
		 <!-- 表单区域 -->
		<view class="form-container">
			 <!-- 日常笔记模式表单 -->
			<template v-if="currentSection === 0">
				<view class="form-card">
					<!-- 标题输入 -->
					<view class="form-item">
						<view class="form-item-title">笔记标题</view>
						<uv-input
							v-model="formData.title"
							placeholder="请输入标题"
							:maxlength="50"
							:clearable="true"
							@input="validateForm"
							class="custom-input"
						></uv-input>
						<text class="input-counter">{{formData.title.length}}/50</text>
					</view>
					
					<!-- 正文输入 -->
					<view class="form-item">
						<view class="form-item-title">笔记内容</view>
						<uv-textarea
							v-model="formData.content"
							placeholder="请输入正文内容"
							:maxlength="2000"
							:height="120"
							:count="true"
							@input="handleContentInput"
							@linechange="handleLineChange"
							class="custom-textarea"
						></uv-textarea>
					</view>
					
					<!-- 图片上传 -->
					<view class="form-item">
						<view class="form-item-title">添加图片（最多9张，第一张做封面图）</view>
						<uv-upload
							:fileList="formData.imageList"
							@afterRead="afterRead"
							@delete="deleteImage"
							:maxCount="9"
							:multiple="true"
							:maxSize="5 * 1024 * 1024"
							@oversize="handleOversize"
							uploadIcon="photo"
							class="custom-upload"
						></uv-upload>
					</view>
				</view>
				
				<view class="form-card">
					<!-- 标签选择 -->
					<view class="form-item">
						<view class="form-item-title">添加标签（可选，最多5个）</view>
						<view class="tags-container">
							<view 
								class="tag-item" 
								v-for="(tag, index) in formData.selectedTags" 
								:key="index"
							>
								{{tag}}
								<text class="tag-delete" @click="removeTag(index)">×</text>
							</view>
							<view class="tag-add" @click="toggleCustomTagInput">
								<uv-icon name="plus" size="14" color="#666"></uv-icon>
							</view>
						</view>
					</view>
					
					 <!-- 手动输入标签 -->
					<view class="form-item" v-if="showCustomTagInput">
						<view class="form-item-title">自定义标签</view>
						<view class="tag-input-container">
							<uv-input
								v-model="customTag"
								placeholder="输入自定义标签（最多10个字符）"
								:maxlength="10"
								:clearable="true"
								class="custom-input"
								@confirm="addCustomTag"
								customStyle="height: 70rpx; align-items: center;"
							></uv-input>
							<uv-button 
								text="添加" 
								type="primary" 
								@click="addCustomTag" 
								:disabled="!customTag || formData.selectedTags.length >= 5"
								class="add-tag-btn"
								customStyle="height: 70rpx; margin-left: 15rpx; width: 120rpx;"
							></uv-button>
						</view>
					</view>
				</view>
			</template>
			
			<!-- 名片模式表单 -->
			<template v-else>
				<!-- 身份部分 -->
				<view class="form-card">
					<view class="section-title">
						<text>需求标签</text>
					</view>
					
					<!-- 身份选择跳转按钮 -->
					<view class="identity-selector" @click="navigateToCategorySelect">
						<view v-if="formData.mainCategory">
							<text class="selected-category">{{formData.mainCategory}}</text>
						</view>
						<view v-else class="empty-selector">
							<text>点击选择您的需求</text>
						</view>
						<uv-icon name="arrow-right" size="18" color="#666"></uv-icon>
					</view>
					
					<!-- 职业子类别列表 - 所有选项平铺展开 -->
					<view v-if="formData.subCategories && formData.subCategories.length > 0">
						<view class="subcategory-list">
							<!-- 子类别标签组 -->
							<view class="subcategory-section" v-for="(item, index) in formData.subCategories" :key="index">
								<!-- 子类别名称 -->
								<view class="subcategory-name">
									<text>{{item.name}}</text>
								</view>
								
								<!-- 标签 -->
								<view class="subcategory-tags">
									<view 
										class="subcategory-tag" 
										v-for="tag in item.sub_tags" 
										:key="tag.id"
										:class="{'tag-selected': isTagSelected(item.id, tag.id)}"
										@click.stop="toggleTag(item.id, tag.id, tag.name)"
									>
										{{tag.name}}
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 个人信息部分 -->
				<view class="form-card">
					<view class="section-title">
						<text>个人信息</text>
					</view>
					
					<!-- 标题输入 -->
					<view class="form-item">
						<view class="form-item-title">名片标题</view>
						<uv-input
							v-model="formData.title"
							placeholder="请输入名片标题"
							:maxlength="50"
							:clearable="true"
							@input="validateForm"
							class="custom-input"
						></uv-input>
						<text class="input-counter">{{formData.title.length}}/50</text>
					</view>
					
					<!-- 正文输入 -->
					<view class="form-item">
						<view class="form-item-title">介绍</view>
						<uv-textarea
							v-model="formData.content"
							placeholder="请介绍您自己"
							:maxlength="2000"
							:height="120"
							:count="true"
							@input="handleContentInput"
							@linechange="handleLineChange"
							class="custom-textarea"
						></uv-textarea>
					</view>

					<!-- 名片图片上传 -->
					<view class="form-item">
						<view class="form-item-title">上传图片（最多1张）</view>
						<uv-upload
							:fileList="formData.cardImage"
							@afterRead="afterRead"
							@delete="deleteImage"
							:maxCount="1"
							:multiple="false"
							:maxSize="5 * 1024 * 1024"
							@oversize="handleOversize"
							uploadIcon="photo"
							class="custom-upload"
						></uv-upload>
					</view>
				</view>
				
				<!-- 联系方式部分 -->
				<view class="form-card">
					<view class="section-title">
						<text>联系方式</text>
					</view>
					
					<!-- 手机号码 -->
					<view class="form-item">
						<view class="form-item-title">手机号码</view>
						<uv-input
							v-model="formData.phone"
							placeholder="请输入您的手机号码"
							:maxlength="11"
							:clearable="true"
							class="custom-input"
							type="number"
						></uv-input>
					</view>
					
					<!-- 微信号 -->
					<view class="form-item">
						<view class="form-item-title">微信号</view>
						<uv-input
							v-model="formData.wechat"
							placeholder="请输入您的微信号"
							:maxlength="30"
							:clearable="true"
							class="custom-input"
						></uv-input>
					</view>
				</view>
			</template>
		</view>
		
		 <!-- 上传加载中提示 -->
		<uv-toast ref="uToast"></uv-toast>
		<uv-loading-page :loading="isSubmitting"></uv-loading-page>
		
		<!-- 底部提交按钮 -->
		<view class="submit-bar">
			<uv-button 
				:text="getButtonText" 
				:disabled="(currentSection === 0 && !isFormValid) || isSubmitting" 
				:loading="isSubmitting"
				@click="handleSubmit"
				size="large"
				:type="getButtonType" 
				shape="circle"
				:custom-style="buttonStyle"
			></uv-button>
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
import userService from '../../services/user';

export default {
	data() {
		return {
			// 当前选中的分段（0: 上传日常，1: 上传名片）
			currentSection: 0,
			 // 当前选中的底部导航项（0:日常, 1:人脉, 2:发布, 3:消息, 4:个人）
			current: 2,
			// 表单数据
			formData: {
				title: '',
				content: '',
				imageList: [],
				selectedTags: [],
				// 名片专用字段
				mainCategory: '', // 大分类
				mainCategoryId: 0,
				subCategories: [], // 职业小类别列表
				selectedSubCategoryId: 0, // 已选择的小类别ID
				selectedSubCategory: '', // 已选择的小类别名称
				selectedSubCategoryIds: [], // 已选择的子类别ID数组
				selectedSubCategories: [], // 已选择的子类别名称数组
				phone: '', // 手机号码
				wechat: '', // 微信号
				cardImage: [] // 名片图片
			},
			// 当前展开的选项索引
			selectedOptionIndex: -1,
			// 自定义标签输入
			customTag: '',
			// 文本域初始高度 (rpx)
			textareaHeight: 120,
			// 文本域自动高度阈值 (字符数)
			textareaAutoHeightThreshold: 120,
			// 是否显示自定义标签输入框
			showCustomTagInput: false, 
			 // 表单是否有效
			isFormValid: false,
			// 是否正在提交
			isSubmitting: false,
			// 是否提交成功
			isSubmitSuccess: false,
			// 按钮样式对象
			buttonStyle: {
				height: '90rpx',
				marginTop: '10rpx',
				marginBottom: '10rpx',
				fontWeight: '600'
			},
		}
	},
	computed: {
		// 获取按钮文本
		getButtonText() {
			if (this.isSubmitting) {
				return this.currentSection === 0 ? '正在发布...' : '正在上传...';
			} else if (this.isSubmitSuccess) {
				return this.currentSection === 0 ? '发布成功' : '更新名片';
			}
			return this.currentSection === 0 ? '发布日常' : '发布名片';
		},
		
		// 获取按钮类型
		getButtonType() {
			if (this.isSubmitSuccess) {
				return this.currentSection === 0 ? 'success' : 'primary';
			}
			return this.currentSection === 0 && this.isFormValid ? 'primary' : (this.currentSection === 1 ? 'primary' : 'info');
		},
		
		// 当前可用的子标签列表
		availableSubTags() {
			if (this.formData.selectedSubCategoryId) {
				const selectedCategory = this.formData.subCategories.find(item => item.id === this.formData.selectedSubCategoryId);
				return selectedCategory ? (selectedCategory.sub_tags || []) : [];
			}
			return [];
		},
		
		// 已选择的所有标签
		allSelectedTags() {
			const tags = [];
			Object.values(this.formData.selectedTags).forEach(tagArray => {
				tags.push(...tagArray);
			});
			
			return tags;
		}
	},
	onLoad() {
		// 检查登录状态
		this.checkLoginStatus();
	},
	methods: {
		// 检查登录状态
		checkLoginStatus() {
			userService.checkLogin().catch(() => {
				uni.showModal({
					title: '提示',
					content: '请先登录后再发布内容',
					showCancel: false,
					success: () => {
						uni.navigateTo({
							url: '/pages/user/user'
						});
					}
				});
			});
		},
		
		// 导航到大分类选择页面
		navigateToCategorySelect() {
			uni.navigateTo({
				url: '/pages/cardcategory/cardcategory',
				events: {
					// 监听从分类选择页面返回的数据
					selectCategory: (data) => {
						console.log('从分类页面返回数据:', data);
						this.formData.mainCategory = data.title;
						this.formData.mainCategoryId = data.id || 0;
						
						// 设置可选的子类别
						this.formData.subCategories = data.items || [];
						
						// 重置选中状态
						this.selectedOptionIndex = -1;
						this.formData.selectedTags = {};
						this.formData.selectedSubCategoryIds = [];
						this.formData.selectedSubCategories = [];
						
						this.validateForm();
					}
				}
			});
		},
		
		// 判断标签是否被选中（使用ID判断）
		isTagSelected(subCategoryId, tagId) {
			const tags = this.formData.selectedTags[subCategoryId] || [];
			return tags.some(tag => tag.id === tagId);
		},
		
		// 切换标签选中状态（保存ID和名称）
		toggleTag(subCategoryId, tagId, tagName) {
			if (!this.formData.selectedTags[subCategoryId]) {
				this.$set(this.formData.selectedTags, subCategoryId, []);
				
				// 当添加第一个标签时，同时记录该子类别的ID和名称
				const subCategory = this.formData.subCategories.find(item => item.id === subCategoryId);
				if (subCategory && !this.formData.selectedSubCategoryIds.includes(subCategoryId)) {
					this.formData.selectedSubCategoryIds.push(subCategoryId);
					this.formData.selectedSubCategories.push(subCategory.name);
				}
			}
			
			const tags = this.formData.selectedTags[subCategoryId];
			const index = tags.findIndex(tag => tag.id === tagId);
			
			if (index > -1) {
				// 如果已选中，则取消选中
				tags.splice(index, 1);
				
				// 如果该子类别下没有标签了，则从选中的子类别列表中移除
				if (tags.length === 0) {
					const categoryIndex = this.formData.selectedSubCategoryIds.indexOf(subCategoryId);
					if (categoryIndex > -1) {
						this.formData.selectedSubCategoryIds.splice(categoryIndex, 1);
						this.formData.selectedSubCategories.splice(categoryIndex, 1);
					}
				}
			} else {
				// 如果未选中，且该类别下未超过3个，则选中
				if (tags.length < 3) {
					tags.push({ id: tagId, name: tagName });
				} else {
					this.$refs.uToast.show({
						message: '每个类别最多选择3个标签',
						type: 'warning'
					});
				}
			}
			
			this.validateForm();
		},
		
		// 重置表单
		resetForm() {
			this.formData = {
				title: '',
				content: '',
				imageList: [],
				// 根据当前模式初始化 selectedTags
				selectedTags: this.currentSection === 0 ? [] : {},
				mainCategory: '',
				mainCategoryId: 0,
				subCategories: [],
				selectedSubCategoryId: 0,
				selectedSubCategory: '',
				selectedSubCategoryIds: [],
				selectedSubCategories: [],
				phone: '',
				wechat: '',
				cardImage: [] // 重置名片图片
			};
			this.selectedOptionIndex = -1;
			this.customTag = '';
			this.isSubmitSuccess = false;
			this.validateForm();
		},
		
		// 判断是否有输入内容
		hasInput() {
			if (this.currentSection === 0) {
				// 日常笔记模式
				return this.formData.title.trim() !== '' || 
					   this.formData.content.trim() !== '' || 
					   this.formData.imageList.length > 0 ||
					   this.formData.selectedTags.length > 0;
			} else {
				// 名片模式
				return this.formData.title.trim() !== '' || 
					   this.formData.content.trim() !== '' || 
					   this.formData.phone.trim() !== '' ||
					   this.formData.wechat.trim() !== '' ||
					   this.formData.mainCategory !== '' ||
					   Object.keys(this.formData.selectedTags).length > 0 ||
					   this.formData.cardImage.length > 0;
			}
		},
		
		// 表单验证
		validateForm() {
			if (this.currentSection === 0) {
				// 日常笔记模式验证 - 只要求标题和内容
				this.isFormValid = this.formData.title.trim() !== '' && 
								   this.formData.content.trim() !== '';
			} else {
				// 名片模式验证 - 移除必填字段验证
				this.isFormValid = true;
			}
		},
		
		// 处理发布按钮点击
		handleSubmit() {
			console.log('handleSubmit called. isFormValid:', this.isFormValid); // 添加日志
			
			// 日常笔记模式下，提交成功则不再允许点击
			// 名片模式下，即使提交成功也允许继续点击更新
			if (this.currentSection === 0 && this.isSubmitSuccess) {
				return;
			}
			
			if (this.currentSection === 0 && !this.isFormValid) {
				// 日常笔记模式 - 检查表单有效性
				this.$refs.uToast.show({
					message: '请完善必填信息',
					type: 'warning'
				});
				return;
			} else {
				// 日常笔记模式（表单有效） 或 名片模式 - 直接提交
				this.submitForm();
			}
		},
		
		// 提交表单
		submitForm() {
			console.log('submitForm called.'); // 添加日志
			this.isSubmitting = true;
			
			// 检查登录状态
			console.log('Checking login status...'); // 添加日志
			userService.checkLogin().then(() => {
				console.log('Login check successful.'); // 添加日志
				// 准备上传数据
				let submitData = {};
				let apiUrl = '';
				
				console.log('Current section:', this.currentSection); // 添加日志
				if (this.currentSection === 0) {
					// 日常笔记数据
					apiUrl = '/api/note/create';
					
					// 提取封面图信息（第一张图片）
					let topPicId = '';
					let topPicSecretId = '';
					let coverImageUrl = '';
					let coverWidth = 0;
					let coverHeight = 0;
					
					// 提取其余图片的pic_id和pic_secret_id
					let picIds = [];
					let picSecretIds = [];
					
					// 如果有图片
					if (this.formData.imageList.length > 0) {
						// 找到封面图（第一张图片）
						const coverImage = this.formData.imageList[0];
						topPicId = coverImage.pic_id ? String(coverImage.pic_id) : '';
						topPicSecretId = coverImage.pic_secret_id;
						coverImageUrl = coverImage.localUrl || coverImage.url; // 使用本地路径或URL
						coverWidth = coverImage.width || 0;
						coverHeight = coverImage.height || 0;
						
						// 收集其余图片的pic_id和pic_secret_id
						if (this.formData.imageList.length > 1) {
							this.formData.imageList.slice(1).forEach(img => {
								if (img.pic_id) {
									picIds.push(parseInt(img.pic_id));
									if (img.pic_secret_id) {
										picSecretIds.push(img.pic_secret_id);
									}
								}
							});
						}
					}
					
					submitData = {
						type: 'note',
						title: this.formData.title,
						content: this.formData.content,
						// 封面图信息
						top_pic_id: topPicId,
						top_pic_secret_id: topPicSecretId,
						pic_ids: picIds,
						pic_secret_ids: picSecretIds.join(','),
						tags: this.formData.selectedTags
					};
					console.log('Preparing note data:', submitData); // 添加日志
					
				} else {
					// 名片数据
					apiUrl = '/api/card/upload';
					
					// 收集所有已选标签的名称和ID
					const tagNames = [];
					const tagIds = [];
					Object.entries(this.formData.selectedTags).forEach(([subCategoryId, tags]) => {
						if (tags && tags.length > 0) {
							// 提取标签ID和名称
							tags.forEach(tag => {
								tagNames.push(tag.name);
								tagIds.push(tag.id || 0);
							});
						}
					});
					
					// 确保main_category_id使用正确的ID值
					submitData = {
						title: this.formData.title.trim(),
						content: this.formData.content.trim(),
						main_category_id: parseInt(this.formData.mainCategoryId) || 0,
						main_category: this.formData.mainCategory,
						// 添加子类别ID和名称
						sub_category_id: this.formData.selectedSubCategoryIds.map(id => parseInt(id) || 0), // 确保是整数数组
						sub_category: this.formData.selectedSubCategories,
						// 标签ID和名称
						sub_tags_id: tagIds,
						sub_tags: tagNames,
						phone: this.formData.phone.trim(),
						wechat: this.formData.wechat.trim(),
						// 添加名片图片信息
						pic_ids: [],
						pic_secret_ids: ''
					};

					// 如果有名片图片，添加其ID信息
					if (this.formData.cardImage.length > 0 && this.formData.cardImage[0].pic_id) {
						submitData.pic_ids = [parseInt(this.formData.cardImage[0].pic_id)];
						submitData.pic_secret_ids = this.formData.cardImage[0].pic_secret_id || '';
					}

					console.log('Preparing card data:', submitData);
				}
				
				const finalApiUrl = uni.getStorageSync('API_BASE_URL') + apiUrl;
				const token = uni.getStorageSync('token') || '';
				console.log('Sending POST request to:', finalApiUrl, 'with token:', token ? 'present' : 'missing'); // 添加日志
				
				// 实际项目中调用API
				uni.request({
					url: finalApiUrl,
					method: 'POST',
					data: submitData,
					header: {
						'content-type': 'application/json',
						'x-nideshop-token': token
					},
					success: (res) => {
						console.log('API Response:', res);
						if (res.data.errno === 0) {
							// 设置提交成功状态
							this.isSubmitSuccess = true;
							
							// 显示成功提示
							let successMessage = '';
							
							if (this.currentSection === 0) {
								successMessage = '笔记发布成功';
								// 笔记发布成功后2秒返回上一页
								setTimeout(() => {
									uni.navigateBack();
								}, 2000);
							} else {
								// 名片模式下，根据返回的消息决定是"上传成功"还是"更新成功"
								// 如果返回消息包含"更新"则显示更新成功，否则显示上传成功
								successMessage = res.data.data && res.data.data.message ? 
									res.data.data.message : '名片上传成功';
							}
							
							this.$refs.uToast.show({
								message: successMessage,
								type: 'success',
								duration: 2000
							});
						} else {
							// 显示错误提示
							this.$refs.uToast.show({
								message: res.data.message || (this.currentSection === 0 ? '发布失败，请重试' : '上传失败，请重试'),
								type: 'error'
							});
						}
					},
					fail: (err) => {
						console.error('API Request Failed:', err);
						this.$refs.uToast.show({
							message: '网络请求失败，请检查网络',
							type: 'error'
						});
						console.error('上传失败:', err);
					},
					complete: () => {
						console.log('API Request Complete.');
						this.isSubmitting = false;
					}
				});
			}).catch((loginError) => {
				console.error('Login check failed:', loginError);
				this.isSubmitting = false;
				uni.showModal({
					title: '提示',
					content: '请先登录后再发布内容',
					showCancel: false,
					success: () => {
						uni.navigateTo({
							url: '/pages/user/user'
						});
					}
				});
			});
		},
		
		// 图片上传后的回调
		afterRead(event) {
			const { file } = event;
			const targetList = this.currentSection === 0 ? this.formData.imageList : this.formData.cardImage;
			
			// 如果是多图上传 (名片限制1张，保持通用性使用多图)
			if (Array.isArray(file)) {
				// 处理多张图片
				file.forEach(item => {
					// 保存本地文件路径以供预览使用
					this.uploadFile(item, targetList);
				});
			} else {
				// 处理单张图片
				this.uploadFile(file, targetList);
			}
			
			this.validateForm();
		},
		
		// 上传图片
		uploadFile(file, targetList) {
			// 显示上传中提示
			const loadingToast = this.$refs.uToast.show({
				message: '正在上传...',
				type: 'loading',
				duration: 0 // 不自动关闭
			});
			
			// 优化API基础URL的获取方式
			const API_BASE_URL = uni.getStorageSync('API_BASE_URL');
			if (!API_BASE_URL) {
				this.$refs.uToast.show({
					message: 'API地址未配置',
					type: 'error'
				});
				return;
			}
			
			// 确定是否为首页图（封面图）- 仅在日常笔记模式下判断
			const isCoverImage = this.currentSection === 0 && this.formData.imageList.length === 0;
			const isTopValue = this.currentSection === 0 ? (isCoverImage ? '0' : '1') : '0'; // 名片图片is_top设为0
			
			// 保存图片的本地路径用于预览
			const localFilePath = file.url;
			
			// 获取图片本地信息
			uni.getImageInfo({
				src: localFilePath,
				success: (imageInfo) => {
					// 先添加预览图片（使用本地路径）
					const imageItem = {
						url: localFilePath, // 使用本地路径作为预览
						status: 'uploading',
						message: '上传中',
						localUrl: localFilePath, // 保存原始本地路径
						width: imageInfo.width,
						height: imageInfo.height,
						is_cover: this.currentSection === 0 ? isCoverImage : true // 名片图片认为是cover
					};
					
					// 添加到图片列表显示预览
					targetList.push(imageItem);
					
					// 创建上传任务
					const uploadTask = uni.uploadFile({
						url: `${API_BASE_URL}/api/upload/image`,
						filePath: localFilePath,
						name: 'file',
						header: {
							'x-nideshop-token': uni.getStorageSync('token') || ''
						},
						formData: {
							is_top: isTopValue // 根据模式设置 is_top
						},
						success: (res) => {
							// 关闭loading提示
							this.$refs.uToast.hide();
							
							try {
								// 解析返回数据
								const data = JSON.parse(res.data);
								
								// 根据返回的状态码和审核状态显示不同的提示
								if (data.code === 0) {
									if (data.is_audit === 0) {
										// 上传成功且通过审核
										this.$refs.uToast.show({
											message: '图片上传成功',
											type: 'success'
										});
										
										// 找到刚刚添加的图片并更新状态和服务器返回的信息
										const index = targetList.findIndex(item => item.localUrl === localFilePath);
										if (index !== -1) {
											// 更新已添加图片的信息，保留本地URL作为预览
											targetList[index].status = 'success';
											targetList[index].message = '上传成功';
											targetList[index].pic_id = data.pic_id;
											targetList[index].pic_secret_id = data.pic_secret_id;
											// url字段仍然使用本地路径以便预览
										}
										
										this.validateForm();
									} else if (data.is_audit === 1) {
										// 上传成功但未通过审核
										this.$refs.uToast.show({
											message: '图片含有不当内容，请更换',
											type: 'warning',
											duration: 3000
										});
										
										// 移除未通过审核的图片
										const index = targetList.findIndex(item => item.localUrl === localFilePath);
										if (index !== -1) {
											targetList.splice(index, 1);
										}
									}
								} else {
									// 其他错误
									this.$refs.uToast.show({
										message: data.message || '上传失败',
										type: 'error'
									});
									
									// 移除上传失败的图片
									const index = targetList.findIndex(item => item.localUrl === localFilePath);
									if (index !== -1) {
										targetList.splice(index, 1);
									}
								}
							} catch (e) {
								// 解析错误
								this.$refs.uToast.show({
									message: '解析响应失败',
									type: 'error'
								});
								console.error('解析响应失败:', e);
								
								// 移除上传失败的图片
								const index = targetList.findIndex(item => item.localUrl === localFilePath);
								if (index !== -1) {
									targetList.splice(index, 1);
								}
							}
						},
						fail: (err) => {
							// 关闭loading提示
							this.$refs.uToast.hide();
							
							// 显示上传失败提示
							this.$refs.uToast.show({
								message: '图片上传失败，请重试',
								type: 'error'
							});
							console.error('上传失败:', err);
							
							// 移除上传失败的图片
							const index = targetList.findIndex(item => item.localUrl === localFilePath);
							if (index !== -1) {
								targetList.splice(index, 1);
							}
						}
					});
					
					// 监听上传进度
					uploadTask.onProgressUpdate((res) => {
						// 更新上传进度
						const index = targetList.findIndex(item => item.localUrl === localFilePath);
						if (index !== -1) {
							targetList[index].progress = res.progress;
							if (res.progress === 100) {
								targetList[index].message = '处理中';
							}
						}
					});
				},
				fail: () => {
					// 无法获取图片信息时
					this.$refs.uToast.hide();
					this.$refs.uToast.show({
						message: '无法读取图片信息',
						type: 'error'
					});
				}
			});
		},
		
		// 删除图片
		deleteImage(event) {
			if (this.currentSection === 0) {
				this.formData.imageList.splice(event.index, 1);
			} else {
				this.formData.cardImage.splice(event.index, 1);
			}
			this.validateForm();
		},
		
		// 处理图片过大
		handleOversize() {
			this.$refs.uToast.show({
				message: '图片大小不能超过5MB',
				type: 'error'
			});
		},
		
		// 添加自定义标签
		addCustomTag() {
			// 确保在日常模式下操作，并且 selectedTags 是数组
			if (this.currentSection !== 0 || !Array.isArray(this.formData.selectedTags)) {
				console.error('addCustomTag called in incorrect mode or with incorrect data type.');
				return;
			}
			
			if (!this.customTag || this.customTag.trim() === '') {
				this.$refs.uToast.show({
					message: '标签不能为空',
					type: 'warning'
				});
				return;
			}
			
			if (this.formData.selectedTags.length >= 5) {
				this.$refs.uToast.show({
					message: '最多添加5个标签',
					type: 'warning'
				});
				return;
			}
			
			// 检查标签是否已存在
			if (this.formData.selectedTags.includes(this.customTag.trim())) {
				this.$refs.uToast.show({
					message: '该标签已添加',
					type: 'warning'
				});
				return;
			}
			
			// 添加自定义标签
			this.formData.selectedTags.push(this.customTag.trim());
			this.customTag = ''; // 清空输入框
			this.validateForm();
			
			// 显示成功提示
			this.$refs.uToast.show({
				message: '标签添加成功',
				type: 'success',
				duration: 1500
			});
		},
		
		// 删除标签
		removeTag(index) {
			this.formData.selectedTags.splice(index, 1);
			this.validateForm();
		},
		
		// 打开/关闭自定义标签输入
		toggleCustomTagInput() {
			if (!this.showCustomTagInput && this.formData.selectedTags.length >= 5) {
				this.$refs.uToast.show({
					message: '最多添加5个标签',
					type: 'warning'
				});
				return;
			}
			this.showCustomTagInput = !this.showCustomTagInput;
		},
		
		// 切换底部导航栏
		tabChange(index) {
			// 当点击的不是当前页面时才执行跳转
			if (index !== 2) {
				// 如果有输入内容，弹窗确认是否放弃
				if (this.hasInput()) {
					uni.showModal({
						title: '提示',
						content: '切换页面将丢失当前编辑的内容，是否继续？',
						success: (res) => {
							if (res.confirm) {
								this.navigateToTab(index);
							}
						}
					});
				} else {
					this.navigateToTab(index);
				}
			}
		},
		
		// 导航到指定的标签页
		navigateToTab(index) {
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
		
		// 处理文本域行数变化
		handleLineChange(e) {
			// 如果内容少于阈值，我们仍然希望文本域高度能够根据内容而增加
			if (this.formData.content.length <= this.textareaAutoHeightThreshold) {
				// 计算实际需要的高度，但不小于初始高度
				const calculatedHeight = Math.max(e.detail.height, this.textareaHeight);
				if (calculatedHeight !== this.textareaHeight) {
					this.textareaHeight = calculatedHeight;
				}
			}
		},
		
		// 正文内容输入处理
		handleContentInput(value) {
			// 检测是否有连续三个换行符（两个空行）
			if (/\n\n\n/.test(value)) {
				// 替换掉连续的换行为两个换行
				this.formData.content = value.replace(/\n\n\n+/g, '\n\n');
			} else {
				this.previousContent = value;
			}
			
			this.validateForm();
		},
		
		// 处理分段器变化
		handleSectionChange(index) {
			// 切换分段前先清空表单数据
			if (this.hasInput() && this.currentSection !== index) {
				uni.showModal({
					title: '提示',
					content: '切换将丢失当前已编辑的内容，是否继续？',
					success: (res) => {
						if (res.confirm) {
							this.currentSection = index;
							this.resetForm();
						}
					}
				});
			} else {
				this.currentSection = index;
				this.resetForm();
			}
		},
	},
	watch: {
		// 监听内容长度变化，处理高度调整逻辑
		'formData.content'(newVal) {
			// 当内容少于阈值时，重置为初始高度
			if (newVal.length <= this.textareaAutoHeightThreshold && this.textareaHeight !== 120) {
				// 使用setTimeout避免立即设置导致的渲染问题
				setTimeout(() => {
					this.textareaHeight = 120;
				}, 10);
			}
		}
	}
}
</script>

<style lang="scss" scoped>
	.publish-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background-color: #fafafa;
		padding-bottom: 120rpx; /* 为底部导航栏留出更多空间 */
		padding-top: 40rpx; 
	}
	
	/* 分段器容器样式 */
	.subsection-container {
		padding: 10rpx 30rpx 0rpx;
	}
	
	.form-container {
		flex: 1;
		padding: 0 30rpx;
		
		.form-card {
			background-color: #fff;
			border-radius: 20rpx;
			padding: 30rpx;
			margin-bottom: 30rpx;
			box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
			
			.section-title {
				font-size: 32rpx;
				font-weight: bold;
				margin-bottom: 30rpx;
				color: #262626;
			}
		}
		
		.form-item {
			margin-bottom: 40rpx;
			position: relative;
			
			&:last-child {
				margin-bottom: 10rpx;
			}
			
			.form-item-title {
				font-size: 28rpx;
				color: #262626;
				margin-bottom: 20rpx;
				font-weight: 500;
			}
			
			.input-counter {
				position: absolute;
				right: 10rpx;
				top: 10rpx;
				font-size: 24rpx;
				color: #8e8e8e;
			}
		}
		
		.identity-selector {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 25rpx 30rpx;
			background-color: #fafafa;

			border: 1px solid #efefef !important;
			margin-bottom: 20rpx;
			transition: all 0.3s;
			border-radius: 40rpx;
			
			&:active {
				background-color: #f0f0f0;
			}
			
			.selected-category {
				font-size: 28rpx;
				color: #262626;
				font-weight: 500;
			}
			
			.empty-selector {
				text {
					font-size: 28rpx;
					color: #8e8e8e;
				}
			}
		}
		
		/* 职业子类别列表 - 平铺展示样式 */
		.subcategory-list {
			margin-top: 30rpx;
			
			.subcategory-section {
				margin-bottom: 30rpx;
				
				.subcategory-name {
					font-size: 28rpx;
					color: #333;
					font-weight: 600;
					margin-bottom: 16rpx;
					padding-bottom: 10rpx;
					border-bottom: 1px solid #f0f0f0;
				}
				
				.subcategory-tags {
					display: flex;
					flex-wrap: wrap;
					
					.subcategory-tag {
						padding: 10rpx 20rpx;
						background-color: #ffffff;
						border: 1px solid #efefef;
						border-radius: 30rpx;
						margin-right: 16rpx;
						margin-bottom: 16rpx;
						font-size: 24rpx;
						color: #666;
						
						&.tag-selected {
							background-color: #0095f6;
							color: #ffffff;
							border-color: #0095f6;
						}
						
						&:active {
							opacity: 0.8;
						}
					}
				}
			}
		}
		
		:deep(.custom-input) {
			border-radius: 12px !important;
			background-color: #fafafa;
			overflow: hidden;
			padding: 4rpx 0;
			border: 1px solid #efefef !important;
			
			.uv-input__input {
				font-weight: 400 !important;
				padding: 20rpx 25rpx !important;
				color: #262626;
			}
		}
		
		:deep(.custom-textarea) {
			border-radius: 8rpx !important;
			background-color: #fafafa;
			padding: 20rpx 25rpx !important;
			margin-bottom: 20rpx;
			transition: height 0.2s ease-in-out;
			border: 1px solid #efefef !important;
			
			.uv-textarea__field {
				font-weight: 400 !important;
				line-height: 1.6;
				padding: 10rpx 0;
				box-sizing: border-box;
				color: #262626;
			}
			
			.uv-textarea__count {
				margin-top: 10rpx;
				color: #8e8e8e;
			}
		}
		
		:deep(.custom-upload) {
			.uv-upload__deletable {
				border-radius: 8rpx;
				overflow: hidden;
			}
			
			.uv-upload__preview-image {
				border-radius: 8rpx;
			}
			
			.uv-upload__bg {
				background-color: #fafafa !important;
				border: 1px dashed #dbdbdb;
				border-radius: 8rpx;
			}
		}
	}
	
	/* 底部提交按钮 */
	.submit-bar {
		padding: 30rpx;
		margin-bottom: 40rpx;
	}
	
	.tags-container {
		display: flex;
		flex-wrap: wrap;
		
		.tag-item {
			display: flex;
			align-items: center;
			padding: 14rpx 25rpx;
			background-color: #0095f6;
			border-radius: 40rpx;
			margin-right: 20rpx;
			margin-bottom: 20rpx;
			font-size: 26rpx;
			color: #ffffff;
			font-weight: 400;
			
			.tag-delete {
				margin-left: 10rpx;
				font-size: 28rpx;
				line-height: 1;
			}
		}
		
		.tag-add {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 60rpx;
			height: 60rpx;
			border-radius: 30rpx;
			border: 1rpx dashed #dbdbdb;
			margin-bottom: 20rpx;
			background-color: #fafafa;
			transition: all 0.2s;
			
			&:active {
				background-color: #f0f0f0;
			}
		}
	}
	
	.tag-input-container {
		display: flex;
		align-items: center;
		margin-bottom: 10rpx;
		
		:deep(.custom-input) {
			flex: 1;
		}
	}
	
	.form-item-hint {
		font-size: 24rpx;
		color: #8e8e8e;
		margin-top: 10rpx;
		display: block;
	}
</style>
