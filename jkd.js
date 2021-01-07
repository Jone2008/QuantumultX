/*
聚看点，所有任务+阅读
欢迎填写邀请码：24224873
点我的获取Cookie
=============环境变量=============
JKD_COOKIE cookies，可选择用&、@、换行隔开
JKD_USER_AGENT 用户ua，默认为ios
JKD_WITHDRAW 提现金额
JKD_FAKE_IOS 将安卓cookie伪装成iOS 默认伪装，填写任意值
JKD_NOTIFY 是否开启通知，开启则22点通知一次
================Qx==============
[task_local]
0,30 7-22/1 * * * https://raw.githubusercontent.com/shylocks/Loon/main/jkd.js, tag=聚看点
[rewrite_local]
https:\/\/www\.xiaodouzhuan\.cn\/jkd\/newMobileMenu\/infoMe\.action url script-request-body https://raw.githubusercontent.com/shylocks/Loon/main/jkd.js
================Loon==============
[Script]
http-request https:\/\/www\.xiaodouzhuan\.cn\/jkd\/newMobileMenu\/infoMe\.action  script-path=https://raw.githubusercontent.com/shylocks/Loon/main/jkd.js, requires-body=true, timeout=100, tag=聚看点
cron "0,30 7-22/1 * * *" script-path=https://raw.githubusercontent.com/shylocks/Loon/main/jkd.js
===============Surge=================
[Script]
聚看点 = type=http-request,pattern=https:\/\/www\.xiaodouzhuan\.cn\/jkd\/newMobileMenu\/infoMe\.action ,script-path=https://raw.githubusercontent.com/shylocks/Loon/main/jkd.js
聚看点 = type=cron,cronexp="0,30 7-22/1 * * *",wake-system=1,timeout=900,script-path=https://raw.githubusercontent.com/shylocks/Loon/main/jkd.js
===============MITM=================
[MITM]
hostname = www.xiaodouzhuan.cn
*/
const API_HOST = 'https://www.xiaodouzhuan.cn'
let UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_2_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
const DATE = `${new Date().getUTCFullYear()}${(new Date().getUTCMonth() + 1).toString().padStart(2, "0")}${new Date().getUTCDate().toString().padStart(2, "0")}`
let liveBody = null, fakeIOS = true
const $ = new Env("聚看点")
let sum = 0
let cookiesArr = [
  // '', // xz_jkd_appkey=xxx; JSESSIONID=xxx; UM_distinctid=xxx; （账号1ck）
  // '', // xz_jkd_appkey=xxx; JSESSIONID=xxx; UM_distinctid=xxx; （账号2ck）
], cookie = '', message;
let notify = !$.isNode() ? $.getdata("JKD_MSG") : !!process.env.JKD_NOTIFY
const ntf = $.isNode() ? require('./sendNotify') : '';

async function getCookie() {
  if ($request && $request.method !== `OPTIONS`) {
    const bodyVal = $request.body
    let cks = $.getdata('CookiesJKD2') || "[]"
    cks = jsonParse(cks);
    const Cookieval = $request.headers['Cookie']
    $.log(`Cookie:${Cookieval}`)
    $.log(`bodyVal:${bodyVal}`)
    if (Cookieval) {
      let os = []
      for (let i = 0; i < cks.length; ++i) {
        cookie = cks[i]
        await getOpenId()
        os.push($.openId)
      }
      cookie = Cookieval
      await getOpenId()
      if ($.openId && !os.includes($.openId)) {
        cks.push(Cookieval)
        $.setdata(JSON.stringify(cks), "CookiesJKD2")
        $.msg($.name, `获取Cookie ${$.openId} 成功`)
      } else {
        if (!$.openId) {
          $.msg($.name, `无法获取openId，请检查是否绑定微信`)
        } else {
          $.msg($.name, `openId ${$.openId} 已存在`)
        }
        // $.msg($.name, `${$.userName}已存在，请注释脚本`)
      }
    }
  }
}

