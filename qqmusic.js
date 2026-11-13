/**
 * QQ 音乐 · 绿钻成长值 + 金币中心签到与每日任务
 *
 * 抓取:打开 QQ 音乐 →「我的 / 会员 / 每日签到」或「金币中心 / 每日签到」,抓 Cookie
 * 签到:cron 自动续期后完成两套签到,并领取已完成的每日任务奖励
 *
 * @Author: MaYIHEI <https://github.com/MaYIHEI/paperclip>
 * @Channel: Telegram 频道 https://t.me/mayihei
 * @Updated: 2026-10-28
 *
 * ===== Loon =====
 * [MITM]
 * hostname = u6.y.qq.com
 * [Script]
 * request if ${url} ~= /^https:\/\/u6\.y\.qq\.com\/cgi-bin\/musics\.fcg\?.*(EveryDaySignLvzScore|GetSignInSummary)/i then script("https://raw.githubusercontent.com/MaYIHEI/paperclip/refs/heads/main/app/qqmusic/qqmusic.js") with tag="QQ音乐 Cookie", img_url="https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/qqmusic.png", requires_body=true
 * cron "0 30 7 * * *" then script("https://raw.githubusercontent.com/MaYIHEI/paperclip/refs/heads/main/app/qqmusic/qqmusic.js") with tag="QQ音乐每日任务", img_url="https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/qqmusic.png"
 * cron "0 * 9-10 * * *" then script("https://raw.githubusercontent.com/MaYIHEI/paperclip/refs/heads/main/app/qqmusic/qqmusic.js") with tag="QQ音乐定时金币", img_url="https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/qqmusic.png"
 * cron "0 5 0,8,12,16,20,22 * * *" then script("https://raw.githubusercontent.com/MaYIHEI/paperclip/refs/heads/main/app/qqmusic/qqmusic.js") with tag="QQ音乐红包雨", img_url="https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/qqmusic.png"
 *
 * ===== Surge =====
 * [MITM]
 * hostname = u6.y.qq.com
 * [Script]
 * QQ音乐 Cookie = type=http-request,pattern=^https:\/\/u6\.y\.qq\.com\/cgi-bin\/musics\.fcg\?.*(EveryDaySignLvzScore|GetSignInSummary),requires-body=true,max-size=0,script-path=https://raw.githubusercontent.com/MaYIHEI/paperclip/refs/heads/main/app/qqmusic/qqmusic.js,img-url=https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/qqmusic.png
 * QQ音乐每日任务 = type=cron,cronexp=30 7 * * *,timeout=1200,script-path=https://raw.githubusercontent.com/MaYIHEI/paperclip/refs/heads/main/app/qqmusic/qqmusic.js,img-url=https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/qqmusic.png
 * QQ音乐定时金币 = type=cron,cronexp=* 9-10 * * *,timeout=1200,script-path=https://raw.githubusercontent.com/MaYIHEI/paperclip/refs/heads/main/app/qqmusic/qqmusic.js,img-url=https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/qqmusic.png
 * QQ音乐红包雨 = type=cron,cronexp=5 0,8,12,16,20,22 * * *,timeout=1200,script-path=https://raw.githubusercontent.com/MaYIHEI/paperclip/refs/heads/main/app/qqmusic/qqmusic.js,img-url=https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/qqmusic.png
 *
 * ===== Quantumult X =====
 * [MITM]
 * hostname = u6.y.qq.com
 * [rewrite_local]
 * ^https:\/\/u6\.y\.qq\.com\/cgi-bin\/musics\.fcg\?.*(EveryDaySignLvzScore|GetSignInSummary) url script-request-body https://raw.githubusercontent.com/MaYIHEI/paperclip/refs/heads/main/app/qqmusic/qqmusic.js
 * [task_local]
 * 30 7 * * * https://raw.githubusercontent.com/MaYIHEI/paperclip/refs/heads/main/app/qqmusic/qqmusic.js, tag=QQ音乐每日任务, img-url=https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/qqmusic.png, enabled=true
 * * 9-10 * * * https://raw.githubusercontent.com/MaYIHEI/paperclip/refs/heads/main/app/qqmusic/qqmusic.js, tag=QQ音乐定时金币, img-url=https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/qqmusic.png, enabled=true
 * 5 0,8,12,16,20,22 * * * https://raw.githubusercontent.com/MaYIHEI/paperclip/refs/heads/main/app/qqmusic/qqmusic.js, tag=QQ音乐红包雨, img-url=https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/qqmusic.png, enabled=true
 */
