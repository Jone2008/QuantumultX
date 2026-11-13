/**
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