if (typeof $request !== 'undefined') {
  getCookie().then(r => {
    $.done()
  }).finally(() => {
    $.done()
  })
} else {
  !(async () => {
    if ($.isNode()) {
      let JKCookie = []
      if (process.env.JKD_COOKIE && process.env.JKD_COOKIE.indexOf('@') > -1) {
        JKCookie = process.env.JKD_COOKIE.split('@');
        console.log(`您的JKD_COOKIE选择的是用@隔开，共计 ${JKCookie.length} 个Cookie\n`)
      } else if (process.env.JKD_COOKIE && process.env.JKD_COOKIE.indexOf('&') > -1) {
        JKCookie = process.env.JKD_COOKIE.split('&');
        console.log(`您的JKD_COOKIE选择的是用&隔开，共计 ${JKCookie.length} 个Cookie\n`)
      } else if (process.env.JKD_COOKIE && process.env.JKD_COOKIE.indexOf('\n') > -1) {
        JKCookie = process.env.JKD_COOKIE.split('\n');
        console.log(`您的JKD_COOKIE选择的是用换行符隔开，共计 ${JKCookie.length} 个Cookie\n`)
      } else if (process.env.JKD_COOKIE) {
        JKCookie = process.env.JKD_COOKIE.split()
      }
      if (process.env.JKD_WITHDRAW) {
        sum = process.env.JKD_WITHDRAW
      }
      Object.keys(JKCookie).forEach((item) => {
        if (JKCookie[item]) {
          cookiesArr.push(JKCookie[item])
        }
      })
      if (process.env.TENCENTCLOUD_RUNENV) {
        $.scf = true
      }
      if (process.env.JKD_DEBUG && process.env.JKD_DEBUG === 'false') console.log = () => {
      };
    } else {
      let cookiesData = $.getdata('CookiesJKD2') || "[]";
      sum = $.getdata("JKD_WITHDRAW") || 0;
      cookiesData = jsonParse(cookiesData);
      cookiesArr = cookiesData.length > 0 ? cookiesData : cookiesArr;
      cookiesArr.reverse();
      cookiesArr = cookiesArr.filter(item => item !== "" && item !== null && item !== undefined);
    }
    if (!cookiesArr[0]) {
      $.msg($.name, '【提示】请先获取聚看点账号一cookie');
      return;
    }
    await requireConfig()
    for (let i = 0; i < cookiesArr.length; i++) {
      if (cookiesArr[i]) {
        cookie = cookiesArr[i];
        if (cookie.match(/UM_distinctid=(\S*);/)) {
          $.uuid = cookie.match(/UM_distinctid=(\S*);/)[1]
        } else $.uuid = ""
        await getOpenId()
        $.index = i + 1;
        $.message = ''
        if (!$.openId) {
          console.log(`Cookies${$.index}已失效！`)
          break
        }
        if (liveBody[$.openId]) {
          if (!liveBody[$.openId][DATE]) {
            liveBody[$.openId][DATE] = {
              "livetime": 0,
              "articletime": 0,
              "videotime": 0,
            }
            $.log('当日liveBody不存在，新建')
            $.isSign = false
          } else {
            $.log('当日liveBody已存在')
            $.isSign = true
          }
        } else {
          liveBody[$.openId] = {}
          liveBody[$.openId][DATE] = {
            "livetime": 0,
            "articletime": 0,
            "videotime": 0,
          }
          $.log('当日liveBody不存在，新建')
          $.isSign = false
        }
        await getUserInfo()
        console.log(`\n******开始【聚看点账号${$.index}】${$.userName || $.openId}*********\n`);
        console.log(`${$.gold}，当前 ${$.current} 元，累计 ${$.sum} 元`)
        $.iOS = true
        if (cookie.indexOf('iOS') > 0) {
          console.log(`${$.userName}的cookie来自iOS客户端`)
          fakeIOS = false
          UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        } else if (cookie.indexOf('android') > 0) {
          console.log(`${$.userName}的cookie来自安卓客户端`)
          // $.iOS = false
          if (!fakeIOS)
            UA = 'Dalvik/2.1.0 (Linux; U; Android 10; ONEPLUS A5010 Build/QKQ1.191014.012)'
          else {
            console.log(`将cookie中的安卓标示替换为iOS`)
            cookie = cookie.replace('!android!753', '!iOS!5.6.5')
          }
        } else {
          console.log(`无法获取客户端标示，请检查cookie是否正确`)
        }
        await jkd()
        await showMsg()
      }
    }
  })()
    .catch((e) => $.logErr(e))
    .finally(async () => {

      if (!$.isNode()) {
        $.setdata(JSON.stringify(liveBody), "jkdLiveBody")
      } else if (!$.scf) {
        const fs = require('fs');
        try {
          await fs.writeFileSync('jkd.json', JSON.stringify(liveBody));
        } catch (err) {
          console.error(err)
        }
      }
      $.done()
    })
}

function requireConfig() {
  if (!$.isNode()) {
    if ($.getdata("jkdLiveBody") != null) {
      console.log('加载本地阅读时长body')
      liveBody = JSON.parse($.getdata("jkdLiveBody"))
      if (liveBody === null) {
        liveBody = {}
      }
    } else {
      console.log('没有阅读时长body，新建')
      liveBody = {}
    }
  } else {
    const fs = require('fs');
    try {
      if (!fs.existsSync('jkd.json')) {
        $.log('未找到活跃时间body，新建')
        liveBody = {}
      } else {
        $.log('读取本地活跃时间body')
        let raw = fs.readFileSync('jkd.json').toString();
        liveBody = JSON.parse(raw) ? JSON.parse(raw) : {}
      }
    } catch (err) {
      liveBody = {}
      console.error(err)
    }
    if (process.env.JKD_FAKE_IOS !== undefined && process.env.JKD_FAKE_IOS !== null && process.env.JKD_FAKE_IOS !== '')
      fakeIOS = false
  }
}

async function showMsg() {
  if (!$.isNode() || notify) {
    $.msg(`【账号${$.name}${$.index} ${$.userName}】`, `${$.gold}，当前 ${$.current} 元，累计 ${$.sum} 元`, $.message)
  } else {
    $.log(`【账号${$.name}${$.index} ${$.userName}】\n ${$.gold}，当前 ${$.current} 元，累计 ${$.sum} 元\n ${$.message}`)
    if (new Date().getUTCHours() === 14 && new Date().getUTCMinutes() < 10 && notify) {
      await ntf.sendNotify(`【${$.name}账号${$.index} ${$.userName}】`, `${$.gold}，当前 ${$.current} 元，累计 ${$.sum} 元\n`);
    }
  }
}

