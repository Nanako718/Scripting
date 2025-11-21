import {
  Widget,
  VStack,
  HStack,
  Text,
  Spacer,
  fetch,
  DynamicShapeStyle,
  WidgetReloadPolicy,
  ProgressView,
  ZStack,
  Gauge,
} from "scripting";
import { login, getSubscribe, formatFlow, BigMeSettings, SubscribeResponse } from "./util/api";

const SETTINGS_KEY = "bigMeSettings";

// 配色主题
const theme = {
  primary: { light: "#007AFF", dark: "#64B5FF" } as DynamicShapeStyle,
  cardBackground: { light: "#FAFAFA", dark: "#1C1C1E" } as DynamicShapeStyle, // 浅色模式：米白色，深色模式：深灰
  cardItemBackground: { light: "#F5F5F5", dark: "#2C2C2E" } as DynamicShapeStyle,
  textPrimary: { light: "#484951", dark: "#F5F5F5" } as DynamicShapeStyle, // 浅色模式：深灰（非纯黑），深色模式：米白色（非纯白）
  textSecondary: { light: "#666666", dark: "#999999" } as DynamicShapeStyle,
  textValue: { light: "#007AFF", dark: "#64B5FF" } as DynamicShapeStyle,
  upload: { light: "#34C759", dark: "#30D158" } as DynamicShapeStyle, // 上传 - 绿色
  download: { light: "#FF9500", dark: "#FF9F0A" } as DynamicShapeStyle, // 下载 - 橙色
  remaining: { light: "#007AFF", dark: "#64B5FF" } as DynamicShapeStyle, // 剩余流量 - 蓝色
  used: { light: "#FF3B30", dark: "#FF453A" } as DynamicShapeStyle, // 已用流量 - 红色
  total: { light: "#AF52DE", dark: "#BF5AF2" } as DynamicShapeStyle, // 总流量 - 紫色
};

function InfoCardItem({ 
  title, 
  value, 
  unit,
  doubleHeight = false,
  valueColor
}: { 
  title: string; 
  value: string; 
  unit: string;
  doubleHeight?: boolean;
  valueColor?: DynamicShapeStyle;
}) {
  const normalHeight = 50;
  const doubleHeightValue = 108;
  
  return (
    <VStack
      alignment="center"
      padding={doubleHeight ? { top: 20, leading: 8, bottom: 20, trailing: 8 } : { top: 10, leading: 8, bottom: 10, trailing: 8 }}
      spacing={doubleHeight ? 10 : 5}
      frame={{ 
        minWidth: 0, 
        maxWidth: Infinity,
        minHeight: doubleHeight ? doubleHeightValue : normalHeight,
        maxHeight: doubleHeight ? doubleHeightValue : normalHeight
      }}
      widgetBackground={{
        style: theme.cardItemBackground,
        shape: {
          type: "rect",
          cornerRadius: 13,
          style: "continuous"
        }
      }}
    >
      <Text 
        font={9} 
        fontWeight="medium" 
        foregroundStyle={theme.textSecondary}
        lineLimit={1}
      >
        {title}
      </Text>
      <Text
        font={doubleHeight ? 18 : 12}
        fontWeight="bold"
        foregroundStyle={valueColor || theme.textValue}
        lineLimit={1}
        minScaleFactor={0.7}
      >
        {value} {unit}
      </Text>
    </VStack>
  );
}

