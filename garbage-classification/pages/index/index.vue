<template>
	<view class="content">
		<button @click="takePhoto">拍照或从相册选择</button>

		<view style="width: 100%;padding:10px 20px;">
			<image :src="imageUrl" style="width: 100%;" mode="widthFix"></image>
			<view v-if="searchedKeyword" style="width: 100%;border:1px solid #ccc;border-radius: 10px;padding:10px;box-sizing: border-box;">
				<view style="text-align: center;font-size: 14px;color: #999;">识别结果</view>
				<view style="text-align: center;height: 30px;line-height: 30px;">
					{{searchedKeyword}}
				</view>
				<view v-if="searchResults">
					<view v-if="searchResults.matched" style="width: 100%;text-align: center;">{{searchResults.matched.typename}}</view>
					<view v-else style="font-size: 14px;">
						<view v-for="item,index in searchResults.similars" style="display: flex;">
							<view style="flex: 1;text-overflow: ellipsis;white-space: nowrap;overflow: hidden;margin-right: 20px;">{{item.keywords}}</view>
							<view>{{item.typename}}</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				imageUrl: '',
				searchedKeyword: '',
				searchResults: null
			}
		},
		methods: {
			// 拆解需求
			// 1、需要从相册或者拍照获得一张图片，并显示到界面里
			takePhoto() {
				uni.chooseImage({
					count: 1,
					success: (res) => {
						this.imageUrl = res.tempFilePaths[0]
						this.imageToBase64(this.imageUrl)
					}
				})
			},
			// 2、图片转换为 base64 编码格式
			imageToBase64(filePath) {
				// #ifdef MP-WEIXIN
					wx.getFileSystemManager().readFile({
						filePath,
						encoding: 'base64',
						success: (res) => this.imageClassify(res.data)
					})
				// #endif
					// #ifdef APP-PLUS
						plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
							entry.file((file) => {
								const reader = new plus.io.FileReader();
								reader.onloadend = (e) => {
									// 截取掉 base64 头
									const base64 = e.target.result.substr(22);
									this.imageClassify(base64)
								};
								reader.readAsDataURL(file);
							}, (e) => {
								alert(e.message);
							});
						})
					// #endif
			},
			// 3、调用百度图像识别 API
			async imageClassify(base64) {
				uniCloud.callFunction({
					name: 'baiduImageClassify',
					data: {
						image: base64
					},
					success: (res) => this.parseImageResult(res.result.result)
				})

			},
			// 4、展示图像识别的结果
			parseImageResult(result, limitScore = 0.7) {
				const actionSheets = []
				let hidIndex

				for (let i = 0, len = result.length; i < len; i++) {
					const item = result[i]

					if (item.score >= limitScore) {
						hidIndex = i
						break
					}

					actionSheets.push(item['keyword'] + ' ' + item['score'])
				}

				if (hidIndex !== undefined) {
					this.searchImageKeyword(result[hidIndex]['keyword'])
					return
				}

				uni.showActionSheet({
					itemList: actionSheets,
					success: (res) => {
						this.searchImageKeyword(result[res.tapIndex]['keyword'])
					}
				})
			},
			// 5、使用图像识别的结果去查询垃圾所属的分类并展示
			searchImageKeyword(keyword) {
				this.searchedKeyword = keyword

				uniCloud.callFunction({
					name: 'TrashClassify',
					data: {
						keyword
					},
					success: (res) => {
						this.searchResults = res.result
					}
				})
			}
			// 6、打包发行
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>
