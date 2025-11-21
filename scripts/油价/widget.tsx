import { Widget, Text, VStack } from "scripting";
import { fetchOilPrice } from "./util/api";

import { View as SystemSmallView } from "./widget/family/small";
import { View as SystemMediumView } from "./widget/family/medium";

(async () => {
  // 从参数中获取油号，支持数字格式（92, 95, 98, 0）或旧格式（E92, E95等）
  let oilParam = Widget.parameter || "92";
  
  // 兼容旧格式：E92 -> 92, E95 -> 95, CHAI_0 -> 0
  if (typeof oilParam === 'string') {
    // 移除 E 前缀
    oilParam = oilParam.replace(/^E/, '');
    // 处理 CHAI_0, CHAI_10 等格式
    if (oilParam.startsWith('CHAI_')) {
      oilParam = oilParam.replace('CHAI_', '');
    }
    // 处理 GAS_92, GAS_95 等格式
    if (oilParam.startsWith('GAS_')) {
      oilParam = oilParam.replace('GAS_', '');
    }
  }
  
  const oilNumber = String(oilParam);
  
  const settings = Storage.get<{ useManualProvince: boolean; manualProvinceId: string }>("oilPriceSettings");
  const manualProvinceId = settings?.useManualProvince ? settings.manualProvinceId : undefined;
  
  try {
    const data = await fetchOilPrice(oilNumber, manualProvinceId);
    
    if (!data || (data.currentPrice === undefined && data.trendData.length === 0)) {
      throw new Error(`无法获取油价数据\n请检查定位权限和网络连接`);
    }

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
        <Text font="caption" foregroundStyle="tertiaryLabel">请检查定位权限和网络连接</Text>
      </VStack>
    );
  }
})();
