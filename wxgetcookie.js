/*
# 监听签到请求以提取 mallId 和 token
[rewrite_local]
^https://m\.mallcoo\.cn/api/user/User/CheckinV2 url script-request-body https://raw.githubusercontent.com/Jone2008/QuantumultX/refs/heads/master/wxgetcookie.js

# MITM 配置
[mitm]
hostname = m.mallcoo.cn
*/

// Quantumult X 脚本：自动获取 mallId 和 token 并打印
const urlPattern = "https://m.mallcoo.cn/api/user/User/CheckinV2";

// 检查是否是目标请求
if ($request.url.indexOf(urlPattern) !== -1 && $request.method === "POST") {
    try {
        // 检查请求体是否存在
        if (!$request.body) {
            throw new Error("请求体为空");
        }

        let mallId, token;

        // 解析 JSON 格式（根据抓包确认是 application/json）
        const requestBody = JSON.parse($request.body);
        if (requestBody && typeof requestBody === 'object') {
            // 支持 MallId 和 MallID（大小写不敏感）
            mallId = requestBody.MallId !== undefined ? requestBody.MallId : requestBody.MallID;
            // 检查 Header 是否存在，并支持 Token 的变体
            token = requestBody.Header && (requestBody.Header.Token || requestBody.Header.token);

            // 检查 mallId 是否有效
            if (mallId === undefined || mallId === null) {
                throw new Error("mallId 未定义或为空");
            }
            // 检查 token 是否有效
            if (token === undefined || token === null) {
                throw new Error("token 未定义或为空");
            }
        } else {
            throw new Error("请求体不是有效的 JSON 对象");
        }

        // 存储 mallId 和 token 到持久化存储
        $prefs.setValueForKey(mallId.toString(), "mallId_" + mallId);
        $prefs.setValueForKey(token, "token_" + mallId);
        
        // 打印获取的数据
        const message = `捕获成功:\nmallId: ${mallId}\ntoken: ${token}`;
        console.log(message); // 输出到 Quantumult X 日志
        $notify("参数捕获成功", "", message); // 发送通知
    } catch (e) {
        const errorMessage = `捕获失败: ${e.message}\n请求体: ${$request.body}`;
        console.log(errorMessage);
        $notify("参数捕获失败", "", errorMessage);
    }
}

$done();
