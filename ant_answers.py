import os
import re
import datetime
import requests
import urllib3

# 禁用安全证书警告
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def get_html(url):
    """采用标准浏览器头抓取网页"""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Referer": "https://duotegame.com",
        "Connection": "keep-alive"
    }
    try:
        response = requests.get(url, headers=headers, timeout=15, verify=False)
        response.raise_for_status()
        response.encoding = response.apparent_encoding if response.apparent_encoding else 'utf-8'
        return response.text
    except Exception as e:
        print(f"❌ 无法访问网址 [{url}]，原因: {e}")
        return ""

def clean_html_tags(html):
    """清洗 HTML 标签及特殊转义符，返回干净的纯文本行列表"""
    html_norm = re.sub(r'(<br\s*/?>|</p>|</div>)', '\n', html)
    pure_text = re.sub(r'<[^>]+>', '', html_norm)
    # 修复特殊符号转义问题
    pure_text = pure_text.replace("&nbsp;", " ").replace("&middot;", "·")
    pure_text = pure_text.replace("&ldquo;", "“").replace("&rdquo;", "”")
    pure_text = pure_text.replace("&lsquo;", "‘").replace("&rsquo;", "’")
    return [line.strip() for line in pure_text.splitlines() if line.strip()]

def force_bold_answer(text):
    """全面兼容各种冒号和空格，确保 Telegram 加粗成功"""
    if "答案" in text:
        parts = re.split(r'答案[：:\s]*', text, maxsplit=1)
        if len(parts) == 2:
            question_part = parts[0].strip()
            answer_part = parts[1].strip().rstrip('。；;')
            return f"{question_part} 答案：**{answer_part}**"
    return text

def extract_庄园(html):
    """采用精准正则边界匹配，彻底阻断 6.2 错误匹配到 6.29 的问题"""
    if not html:
        return "抓取网页失败\n"
        
    now = datetime.datetime.now()
    m, d = now.month, now.day
    
    # 构造精确的正则表达式：匹配今天日期，但后面绝对不能紧跟数字（阻断 6.29 等）
    pattern_str = rf"^0?{m}\.0?{d}(?:[：:\s]|$)"
    date_regex = re.compile(pattern_str)
    
    lines = clean_html_tags(html)
    result = []
    
    for line in lines:
        if date_regex.match(line) and "答案" in line:
            beautified_line = force_bold_answer(line)
            result.append(beautified_line)
            
    if result:
        return f"\n\n".join(result) + "\n"
    return "⚠️ 庄园今日答案尚未更新或未匹配到今天日期。\n"

def extract_新村(html):
    """提取新村当日问答，严格限制日期边界，彻底过滤解析"""
    if not html:
        return "抓取网页失败\n"
        
    now = datetime.datetime.now()
    m, d = now.month, now.day
    
    # 构造新村的精准正则边界：匹配 6月2日 等，后面不紧跟数字
    pattern_str = rf"^0?{m}月0?{d}日(?:[：:\s]|$)"
    date_regex = re.compile(pattern_str)
    
    lines = clean_html_tags(html)
    result = []
    
    for i, line in enumerate(lines):
        if date_regex.match(line) and any(k in line for k in ["问题", "答案", "今日"]):
            result.append(line)
            for j in range(1, 3):
                if i + j < len(lines):
                    next_line = lines[i + j]
                    if "解析" in next_line or "月" in next_line or "日" in next_line:
                        break
                    if "答案" in next_line:
                        result.append(next_line)
            break
            
    if result:
        joined_text = " ".join([l.strip() for l in result if "解析" not in l])
        return force_bold_answer(joined_text) + "\n"
    return "⚠️ 新村今日答案尚未更新或未匹配到今天日期。\n"

def send_tg(text):
    """青龙公共 Telegram 通知推送引擎"""
    token = os.getenv("TG_BOT_TOKEN")
    user_id = os.getenv("TG_USER_ID")
    host = os.getenv("TG_API_HOST", "api.telegram.org")
    if not token or not user_id:
        print("⚠️ 未检测到面板的环境变量，取消推送。")
        return
    
    url = f"https://{host}/bot{token}/sendMessage"
    payload = {"chat_id": user_id, "text": text, "parse_mode": "Markdown"}
    try:
        res = requests.post(url, json=payload, timeout=10)
        print("✅ Telegram 推送成功！" if res.status_code == 200 else f"❌ TG 推送失败: {res.text}")
    except Exception as e:
        print(f"❌ TG 推送引发异常: {e}")

def main():
    print("🔔 开始获取蚂蚁庄园和蚂蚁新村今日答案...")
    
    # 🔍 【已严格校对】带有标准斜杠的正确 URL
    url_zy = "https://www.duotegame.com/mgl/1175.html"
    url_xc = "https://www.duotegame.com/mgl/32370.html"
    
    html_zy = get_html(url_zy)
    html_xc = get_html(url_xc)
    
    ans_zy = extract_庄园(html_zy)
    ans_xc = extract_新村(html_xc)
    
    push_content = (
        "📌 *蚂蚁系列今日答案推送*\n\n"
        f"🏡 *蚂蚁庄园结果：*\n{ans_zy}\n"
        f"🧑‍🌾 *蚂蚁新村结果：*\n{ans_xc}"
    )
    
    print("\n--- 提取结果 ---")
    print(push_content)
    print("--------------- \n")
    
    send_tg(push_content)

if __name__ == "__main__":
    main()
