import {
  Widget,
  VStack,
  HStack,
  Text,
  Image,
  Color,
  Spacer,
  DynamicShapeStyle,
  WidgetReloadPolicy,
  ZStack,
  Gauge,
} from "scripting";
import { getSettings, queryImportantData } from "./telecomApi";

// 设置结构定义
type ChinaTelecomSettings = {
  apiUrl: string;
  mobile: string;
  password: string;
};

const SETTINGS_KEY = "chinaTelecomSettings";

// 组件数据结构
type TelecomData = {
  fee: { title: string; balance: string; unit: string };
  voice: { title: string; balance: string; unit: string; used?: number; total?: number };
  flow: { title: string; balance: string; unit: string; used?: number; total?: number };
  otherFlow?: { title: string; balance: string; unit: string; used?: number; total?: number };
};


// 格式化流量值（自动转换单位：大于1GB显示GB，不够1GB显示MB）
function formatFlowValue(value: number, unit: string = "MB"): { balance: string; unit: string } {
  if (value > 1024) {
    return {
      balance: (value / 1024).toFixed(2),
      unit: "GB"
    };
  }
  return {
    balance: value.toFixed(2),
    unit: "MB"
  };
}

// 卡片主题配置 - Catppuccin 配色方案
const cardThemes = {
  fee: {
    background: { light: "rgba(140, 170, 238, 0.12)", dark: "rgba(140, 170, 238, 0.18)" } as DynamicShapeStyle,
    iconColor: { light: "#8caaee", dark: "#8caaee" } as DynamicShapeStyle,
    titleColor: { light: "#737994", dark: "#99d1db" } as DynamicShapeStyle,
    descColor: { light: "#51576d", dark: "#c6d0f5" } as DynamicShapeStyle,
    icon: "creditcard.fill"
  },
  voice: {
    background: { light: "rgba(166, 209, 137, 0.12)", dark: "rgba(166, 209, 137, 0.18)" } as DynamicShapeStyle,
    iconColor: { light: "#a6d189", dark: "#a6d189" } as DynamicShapeStyle,
    titleColor: { light: "#626880", dark: "#81c8be" } as DynamicShapeStyle,
    descColor: { light: "#51576d", dark: "#c6d0f5" } as DynamicShapeStyle,
    icon: "phone.fill"
  },
  flow: {
    background: { light: "rgba(239, 159, 118, 0.12)", dark: "rgba(239, 159, 118, 0.18)" } as DynamicShapeStyle,
    iconColor: { light: "#ef9f76", dark: "#ef9f76" } as DynamicShapeStyle,
    titleColor: { light: "#737994", dark: "#e5c890" } as DynamicShapeStyle,
    descColor: { light: "#51576d", dark: "#c6d0f5" } as DynamicShapeStyle,
    icon: "antenna.radiowaves.left.and.right"
  },
  otherFlow: {
    background: { light: "rgba(202, 158, 230, 0.12)", dark: "rgba(202, 158, 230, 0.18)" } as DynamicShapeStyle,
    iconColor: { light: "#ca9ee6", dark: "#ca9ee6" } as DynamicShapeStyle,
    titleColor: { light: "#737994", dark: "#babbf1" } as DynamicShapeStyle,
    descColor: { light: "#51576d", dark: "#c6d0f5" } as DynamicShapeStyle,
    icon: "wifi.circle.fill"
  }
};

