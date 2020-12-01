# -*- coding: utf8 -*-

import re
import time
import random
import requests
from datetime import datetime, timedelta

# 以下为需自行抓包数据
TIME = 5  # 单次上传阅读时间，默认为5分钟
LIMIT_TIME = 18  # 每日最大上传阅读时间，默认为18小时
DELAYSEC = 1  # 单次任务延时，默认为1秒

qqreadtimeurl = ""

qqreadheaders = {

}

qqreadtimeheaders = {

}
# 以上为需自行抓包数据


def getTemplate(functionId):
    functionURL = f"https://mqqapi.reader.qq.com/mqq/{functionId}"
    delay()
    data = requests.get(functionURL, headers=qqreadheaders).json()
    return data

# 获取任务列表


def qqreadtask():
    task_data = getTemplate("red_packet/user/page?fromGuid=")['data']
    return task_data

# 获取“我的”页面任务


def qqreadmytask():
    mytask_data = getTemplate("v1/task/list")['data']['taskList']
    return mytask_data

# 获取用户名


def qqreadinfo():
    info_data = getTemplate("user/init")['data']
    return info_data

# 书券签到


def qqreadticket():
    qqreadticketurl = "https://mqqapi.reader.qq.com/mqq/sign_in/user"
    delay()
    ticket_data = requests.post(
        qqreadticketurl, headers=qqreadheaders).json()['data']
    return ticket_data

# 每日打卡


def qqreadsign():
    sign_data = getTemplate("red_packet/user/clock_in/page")['data']
    return sign_data

# 每日打卡翻倍


def qqreadsign2():
    sign2_data = getTemplate("red_packet/user/clock_in_video")
    return sign2_data

# 每日阅读


def qqreadtodayread():
    todayread_data = getTemplate("red_packet/user/read_book")
    return todayread_data

# 视频奖励


def qqreadvideo():
    video_data = getTemplate("red_packet/user/watch_video")
    return video_data

# 宝箱奖励


def qqreadbox():
    box_data = getTemplate("red_packet/user/treasure_box")
    return box_data

# 宝箱奖励翻倍


def qqreadbox2():
    box2_data = getTemplate("red_packet/user/treasure_box_video")
    return box2_data

# 获取本周阅读时长


def qqreadwktime():
    wktime_data = getTemplate("v1/bookShelfInit")['data']['readTime']
    return wktime_data

# 周阅读时长奖励查询


def qqreadwkpickinfo():
    wkpickinfo_data = getTemplate("pickPackageInit")['data']
    return wkpickinfo_data

# 周阅读时长奖励领取


def qqreadwkpick(num):
    wkpick_data = getTemplate(f"pickPackage?readTime={num}")
    return wkpick_data

# 获取本日阅读时长


def qqreadtodaytime():
    todaytime_data = getTemplate("page/config?router=/pages/book-read/index&options=")[
        'data']['pageParams']['todayReadSeconds']
    return todaytime_data//60

# 本日阅读时长奖励


def qqreadtodaygift(sec):
    todygift_data = getTemplate(
        f"red_packet/user/read_time?seconds={sec}")['data']
    return todygift_data

# 上传阅读时长


def qqreadaddtime():
    sectime = random.randint(TIME*60*1000, (TIME+1)*60*1000)
    findtime = re.compile(r'readTime=(.*?)&')
    findtime1 = re.compile(r'readTime%22%3A(.*?)%2C')
    url = re.sub(findtime.findall(qqreadtimeurl)[
                 0], str(sectime), str(qqreadtimeurl))
    url = re.sub(findtime1.findall(qqreadtimeurl)[
                 0], str(sectime), str(qqreadtimeurl))
    delay()
    addtime_data = requests.get(url, headers=qqreadtimeheaders).json()
    return addtime_data

# 每日阅读时长奖励


def qqreadssr(sec):
    readssr_data = getTemplate(f"red_packet/user/read_time?seconds={sec}")
    return readssr_data


# 获取北京时间


def gettime():
    utc_dt = datetime.utcnow()  # UTC时间
    bj_dt = (utc_dt+timedelta(hours=8)).strftime('%Y-%m-%d %H:%M:%S')  # 北京时间
    return bj_dt

# 延时


def delay():
    time.sleep(DELAYSEC)


