import { fetch } from "scripting";

// 历史价格数据项
export type GoldHistoryItem = {
  date: string;
  price: number;
  diffper: number;
};

// 金价数据
export type GoldPriceData = {
  currentPrice: number;
  currentStatus: number; // 价格变化（当前价格 - 上一个价格）
  trendData: GoldHistoryItem[];
};

// 获取当前金价
async function fetchCurrentGoldPrice(): Promise<number | null> {
  try {
    const res = await fetch("https://www.huilvbiao.com/api/gold_indexApi", {
      method: "GET",
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "zh-CN,zh;q=0.9",
      },
    });

    if (!res.ok) {
      return null;
    }

    const text = await res.text();

    // 解析返回的 JS 文本，优先使用上海黄金延期 AUTD 的价格
    const autdMatch = text.match(/var\s+hq_str_gds_AUTD\s*=\s*"([^"]+)"/);
    const targetMatch = autdMatch;

    if (!targetMatch) {
      return null;
    }

    const firstField = targetMatch[1].split(",")[0];
    const price = parseFloat(firstField);

    if (Number.isNaN(price)) {
      return null;
    }

    return price;
  } catch (e) {
    console.log("获取当前金价失败:", e);
    return null;
  }
}

// 获取历史金价数据
async function fetchGoldHistory(): Promise<GoldHistoryItem[]> {
  try {
    const res = await fetch("https://www.huilvbiao.com/api/gold_autd_real?t=au9", {
      method: "GET",
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "zh-CN,zh;q=0.9",
      },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      return [];
    }

    // 转换数据格式，使用 new 字段作为价格
    const trendData: GoldHistoryItem[] = data
      .map((item: any) => {
        const price = item.new || item.buy || 0;
        const date = item.date_time || "";
        const diffper = item.diffper || 0;

        return {
          date,
          price: parseFloat(String(price)),
          diffper: parseFloat(String(diffper)),
        };
      })
      .filter((item: GoldHistoryItem) => !Number.isNaN(item.price) && item.price > 0)
      .reverse(); // 反转数组，使时间从旧到新

    return trendData;
  } catch (e) {
    console.log("获取历史金价失败:", e);
    return [];
  }
}

// 获取金价数据（当前价格和历史趋势）
export async function fetchGoldPrice(): Promise<GoldPriceData | null> {
  try {
    const [currentPrice, trendData] = await Promise.all([
      fetchCurrentGoldPrice(),
      fetchGoldHistory(),
    ]);

    if (currentPrice == null) {
      return null;
    }

    // 计算当前价格变化（当前价格 - 上一个历史价格）
    let currentStatus = 0;
    if (trendData.length > 0) {
      const lastPrice = trendData[trendData.length - 1].price;
      currentStatus = currentPrice - lastPrice;
    }

    return {
      currentPrice,
      currentStatus,
      trendData,
    };
  } catch (error) {
    console.log("获取金价数据失败:", error);
    return null;
  }
}
