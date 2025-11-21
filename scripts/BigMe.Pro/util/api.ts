import { fetch } from "scripting";

// API 基础地址
const BASE_URL = "https://happy.bigmess.org/api/v1";

// 设置结构
export type BigMeSettings = {
  email: string;
  password: string;
};

// 登录响应
type LoginResponse = {
  status: string;
  message: string;
  data: {
    token: string;
    is_admin: number;
    auth_data: string;
  };
  error: null | string;
};

// 订阅信息响应
export type SubscribeResponse = {
  status: string;
  message: string;
  data: {
    plan_id: number;
    token: string;
    expired_at: number | null;
    u: number; // 上传流量（字节）
    d: number; // 下载流量（字节）
    transfer_enable: number; // 总流量（字节）
    device_limit: number | null;
    email: string;
    uuid: string;
    plan: {
      id: number;
      group_id: number;
      transfer_enable: number;
      device_limit: number | null;
      name: string;
      speed_limit: number | null;
      show: number;
      sort: number;
      renew: number;
      content: string;
      month_price: number | null;
      quarter_price: number | null;
      half_year_price: number | null;
      year_price: number | null;
      two_year_price: number | null;
      three_year_price: number | null;
      onetime_price: number;
      reset_price: number;
      reset_traffic_method: number;
      capacity_limit: number | null;
      created_at: number;
      updated_at: number;
    };
    alive_ip: number;
    subscribe_url: string;
    reset_day: number | null;
  };
  error: null | string;
};

// 登录结果
export type LoginResult = {
  token: string; // auth_data (JWT)
  apiToken: string; // token (API token)
  cookies: string;
};

// 登录获取 authorization token 和 cookies
export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    let cookies = "";
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
        "Accept": "application/json",
      };

      // 如果有 cookie，添加到请求头
      if (cookies) {
        headers["Cookie"] = cookies;
      }

      const response = await fetch(`${BASE_URL}/passport/auth/login`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email,
          password,
        }),
        handleRedirect: async (newRequest) => {
          return newRequest;
        },
      });

      // 读取响应内容
      let responseText = "";
      try {
        responseText = await response.text();
      } catch (e) {
        // 忽略读取错误
      }

      // 检测是否为 WAF 挑战页面
      const setCookieHeader = response.headers.get("set-cookie");
      if (isWAFChallenge(response.status, responseText, setCookieHeader)) {
        // 提取并保存 cookie
        const newCookies = extractCookies(setCookieHeader);
        if (newCookies) {
          cookies = newCookies;
        }

        // 等待 6 秒（比页面要求的 5 秒稍长）
        await sleep(6000);

        retryCount++;
        if (retryCount > maxRetries) {
          throw new Error("WAF 验证失败，请稍后重试");
        }
        continue;
      }

      // 如果不是 WAF 挑战页面，检查响应状态
      if (!response.ok) {
        throw new Error(`登录失败: HTTP ${response.status}`);
      }

      // 尝试解析 JSON 响应
      let data: LoginResponse;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("服务器返回了无效的响应格式");
      }

      if (data.status !== "success" || !data.data?.auth_data) {
        throw new Error(data.message || "登录失败");
      }

      console.log("登录成功");
      
      // 如果成功登录后还有 cookie，也保存下来
      const finalCookies = extractCookies(setCookieHeader) || cookies;
      
      // 返回 auth_data (JWT) 和 token (API token) 以及 cookies
      return {
        token: data.data.auth_data, // JWT token for Authorization header
        apiToken: data.data.token, // API token (备用)
        cookies: finalCookies,
      };
    }

    throw new Error("登录失败：超过最大重试次数");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("登录失败:", errorMessage);
    throw new Error(`登录失败: ${errorMessage}`);
  }
}

