import { Widget, Text, VStack, fetch } from "scripting";
import { View as SystemSmallView } from "./widget/family/small";
import { View as SystemMediumView } from "./widget/family/medium";

type GoldProfitSettings = {
  grams: string;
  buyPrice: string;
};

const SETTINGS_KEY = "goldProfitSettings";

async function fetchGoldPrice(): Promise<number | null> {
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
    console.log("获取金价失败:", e);
    return null;
  }
}

(async () => {
  const settings = Storage.get<GoldProfitSettings>(SETTINGS_KEY);
  
  if (!settings || !settings.grams || !settings.buyPrice) {
    Widget.present(
      <VStack padding spacing={4}>
        <Text font="headline" foregroundStyle="systemRed">未设置参数</Text>
        <Text font="body" foregroundStyle="secondaryLabel">
          请在设置页面配置买入克数和买入单价
        </Text>
      </VStack>
    );
    return;
  }

  const gramsNum = parseFloat(settings.grams.trim());
  const buyPriceNum = parseFloat(settings.buyPrice.trim());

  if (Number.isNaN(gramsNum) || Number.isNaN(buyPriceNum)) {
    Widget.present(
      <VStack padding spacing={4}>
        <Text font="headline" foregroundStyle="systemRed">参数错误</Text>
        <Text font="body" foregroundStyle="secondaryLabel">
          请检查买入克数和买入单价设置
        </Text>
      </VStack>
    );
    return;
  }

  try {
    const currentPrice = await fetchGoldPrice();
    
    if (currentPrice == null) {
      throw new Error("无法获取当前金价\n请检查网络连接");
    }

    const profit = (currentPrice - buyPriceNum) * gramsNum;
    const priceDiff = currentPrice - buyPriceNum;
    const percentage = (priceDiff / buyPriceNum) * 100;

    const data = {
      currentPrice,
      buyPrice: buyPriceNum,
      grams: gramsNum,
      profit,
      priceDiff,
      percentage,
    };

    switch (Widget.family) {
      case "systemSmall":
        Widget.present(<SystemSmallView data={data} />);
        break;
      case "systemMedium":
        Widget.present(<SystemMediumView data={data} />);
        break;
      default:
        throw new Error("Unsupported widget size");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Widget.present(
      <VStack padding spacing={4}>
        <Text font="headline" foregroundStyle="systemRed">获取数据失败</Text>
        <Text font="body" foregroundStyle="secondaryLabel">{errorMessage}</Text>
        <Text font="caption" foregroundStyle="tertiaryLabel">请检查网络连接</Text>
      </VStack>
    );
  }
})();
