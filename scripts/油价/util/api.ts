import { fetch } from "scripting";

const base = 'https://cx.sinopecsales.com/yjkqiantai';

export const provinces = [
  { label: '北京', value: '11' },
  { label: '天津', value: '12' },
  { label: '河北', value: '13' },
  { label: '山西', value: '14' },
  { label: '河南', value: '41' },
  { label: '山东', value: '37' },
  { label: '上海', value: '31' },
  { label: '江苏', value: '32' },
  { label: '浙江', value: '33' },
  { label: '安徽', value: '34' },
  { label: '福建', value: '35' },
  { label: '江西', value: '36' },
  { label: '湖北', value: '42' },
  { label: '湖南', value: '43' },
  { label: '广东', value: '44' },
  { label: '广西', value: '45' },
  { label: '云南', value: '53' },
  { label: '贵州', value: '52' },
  { label: '海南', value: '46' },
  { label: '重庆', value: '50' },
  { label: '四川', value: '51' },
  { label: '新疆', value: '65' },
  { label: '内蒙古', value: '15' },
  { label: '辽宁', value: '21' },
  { label: '吉林', value: '22' },
  { label: '宁夏', value: '64' },
  { label: '陕西', value: '61' },
  { label: '黑龙江', value: '23' },
  { label: '西藏', value: '54' },
  { label: '青海', value: '63' },
  { label: '甘肃', value: '62' }
];

const oilDisplayNames = new Map<string, string>([
  ['92', '92#'],
  ['95', '95#'],
  ['98', '98#'],
  ['0', '0#'],
  ['10', '-10#'],
  ['20', '-20#'],
  ['35', '-35#'],
]);

function getFieldNameByOilNumber(oilNumber: string, provinceCheck: any): string | null {
  const num = oilNumber;
  
  if (num === '0' || num === '10' || num === '20' || num === '35') {
    if (provinceCheck[`CHAI_${num}`] === 'Y') return `CHAI_${num}`;
    if (provinceCheck[`CHECHAI_${num}`] === 'Y') return `CHECHAI_${num}`;
    return null;
  }
  
  const possibleFields = [`E${num}`, `GAS_${num}`];
  for (const field of possibleFields) {
    if (provinceCheck[field] === 'Y') {
      return field;
    }
  }
  
  return null;
}

export async function getProvinceId(manualProvinceId?: string): Promise<{ provinceId: string; cityName: string }> {
  if (manualProvinceId) {
    const province = provinces.find((p) => p.value === manualProvinceId);
    if (province) {
      return { provinceId: province.value, cityName: province.label };
    }
  }
  try {
    const location = await Location.requestCurrent();
    if (!location) {
      throw new Error('无法获取当前位置');
    }

    const placemarks = await Location.reverseGeocode({
      latitude: location.latitude,
      longitude: location.longitude,
      locale: 'zh-CN',
    });

    if (placemarks && placemarks.length > 0) {
      const place = placemarks[0];
      const administrativeArea = place.administrativeArea || '';
      const subAdministrativeArea = place.subAdministrativeArea || '';
      const locality = place.locality || '';
      const subLocality = place.subLocality || '';
      
      const possibleProvinceNames = [
        administrativeArea,
        subAdministrativeArea,
        locality,
      ].filter(Boolean);
      
      let matchedProvince = null;
      
      for (const areaName of possibleProvinceNames) {
        const provinceName = areaName.replace(/省|市|自治区|特别行政区|回族自治区|维吾尔自治区|壮族自治区/g, '').trim();
        
        matchedProvince = provinces.find((p) => {
          if (p.label === provinceName) return true;
          if (p.label.includes(provinceName) || provinceName.includes(p.label)) return true;
          if (areaName.includes(p.label) || p.label.includes(provinceName)) return true;
          return false;
        });
        
        if (matchedProvince) {
          break;
        }
      }
      
      if (matchedProvince) {
        const cityName = locality || subLocality || subAdministrativeArea || administrativeArea || '未知';
        return { provinceId: matchedProvince.value, cityName };
      }
    }
  } catch (e) {
    console.log('定位失败:', e);
  }
  return { provinceId: '11', cityName: '北京' };
}

// 切换省份并获取当前油价
export async function getCurrentPrice(provinceId: string) {
  const url = `${base}/data/switchProvince`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'user-agent': 'Scriptable/1 CFNetwork/3860.300.21 Darwin/25.2.0',
      'accept': '*/*',
      'accept-encoding': 'gzip, deflate, br',
      'content-type': 'application/json;charset=UTF-8',
      'accept-language': 'zh-CN,zh-Hans;q=0.9',
      'referer': `${base}/`,
    },
    body: JSON.stringify({ provinceId }),
  });
  
  // 从响应中提取 cookie
  const cookieArray = res.cookies || [];
  const cookies = cookieArray.map((c) => `${c.name}=${c.value}`).join('; ');
  
  const data = await res.json();
  return { data, cookies };
}

// 获取历史油价数据
export async function getHistoryPrice(provinceId: string, cookies?: string) {
  const url = `${base}/data/initOilPrice`;
  const headers: Record<string, string> = {
    'user-agent': 'Scriptable/1 CFNetwork/3860.300.21 Darwin/25.2.0',
    'accept': '*/*',
    'accept-language': 'zh-CN,zh-Hans;q=0.9',
    'referer': `${base}/`,
  };
  if (cookies) {
    headers['cookie'] = cookies;
  }
  const res = await fetch(url, {
    method: 'GET',
    headers,
  });
  const data = await res.json();
  return data;
}

export async function fetchOilPrice(oilNumber: string = '92', manualProvinceId?: string) {
  const oilDisplayName = oilDisplayNames.get(oilNumber) || `${oilNumber}#`;
  
  const { provinceId, cityName } = await getProvinceId(manualProvinceId);
  
  try {
    const switchResult = await getCurrentPrice(provinceId);
    const switchCookies = switchResult.cookies || '';
    
    const historyData = await getHistoryPrice(provinceId, switchCookies);
    const currentResult = await getCurrentPrice(provinceId);
    const currentData = currentResult.data;

    const province = provinces.find((p) => p.value === provinceId);
    const provinceName = province?.label || '未知';

    const provinceCheck = (currentData as any)?.data?.provinceCheck || {};
    const fieldName = getFieldNameByOilNumber(oilNumber, provinceCheck);
    
    if (!fieldName) {
      throw new Error(`省份 ${provinceName} 不支持油号 ${oilNumber}`);
    }

    const historyPrices = Array.isArray(historyData.data?.provinceData)
      ? historyData.data.provinceData
      : [];
    
    const currentPriceData = (currentData as any)?.data?.provinceData || {};

    const trendData = historyPrices
      .filter((item: any) => item[fieldName] !== undefined && item[fieldName] !== null)
      .map((item: any) => {
        const price = item[fieldName];
        const date = item.STR_START_DATE || item.queryDate || item.START_DATE || '';
        const statusField = `${fieldName}_STATUS`;
        const status = item[statusField] !== undefined ? item[statusField] : 0;
        return {
          date,
          price,
          status,
        };
      })
      .reverse();
    
    const currentPrice = currentPriceData[fieldName];
    const statusField = `${fieldName}_STATUS`;
    const currentStatus = currentPriceData[statusField] !== undefined ? currentPriceData[statusField] : 0;

    return {
      provinceName,
      cityName,
      provinceId,
      oilType: oilNumber,
      oilName: oilDisplayName,
      currentPrice,
      currentStatus,
      trendData,
    };
  } catch (error) {
    console.log('获取油价数据失败:', error);
    throw error;
  }
}

