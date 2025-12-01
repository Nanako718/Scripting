import { fetch } from "scripting";

// 设置结构
export type ChinaTelecomSettings = {
  apiUrl: string;
  mobile: string;
  password: string;
};

const SETTINGS_KEY = "chinaTelecomSettings";

// 日期格式化函数
function formatDate(format: string, date?: Date | string): string {
  const d = date ? new Date(typeof date === 'string' ? date.replace(/-/g, '/') : date) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('yyyy', String(year))
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
}

// 从 Storage 读取设置
export function getSettings(): ChinaTelecomSettings | null {
  return Storage.get<ChinaTelecomSettings>(SETTINGS_KEY);
}

// 查询重要数据接口（直接使用配置的 API）
export async function queryImportantData(): Promise<any> {
  const settings = getSettings();
  if (!settings) {
    throw new Error("未找到配置，请在设置中配置接口、账号、密码");
  }

  if (!settings.apiUrl) {
    throw new Error("未配置接口地址(apiUrl)，请在设置中配置");
  }

  if (!settings.mobile) {
    throw new Error("未配置手机号(mobile)，请在设置中配置");
  }

  if (!settings.password) {
    throw new Error("未配置密码(password)，请在设置中配置");
  }

  let baseUrl = settings.apiUrl.trim();
  baseUrl = baseUrl.replace(/\/$/, '');
  const apiUrl = `${baseUrl}/qryImportantData`;
  const mobile = settings.mobile.trim();
  const password = settings.password.trim();

  console.log("查询数据:", apiUrl, mobile);

  const body = {
    phonenum: mobile,
    password: password
  };

  const headers = {
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`查询请求失败: HTTP ${response.status}`);
    }

    const data = JSON.parse(await response.text());

    if (data.headerInfos?.code === '0000' && data.responseData?.resultCode === '0000') {
      console.log("查询成功");
      return data;
    } else {
      const errMsg = data.responseData?.resultDesc || data.headerInfos?.reason || "未知错误";
      console.error("查询失败:", errMsg);
      throw new Error("查询失败: " + errMsg);
    }
  } catch (error) {
    console.error("查询异常:", error);
    throw error;
  }
}

