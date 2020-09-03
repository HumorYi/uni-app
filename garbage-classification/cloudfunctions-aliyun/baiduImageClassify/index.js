'use strict';

const getAccessToken = async () => {
  const res = await uniCloud.httpclient.request('https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=9WUDpuIIgV5rZOU7rkUgrPYs&client_secret=GUyO6P7TqEU0pBlGW1ZhIqjvPz17eGM4', {
    dataType: 'json'
  })
  
  return res.data.access_token
}

const getClassify = async (access_token, image) => {
  const res = await uniCloud.httpclient.request('https://aip.baidubce.com/rest/2.0/image-classify/v2/advanced_general', {
    dataType: 'json',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: {
      access_token,
      image
    }
  })
   
  return res.data
}

exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
  
  const access_token = await getAccessToken()
  const classify = await getClassify(access_token, event.image)
  
  return classify
};
