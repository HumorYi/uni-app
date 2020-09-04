'use strict';
exports.main = async (event, context) => {
  //event为客户端上传的参数
  console.log('event : ' + event);
	const {keyword} = event
  
  if(!keyword)return "parameter keyword missed";
	
	const db = uniCloud.database()
	db.collection('garbage-classification').add({
		data: {
			keyword
		}
	})
  
  const classify_res=await uniCloud.httpclient.request("https://sffc.sh-service.com/wx_miniprogram/sites/feiguan/trashTypes_2/Handler/Handler.ashx?a=EXC_QUERY&kw="+keyword,{
	  dataType:"json"
  });
  
  if(classify_res.status!=200)return classify_res;
  
  const finalData={
	  keyword,
	  matched:null,
	  similars:[]
  };
  
  if(classify_res.data.query_result_type_1){
	  finalData.matched={
			"typename":classify_res.data.query_result_type_1.TypeKey
	  }
  }
  
  if(classify_res.data.query_result_type_m1){
	  for(let i=0;i<classify_res.data.query_result_type_m1.trashTypes.length;i++){
		  finalData.similars.push({
			  "keywords":classify_res.data.query_result_type_m1.trashTypes[i]["Name"],
			  "typename":classify_res.data.query_result_type_m1.trashTypes[i]["TypeKey"]
		  });
	  }
  }
  
  //返回数据给客户端
  return finalData;
};