// 处理查询结果并保存（已废弃，不再使用）
export function processQueryResult(res: any): any {
  if (!res || !res.responseData || !res.responseData.data) {
    throw new Error("查询数据失败：响应数据格式不正确");
  }

  const old_obj_str = Storage.get<string>("vvv_flow", { shared: true });
  let old_obj = null;
  try {
    if (old_obj_str) {
      old_obj = JSON.parse(old_obj_str);
    }
  } catch (error) {
    console.warn("⚠️ 解析旧数据失败:", error);
  }

  // 接口返回的数据格式：
  // flowTotal: 总流量（字节）
  // commonTotal: 通用流量总计（字节）
  // commonUse: 通用流量已用（字节）
  // specialTotal: 专用流量总计（字节）
  // specialUse: 专用流量已用（字节）

  // 通用流量（收费流量）- 单位是字节，需要转换为 MB
  const commonTotal = parseFloat(String(res.commonTotal || "0"));
  const commonUse = parseFloat(String(res.commonUse || "0"));
  const commonBalance = commonTotal - commonUse;
  
  let limitbalancetotal = commonBalance / 1024; // 转换为 MB
  let limitusagetotal = commonUse / 1024; // 转换为 MB
  let limitratabletotal = commonTotal / 1024; // 转换为 MB

  // 专用流量（免费流量）- 单位是字节，需要转换为 MB
  const specialTotal = parseFloat(String(res.specialTotal || "0"));
  const specialUse = parseFloat(String(res.specialUse || "0"));
  const specialBalance = specialTotal - specialUse;
  
  let unlimitbalancetotal = specialBalance / 1024; // 转换为 MB
  let unlimitusagetotal = specialUse / 1024; // 转换为 MB
  let unlimitratabletotal = specialTotal / 1024; // 转换为 MB

  const now = new Date();
  const time = formatDate('yyyy-MM-dd HH:mm:ss', now);
  const query_date = formatDate('yyyy-MM-dd', now);

  const fee_used_flow = Number(limitusagetotal.toFixed(2));
  const fee_remain_flow = Number(limitbalancetotal.toFixed(2));
  const fee_all_flow = Number(limitratabletotal.toFixed(2));

  const free_used_flow = Number(unlimitusagetotal.toFixed(2));
  const used_flow = Number((limitusagetotal + unlimitusagetotal).toFixed(2));
  const sum_top_flow = Number((unlimitratabletotal + limitratabletotal).toFixed(2));
  const remain_top_flow = Number((limitbalancetotal + unlimitbalancetotal).toFixed(2));

  const second = old_obj ? parseFloat(((new Date(time.replace(/-/g, '/')).getTime() - new Date(old_obj.query_date_time.replace(/-/g, '/')).getTime()) / 1000).toFixed(2)) : 0;
  const second_flow = (old_obj && old_obj.fee_used_flow < fee_used_flow) ? parseFloat((fee_used_flow - old_obj.fee_used_flow).toFixed(2)) : 0;

  const last_day_fee_flow = (old_obj && old_obj.last_day_fee_flow >= 0) ? old_obj.last_day_fee_flow : fee_used_flow;
  const offset_fee = parseFloat((fee_used_flow - last_day_fee_flow).toFixed(2));
  const one_day_fee_flow = offset_fee >= 0 ? offset_fee : (old_obj?.one_day_fee_flow || 0);

  const last_day_free_flow = (old_obj && old_obj.last_day_free_flow >= 0) ? old_obj.last_day_free_flow : free_used_flow;
  const offset_free = parseFloat((free_used_flow - last_day_free_flow).toFixed(2));
  const one_day_free_flow = (offset_free >= 0 ? offset_free : (old_obj?.one_day_free_flow || 0));

  const last_day_flow = (old_obj && old_obj.last_day_flow >= 0) ? old_obj.last_day_flow : used_flow;
  const offset_flow = parseFloat((used_flow - last_day_flow).toFixed(2));
  const one_day_flow = (offset_flow >= 0 ? offset_flow : (old_obj?.one_day_flow || 0));

  // 计算每日可用流量限制
  const dd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate() + 1;
  const fee_flow_limit = parseInt((fee_remain_flow / dd).toFixed(0));

  const obj = {
    'query_date_time': time,
    'query_date': query_date,
    'fee_used_flow': fee_used_flow,
    'fee_remain_flow': fee_remain_flow,
    'fee_all_flow': fee_all_flow,
    'free_used_flow': free_used_flow,
    'used_flow': used_flow,
    'sum_top_flow': sum_top_flow,
    'remain_top_flow': remain_top_flow,
    'last_day_fee_flow': last_day_fee_flow,
    'one_day_fee_flow': one_day_fee_flow,
    'last_day_free_flow': last_day_free_flow,
    'one_day_free_flow': one_day_free_flow,
    'last_day_flow': last_day_flow,
    'one_day_flow': one_day_flow,
    'second': second,
    'second_flow': second_flow,
    'fee_flow_limit': fee_flow_limit,
  };

  console.log("=".repeat(50));
  console.log("📊 流量统计结果:");
  console.log("  - 查询时间:", obj.query_date_time);
  console.log("  - 收费流量已用:", obj.fee_used_flow, "MB");
  console.log("  - 收费流量剩余:", obj.fee_remain_flow, "MB");
  console.log("  - 免费流量已用:", obj.free_used_flow, "MB");
  console.log("  - 总流量已用:", obj.used_flow, "MB");
  console.log("  - 总流量剩余:", obj.remain_top_flow, "MB");
  console.log("  - 今日已用收费流量:", obj.one_day_fee_flow, "MB");
  console.log("  - 今日可用流量:", obj.fee_flow_limit, "MB");
  console.log("=".repeat(50));

  // 保存结果
  const objstr = JSON.stringify(obj);
  Storage.set("vvv_flow", objstr, { shared: true });

  return obj;
}

// 主查询函数（直接查询）
export async function handleQuery(): Promise<any> {
  console.log("=".repeat(50));
  console.log("🚀 开始处理查询请求");
  console.log("=".repeat(50));

  const res = await queryImportantData();

  if (!res) {
    throw new Error("查询失败");
  }

  return processQueryResult(res);
}