// 可复用卡片组件
function DataCard({
  title,
  value,
  unit,
  theme,
  titleStyle,
  descStyle,
  showLogo,
  progressUsed,
  progressTotal
}: {
  title: string;
  value: string;
  unit: string;
  theme: typeof cardThemes.fee;
  titleStyle: DynamicShapeStyle;
  descStyle: DynamicShapeStyle;
  showLogo?: boolean;
  progressUsed?: number;
  progressTotal?: number;
}) {
  const showProgress = progressUsed !== undefined && progressTotal !== undefined && progressTotal > 0;
  const progressPercentage = showProgress ? progressUsed / progressTotal! : 0;
  const percentageText = showProgress ? `${Math.round(progressPercentage * 100)}%` : "0%";
  const cardTitleStyle = theme.titleColor || titleStyle;
  const cardDescStyle = theme.descColor || descStyle;
  
  return (
    <ZStack>
      <VStack
        alignment="center"
        padding={{ top: 8, leading: 6, bottom: 8, trailing: 6 }}
        frame={{ minWidth: 0, maxWidth: Infinity }}
        widgetBackground={{
          style: theme.background,
          shape: {
            type: "rect",
            cornerRadius: 15,
            style: "continuous"
          }
        }}
      >
        <Image 
          systemName={theme.icon} 
          font={13}
          fontWeight="medium"
          foregroundStyle={theme.iconColor} 
        />
        <Spacer minLength={3} />
        <VStack alignment="center" spacing={2}>
          <Text 
            font={8} 
            fontWeight="medium" 
            foregroundStyle={cardTitleStyle}
            lineLimit={1}
            minScaleFactor={0.8}
          >{title}</Text>
          <Text
            font={13}
            fontWeight="bold"
            foregroundStyle={cardDescStyle}
            lineLimit={1}
            minScaleFactor={0.7}
          >{`${value}${unit}`}</Text>
        </VStack>
      </VStack>
      {showProgress ? (
        <VStack alignment="center">
          <Spacer />
          <VStack
            alignment="center"
            frame={{ width: 28, height: 28 }}
          >
            <Gauge
              value={progressPercentage}
              min={0}
              max={1}
              label={<Text font={1}> </Text>}
              currentValueLabel={
                <Text 
                  font={10}
                  fontWeight="semibold"
                  foregroundStyle={theme.descColor || descStyle}
                >
                  {percentageText}
                </Text>
              }
              gaugeStyle="accessoryCircularCapacity"
              tint={theme.iconColor}
              scaleEffect={0.7}
            />
          </VStack>
          <Spacer />
        </VStack>
      ) : null}
      {showLogo ? (
        <VStack alignment="center">
          <Spacer />
          <Image 
            imageUrl="https://raw.githubusercontent.com/Nanako718/Scripting/refs/heads/main/images/10000.png" 
            frame={{ width: 32, height: 32 }} 
            resizable 
          />
          <Spacer />
        </VStack>
      ) : null}
    </ZStack>
  );
}

// 小尺寸组件卡片
function SmallDataCard({
  title,
  value,
  unit,
  theme,
  titleStyle,
  descStyle,
  showLogo,
  useLogoAsIcon
}: {
  title: string;
  value: string;
  unit: string;
  theme: typeof cardThemes.fee;
  titleStyle: DynamicShapeStyle;
  descStyle: DynamicShapeStyle;
  showLogo?: boolean;
  useLogoAsIcon?: boolean;
}) {
  const cardTitleStyle = theme.titleColor || titleStyle;
  const cardDescStyle = theme.descColor || descStyle;
  
  return (
    <ZStack>
      <HStack
        alignment="center"
        padding={{ top: 6, leading: 8, bottom: 6, trailing: 8 }}
        spacing={6}
        frame={{ minWidth: 0, maxWidth: Infinity }}
        widgetBackground={{
          style: theme.background,
          shape: {
            type: "rect",
            cornerRadius: 12,
            style: "continuous"
          }
        }}
      >
        <HStack alignment="center" frame={{ width: 20, height: 20 }}>
          {useLogoAsIcon ? (
            <Image 
              imageUrl="https://raw.githubusercontent.com/Nanako718/Scripting/refs/heads/main/images/10000.png" 
              frame={{ width: 16, height: 16 }} 
              resizable 
            />
          ) : (
            <Image 
              systemName={theme.icon} 
              font={12}
              fontWeight="medium"
              foregroundStyle={theme.iconColor} 
            />
          )}
        </HStack>
        <VStack alignment="leading" spacing={2} frame={{ minWidth: 0, maxWidth: Infinity }}>
          <Text 
            font={9} 
            fontWeight="medium" 
            foregroundStyle={cardTitleStyle}
            lineLimit={1}
            minScaleFactor={0.8}
          >
            {title}
          </Text>
          <Text
            font={14}
            fontWeight="bold"
            foregroundStyle={cardDescStyle}
            lineLimit={1}
            minScaleFactor={0.7}
          >
            {`${value}${unit}`}
          </Text>
        </VStack>
        {showLogo && !useLogoAsIcon ? (
          <HStack alignment="center" frame={{ width: 20, height: 20 }}>
            <Image 
              imageUrl="https://raw.githubusercontent.com/Nanako718/Scripting/refs/heads/main/images/10000.png" 
              frame={{ width: 16, height: 16 }} 
              resizable 
            />
          </HStack>
        ) : null}
      </HStack>
    </ZStack>
  );
}

