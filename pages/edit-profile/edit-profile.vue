<template>
	<view class="edit-profile-container">
		<view class="form-wrapper">
			<!-- 基本信息表单 -->
			<view class="form-group">
				<view class="section-header">
					<uv-icon name="edit-pen-fill" size="24" color="#2979ff" customStyle="margin-right: 10rpx;"></uv-icon>
					<text class="section-title">基本信息</text>
				</view>
				<uv-form 
					:model="formData" 
					ref="uvForm" 
					:rules="rules" 
					labelPosition="left" 
					:labelWidth="120" 
					:customStyle="{background: 'transparent'}"
				>
					<!-- 头像选项，整合到表单中 -->
					<uv-form-item label="头像" borderBottom>
						<!-- #ifdef MP-WEIXIN -->
						<view class="input-container">
							<text class="placeholder-text" v-if="!formData.avatar">点击更换头像</text>
						</view>
						<view slot="right">
							<button class="avatar-upload wx-avatar-button" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
								<image class="avatar" :src="formData.avatar || '/static/images/default-avatar.png'" mode="aspectFill"></image>
								<view class="avatar-hint">
									<uv-icon name="camera-fill" size="18" color="#ffffff"></uv-icon>
								</view>
							</button>
						</view>
						<!-- #endif -->
						
						<!-- #ifndef MP-WEIXIN -->
						<view class="input-container">
							<text class="placeholder-text" v-if="!formData.avatar">点击更换头像</text>
						</view>
						<view slot="right">
							<view class="avatar-upload" @click="chooseAvatar">
								<image class="avatar" :src="formData.avatar || '/static/images/default-avatar.png'" mode="aspectFill"></image>
								<view class="avatar-hint">
									<uv-icon name="camera-fill" size="18" color="#ffffff"></uv-icon>
								</view>
							</view>
						</view>
						<!-- #endif -->
					</uv-form-item>
					
					<uv-form-item label="昵称" prop="nickname" borderBottom>
						<view class="input-container">
							<!-- #ifdef MP-WEIXIN -->
							<input
								type="nickname"
								class="wx-nickname-input"
								v-model="formData.nickname"
								placeholder="请输入昵称"
								maxlength="20"
								@blur="onNicknameInput"
							/>
							<!-- #endif -->
						</view>
						<view slot="right" class="character-count">
							<text>{{ formData.nickname.length }}/20</text>
						</view>
					</uv-form-item>
					
					<uv-form-item label="个性签名" prop="bio" borderBottom>
						<view class="input-container">
							<uv-input
								v-model="formData.bio"
								placeholder="分享你的生活态度"
								maxlength="30"
								:border="false"
								:clearable="true"
								:placeholderStyle="placeholderStyle"
							></uv-input>
						</view>
						<view slot="right" class="character-count">
							<text>{{ formData.bio.length }}/30</text>
						</view>
					</uv-form-item>
					
					<uv-form-item label="手机号码" prop="mobile" borderBottom>
						<view class="input-container">
							<uv-input
								v-model="formData.mobile"
								placeholder="请输入手机号"
								:border="false"
								:clearable="true"
								:placeholderStyle="placeholderStyle"
							></uv-input>
						</view>
					</uv-form-item>
					
					<uv-form-item label="微信号" prop="wechat_id" borderBottom>
						<view class="input-container">
							<uv-input
								v-model="formData.wechat_id"
								placeholder="请输入微信号"
								:border="false"
								:clearable="true"
								:placeholderStyle="placeholderStyle"
							></uv-input>
						</view>
					</uv-form-item>
					
					<uv-form-item label="性别" prop="gender" borderBottom>
						<view class="gender-group">
							<view 
								class="gender-item" 
								:class="{'gender-active': formData.gender === 1}"
								@click="selectGender(1)"
							>
								<text>男生</text>
							</view>
							<view 
								class="gender-item" 
								:class="{'gender-active': formData.gender === 2}"
								@click="selectGender(2)"
							>
								<text>女生</text>
							</view>
						</view>
					</uv-form-item>
					
					<uv-form-item label="生日" prop="birthday" borderBottom>
						<view class="birthday-display" @click="showBirthdayCalendar">
							<text :class="[formData.birthday ? 'birthday-text' : 'placeholder-text']">
								{{ formData.birthday ? formatDate(new Date(formData.birthday * 1000)) : '请选择出生日期' }}
							</text>
							<uv-icon name="calendar" size="18" color="#2979ff"></uv-icon>
						</view>
					</uv-form-item>
				</uv-form>
			</view>
			
			<!-- 保存按钮区域 -->
			<view class="button-wrapper">
				<uv-button 
					type="primary" 
					size="large"
					shape="circle"
					:loading="submitting"
					@click="submitForm"
					:customStyle="buttonStyle"
				>
					<view class="button-content">
						<uv-icon name="checkmark-circle" size="18" color="#ffffff" customStyle="margin-right: 8rpx;"></uv-icon>
						<text>保存修改</text>
					</view>
				</uv-button>
				
				<!-- 取消按钮 -->
				<uv-button 
					type="info" 
					size="large"
					shape="circle"
					plain
					@click="confirmCancel"
					:customStyle="cancelButtonStyle"
				>
					<view class="button-content">
						<uv-icon name="close-circle" size="18" color="#909399" customStyle="margin-right: 8rpx;"></uv-icon>
						<text>取消</text>
					</view>
				</uv-button>
			</view>
		</view>
		
		<!-- 生日日期选择器 -->
		<uv-calendars 
			ref="birthdayCalendar"
			:color="'#2979ff'"
			:startDate="'1950-01-01'"
			:endDate="todayFormatted"
			@confirm="confirmBirthday"
		></uv-calendars>
		
		<!-- 操作确认弹窗 -->
		<uv-modal
			:show="showCancelModal"
			title="放弃修改"
			content="确定要放弃编辑吗？未保存的修改将丢失。"
			showCancelButton
			confirmColor="#2979ff"
			@confirm="goBack"
			@cancel="showCancelModal = false"
		></uv-modal>
		
		<!-- 提示组件 -->
		<uv-toast ref="uToast"></uv-toast>
	</view>