def main():
    start_time = time.time()

    info_data = qqreadinfo()
    todaytime_data = qqreadtodaytime()
    wktime_data = qqreadwktime()
    task_data = qqreadtask()
    mytask_data = qqreadmytask()

    tz = f"========== {gettime()} =========\n"
    tz += f"============= 📣系统通知📣 =============\n"
    tz += f"【用户信息】{info_data['user']['nickName']}\n"
    tz += f"【账户余额】{task_data['user']['amount']}金币\n"
    tz += f"【今日阅读】{todaytime_data}分钟\n"
    tz += f"【本周阅读】{wktime_data}分钟\n"
    tz += f"【{task_data['taskList'][0]['title']}】{task_data['taskList'][0]['amount']}金币,{task_data['taskList'][0]['actionText']}\n"
    tz += f"【{task_data['taskList'][1]['title']}】{task_data['taskList'][1]['amount']}金币,{task_data['taskList'][1]['actionText']}\n"
    tz += f"【{task_data['taskList'][2]['title']}】{task_data['taskList'][2]['amount']}金币,{task_data['taskList'][2]['actionText']}\n"
    tz += f"【{task_data['taskList'][3]['title']}】{task_data['taskList'][3]['amount']}金币,{task_data['taskList'][3]['actionText']}\n"
    tz += f"【第{task_data['invite']['issue']}期】时间{task_data['invite']['dayRange']} [已邀请{task_data['invite']['inviteCount']}人，再邀请{task_data['invite']['nextInviteConfig']['count']}人获得{task_data['invite']['nextInviteConfig']['amount']}金币]\n"
    tz += f"【{task_data['fans']['title']}】{task_data['fans']['fansCount']}个好友,{task_data['fans']['todayAmount']}金币\n"
    tz += f"【宝箱任务{task_data['treasureBox']['count'] + 1}】{task_data['treasureBox']['tipText']}\n"

    if task_data['treasureBox']['doneFlag'] == 0:
        box_data = qqreadbox()
        if box_data['code'] == 0:
            tz += f"【宝箱奖励{box_data['data']['count']}】获得{box_data['data']['amount']}金币\n"

    for i in range(len(task_data['taskList'])):
        if task_data['taskList'][i]['title'].find("立即阅读") != -1 and task_data['taskList'][i]['doneFlag'] == 0:
            todayread_data = qqreadtodayread()
            if todayread_data['code'] == 0:
                tz += f"【每日阅读】获得{todayread_data['data']['amount']}金币\n"

        if task_data['taskList'][i]['title'].find("打卡") != -1:
            sign_data = qqreadsign()
            if task_data['taskList'][i]['doneFlag'] == 0:
                tz += f"【今日打卡】获得{sign_data['todayAmount']}金币，已连续签到{sign_data['clockInDays']}天\n"
            if sign_data['videoDoneFlag'] == 0:
                sign2_data = qqreadsign2()
                if sign2_data['code'] == 0:
                    tz += f"【打卡翻倍】获得{sign2_data['data']['amount']}金币\n"

        if task_data['taskList'][i]['title'].find("视频") != -1 and task_data['taskList'][i]['doneFlag'] == 0:
            video_data = qqreadvideo()
            if video_data['code'] == 0:
                tz += f"【视频奖励】获得{video_data['data']['amount']}金币\n"

        if task_data['taskList'][i]['title'].find("阅读任务") != -1 and task_data['taskList'][i]['doneFlag'] == 0:
            if todaytime_data >= 1 and todaytime_data < 5:
                todaygift_data = qqreadtodaygift(30)
                if todaygift_data['amount'] > 0:
                    tz += f"【阅读金币1】获得{todaygift_data['amount']}金币\n"
            if todaytime_data >= 5 and todaytime_data < 30:
                todaygift_data = qqreadtodaygift(300)
                if todaygift_data['amount'] > 0:
                    tz += f"【阅读金币2】获得{todaygift_data['amount']}金币\n"
            if todaytime_data >= 30:
                todaygift_data = qqreadtodaygift(1800)
                if todaygift_data['amount'] > 0:
                    tz += f"【阅读金币3】获得{todaygift_data['amount']}金币\n"

    for i in range(len(mytask_data)):
        if mytask_data[i]['title'].find("每日签到") != -1 and mytask_data[i]['doneFlag'] == 0:
            ticket_data = qqreadticket()
            if ticket_data['takeTicket'] > 0:
                tz += f"【书券签到】获得{ticket_data['takeTicket']}书券\n"

    if wktime_data >= 1200:
        wkpickinfo_data = qqreadwkpickinfo()
        package = ['10', '10', '20', '30', '50', '80', '100', '120']
        if wkpickinfo_data[-1]['isPick'] == False:
            for index, i in enumerate(wkpickinfo_data):
                info = getTemplate(f"pickPackage?readTime={i['readTime']}")
                if info['code'] == 0:
                    tz += f"【周时长奖励{index+1}】领取{package[index]}书券\n"
        else:
            tz += "【周时长奖励】已全部领取\n"

    if task_data['treasureBox']['videoDoneFlag'] == 0:
        time.sleep(8)
        box2_data = qqreadbox2()
        if box2_data['code'] == 0:
            tz += f"【宝箱翻倍】获得{box2_data['data']['amount']}金币\n"

    if todaytime_data//60 <= LIMIT_TIME:
        addtime_data = qqreadaddtime()
        if addtime_data['code'] == 0:
            tz += f"【阅读时长】成功上传{TIME}分钟\n"

    tz += f"\n🕛耗时：{time.time()-start_time}秒"
    print(tz)


if __name__ == "__main__":
    print("脚本开始运行!")
    main()