function MediumWidgetView1({ data }: { data: ReturnType<typeof getSubscribe> extends Promise<infer T> ? T : never }) {
  const padding = 14;
  
  const widgetSize = Widget.displaySize;
  const progressBarWidth = widgetSize.width - padding * 2;
  
  const usedBytes = data.u + data.d;
  const totalBytes = data.transfer_enable;
  const usedFlow = formatFlow(usedBytes);
  const totalFlow = formatFlow(totalBytes);
  
  const progress = totalBytes > 0 ? usedBytes / totalBytes : 0;
  const progressWidth = Math.max(0, Math.min(progressBarWidth, progress * progressBarWidth));
  const progressBarHeight = 18;
  
  const isLongTerm = data.expired_at === null;
  const validityText = isLongTerm ? "该订阅长期有效" : `有效期至 ${data.expired_at ? new Date(data.expired_at * 1000).toLocaleDateString() : ""}`;

  return (
    <VStack
      alignment="leading"
      padding={{ top: padding, leading: padding, bottom: padding, trailing: padding }}
      spacing={8}
    >
      <Text font={15} fontWeight="semibold" foregroundStyle={theme.textPrimary} lineLimit={1}>
        我的订阅
      </Text>
      
      <Text font={20} fontWeight="bold" foregroundStyle={theme.textPrimary} lineLimit={1}>
        {data.plan.name}
      </Text>
      
      <Text font={12} fontWeight="regular" foregroundStyle={theme.textSecondary} lineLimit={1}>
        {validityText}
      </Text>
      
      <Spacer minLength={8} />
      
      <VStack spacing={5} alignment="leading">
        <ZStack alignment="leading">
          <VStack
            frame={{ 
              width: progressBarWidth, 
              minWidth: progressBarWidth, 
              maxWidth: progressBarWidth, 
              height: progressBarHeight, 
              minHeight: progressBarHeight, 
              maxHeight: progressBarHeight 
            }}
            widgetBackground={{
              style: { light: "#E5E5EA", dark: "#3A3A3C" } as DynamicShapeStyle,
              shape: {
                type: "rect",
                cornerRadius: 5,
                style: "continuous"
              }
            }}
          />
          {progressWidth > 0 ? (
            <VStack
              frame={{ 
                width: progressWidth,
                minWidth: 0,
                height: progressBarHeight,
                minHeight: progressBarHeight,
                maxHeight: progressBarHeight
              }}
              alignment="leading"
              widgetBackground={{
                style: theme.upload,
                shape: {
                  type: "rect",
                  cornerRadius: 5,
                  style: "continuous"
                }
              }}
            />
          ) : null}
        </ZStack>
        
        <HStack alignment="center" spacing={3}>
          <Text font={13} fontWeight="medium" foregroundStyle={theme.textPrimary} lineLimit={1}>
            已用 {usedFlow.value} {usedFlow.unit}
          </Text>
          <Text font={13} fontWeight="regular" foregroundStyle={theme.textSecondary} lineLimit={1}>
            /
          </Text>
          <Text font={13} fontWeight="medium" foregroundStyle={theme.textPrimary} lineLimit={1}>
            总计 {totalFlow.value} {totalFlow.unit}
          </Text>
        </HStack>
      </VStack>
    </VStack>
  );
}

function MediumWidgetView2({ data }: { data: ReturnType<typeof getSubscribe> extends Promise<infer T> ? T : never }) {
  const padding = 14;

  const usedBytes = data.u + data.d;
  const totalBytes = data.transfer_enable;
  const usedFlow = formatFlow(usedBytes);
  const totalFlow = formatFlow(totalBytes);
  const remainingFlow = formatFlow(Math.max(0, totalBytes - usedBytes));

  const isLongTerm = data.expired_at === null;
  const validityText = isLongTerm ? "长期有效" : `有效期至 ${data.expired_at ? new Date(data.expired_at * 1000).toLocaleDateString() : ""}`;

  const uploadFlow = formatFlow(data.u);
  const downloadFlow = formatFlow(data.d);

  return (
    <VStack
      alignment="leading"
      padding={{ top: padding, leading: padding, bottom: padding, trailing: padding }}
      spacing={10}
    >
      <HStack alignment="center" spacing={8}>
        <HStack alignment="center" spacing={8} frame={{ minWidth: 0, maxWidth: Infinity }}>
          <Text font="title3" fontWeight="bold" foregroundStyle={theme.textPrimary} lineLimit={1}>
            {data.plan.name}
          </Text>
          <Spacer />
          <Text font={9} foregroundStyle={theme.textSecondary}>
            {validityText}
          </Text>
        </HStack>
      </HStack>

      <HStack alignment="top" spacing={8}>
        <VStack alignment="center" frame={{ width: 85, minWidth: 85, maxWidth: 85 }}>
          <InfoCardItem 
            title="流量剩余" 
            value={remainingFlow.value} 
            unit={remainingFlow.unit}
            doubleHeight={true}
            valueColor={theme.remaining}
          />
        </VStack>

        <VStack alignment="leading" spacing={8} frame={{ minWidth: 0, maxWidth: Infinity }}>
          <HStack alignment="center" spacing={8}>
            <InfoCardItem 
              title="上传流量" 
              value={uploadFlow.value} 
              unit={uploadFlow.unit}
              valueColor={theme.upload}
            />
            <InfoCardItem 
              title="下载流量" 
              value={downloadFlow.value} 
              unit={downloadFlow.unit}
              valueColor={theme.download}
            />
          </HStack>
          <HStack alignment="center" spacing={8}>
            <InfoCardItem 
              title="已用流量" 
              value={usedFlow.value} 
              unit={usedFlow.unit}
              valueColor={theme.used}
            />
            <InfoCardItem 
              title="总流量" 
              value={totalFlow.value} 
              unit={totalFlow.unit}
              valueColor={theme.total}
            />
          </HStack>
        </VStack>
      </HStack>
    </VStack>
  );
}

