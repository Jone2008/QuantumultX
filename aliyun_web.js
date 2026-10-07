[Script]
http-response ^https?:\/\/developer\.aliyun\.com\/developer\/api\/my\/user\/getUser script-path=https://raw.githubusercontent.com/leiyiyan/resource/main/script/aliyun_web/aliyun_web.js, requires-body=true, timeout=60, tag=阿里云Web Cookie

[MITM]
hostname = developer.aliyun.com