</template>

<script>
import config from '../../config/config';

export default {
	data() {
		return {
			formData: {
				avatar: '',
				nickname: '',
				bio: '',
				mobile: '',
				wechat_id: '',
				gender: 0,
				birthday: 0,
				realname: '',
				age: 0,
				height: 0,
				weight: 0,
				job: '',
				industry: '',
				company: '',
				position: '',
				hobbies: ''
			},
			originalData: null,
			wechatUserInfo: null,
			fromWechat: false,
			submitting: false,
			showCancelModal: false,
			buttonStyle: {
				height: '90rpx',
				fontWeight: '600',
				marginBottom: '20rpx',
				boxShadow: '0 10rpx 15rpx rgba(41, 121, 255, 0.2)'
			},
			cancelButtonStyle: {
				height: '90rpx',
				fontWeight: '600',
				borderColor: '#dcdfe6'
			},
			rules: {
				nickname: [
					{
						max: 20,
						message: '昵称不能超过20个字符',
						trigger: ['blur', 'change']
					}
				],
				bio: [
					{
						max: 30,
						message: '个性签名不能超过30个字符',
						trigger: ['blur', 'change']
					}
				],
				wechat_id: [
					{
						max: 30,
						message: '微信号不能超过30个字符',
						trigger: ['blur', 'change']
					}
				]
			},
			placeholderStyle: 'color: #909399; font-size: 28rpx;',
			todayFormatted: ''
		}
	},
	created() {
		this.todayFormatted = this.formatDate(new Date());
	},
	onLoad(options) {
		this.fromWechat = options.fromWechat === 'true';
		this.initUserData();
		if (this.fromWechat) {
			this.getWechatUserInfo();
		}
	},
	onBackPress() {
		if (this.hasChanges()) {
			this.showCancelModal = true;
			return true;
		}
		return false;
	},
    methods: {
		initUserData() {
			try {
				const userInfoStr = uni.getStorageSync('userInfo');
				if (userInfoStr) {
					const userInfo = typeof userInfoStr === 'string' ? JSON.parse(userInfoStr) : userInfoStr;

					const displayNickname = userInfo.nickname === '点击编辑昵称' ? '微信用户' : userInfo.nickname;
					
					let bioText = userInfo.bio || userInfo.personal_intro || '';
					if (bioText === '暂无签名') {
						bioText = '';
					}
					
					this.formData = {
						avatar: userInfo.avatar || '',
						nickname: displayNickname || '',
						bio: bioText,
						// 当手机号是"未绑定"或未填写时，显示为空
						mobile: userInfo.mobile === '未绑定' ? '' : (userInfo.mobile || ''),
						// 当微信号是"未绑定"或未填写时，显示为空
						wechat_id: userInfo.wechat_id === '未绑定' ? '' : (userInfo.wechat_id || ''),
						gender: userInfo.gender || 0,
						birthday: userInfo.birthday || 0,
						// 新增字段
						realname: userInfo.realname || '',
						age: userInfo.age > 0 ? userInfo.age : 0,
						height: userInfo.height > 0 ? userInfo.height : 0,
						weight: userInfo.weight > 0 ? userInfo.weight : 0,
						job: userInfo.job || '',
						industry: userInfo.industry || '',
						company: userInfo.company || '',
						position: userInfo.position || '',
						hobbies: userInfo.hobbies || ''
					};
					this.originalData = JSON.stringify(this.formData);
				}
			} catch (e) {
				console.error('获取用户数据失败', e);
				this.$refs.uToast.show({
					message: '获取用户数据失败',
					type: 'error'
				});
			}
		},
		hasChanges() {
			return this.originalData !== JSON.stringify(this.formData);
		},
		getWechatUserInfo() {
			try {
				const wechatInfoStr = uni.getStorageSync('wechatUserInfo');
				if (wechatInfoStr) {
					this.wechatUserInfo = typeof wechatInfoStr === 'string' ? JSON.parse(wechatInfoStr) : wechatInfoStr;
					if (this.wechatUserInfo) {
						this.formData.avatar = this.wechatUserInfo.avatarUrl || this.formData.avatar;
						this.formData.nickname = this.wechatUserInfo.nickName || this.formData.nickname;
						if (this.wechatUserInfo.gender) {
							this.formData.gender = this.wechatUserInfo.gender;
						}
					}
					uni.removeStorageSync('wechatUserInfo');
				}
			} catch (e) {
				console.error('获取微信用户信息失败', e);
			}
		},
		selectGender(gender) {
			uni.vibrateShort();
			this.formData.gender = gender;
		},
		onChooseAvatar(e) {
			const { avatarUrl } = e.detail;
			uni.showLoading({
				title: '上传中...',
				mask: true
			});
			this.uploadImage(avatarUrl);
		},
		onNicknameInput(e) {
			this.$refs.uvForm.validateField('nickname');
		},
		chooseAvatar() {
			uni.showActionSheet({
				itemList: ['拍照', '从相册选择'],
				success: (res) => {
					const sourceType = res.tapIndex === 0 ? ['camera'] : ['album'];
					uni.chooseImage({
						count: 1,
						sizeType: ['compressed'],
						sourceType: sourceType,
						success: (res) => {
							uni.showLoading({
								title: '上传中...',
								mask: true
							});
							const tempFilePath = res.tempFilePaths[0];
							uni.compressImage({
								src: tempFilePath,
								quality: 80,
								success: (compressRes) => {
									this.uploadImage(compressRes.tempFilePath);
								},
								fail: () => {
									this.uploadImage(tempFilePath);
								}
							});
						}
					});
				}
			});
		},
		uploadImage(filePath) {
			// 获取 API 基础 URL
			const API_BASE_URL = uni.getStorageSync('API_BASE_URL') || config.API_BASE_URL;
			
			// 创建上传任务
			const uploadTask = uni.uploadFile({
				url: `${API_BASE_URL}/api/upload/image`,
				filePath: filePath,
				name: 'file',
				header: {
					'x-nideshop-token': uni.getStorageSync('token') || ''
				},
				formData: {
					is_top: '0' // 头像设置为主要图片
				},
				success: (uploadRes) => {
					uni.hideLoading();
					
					try {
						// 解析返回数据
						const data = JSON.parse(uploadRes.data);
						
						// 根据返回的状态码和审核状态显示不同的提示
						if (data.code === 0) {
							if (data.is_audit === 0) {
								// 上传成功且通过审核
								this.$refs.uToast.show({
									message: '头像上传成功',
									type: 'success'
								});
								
								// 获取图片信息
								uni.getImageInfo({
									src: data.url,
									success: (imageInfo) => {
										// 保存头像信息
										this.formData.avatar = data.url;
										this.formData.avatar_pic_id = data.pic_id;
										this.formData.avatar_pic_secret_id = data.pic_secret_id;
										this.formData.avatar_width = imageInfo.width;
										this.formData.avatar_height = imageInfo.height;
									},
									fail: () => {
										// 无法获取图片信息时，仍然保存基本信息
										this.formData.avatar = data.url;
										this.formData.avatar_pic_id = data.pic_id;
										this.formData.avatar_pic_secret_id = data.pic_secret_id;
									}
								});
							} else if (data.is_audit === 1) {
								// 上传成功但未通过审核
								this.$refs.uToast.show({
									message: '图片含有不当内容，请更换',
									type: 'warning',
									duration: 3000
								});
							}
						} else {
							// 其他错误
							this.$refs.uToast.show({
								message: data.message || '上传失败',
								type: 'error'
							});
						}
					} catch (e) {
						// 解析错误
						this.$refs.uToast.show({
							message: '解析响应失败',
							type: 'error'
						});
						console.error('解析响应失败:', e);
					}
				},
				fail: (err) => {
					uni.hideLoading();
					this.$refs.uToast.show({
						message: '头像上传失败，请重试',
						type: 'error'
					});
					console.error('上传失败:', err);
				}
			});
			
			// 监听上传进度
			uploadTask.onProgressUpdate((res) => {
				// 可以根据需要显示上传进度
				if (res.progress === 100) {
					// 上传完成，等待服务器处理
				}
			});
		},
		// 添加缺少的 submitForm 方法
		submitForm() {
			if (!this.hasChanges()) {
				this.$refs.uToast.show({
					message: '未做任何修改',
					type: 'warning',
					duration: 1500,
					icon: 'info-circle-fill'
				});
				return;
			}
			this.$refs.uvForm.validate().then(valid => {
				if (valid) {
					this.saveUserProfile();
				}
			}).catch(errors => {
				console.log('表单验证失败', errors);
				this.$refs.uToast.show({
					message: '请检查表单填写是否正确',
					type: 'error',
					duration: 1500,
					icon: 'error-circle-fill'
				});
			});
		},
		saveUserProfile() {
			this.submitting = true;
			uni.showLoading({
				title: '保存中...',
				mask: true
			});
			
			// 准备提交数据
			const submitData = {
				avatar: this.formData.avatar,
				nickname: this.formData.nickname,
				gender: this.formData.gender,
				personal_intro: this.formData.bio,
				wechat_id: this.formData.wechat_id,
				birthday: this.formData.birthday,
				// 新增字段
				realname: this.formData.realname,
				age: this.formData.age,
				height: this.formData.height,
				weight: this.formData.weight,
				job: this.formData.job,
				industry: this.formData.industry,
				company: this.formData.company,
				position: this.formData.position,
				hobbies: this.formData.hobbies
			};
			
			// 添加头像的 pic_id 和 pic_secret_id
			if (this.formData.avatar_pic_id) {
				submitData.pic_ids = [parseInt(this.formData.avatar_pic_id)];
				submitData.pic_secret_ids = this.formData.avatar_pic_secret_id || '';
			}
			
			uni.request({
				url: `${config.API_BASE_URL}/api/user/upload`,
				method: 'POST',
				header: {
					'content-type': 'application/json',
					'X-Nideshop-Token': uni.getStorageSync('token') || ''
				},
				data: submitData,
				success: (res) => {
					uni.hideLoading();
					if (res.data && res.data.errno === 0) {
						try {
							const userInfoStr = uni.getStorageSync('userInfo');
							if (userInfoStr) {
								const userInfo = typeof userInfoStr === 'string' ? JSON.parse(userInfoStr) : userInfoStr;
								const updatedUserInfo = {
									...userInfo,
									avatar: this.formData.avatar,
									nickname: this.formData.nickname,
									gender: this.formData.gender,
									bio: this.formData.bio,
									personal_intro: this.formData.bio,
									wechat_id: this.formData.wechat_id,
									birthday: this.formData.birthday,
									// 新增字段
									realname: this.formData.realname,
									age: this.formData.age,
									height: this.formData.height,
									weight: this.formData.weight,
									job: this.formData.job,
									industry: this.formData.industry,
									company: this.formData.company,
									position: this.formData.position,
									hobbies: this.formData.hobbies,
									// 保存头像相关信息
									avatar_pic_id: this.formData.avatar_pic_id,
									avatar_pic_secret_id: this.formData.avatar_pic_secret_id
								};
								uni.setStorageSync('userInfo', JSON.stringify(updatedUserInfo));
							}
						} catch (e) {
							console.error('更新本地存储失败', e);
						}
						this.$refs.uToast.show({
							message: '保存成功',
							type: 'success',
							duration: 1500
						});
						setTimeout(() => {
							uni.navigateBack();
						}, 1500);
					} else {
						this.$refs.uToast.show({
							message: res.data?.errmsg || '更新失败',
							type: 'error'
						});
					}
				},
				fail: (err) => {
					uni.hideLoading();
					console.error('请求失败', err);
					this.$refs.uToast.show({
						message: '网络请求失败，请重试',
						type: 'error'
					});
				},
				complete: () => {
					this.submitting = false;
				}
			});
		},
		showBirthdayCalendar() {
			this.$refs.birthdayCalendar.open();
		},
		confirmBirthday(e) {
			const date = new Date(e.fulldate);
			this.formData.birthday = Math.floor(date.getTime() / 1000);
			this.$refs.uToast.show({
				message: '已选择: ' + this.formatDate(date),
				type: 'success',
				duration: 1000,
				icon: 'checkmark-circle-fill'
			});
		},
		formatDate(date) {
			const year = date.getFullYear();
			const month = (date.getMonth() + 1).toString().padStart(2, '0');
			const day = date.getDate().toString().padStart(2, '0');
			return `${year}-${month}-${day}`;
		},
		confirmCancel() {
			if (this.hasChanges()) {
				this.showCancelModal = true;
			} else {
				this.goBack();
			}
		},
		goBack() {
			uni.navigateBack();
		},
		navigateTo(url) {
			uni.navigateTo({
				url: url
			});
		}
	}
}
</script>

