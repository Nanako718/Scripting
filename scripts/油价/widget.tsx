import { Widget, Text } from "scripting";
import { fetchOilPrice } from "./util/api";

import { View as SystemSmallView } from "./widget/family/small";
import { View as SystemMediumView } from "./widget/family/medium";

(async () => {
  // 从参数中获取油号，默认为E92
  const oilType = Widget.parameter || "E92";
  console.log(`\n🚀 Widget 启动 - 尺寸: ${Widget.family}, 参数: ${oilType || '(无)'}`);
  const data = await fetchOilPrice(oilType);

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
})().catch((e) => {
  Widget.present(<Text>{String(e)}</Text>);
});