async function jkd() {
  let st = new Date().getTime()
  await call3($.uuid, "OPEN_APP")
  if (sum !== 0 && $.current > sum) {
    console.log(`触发提现条件，去提现`)
    await withDraw()
  }
  $.profit = 0
  await bindTeacher()
  if (!$.isSign) await sign() // 签到
  $.log(`去领取阶段奖励`)
  await getStageState() // 阶段奖励
  $.luckyDrawNum = 50
  if ($.luckyDrawNum > 0) {
    $.log(`去转转盘`)
    for (let i = 0; i < 10 && $.luckyDrawNum > 0; ++i) {
      await getLuckyLevel()
      if ($.luckyDrawNum === 0) break
      await luckyDraw()
      await luckyProfit()
      await $.wait(1000)
    }
  }
  // await getTaskList() // 任务
  for (let i = 0; i < $.videoPacketNum && !$.scf; ++i) {
    $.log(`去看激励视频`)
    await adv(17)
  }
  await openTimeBox()  // 宝箱
  await getTaskBoxProfit()  // 摇钱树1
  await getTaskBoxProfit(2) // 摇钱树2
  $.artList = []
  // 看视频
  let stA = new Date().getTime()
  await getArticleList(53)
  for (let i = 0; i < $.artList.length; ++i) {
    const art = $.artList[i]
    if (art['art_id']) {
      let artId = art['art_id']
      await call2($.uuid)
      if ($.videocount === 0) {
        $.log(`观看视屏次数已满，跳出`)
        break
      }
      $.log(`去看视频：${artId}`)
      await call1($.uuid, artId)
      await getVideo(artId, true)
      await video(artId)
      await call1($.uuid)
      await $.wait(31 * 1000)
      await videoAccount(artId)
      await $.wait(5 * 1000)
    }
  }
  let etA = new Date().getTime()
  let addArticleTime = Math.trunc((etA - stA) / 1000)
  $.artList = []
  // 看文章
  let stV = new Date().getTime()
  await getArticleList()
  for (let i = 0; i < $.artList.length; ++i) {
    const art = $.artList[i]
    if (art['art_id']) {
      await call2($.uuid)
      if ($.artcount === 0) {
        $.log(`观看文章次数已满，跳出`)
        break
      }
      let artId = art['art_id']
      await getArticle(artId)
      await call1($.uuid, artId)
      await article(artId)
      await openArticle(artId)
      await $.wait(31 * 1000)
      await readAccount(artId)
      await $.wait(5 * 1000)
    }
  }
  let etV = new Date().getTime()
  let addVideoTime = Math.trunc((etV - stV) / 1000)

  await $.wait(1000)
  let et = new Date().getTime()
  let addLiveTime = Math.trunc((et - st) / 1000)
  liveBody[$.openId][DATE]['livetime'] += addLiveTime
  liveBody[$.openId][DATE]['articletime'] += addArticleTime
  liveBody[$.openId][DATE]['videotime'] += addVideoTime
  let body = {
    'livetime': (liveBody[$.openId][DATE]['livetime'] * 1000).toString(),
    'articletime': (liveBody[$.openId][DATE]['articletime'] * 1000).toString(),
    'videotime': (liveBody[$.openId][DATE]['videotime'] * 1000).toString(),
    'addlivetime': (addLiveTime * 1000).toString(),
    'addarticletime': (addArticleTime * 1000).toString(),
    'addvideotime': (addVideoTime * 1000).toString(),
  }
  $.message += `本次运行增加活跃时间 ${addLiveTime} 秒\n`
  await userLive(body)
  $.log(`本次运行完成，共计获得 ${$.profit} 金币`)
  $.message += `本次运行获得 ${$.profit} 金币\n`
  await getUserInfo()
}