function MediumWidgetView({ data, uiStyle }: { data: ReturnType<typeof getSubscribe> extends Promise<infer T> ? T : never; uiStyle: number }) {
  if (uiStyle === 1) {
    return <MediumWidgetView1 data={data} />;
  } else {
    return <MediumWidgetView2 data={data} />;
  }
}

async function render() {
  const settings = Storage.get<BigMeSettings>(SETTINGS_KEY);

  let uiStyle = 1;
  const paramStr = Widget.parameter;
  
  if (paramStr && String(paramStr).trim() !== "") {
    const trimmedParam = String(paramStr).trim();
    try {
      const param = JSON.parse(trimmedParam);
      if (typeof param === "number") {
        uiStyle = param;
      } else if (typeof param === "object" && param !== null) {
        uiStyle = param.uiStyle || param.ui_style || param.style || 1;
      } else if (typeof param === "string") {
        const parsed = parseInt(param, 10);
        if (!isNaN(parsed) && parsed > 0) {
          uiStyle = parsed;
        }
      }
    } catch (e) {
      const parsed = parseInt(trimmedParam, 10);
      if (!isNaN(parsed) && parsed > 0) {
        uiStyle = parsed;
      }
    }
  }
  
  uiStyle = (uiStyle === 1 || uiStyle === 2) ? uiStyle : 1;

  const refreshInterval = 15;
  const nextUpdate = new Date(Date.now() + refreshInterval * 60 * 1000);
  const reloadPolicy: WidgetReloadPolicy = {
    policy: "after",
    date: nextUpdate,
  };

  if (Widget.family !== "systemMedium") {
    Widget.present(
      <VStack padding spacing={8} alignment="center">
        <Text font="headline" foregroundStyle="systemRed">不支持的组件尺寸</Text>
        <Text font="body" foregroundStyle="secondaryLabel">
          请使用中型组件
        </Text>
      </VStack>,
      reloadPolicy
    );
    return;
  }

  if (!settings || !settings.email || !settings.password) {
    Widget.present(
      <VStack padding spacing={8} alignment="center">
        <Text font="headline" foregroundStyle="systemRed">未配置账号</Text>
        <Text font="body" foregroundStyle="secondaryLabel">
          请先在主应用中设置 BigMe.Pro 账号和密码
        </Text>
      </VStack>,
      reloadPolicy
    );
    return;
  }

  try {
    const loginResult = await login(settings.email, settings.password);
    const subscribeData = await getSubscribe(loginResult.token, loginResult.cookies, loginResult.apiToken);
    Widget.present(<MediumWidgetView data={subscribeData} uiStyle={uiStyle} />, reloadPolicy);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("小组件渲染失败:", errorMessage);
    Widget.present(
      <VStack padding spacing={8} alignment="center">
        <Text font="headline" foregroundStyle="systemRed">获取数据失败</Text>
        <Text font="body" foregroundStyle="secondaryLabel">{errorMessage}</Text>
        <Text font="caption" foregroundStyle="tertiaryLabel">
          请检查网络连接和账号密码
        </Text>
      </VStack>,
      reloadPolicy
    );
  }
}

render();