// 获取订阅信息
export async function getSubscribe(token: string, cookies?: string, apiToken?: string): Promise<SubscribeResponse["data"]> {
  try {
    let currentCookies = cookies || "";
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      const headers: Record<string, string> = {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
        "Accept": "application/json",
      };

      // 根据浏览器请求，Authorization header 应该直接使用 JWT token，不需要 "Bearer " 前缀
      if (token) {
        headers["Authorization"] = token;
      }
      
      // 添加其他浏览器请求头以提高兼容性
      headers["Content-Language"] = "zh-CN";
      headers["Referer"] = "https://happy.bigmess.org/user";

      // 如果有 cookie，添加到请求头
      if (currentCookies) {
        headers["Cookie"] = currentCookies;
      }

      const response = await fetch(`${BASE_URL}/user/getSubscribe`, {
        method: "GET",
        headers,
        handleRedirect: async (newRequest) => {
          return newRequest;
        },
      });

      // 读取响应内容
      let responseText = "";
      try {
        responseText = await response.text();
      } catch (e) {
        // 忽略读取错误
      }

      // 检测是否为 WAF 挑战页面
      const setCookieHeader = response.headers.get("set-cookie");
      if (isWAFChallenge(response.status, responseText, setCookieHeader)) {
        // 提取并保存 cookie
        const newCookies = extractCookies(setCookieHeader);
        if (newCookies) {
          currentCookies = newCookies;
        }

        // 等待 6 秒（比页面要求的 5 秒稍长）
        await sleep(6000);

        retryCount++;
        if (retryCount > maxRetries) {
          throw new Error("WAF 验证失败，请稍后重试");
        }
        continue;
      }

      // 如果不是 WAF 挑战页面，检查响应状态
      if (!response.ok) {
        throw new Error(`获取订阅信息失败: HTTP ${response.status}`);
      }

      // 尝试解析 JSON 响应
      let data: SubscribeResponse;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("服务器返回了无效的响应格式");
      }

      if (data.status !== "success" || !data.data) {
        throw new Error(data.message || "获取订阅信息失败");
      }

      const subscribeData = data.data;
      const usedBytes = subscribeData.u + subscribeData.d;
      const totalBytes = subscribeData.transfer_enable;
      const usedFlow = formatFlow(usedBytes);
      const totalFlow = formatFlow(totalBytes);
      const progress = totalBytes > 0 ? (usedBytes / totalBytes * 100).toFixed(2) : "0.00";

      console.log("订阅名称:", subscribeData.plan.name);
      console.log("流量使用: 已用", usedFlow.value, usedFlow.unit, "/ 总计", totalFlow.value, totalFlow.unit, "(" + progress + "%)");
      console.log("上传流量:", formatFlow(subscribeData.u).value, formatFlow(subscribeData.u).unit);
      console.log("下载流量:", formatFlow(subscribeData.d).value, formatFlow(subscribeData.d).unit);
      console.log("过期时间:", subscribeData.expired_at ? new Date(subscribeData.expired_at * 1000).toLocaleString() : "长期有效");

      return subscribeData;
    }

    throw new Error("获取订阅信息失败：超过最大重试次数");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("获取订阅信息失败:", errorMessage);
    throw new Error(`获取订阅信息失败: ${errorMessage}`);
  }
}

// 检测是否为 WAF 挑战页面
function isWAFChallenge(status: number, responseText: string, setCookieHeader: string | null): boolean {
  return (
    status === 503 &&
    (responseText.includes("Please wait 5 seconds") ||
      responseText.includes("您的浏览器将在五秒后跳转") ||
      (setCookieHeader?.includes("__waf_under_attack") ?? false))
  );
}

// 从响应中提取 Cookie
function extractCookies(setCookieHeader: string | null): string {
  const cookies: string[] = [];
  
  if (setCookieHeader) {
    // 处理多个 Set-Cookie 头
    const cookieStrings = setCookieHeader.split(", ");
    for (const cookieStr of cookieStrings) {
      // 提取 cookie 名称和值（在分号之前）
      const cookiePart = cookieStr.split(";")[0];
      if (cookiePart) {
        cookies.push(cookiePart);
      }
    }
  }
  
  return cookies.join("; ");
}

// 等待指定时间（毫秒）
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 格式化流量（字节转 GB）
export function formatFlow(bytes: number): { value: string; unit: string } {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) {
    return {
      value: gb.toFixed(2),
      unit: "GB",
    };
  }
  const mb = bytes / (1024 * 1024);
  return {
    value: mb.toFixed(2),
    unit: "MB",
  };
}