// 小尺寸组件视图
function SmallWidgetView({ data, titleStyle, descStyle }: { 
  data: TelecomData;
  titleStyle: DynamicShapeStyle;
  descStyle: DynamicShapeStyle;
}) {
  // 计算总流量剩余（通用流量 + 其他流量）
  const flowRemain = (data.flow?.total && data.flow?.used !== undefined) 
    ? Math.max(0, data.flow.total - data.flow.used) : 0;
  const otherFlowRemain = (data.otherFlow?.total && data.otherFlow?.used !== undefined)
    ? Math.max(0, data.otherFlow.total - data.otherFlow.used) : 0;
  const totalFlowFormatted = formatFlowValue(flowRemain + otherFlowRemain, "MB");
  
  return (
    <VStack alignment="leading" padding={{ top: 8, leading: 8, bottom: 8, trailing: 8 }} spacing={6}>
      <SmallDataCard
        title={data.fee.title}
        value={data.fee.balance}
        unit={data.fee.unit}
        theme={cardThemes.fee}
        titleStyle={titleStyle}
        descStyle={descStyle}
        useLogoAsIcon={true}
      />
      <SmallDataCard
        title="剩余总流量"
        value={totalFlowFormatted.balance}
        unit={totalFlowFormatted.unit}
        theme={cardThemes.flow}
        titleStyle={titleStyle}
        descStyle={descStyle}
      />
      <SmallDataCard
        title={data.voice.title}
        value={data.voice.balance}
        unit="MIN"
        theme={cardThemes.voice}
        titleStyle={titleStyle}
        descStyle={descStyle}
      />
    </VStack>
  );
}

// 默认样式
const defaultTitleStyle: DynamicShapeStyle = {
  light: "#666666",
  dark: "#CCCCCC",
};

const defaultDescStyle: DynamicShapeStyle = {
  light: "#000000",
  dark: "#FFFFFF",
};

function WidgetView({ data }: { data: TelecomData }) {
  const titleStyle = defaultTitleStyle;
  const descStyle = defaultDescStyle;

  if (Widget.family === "systemSmall") {
    return <SmallWidgetView data={data} titleStyle={titleStyle} descStyle={descStyle} />;
  }

  return (
    <VStack alignment="leading" padding={{ top: 10, leading: 10, bottom: 10, trailing: 10 }} spacing={8}>
      <HStack alignment="center" spacing={6}>
        <DataCard
          title={data.fee.title}
          value={data.fee.balance}
          unit={data.fee.unit}
          theme={cardThemes.fee}
          titleStyle={titleStyle}
          descStyle={descStyle}
          showLogo={true}
        />
        <DataCard
          title={data.voice.title}
          value={data.voice.balance}
          unit={data.voice.unit}
          theme={cardThemes.voice}
          titleStyle={titleStyle}
          descStyle={descStyle}
          progressUsed={data.voice.used}
          progressTotal={data.voice.total}
        />
        <DataCard
          title={data.flow.title}
          value={data.flow.balance}
          unit={data.flow.unit}
          theme={cardThemes.flow}
          titleStyle={titleStyle}
          descStyle={descStyle}
          progressUsed={data.flow.used}
          progressTotal={data.flow.total}
        />
        {data.otherFlow ? (
          <DataCard
            title={data.otherFlow.title}
            value={data.otherFlow.balance}
            unit={data.otherFlow.unit}
            theme={cardThemes.otherFlow}
            titleStyle={titleStyle}
            descStyle={descStyle}
            progressUsed={data.otherFlow.used}
            progressTotal={data.otherFlow.total}
          />
        ) : null}
      </HStack>
    </VStack>
  );
}