<style lang="scss" scoped>
.edit-profile-container {
	min-height: 100vh;
	background-color: #f8f8fa;
	padding-bottom: 40rpx;
	padding-top: 40rpx;
}

.form-wrapper {
	padding: 20rpx;
}

.section-header {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
	
	.section-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}
}

.form-group {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.input-container {
	flex: 1;
	height: 70rpx;
	display: flex;
	align-items: center;
	padding-left: 0rpx;;  /* ddd */
	
	.placeholder-text {
		font-size: 28rpx;
		color: #909399;
	}
	
	.mobile-text {
		font-size: 28rpx;
		color: #333;
	}
}

.textarea-container {
	flex: 1;
	padding-left: 16rpx;
	padding-top: 15rpx;
	padding-bottom: 15rpx;
}

.bio-textarea {
	width: 100%;
	height: 120rpx;
	font-size: 28rpx;
	color: #333;
	line-height: 1.5;
	padding: 0;
}

.placeholder-style {
	color: #909399;
	font-size: 28rpx;
}

:deep(.uv-form-item__body__left__content) {
	font-weight: 500;
	color: #333;
	padding-left: 16rpx;
}

:deep(.uv-input__content__field-wrapper) {
	padding-left: 0;
}

.character-count {
	background-color: #f5f7fa;
	border-radius: 30rpx;
	padding: 4rpx 16rpx;
	
	text {
		font-size: 22rpx;
		color: #909399;
	}
}

.avatar-upload {
	position: relative;
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	overflow: hidden;
	box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
	transition: transform 0.3s ease;
	
	&:active {
		transform: scale(0.95);
	}
	
	.avatar {
		width: 100%;
		height: 100%;
		display: block;
	}
	
	.avatar-hint {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 36rpx;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
		display: flex;
		align-items: center;
		justify-content: center;
	}
}

/* 微信头像按钮样式重置 */
.wx-avatar-button {
	padding: 0;
	line-height: 1;
	background-color: transparent;
	border: none;
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	overflow: hidden;
	position: relative;
	box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
	
	&::after {
		border: none;
	}
	
	&:active {
		transform: scale(0.95);
	}
}

.gender-group {
	display: flex;
	padding-left: 16rpx;
	
	.gender-item {
		margin-right: 30rpx;
		height: 64rpx;
		display: flex;
		align-items: center;
		transition: all 0.2s;
		padding: 0 30rpx;
		border-radius: 32rpx;
		border: 1px solid #ebeef5;
		
		text {
			font-size: 28rpx;
			color: #666;
		}
		
		&:active {
			background-color: #f0f0f0;
		}
	}
	
	.gender-active {
		&.gender-item:nth-child(1) {
			background-color: #ecf5ff;
			border-color: #a3cfff;
			
			text {
				color: #2979ff;
				font-weight: 500;
			}
		}
		
		&.gender-item:nth-child(2) {
			background-color: #fef0f0;
			border-color: #fbc4c4;
			
			text {
				color: #ff5577;
				font-weight: 500;
			}
		}
	}
}

.birthday-display {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 70rpx;
	border-radius: 8rpx;
	padding: 0 10rpx 0 16rpx;
	transition: all 0.2s;
	
	&:active {
		background-color: #f5f5f5;
	}
	
	.birthday-text {
		font-size: 28rpx;
		color: #333;
	}
	
	.placeholder-text {
		font-size: 28rpx;
		color: #909399;
	}
}

.button-wrapper {
	padding: 20rpx 10rpx 40rpx;
}

.button-content {
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 微信昵称输入框样式 */
.wx-nickname-input {
	height: 70rpx;
	font-size: 28rpx;
	width: 100%;
	color: #333;
	padding-left: 0;
}

/* 补充响应式适配 */
@media screen and (min-width: 768px) {
	.form-wrapper {
		max-width: 700rpx;
		margin: 0 auto;
	}
}
</style>
