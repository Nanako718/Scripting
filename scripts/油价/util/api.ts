import { fetch } from "scripting";

const base = 'https://cx.sinopecsales.com/yjkqiantai';

// 获取定位服务配置
function getLocationConfig(): string {
  const provinceCodes = [11, 12, 13, 14, 41, 37, 31, 32, 33, 34, 35, 36, 42, 43, 44, 45, 53, 52, 46, 50, 51, 65, 15, 21, 22, 64, 61, 23, 54, 63, 62];
  const offset = provinceCodes.reduce((sum, code) => sum + code, 0) % 100;
  
  const encoded = [113, 98, 100, 38, 112, 38, 113, 125, 100, 125, 105, 104, 115, 115, 122, 122, 112, 122, 99, 104, 104, 100, 125, 113, 118, 115, 113, 122, 100, 46, 118];
  const key = offset;
  return encoded.map((v) => String.fromCharCode(v ^ key)).join('');
}

const provinces = [
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

const names = new Map([
  ['GAS_92', '92#'],
  ['GAS_95', '95#'],
  ['GAS_98', '98#'],
  ['E92', 'E92#'],
  ['E95', 'E95#'],
  ['AIPAO95', '爱跑95#'],
  ['AIPAO98', '爱跑98#'],
  ['AIPAOE92', '爱跑E92#'],
  ['AIPAOE95', '爱跑E95#'],
  ['AIPAOE98', '爱跑E98#'],
  ['CHAI_0', '0#'],
  ['CHAI_10', '-10#'],
  ['CHAI_20', '-20#'],
  ['CHAI_35', '-35#']
]);

// 获取当前位置的省份ID
export async function getProvinceId(): Promise<string> {
  try {
    const locationRes = await fetch(`https://restapi.amap.com/v3/ip?key=${getLocationConfig()}`);
    const locationData = await locationRes.json();
    if (locationData.status === '1' && locationData.province) {
      const provinceName = locationData.province.replace(/省|市|自治区|特别行政区/g, '');
      const city = locationData.city || '未知';
      const province = provinces.find(
        (p) => p.label.includes(provinceName) || provinceName.includes(p.label),
      );
      if (province) {
        console.log(`📍 定位信息: 省份=${locationData.province}, 城市=${city}`);
        return province.value;
      }
    }
  } catch (e) {
    console.log('❌ 获取定位失败:', e);
  }
  console.log(`📍 使用默认省份: 河南 (ID: 41)`);
  return '41';
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

// 获取油价数据（当前和历史）
export async function fetchOilPrice(oilType: string = 'E92') {
  console.log(`⛽ 选择的油号: ${oilType} (${names.get(oilType) || oilType})`);
  
  const provinceId = await getProvinceId();
  const switchResult = await getCurrentPrice(provinceId);
  const switchCookies = switchResult.cookies || '';
  const historyData = await getHistoryPrice(provinceId, switchCookies);
  const currentResult = await getCurrentPrice(provinceId);
  const currentData = currentResult.data;

  const province = provinces.find((p) => p.value === provinceId);
  const provinceName = province?.label || '未知';

  const historyPrices = Array.isArray(historyData.data?.provinceData)
    ? historyData.data.provinceData
    : [];

  const trendData = historyPrices
    .filter((item: any) => item[oilType] !== undefined && item[oilType] !== null)
    .map((item: any) => {
      const price = item[oilType];
      const date = item.STR_START_DATE || item.queryDate || item.START_DATE || '';
      const status = item[`${oilType}_STATUS`] !== undefined ? item[`${oilType}_STATUS`] : 0;
      return {
        date,
        price,
        status,
      };
    })
    .reverse();

  const currentPriceData = (currentData as any)?.data?.provinceData || {};
  const currentPrice = currentPriceData[oilType];
  const currentStatus = currentPriceData[`${oilType}_STATUS`] || 0;

  console.log(`💰 当前油价: ${currentPrice?.toFixed(2) || 'N/A'} 元/升`);
  console.log(`📊 涨跌: ${currentStatus > 0 ? '+' : ''}${currentStatus.toFixed(2)} 元`);
  console.log(`📈 历史油价数据: 共 ${trendData.length} 条`);
  
  // 显示所有历史数据
  if (trendData.length > 0) {
    trendData.forEach((item: any, index: number) => {
      const statusStr = item.status > 0 ? `+${item.status.toFixed(2)}` : item.status.toFixed(2);
      console.log(`  ${index + 1}. ${item.date}: ${item.price.toFixed(2)} 元 (${statusStr})`);
    });
  }

  return {
    provinceName,
    provinceId,
    oilType,
    oilName: names.get(oilType) || oilType,
    currentPrice,
    currentStatus,
    trendData,
  };
}

