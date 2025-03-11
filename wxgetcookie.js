// Quantumult X 脚本：自动获取 mallId 和 token 并打印
const urlPattern = "https://m.mallcoo.cn/api/user/User/CheckinV2";

// 检查是否是目标请求
if ($request.url.indexOf(urlPattern) !== -1 && $request.method === "POST") {
    try {
        // 解析请求体
        const requestBody = JSON.parse($request.body);
        const mallId = requestBody.MallId;
        const token = requestBody.Header.Token;

        // 验证参数是否存在
        if (mallId && token) {
            // 存储 mallId 和 token 到持久化存储
            $prefs.setValueForKey(mallId.toString(), "mallId_" + mallId);
            $prefs.setValueForKey(token, "token_" + mallId);
            
            // 打印获取的数据
            const message = `捕获成功:\nmallId: ${mallId}\ntoken: ${token}`;
            console.log(message); // 输出到 Quantumult X 日志
            $notify("参数捕获成功", "", message); // 发送通知
        } else {
            $notify("参数提取失败", "", "未找到 mallId 或 token");
        }
    } catch (e) {
        $notify("解析错误", "", "无法解析请求体: " + e.message);
    }
}

$done();