// 将 API 响应转换为 TelecomData
function convertToTelecomData(apiData: any): TelecomData {
  const responseData = apiData.responseData?.data;
  if (!responseData) {
    throw new Error("API 响应数据格式不正确");
  }

  // 话费数据
  const balanceInfo = responseData.balanceInfo;
  const indexBalanceDataInfo = balanceInfo?.indexBalanceDataInfo;
  const phoneBillRegion = balanceInfo?.phoneBillRegion;
  
  // 获取账户余额
  let balance = parseFloat(indexBalanceDataInfo?.balance || "0");
  const arrear = parseFloat(indexBalanceDataInfo?.arrear || "0");
  
  // 如果 balance 为 0 但有欠费，说明账户余额为负数（欠费）
  // 如果 balance 为 0 且没有欠费，可能是账户余额确实为 0
  // 如果有实时费用信息，也可以考虑显示
  let feeTitle = "剩余话费";
  let feeValue = balance;
  
  if (arrear > 0) {
    // 有欠费，显示欠费金额（负数表示欠费）
    feeTitle = "账户余额";
    feeValue = balance - arrear; // 账户余额 = 余额 - 欠费
  } else if (balance === 0 && phoneBillRegion?.subTitleHh) {
    // 如果余额为 0，尝试显示实时费用信息
    const realTimeFee = parseFloat(phoneBillRegion.subTitleHh.replace("元", "") || "0");
    if (realTimeFee > 0) {
      feeTitle = "实时费用";
      feeValue = realTimeFee;
    }
  }
  
  const feeData = {
    title: feeTitle,
    balance: feeValue.toFixed(2),
    unit: "元"
  };

  // 语音数据
  const voiceInfo = responseData.voiceInfo;
  const voiceDataInfo = voiceInfo?.voiceDataInfo;
  const voiceBalance = parseFloat(voiceDataInfo?.balance || "0");
  const voiceUsed = parseFloat(voiceDataInfo?.used || "0");
  const voiceTotal = parseFloat(voiceDataInfo?.total || "0");
  const voiceData = {
    title: "剩余语音",
    balance: voiceBalance.toFixed(0),
    unit: "分钟",
    used: voiceUsed,
    total: voiceTotal > 0 ? voiceTotal : (voiceUsed + voiceBalance)
  };

  // 通用流量数据
  const flowInfo = responseData.flowInfo;
  const commonFlow = flowInfo?.commonFlow;
  const commonBalanceBytes = parseFloat(commonFlow?.balance || "0");
  const commonUsedBytes = parseFloat(commonFlow?.used || "0");
  const commonBalanceMB = commonBalanceBytes / 1024; // 转换为 MB
  const commonUsedMB = commonUsedBytes / 1024; // 转换为 MB
  const commonTotalMB = commonBalanceMB + commonUsedMB;
  
  const flowFormatted = formatFlowValue(commonBalanceMB, "MB");
  const flowData_converted = {
    title: "通用流量",
    balance: flowFormatted.balance,
    unit: flowFormatted.unit,
    used: commonUsedMB,
    total: commonTotalMB
  };

  // 专用流量（其他流量）
  const specialAmount = flowInfo?.specialAmount;
  let otherFlowData: { title: string; balance: string; unit: string; used?: number; total?: number } | undefined;
  if (specialAmount) {
    const specialBalanceBytes = parseFloat(specialAmount.balance || "0");
    const specialUsedBytes = parseFloat(specialAmount.used || "0");
    const specialBalanceMB = specialBalanceBytes / 1024; // 转换为 MB
    const specialUsedMB = specialUsedBytes / 1024; // 转换为 MB
    const specialTotalMB = specialBalanceMB + specialUsedMB;
    
    if (specialBalanceMB > 0 || specialUsedMB > 0) {
      const otherFlowFormatted = formatFlowValue(specialBalanceMB, "MB");
      otherFlowData = {
        title: "其他流量",
        balance: otherFlowFormatted.balance,
        unit: otherFlowFormatted.unit,
        used: specialUsedMB,
        total: specialTotalMB
      };
    }
  }

  return {
    fee: feeData,
    voice: voiceData,
    flow: flowData_converted,
    otherFlow: otherFlowData
  };
}

async function render() {
  const refreshInterval = 15; // 15分钟刷新一次
  const nextUpdate = new Date(Date.now() + refreshInterval * 60 * 1000);
  const reloadPolicy: WidgetReloadPolicy = {
    policy: "after",
    date: nextUpdate
  };

  // 检查配置
  const settings = getSettings();
  if (!settings || !settings.mobile || !settings.password) {
    Widget.present(
      <Text>请先在主应用中设置手机号和密码</Text>,
      reloadPolicy
    );
    return;
  }

  try {
    const apiData = await queryImportantData();
    const telecomData = convertToTelecomData(apiData);
    Widget.present(<WidgetView data={telecomData} />, reloadPolicy);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("渲染失败:", errorMessage);
    Widget.present(
      <Text>发生错误: {errorMessage}</Text>,
      reloadPolicy
    );
  }
}

render();
