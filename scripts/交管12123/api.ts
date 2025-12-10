import { fetch } from "scripting";

// API 配置
const API_PARAMS = {
  api1: 'biz.vio.unhandledVioCount.query',
  infoURL: 'https://miniappcsfw.122.gov.cn:8443/openapi/invokeApi/business/biz',
  productId: 'p10000000000000000001',
  api2: 'biz.user.integration.query',
};

// 设置结构定义
export type Traffic12123Settings = {
  token: string;
  enableBoxJs?: boolean;
  boxJsUrl?: string;
  vehicleImageUrl?: string;
  vehicleImageWidth?: number;
  vehicleImageHeight?: number;
  vehicleImageOffsetY?: number;
}

// 数据类型定义
export type TrafficData = {
  plateNumber: string;
  drivingLicenseType: string;
  renewalDate: string;
  annualInspectionDate: string;
  violationCount: number;
  penaltyPoints: number;
  recordInfo: string;
  vehicleImageUrl?: string;
}

const BOXJS_KEY = "12123.token"; // BoxJs 中存储的 key

// 从 BoxJs 读取 Token
export async function fetchTokenFromBoxJs(boxJsUrl: string): Promise<string | null> {
  try {
    const url = `${boxJsUrl.replace(/\/$/, "")}/query/data/${BOXJS_KEY}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      // BoxJs 返回格式: { "key": "12123", "val": "token值" }
      const token = data?.val;
      if (token && typeof token === 'string' && token.trim()) {
        return token.trim();
      }
    }
  } catch (error) {
    // 静默失败
  }
  return null;
}

// 格式化日期（显示完整日期：年-月-日）
function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length >= 3) {
    return `${parts[0]}-${parts[1]}-${parts[2]}`;
  }
  return dateStr;
}

// 解析 Token
function parseToken(token: string): { sign: string; verifyToken: string } | null {
  try {
    let tokenStr = token;
    if (tokenStr.startsWith('params=')) {
      tokenStr = tokenStr.replace('params=', '');
    }
    
    const body = JSON.parse(decodeURIComponent(tokenStr));
    const params = {
      sign: body.sign,
      verifyToken: body.verifyToken,
    };
    return params;
  } catch (error) {
    return null;
  }
}

// 请求未处理违法数量
async function fetchViolationCount(params: { sign: string; verifyToken: string }): Promise<number | null> {
  try {
    const response = await fetch(API_PARAMS.infoURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `params=${JSON.stringify({
        api: API_PARAMS.api1,
        productId: API_PARAMS.productId,
        ...params,
      })}`,
    });
    
    if (!response.ok) {
      return null;
    }

    const violationData = await response.json();
    
    if (!violationData.success) {
      return null;
    }

    const illegal = violationData.data?.list?.[0] || {};
    const violationCount = illegal.count || 0;
    return violationCount;
  } catch (error) {
    return null;
  }
}

// 请求用户详细信息（驾驶证、车辆）
async function fetchUserDetails(params: { sign: string; verifyToken: string }): Promise<{
  drivingLicense?: any;
  vehicles?: any[];
} | null> {
  try {
    const response = await fetch(API_PARAMS.infoURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `params=${encodeURIComponent(
        JSON.stringify({
          api: API_PARAMS.api2,
          productId: API_PARAMS.productId,
          ...params,
        })
      )}`,
    });
    
    if (!response.ok) {
      return null;
    }

    const detailsData = await response.json();
    
    if (!detailsData.success) {
      return null;
    }

    const { drivingLicense, vehicles } = detailsData.data || {};
    
    return { drivingLicense, vehicles };
  } catch (error) {
    return null;
  }
}

// 获取交管12123数据
export async function fetchTrafficData(token: string): Promise<TrafficData | null> {
  try {
    // 完全模仿 12123.js 的 token 解析方式
    let tokenStr = token;
    if (tokenStr.startsWith('params=')) {
      tokenStr = tokenStr.replace('params=', '');
    }
    
    // 处理 BoxJs 返回的数组格式
    let actualTokenStr = tokenStr;
    try {
      const parsed = JSON.parse(tokenStr);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].val) {
        actualTokenStr = parsed[0].val;
      }
    } catch (e) {
      // 不是数组格式，直接使用
    }
    
    const body = JSON.parse(decodeURIComponent(actualTokenStr));
    
    const params = {
      sign: body.sign,
      verifyToken: body.verifyToken,
    };

    // 第一步：请求未处理违法数量
    const requestBody1 = {
      api: API_PARAMS.api1,
      productId: API_PARAMS.productId,
      ...params,
    };
    const bodyStr1 = `params=${JSON.stringify(requestBody1)}`;
    
    const violationResponse = await fetch(API_PARAMS.infoURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      },
      body: bodyStr1,
    });
    
    if (!violationResponse.ok) {
      return null;
    }

    const violationData = await violationResponse.json();
    
    if (!violationData.success) {
      return null;
    }

    const illegal = violationData.data?.list?.[0] || {};
    const violationCount = parseInt(String(illegal.count || 0), 10) || 0;

    // 第二步：请求用户详细信息
    const requestBody2 = {
      api: API_PARAMS.api2,
      productId: API_PARAMS.productId,
      ...params,
    };
    const bodyStr2 = `params=${encodeURIComponent(JSON.stringify(requestBody2))}`;
    
    const detailsResponse = await fetch(API_PARAMS.infoURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      },
      body: bodyStr2,
    });
    
    if (!detailsResponse.ok) {
      return null;
    }

    const detailsData = await detailsResponse.json();
    
    if (!detailsData.success) {
      return null;
    }

    const { drivingLicense, vehicles } = detailsData.data || {};
    
    const vehicle = vehicles?.[0] || {};
    const penaltyPoints = parseInt(String(drivingLicense?.cumulativePoint || 0), 10) || 0;
    
    const licenseStatus = drivingLicense?.status === 'A' ? '正常' : (drivingLicense?.status || '正常');
    
    const data: TrafficData = {
      plateNumber: vehicle.plateNumber || '—',
      drivingLicenseType: drivingLicense?.allowToDrive || '—',
      renewalDate: formatDate(drivingLicense?.validityEnd || ''),
      annualInspectionDate: formatDate(vehicle.validPeriodEnd || ''),
      violationCount,
      penaltyPoints,
      recordInfo: `备案信息：${drivingLicense?.name || ''}, 驾驶证状态(${licenseStatus}), ${drivingLicense?.issueOrganizationName || ''}`,
      vehicleImageUrl: vehicle.vehicleImageUrl,
    };
    
    return data;
  } catch (error) {
    return null;
  }
}
