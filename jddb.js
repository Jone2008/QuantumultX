/**
 * 京东京豆夺宝。地址：我的 - 右上角信息 - 账户通知 - 京豆账户变动通知 - 京豆夺宝
 * 需自行抓包获取header和body，开着抓包打开'京豆夺宝'。抓包地址为 https://pf.moxigame.cn/jddb/duobao/login
 * 有效期未知。
 * 能不能多账号未知，所以没写。
 */

const $ = new Env('京东京豆夺宝');

let jddb_name = $.getdata('jddb_name') || ``; //默认不参与需要京豆大于10的活动

const headers = {
//header填到这里
};
const body = ``; //body填进``里面

!(async () => {
	await do_login();
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })

if ($.isNode()) {
    if (process.env.JDDB_NAME) {
     jddb_name = process.env.JDDB_NAME;
  }
}

//时间格式化
Date.prototype.format = function(fmt) { 
     var o = { 
        "M+" : this.getMonth()+1,                 //月份 
        "d+" : this.getDate(),                    //日 
        "h+" : this.getHours(),                   //小时 
        "m+" : this.getMinutes(),                 //分 
        "s+" : this.getSeconds(),                 //秒 
        "q+" : Math.floor((this.getMonth()+3)/3), //季度 
        "S"  : this.getMilliseconds()             //毫秒 
    }; 
    if(/(y+)/.test(fmt)) {
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
    }
     for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
             fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
         }
     }
    return fmt; 
} 


//do_login
function do_login() {
  return new Promise(resolve => {
    $.post(login(), async(err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(resp)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            const result = JSON.parse(data);
			//console.log(`结果：${JSON.stringify(result)}\n`)
			$.token = result.token
			$.nickname = result.userInfo.nickname
			$.id = result.id
			if (result.code == 0){
				console.log(`账号 ${$.nickname} 登入成功，开始检测京豆夺宝活动 -----\n`)
				console.log(`默认做需要京豆少于10的活动！`)
				console.log(`如需参与其它，请自行填写活动全称到变量 JDDB_NAME ！`)
				for (let p = 0; p < 2; p++) {
					page = p + 1 ;
					await do_check_list()
				}
				for (let o = 0; o < 2; o++) {
					page1 = o + 1;
					await do_joined_list()
				}
				await do_awardedList()
			} else {
				console.log(`登入失败：${JSON.stringify(result)}\n`)
			}
      }
    }
  }	catch (e) {
     $.logErr(e, resp)
     } finally {
        resolve();
      }
	})
  })
}

 //do_check_list
 function do_check_list() {
  return new Promise(resolve => {
    $.post(check_list(), async(err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(resp)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            const result = JSON.parse(data);
			//console.log(`结果：${JSON.stringify(result)}\n`)
			if (result.code == 0) {
				prizenums = result.result.totSize
				//pageSize = result.result.pageSize
				console.log(`\n检测活动成功，共有 ${prizenums} 个京豆夺宝活动。`)
				console.log(`显示第 ${page} 页的活动：`)
				let list = result.result.list
				for (let i = 0; i < list.length; i++) {
					console.log(`\n【活动${i+1}】：抽 ${list[i].actTitle} \n开始时间：${new Date(list[i].startTime).format("yyyy-MM-dd hh:mm:ss")} \n结束时间：${new Date(list[i].endTime).format("yyyy-MM-dd hh:mm:ss")} \n参与需要 ${list[i].duoBaoSetting.jdBeanNum} 京豆。`)
					if (list[i].status === `open` && list[i].duoBaoSetting.jdBeanNum <= 10){
						actid = list[i]._id
						console.log(`开始参与活动 ${list[i].actTitle} -----`)
						await do_join()
						await $.wait(3000)
					} else if (list[i].status === `open` && `${jddb_name}` === `${list[i].actTitle}`) {
						actid = list[i]._id
						console.log(`你选择参与活动 ${jddb_name}`)
						console.log(`开始参与活动 ${list[i].actTitle} -----`)
						await do_join()
					}
				}
			} else {
				console.log(`检测任务失败：${JSON.stringify(result)}\n`)
			}
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

 //do_join
 function do_join() {
  return new Promise(resolve => {
    $.post(join(), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(resp)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            const result = JSON.parse(data);
			if (result.code == 0) {
				console.log(`参与成功！`)
			} else {
			console.log(`${JSON.stringify(result)}`)
			}
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

//显示已参与的活动
 function do_joined_list() {
  return new Promise(resolve => {
    $.post(joined_list(), async(err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(resp)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            const result = JSON.parse(data);
			//console.log(`结果：${JSON.stringify(result)}\n`)
			if (result.code == 0) {
				let list = result.result.list
				for (let i = 0; i < list.length; i++) {
					console.log(`\n已参与活动【抽 ${list[i].actTitle} 】，开始进行1次(假)分享 -----`)
					actid = list[i]._id
					for (let s = 0; s < 1; s++) {
						await do_share()
						await $.wait(1500)
					}
				}
			} else {
				console.log(`获取失败：${JSON.stringify(result)}\n`)
			}
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

 //do_share
 function do_share() {
  return new Promise(resolve => {
    $.post(share(), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(resp)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            const result = JSON.parse(data);
			if (result.code == 0) {
				console.log(`分享成功！`)
			} else {
			console.log(`分享失败：${JSON.stringify(result)}`)
			}
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

 //查询中奖信息
 function do_awardedList() {
  return new Promise(resolve => {
    $.post(awardedList(), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(resp)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            const result = JSON.parse(data);
			console.log(`\n中奖信息：${JSON.stringify(result)}`)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

//login
function login() {
  return {
    url: `https://pf.moxigame.cn/jddb/duobao/login`,
    headers: headers,
    body: body
  }
}

//check_list
function check_list() {
  return {
    url: `https://pf.moxigame.cn/jddb/duobao/list`,
    headers: headers,
    body: `{"id":"${$.id}","token":"${$.token}","pageSize":10,"page":${page},"status":"progress"}`
  }
}

//join
function join() {
  return {
    url: `https://pf.moxigame.cn/jddb/duobao/join`,
    headers: headers,
    body: `{"id":"${$.id}","token":"${$.token}","activeid":"${actid}"}`
  }
}

//joined_list
function joined_list() {
  return {
    url: `https://pf.moxigame.cn/jddb/duobao/joinProgressList`,
    headers: headers,
    body: `{"id":"${$.id}","token":"${$.token}","pageSize":10,"page":${page1}}`
  }
}

//share
function share() {
  return {
    url: `https://pf.moxigame.cn/jddb/duobao/finishTask`,
    headers: headers,
    body: `{"id":"${$.id}","token":"${$.token}","type":"share","activeid":"${actid}"}`
  }
}

//awardedList
function awardedList() {
  return {
    url: `https://pf.moxigame.cn/jddb/duobao/joinAwardedList`,
    headers: headers,
    body: `{"id":"${$.id}","token":"${$.token}","pageSize":10,"page":1}`
  }
}

function safeGet(data) {
  try {
    if (typeof JSON.parse(data) == "object") {
      return true;
    }
  } catch (e) {
    console.log(e);
    console.log(`服务器访问数据为空，请检查自身设备网络情况`);
    return false;
  }
}


// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