function userLive(body) {
  // 保活
  let postBody = {
    ...body,
    "appid": "xzwl",
    "channel": $.iOS ? "iOS" : "android",
    "psign": "92dea068b6c271161be05ed358b59932",
    "appversioncode": $.version,
    "time": new Date().getTime(),
    "apptoken": "xzwltoken070704",
    "appversion": fakeIOS ? '5.6.5' : $.version.toString().split('').join('.'),
    "openid": $.openId,
    "os": $.iOS ? "iOS" : "android",
    "opdate": `${DATE}`
  }
  return new Promise(resolve => {
    $.post(taskPostUrl("jkd/user/userlive.action",
      `jsondata=${escape(JSON.stringify(postBody))}`), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${JSON.stringify(err)}`)
          $.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 'ok') {
              console.log('增加阅读时长成功！')
            } else {
              $.log(`获取任务列表失败，错误信息：${JSON.stringify(data)}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function bindTeacher() {
  return new Promise(resolve => {
    $.get(taskGetUrl("jkd/weixin20/member/bindTeacher.action", "teacherCode=24224873"), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${JSON.stringify(err)}`)
          $.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          // console.log(data)
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function getStageState() {
  return new Promise(resolve => {
    $.post(taskGetUrl("jkd/weixin20/newactivity/readStageReward.action",), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${JSON.stringify(err)}`)
          $.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          for (let i = 1; i <= 3; ++i) {
            let str = `var readtime${i} = "(.*)";`
            switch (parseInt(data.match(str)[1])) {
              case 1:
                $.log(`第${i}阶段奖励可领取`)
                await getStageReward(i)
                break
              case 2:
                $.log(`第${i}阶段奖励已领取过`)
                break
              default:
                $.log(`第${i}阶段未完成`)
                break
            }
          }
          //$.isSign = data.match(/var readtime1 = "(.*)";/)[1]

        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function getTaskList() {
  let body = {
    "appid": "xzwl",
    "channel": $.iOS ? "iOS" : "android",
    "psign": "92dea068b6c271161be05ed358b59932",
    "appversioncode": $.version,
    "time": new Date().getTime(),
    "apptoken": "xzwltoken070704",
    "appversion": fakeIOS ? '5.6.5' : $.version.toString().split('').join('.'),
    "openid": $.openId,
    "os": $.iOS ? "iOS" : "android",
    "listtype": "wealnews",
    "ua": $.isNode() ?
      (process.env.JKD_USER_AGENT ? process.env.JKD_USER_AGENT : UA) : ($.getdata('JKDUA')
        ? $.getdata('JKDUA') : UA),
    "pageNo": 0,
    "pageSize": 20
  }
  return new Promise(resolve => {
    $.post(taskGetUrl("jkd/mobile/base/welfaretask/indexList.action",
      `jsondata=${escape(JSON.stringify(body))}`), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${JSON.stringify(err)}`)
          $.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 'ok') {
              const taskList = data.data.data.list
              for (let i = 0; i < taskList.length; ++i) {
                const task = taskList[i]
                if (task['tstatus'] === 1) {
                  $.log(`去做任务【${task['name']}】`)
                  await doTask(task['pid'], task['name'], "doTask")
                  await doTask(task['pid'], task['name'], "getMoney")
                  await $.wait(15 * 1000)
                }
              }
            } else {
              $.log(`获取任务列表失败，错误信息：${JSON.stringify(data)}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function doTask(taskId, taskName, action) {
  let body = {
    "appid": "xzwl",
    //"exporturl": "https:\/\/kyshiman.com\/kkz\/channel?ref=436",
    //"pageurl": "https:\/\/new.huanzhuti.com\/news\/26382197?cid=qsbk02",
    "slidenum": 1,
    "channel": $.iOS ? "iOS" : "android",
    "psign": "92dea068b6c271161be05ed358b59932",
    "appversioncode": `${$.version}`,
    "time": `${new Date().getTime()}`,
    "apptoken": "xzwltoken070704",
    "appversion": fakeIOS ? '5.6.5' : $.version.toString().split('').join('.'),
    "openid": $.openID,
    "os": $.iOS ? "iOS" : "android",
    "operatepath": "adDetail",
    "taskId": taskId,
    "billingtype": 2,
    "pagetype": "adDetail",
    // "name": taskName,
    "taskExecuteId": 0
  }
  $.log(`jsondata=${escape(JSON.stringify(body))}`)
  return new Promise(resolve => {
    $.post(taskPostUrl(`jkd/mobile/base/welfaretask/${action}.action`,
      `jsondata=${escape(JSON.stringify(body))}`), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${JSON.stringify(err)}`)
          //$.log(resp)
          $.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 'ok') {
              const taskList = data.data.data.list
              for (let i = 0; i < taskList.length; ++i) {
                const task = taskList[i]
                if (task['tstatus'] === 1) {
                  await doTask()
                }
              }
            } else {
              $.log(`获取任务列表失败，错误信息：${JSON.stringify(data)}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function getOpenId() {
  return new Promise(resolve => {
    $.post(taskGetUrl("jkd/task/userSign.action", `channel=${$.iOS ? "iOS" : "android"}`), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${JSON.stringify(err)}`)
          $.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          $.openId = data.match(/var openid = "(\S*)"/)[1]
          $.version = data.match(/var myversions = parseInt\("(.*)"\)/)[1]
          if ($.openId) {
            $.log(`获取openId成功`)
          }
          // $.isSign = data.match(/var issign = parseInt\("(.*)"\)/)[1]
          $.videoPacketNum = data.match(/var videoPacketNum = (\S*);/)[1]
          $.newsTaskNum = data.match(/var newsTaskNum = (\S*);/)[1]
          $.luckyDrawNum = (data.match(/var luckDrawTaskNum = (\S*);/)[1])
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function getUserInfo() {
  let body = {
    "openid": $.openId,
    "channel": $.iOS ? "iOS" : "android",
    "os": $.iOS ? "iOS" : "android",
    "appversioncode": $.version,
    "time": new Date().getTime().toString(),
    "psign": "92dea068b6c271161be05ed358b59932",
    "apptoken": "xzwltoken070704",
    "appid": "xzwl",
    "appversion": fakeIOS ? '5.6.5' : $.version.toString().split('').join('.'),
  }
  return new Promise(resolve => {
    $.post(taskPostUrl("jkd/newMobileMenu/infoMe.action",
      `jsondata=${escape(JSON.stringify(body))}`), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${JSON.stringify(err)}`)
          $.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 'ok') {
              $.userName = data.userinfo.username
              $.sum = data.userinfo.infoMeSumCashItem.value
              $.gold = data.userinfo.infoMeGoldItem.title + ": " + data.userinfo.infoMeGoldItem.value
              $.current = data.userinfo.infoMeCurCashItem.value
            } else {
              $.log(`个人信息获取失败，错误信息：${JSON.stringify(data)}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function sign() {
  let body = `openID=${$.openId}&accountType=0`
  return new Promise(resolve => {
    $.get(taskGetUrl("jkd/task/sign.action", body), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${JSON.stringify(err)}`)
          $.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 'ok') {
              $.profit += data.datas.signAmt
              $.log(`签到成功，获得 ${data.datas.signAmt} 金币，已签到 ${data.datas.signDays} 天，下次签到金币：${data.datas.nextSignAmt}`)
              $.message += `签到成功，获得 ${data.datas.signAmt} 金币，已签到 ${data.datas.signDays} 天，下次签到金币：${data.datas.nextSignAmt}\n`
              $.log(`去做签到分享任务`)
              await signShare(data.datas.position)
            } else {
              $.log(`签到失败，错误信息：${JSON.stringify(data)}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function getTaskBoxProfit(boxType = 1) {
  let body = `box_type=${boxType}`
  return new Promise(resolve => {
    $.post(taskPostUrl("jkd/task/getTaskBoxProfit.action", body), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${JSON.stringify(err)}`)
          $.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 'ok') {
              $.log(`摇钱树开启成功，获得 ${data.profit} 金币`)
              $.profit += data.profit
              if (data.advertPopup && data.advertPopup.advert && !$.scf) {
                $.log(`去做额外翻倍任务`)
                await adv(data.advertPopup.position)
              }
            } else if (data['ret'] === 'fail') {
              $.log(`摇钱树开启失败，错误信息：${data.rtn_msg}`)
            } else {
              $.log(`未知错误：${JSON.stringify(data)}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function signShare(position) {
  let body = {
    "openid": $.openId,
    "channel": $.iOS ? "iOS" : "android",
    "os": $.iOS ? "iOS" : "android",
    "appversioncode": `${$.version}`,
    "time": `${new Date().getTime()}`,
    "psign": "92dea068b6c271161be05ed358b59932",
    "position": position,
    "apptoken": "xzwltoken070704",
    "appid": "xzwl",
    "appversion": fakeIOS ? '5.6.5' : $.version.toString().split('').join('.'),
  }
  return new Promise(resolve => {
    $.post(taskPostUrl("jkd/account/signShareAccount.action",
      `jsondata=${escape(JSON.stringify(body))}`), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${JSON.stringify(err)}`)
          $.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 'ok') {
              $.log(`签到分享成功，获得 ${data.profit} 金币`)
              $.profit += data.profit
              if (data.advertPopup && data.advertPopup.advert) {
                $.log(`去做额外【${data.advertPopup.buttonText}】任务`)
                await adv(data.advertPopup.position)
              }
            } else if (data['ret'] === 'fail') {
              $.log(`签到失败，错误信息：${data.rtn_msg}`)
            } else {
              $.log(`未知错误：${JSON.stringify(data)}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function adv(position) {
  if ($.scf) return
  let body = {
    "openid": $.openId,
    "channel": $.iOS ? "iOS" : "android",
    "os": $.iOS ? "iOS" : "android",
    "appversioncode": `${$.version}`,
    "time": `${new Date().getTime()}`,
    "psign": "92dea068b6c271161be05ed358b59932",
    "position": position,
    "apptoken": "xzwltoken070704",
    "appid": "xzwl",
    "appversion": fakeIOS ? '5.6.5' : $.version.toString().split('').join('.'),
  }
  return new Promise(resolve => {
    $.post(taskPostUrl("jkd/newmobile/stimulateAdv.action",
      `jsondata=${escape(JSON.stringify(body))}`), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${JSON.stringify(err)}`)
          $.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 'ok') {
              $.log(`点击视频成功，预计获得 ${data.rewardAmount ? data.rewardAmount : 0} 金币，等待 30 秒`)
              await $.wait(31 * 1000)
              body['time'] = `${new Date().getTime()}`
              await rewardAdv(body)
            } else if (data['ret'] === 'fail') {
              $.log(`点击视频失败，错误信息：${data.rtn_msg}`)
            } else {
              $.log(`未知错误：${JSON.stringify(data)}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function rewardAdv(body) {
  return new Promise(resolve => {
    $.post(taskPostUrl("jkd/account/stimulateAdvAccount.action",
      `jsondata=${escape(JSON.stringify(body))}`), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${JSON.stringify(err)}`)
          $.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 'ok') {
              $.log(`观看视频成功，获得 ${data.profit} 金币`)
              $.profit += data.profit
            } else if (data['ret'] === 'fail') {
              $.log(`观看视频失败，错误信息：${data.rtn_msg}`)
            } else {
              $.log(`未知错误：${JSON.stringify(data)}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function getArticleList(categoryId = 3) {
  let body = {
    "appid": "xzwl",
    "connectionType": 100,
    "optaction": "down",
    "pagesize": 12,
    "channel": $.iOS ? "iOS" : "android",
    "psign": "92dea068b6c271161be05ed358b59932",
    "appversioncode": $.version,
    "time": "1609437200",
    "apptoken": "xzwltoken070704",
    "cateid": categoryId,
    "openid": $.openId,
    "os": $.iOS ? "iOS" : "android",
    "appversion": fakeIOS ? '5.6.5' : $.version.toString().split('').join('.'),
    "operatorType": 2,
    "page": 12
  }
  return new Promise(resolve => {
    $.post(taskPostUrl("jkd/newmobile/artlist.action",
      `jsondata=${escape(JSON.stringify(body))}`),
      async (err, resp, data) => {
        try {
          if (err) {
            $.log(`${JSON.stringify(err)}`)
            $.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if (data['ret'] === 'ok') {
                $.artList = data.artlist
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}

function openTimeBox() {
  let body = {
    "openid": $.openId,
    "channel": $.iOS ? "iOS" : "android",
    "os": $.iOS ? "iOS" : "android",
    "appversioncode": `${$.version}`,
    "time": `${new Date().getTime()}`,
    "psign": "92dea068b6c271161be05ed358b59932",
    "apptoken": "xzwltoken070704",
    "appid": "xzwl",
    "appversion": fakeIOS ? '5.6.5' : $.version.toString().split('').join('.'),
  }
  return new Promise(resolve => {
    $.post(taskPostUrl("jkd/account/openTimeBoxAccount.action",
      `jsondata=${escape(JSON.stringify(body))}`), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${JSON.stringify(err)}`)
          $.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 'ok') {
              $.log(`宝箱奖励领取成功，获得 ${data.profit} 金币`)
              $.profit += data.profit
              if (data.advertPopup && data.advertPopup.position) {
                $.log(`去做额外【${data.advertPopup.buttonText}】任务`)
                await adv(data.advertPopup.position)
              }
            } else if (data['ret'] === 'fail') {
              $.log(`签到失败，错误信息：${data.rtn_msg}`)
            } else {
              $.log(`未知错误：${JSON.stringify(data)}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function getArticle(artId) {
  let body = {
    "time": `${new Date().getTime()}`,
    "apptoken": "xzwltoken070704",
    "appversion": fakeIOS ? '5.6.5' : $.version.toString().split('').join('.'),
    "openid": $.openId,
    "channel": $.iOS ? "iOS" : "android",
    "os": $.iOS ? "iOS" : "android",
    "psign": "92dea068b6c271161be05ed358b59932",
    "artid": artId,
    "appid": "xzwl"
  }
  return new Promise(resolve => {
    $.post(taskPostUrl("jkd/newmobile/articleDetail.action",
      `jsondata=${escape(JSON.stringify(body))}`), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${JSON.stringify(err)}`)
          $.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 'ok') {
              $.log(`articleDetail 记录成功`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function getVideo(artId) {
  let body = {
    "appid": "xzwl",
    "channel": $.iOS ? "iOS" : "android",
    "psign": "92dea068b6c271161be05ed358b59932",
    "appversioncode": $.version.toString(),
    "time": new Date().getTime().toString(),
    "apptoken": "xzwltoken070704",
    "requestid": new Date().getTime().toString(),
    "openid": $.openId,
    "os": $.iOS ? "iOS" : "android",
    "artid": artId,
    "appversion": fakeIOS ? '5.6.5' : $.version.toString().split('').join('.'),
    "relate": "1",
    "scenetype": ""
  }
  return new Promise(resolve => {
    $.post(taskPostUrl("jkd/newmobile/artDetail.action",
      `jsondata=${escape(JSON.stringify(body))}`), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${JSON.stringify(err)}`)
          $.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 'ok') {
              $.log(`artDetail 记录成功`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function getStageReward(stage) {
  return new Promise(resolve => {
    $.post(taskPostUrl("jkd/weixin20/newactivity/getStageReward.action",
      `stage=${stage}`), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${JSON.stringify(err)}`)
          $.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['ret'] === 'ok') {
              $.log(`阶段奖励${stage}获取成功，获得 ${data.profit} 金币`)
              $.profit += data.profit
            } else if (data['ret'] === 'fail') {
              $.log(`阶段奖励获取失败，错误信息：${data.rtn_msg}`)
            } else {
              $.log(`未知错误：${JSON.stringify(data)}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function call2(uuid, opttype = "ART_READ") {
  let body = {
    "openID": $.openId,
    "openid": $.openId,
    "app_id": "xzwl",
    "version_token": `${$.version}`,
    "channel": $.iOS ? "iOS" : "android",
    "vercode": `${$.version}`,
    "psign": "92dea068b6c271161be05ed358b59932",
    "app_token": "xzwltoken070704",
    "version": fakeIOS ? '5.6.5' : $.version.toString().split('').join('.'),
    "pars": {
      "openID": $.openId,
      "uniqueid": uuid,
      "os": $.iOS ? "iOS" : "android",
      "channel": $.iOS ? "iOS" : "android",
      "openid": $.openId
    }
  }
  return new Promise(resolve => {
    $.post(taskPostUrl("jkd/minfo/call.action",
      `jdata=${escape(JSON.stringify(body))}&opttype=${opttype}&optversion=1.0`),
      async (err, resp, data) => {
        try {
          if (err) {
            $.log(`${JSON.stringify(err)}`)
            $.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if (data['ret'] === 'ok') {
                if (opttype === 'ART_READ') {
                  $.artcount = data.datas.artcount
                  $.videocount = data.datas.videocount
                  $.log(`文章剩余观看次数：${$.artcount}，视频剩余观看次数：${$.videocount}`)
                } else {
                  console.log(`动作${opttype}记录成功！`)
                }
              } else {
                console.log(data)
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}

function call3(uuid, opttype = "ART_READ") {
  let body = {
    "openID": $.openId,
    "openid": $.openId,
    "app_id": "xzwl",
    "version_token": `${$.version}`,
    "channel": $.iOS ? "iOS" : "android",
    "vercode": `${$.version}`,
    "psign": "92dea068b6c271161be05ed358b59932",
    "app_token": "xzwltoken070704",
    "version": fakeIOS ? '5.6.5' : $.version.toString().split('').join('.'),
    "pars": {
      "openID": $.openId,
      "uniqueid": uuid,
      "os": $.iOS ? "iOS" : "android",
      "channel": $.iOS ? "iOS" : "android",
      "openid": $.openId
    }
  }
  return new Promise(resolve => {
    $.post(taskPostUrl("jkd/minfo/call2.action",
      `jdata=${escape(JSON.stringify(body))}&opttype=${opttype}&optversion=1.0`),
      async (err, resp, data) => {
        try {
          if (err) {
            $.log(`${JSON.stringify(err)}`)
            $.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if (data['ret'] === 'ok') {
                if (opttype === 'ART_READ') {
                  $.artcount = data.datas.artcount
                  $.videocount = data.datas.videocount
                  $.log(`文章剩余观看次数：${$.artcount}，视频剩余观看次数：${$.videocount}`)
                } else {
                  console.log(`动作${opttype}记录成功！`)
                }
              } else {
                console.log(data)
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}

function call1(uuid, article_id, opttype = "INF_ART_COMMENTS") {
  let body = {
    "openID": $.openId,
    "openid": $.openId,
    "app_id": "xzwl",
    "version_token": `${$.version}`,
    "channel": $.iOS ? "iOS" : "android",
    "vercode": `${$.version}`,
    "psign": "92dea068b6c271161be05ed358b59932",
    "app_token": "xzwltoken070704",
    "version": fakeIOS ? '5.6.5' : $.version.toString().split('').join('.'),
    "pars": {
      "openID": $.openId,
      "uniqueid": uuid,
      "os": $.iOS ? "iOS" : "android",
      "channel": $.iOS ? "iOS" : "android",
      "openid": $.openId
    }
  }
  if (article_id) body['pars']['article_id'] = article_id
  return new Promise(resolve => {
    $.post(taskPostUrl("jkd/minfo/call.action",
      `jdata=${escape(JSON.stringify(body))}&opttype=${opttype}`),
      async (err, resp, data) => {
        try {
          if (err) {
            $.log(`${JSON.stringify(err)}`)
            $.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              // $.log(data)
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}

function article(artId) {
  let body = `articleid=${artId}&openID=${$.openId}&ce=${$.iOS ? "iOS" : "android"}&request_id=${new Date().getTime()}&scene_type=art_recommend_${$.iOS ? "iOS" : "android"}&articlevideo=0&version=${$.version}&account_type=1&channel=iOS&shade=1&a=zv8lS5d9LnyV7Bdoyt0NHQ==&font_size=1&scene_type=&request_id=${new Date().getTime()}`
  let config = {
    'url': 'https://www.jukandiannews.com/jkd/weixin20/station/stationarticle.action?' + body,
    'Host': 'www.jukandiannews.com',
    'origin': 'https://www.jukandiannews.com',
    'accept-language': 'zh-cn',
    'user-agent': $.isNode() ?
      (process.env.JKD_USER_AGENT ? process.env.JKD_USER_AGENT : UA) : ($.getdata('JKDUA')
        ? $.getdata('JKDUA') : UA),
    'Cookie': cookie,
  }
  return new Promise(resolve => {
    $.get(config, async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${JSON.stringify(err)}`)
          $.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          $.log(`article 记录成功`)
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function openArticle(artId) {
  let body = `openID=${$.openId}&articleID=${artId}&ce=iOS&articlevideo=0&event=oa&advCodeRandom=0&isShowAdv=1`
  let config = {
    'url': 'https://www.jukandiannews.com/jkd/weixin20/station/articleOpen.action',
    body: body,
    'Host': 'www.jukandiannews.com',
    'accept': 'application/json, text/javascript, */*; q=0.01',
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'origin': 'https://www.jukandiannews.com',
    'accept-language': 'zh-cn',
    'x-requested-with': 'XMLHttpRequest',
    'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    'Cookie': cookie,
  }
  return new Promise(resolve => {
    $.post(config, async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${JSON.stringify(err)}`)
          $.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          $.log(`openArticle 记录成功`)
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function video(artId) {
  let body = `platfrom_id=qtt-video&articleid=${artId}&openID=${$.openId}`
  return new Promise(resolve => {
    $.get(taskGetUrl('jkd/weixin20/station/cnzzinVideo.action', body), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${JSON.stringify(err)}`)
          $.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          $.log(`video 记录成功`)
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function readAccount(artId, payType = 1) {
  let body = {
    "appid": "xzwl",
    "read_weal": 0,
    "paytype": payType,
    "securitykey": "",
    "channel": $.iOS ? "iOS" : "android",
    "psign": "92dea068b6c271161be05ed358b59932",
    "appversioncode": `${$.version}`,
    "time": `${new Date().getTime()}`,
    "apptoken": "xzwltoken070704",
    "appversion": fakeIOS ? '5.6.5' : $.version.toString().split('').join('.'),
    "openid": $.openId,
    "os": $.iOS ? "iOS" : "android",
    "artid": artId,
    "accountType": "0",
    "readmodel": "1"
  }
  return new Promise(resolve => {
    $.post(taskPostUrl("jkd/account/readAccount.action",
      `jsondata=${escape(JSON.stringify(body))}`),
      async (err, resp, data) => {
        try {
          if (err) {
            $.log(`${JSON.stringify(err)}`)
            $.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if (data['ret'] === 'ok') {
                $.log(`文章【${artId}】阅读成功，获得 ${data.profit} 金币`)
                $.profit += data.profit
              } else if (data['ret'] === 'fail') {
                $.log(`文章阅读失败，错误信息：${data.rtn_msg}`)
              } else {
                $.log(`未知错误：${JSON.stringify(data)}`)
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}

function videoAccount(artId) {
  let body = {
    "appid": "xzwl",
    "read_weal": 0,
    "paytype": 2,
    "securitykey": "",
    "channel": $.iOS ? "iOS" : "android",
    "psign": "92dea068b6c271161be05ed358b59932",
    "appversioncode": $.version,
    "time": new Date().toString(),
    "apptoken": "xzwltoken070704",
    "appversion": fakeIOS ? '5.6.5' : $.version.toString().split('').join('.'),
    "openid": $.openId,
    "os": $.iOS ? "iOS" : "android",
    "artid": artId,
    "accountType": "0",
    "readmodel": "1"
  }
  return new Promise(resolve => {
    $.post(taskPostUrl("jkd/account/readAccount.action",
      `jsondata=${escape(JSON.stringify(body))}`),
      async (err, resp, data) => {
        try {
          if (err) {
            $.log(`${JSON.stringify(err)}`)
            $.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if (data['ret'] === 'ok') {
                $.log(`视频【${artId}】阅读成功，获得 ${data.profit} 金币`)
                $.profit += data.profit
              } else if (data['ret'] === 'fail') {
                $.log(`视频阅读失败，错误信息：${data.rtn_msg}`)
              } else {
                $.log(`未知错误：${JSON.stringify(data)}`)
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}

function luckyDraw() {
  return new Promise(resolve => {
    $.post(taskPostUrl("jkd/activity/advluckdraw/getLuckDrawGold.action"),
      async (err, resp, data) => {
        try {
          if (err) {
            $.log(`${JSON.stringify(err)}`)
            $.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if (data['ret'] === 'ok') {
                $.log(`luckyDraw记录成功`)
              } else if (data['ret'] === 'fail') {
                $.log(`luckyDraw记录失败，错误信息：${data.rtn_msg}`)
              } else {
                $.log(`未知错误：${JSON.stringify(data)}`)
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}

function luckyProfit() {
  return new Promise(resolve => {
    $.post(taskPostUrl("jkd/activity/advluckdraw/getTotalLuckProfit.action",),
      async (err, resp, data) => {
        try {
          if (err) {
            $.log(`${JSON.stringify(err)}`)
            $.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if (data['ret'] === 'ok') {
                $.log(`转盘获取成功，共计 ${data.data.totalProfit} 金币`)
              } else if (data['ret'] === 'fail') {
                $.log(`视频阅读失败，错误信息：${data.rtn_msg}`)
              } else {
                $.log(`未知错误：${JSON.stringify(data)}`)
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}

function getLuckyLevel() {
  return new Promise(resolve => {
    $.post(taskPostUrl("jkd/activity/advluckdraw/getLuckDrawLevel.action",),
      async (err, resp, data) => {
        try {
          if (err) {
            $.log(`${JSON.stringify(err)}`)
            $.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if (data['ret'] === 'ok') {
                console.log(`转盘记录成功，剩余 ${data.data.unFinishNum} 次`)
                $.unFinishNum = data.data.unFinishNum
                let states = JSON.parse(data.data.list)
                for (let i = 0; i < states.length; ++i) {
                  const vo = states[i]
                  if (vo['status'] === 1) {
                    console.log(`去领取开宝箱阶段奖励：${vo['level']}`)
                    await getLuckyDrawBox(i)
                  }
                }
                if (data['data']['luckName'] === "神秘宝箱") {
                  console.log(`去领取神秘宝箱奖励`)
                  await adv(11)
                }
              } else if (data['ret'] === 'failed') {
                $.log(`转盘已达上限，跳出`)
                $.luckyDrawNum = 0
              } else {
                $.log(`未知错误：${JSON.stringify(data)}`)
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}

function getLuckyDrawBox(i) {
  let body = `num=${i}`
  return new Promise(resolve => {
    $.post(taskPostUrl("jkd/activity/advluckdraw/getLuckDrawBox.action", body),
      async (err, resp, data) => {
        try {
          if (err) {
            $.log(`${JSON.stringify(err)}`)
            $.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if (data['ret'] === 'ok') {
                console.log(`阶段奖励领取成功，获得 ${data.data} 金币`)
                $.profit += data.data
              } else if (data['ret'] === 'fail') {
                $.log(`阶段奖励领取失败，错误信息：${data.rtn_msg}`)
              } else {
                $.log(`未知错误：${JSON.stringify(data)}`)
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}

function withDraw() {
  return new Promise(resolve => {
    $.post(taskPostUrl("jkd/weixin20/userWithdraw/userWithdrawPost.action",
      `type=wx&sum=${sum}&mobile=&pid=0&accountid=&productcode=`), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${JSON.stringify(err)}`)
          $.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          $.log(`提现结果：${data}`)
          message += `提现结果：${data}`
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function safeGet(data) {
  try {
    if (typeof JSON.parse(data) == "object") {
      return true;
    }
  } catch (e) {
    $.log(e);
    $.log(`聚看点服务器访问数据为空，请检查自身设备网络情况`);
    return false;
  }
}

function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      $.log(e);
      $.msg($.name, '', '不要在BoxJS手动复制粘贴修改cookie')
      return [];
    }
  }
}

function taskGetUrl(function_id, body) {
  return {
    url: `${API_HOST}/${function_id}?${body}`,
    headers: {
      "Cookie": cookie,
      'Content-Type': 'application/x-www-form-urlencoded',
      'accept': 'application/json, text/plain, */*',
      'origin': 'https://www.xiaodouzhuan.cn',
      'referer': 'https://www.xiaodouzhuan.cn',
      "User-Agent": $.isNode() ?
        (process.env.JKD_USER_AGENT ? process.env.JKD_USER_AGENT : UA) : ($.getdata('JKDUA')
          ? $.getdata('JKDUA') : UA),
    }
  }
}

function taskPostUrl(function_id, body) {
  return {
    url: `${API_HOST}/${function_id}`,
    body: body,
    headers: {
      "Cookie": cookie,
      'Content-Type': 'application/x-www-form-urlencoded',
      'accept': 'application/json, text/plain, */*',
      'origin': 'https://www.xiaodouzhuan.cn',
      'referer': 'https://www.xiaodouzhuan.cn',
      "User-Agent": $.isNode() ?
        (process.env.JKD_USER_AGENT ? process.env.JKD_USER_AGENT : UA) : ($.getdata('JKDUA')
          ? $.getdata('JKDUA') : UA),
    }
  }
}

function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r)));let h=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];h.push(e),s&&h.push(s),i&&h.push(i),console.log(h.join("\n")),this.logs=this.logs.concat(h)}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
