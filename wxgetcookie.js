/*
# 监听签到请求以提取 mallId 和 token
[rewrite_local]
^https://m\.mallcoo\.cn/api/user/User/CheckinV2 url script-request-body https://raw.githubusercontent.com/Jone2008/QuantumultX/refs/heads/master/wxgetcookie.js

# MITM 配置
[mitm]
hostname = m.mallcoo.cn
*/

// Quantumult X 脚本：自动获取 mallId 和 token 并打印，支持多种请求体格式
const urlPattern = "https://m.mallcoo.cn/api/user/User/CheckinV2";

// 检查是否是目标请求
if ($request.url.indexOf(urlPattern) !== -1 && $request.method === "POST") {
    try {
        // 检查请求体是否存在
        if (!$request.body) {
            throw new Error("请求体为空");
        }

        let mallId, token;

        // 尝试解析 JSON 格式
        try {
            const requestBody = JSON.parse($request.body);
            if (requestBody && typeof requestBody === 'object') {
                // 支持 MallId 和 MallID（大小写不敏感）
                mallId = requestBody.MallId !== undefined ? requestBody.MallId : requestBody.MallID;
                // 检查 Header 是否存在，并支持 Token 的变体
                token = requestBody.Header && (requestBody.Header.Token || requestBody.Header.token);

                // 检查 mallId 是否有效
                if (mallId === undefined || mallId === null) {
                    throw new Error("mallId 未定义或为空 (JSON)");
                }
                // 检查 token 是否有效
                if (token === undefined || token === null) {
                    throw new Error("token 未定义或为空 (JSON)");
                }
            } else {
                throw new Error("JSON 请求体无效");
            }
        } catch (jsonError) {
            console.log(`JSON 解析失败: ${jsonError.message}`);

            // 尝试解析 URL-encoded 格式
            if ($request.body.includes("=") && $request.body.includes("&")) {
                const params = new URLSearchParams($request.body);
                // 支持大小写变体
                mallId = params.get("MallId") || params.get("MallID");
                token = params.get("Header.Token") || params.get("token");

                if (mallId === null) {
                    throw new Error("mallId 未定义或为空 (URL-encoded)");
                }
                if (token === null) {
                    throw new Error("token 未定义或为空 (URL-encoded)");
                }
            } else {
                // 其他格式，完整输出请求体
                throw new Error(`未知请求体格式: ${$request.body}`);
            }
        }

        // 存储 mallId 和 token 到持久化存储
        $prefs.setValueForKey(mallId.toString(), "mallId_" + mallId);
        $prefs.setValueForKey(token, "token_" + mallId);
        
        // 打印获取的数据
        const message = `捕获成功:\nmallId: ${mallId}\ntoken: ${token}`;
        console.log(message); // 输出到 Quantumult X 日志
        $notify("参数捕获成功", "", message); // 发送通知
    } catch (e) {
        const errorMessage = `捕获失败: ${e.message}`;
        console.log(errorMessage);
        $notify("参数捕获失败", "", errorMessage);
    }
}

$done();
