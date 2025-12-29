import { Script, Widget, VStack, HStack, ZStack, Text, ProgressView, Spacer, Image, Divider } from "scripting";
import { ProgressData } from "./shared/types";
import { COLORS, CATPPUCCIN } from "./shared/constants";
import { 
  getStoredBirthday,
  getStoredSmallWidgetDisplay,
  getProgressData,
  getProgressItemByKey
} from "./shared/utils";

const REFRESH_INTERVAL = 30 * 60;

function getDateInfo() {
  const now = new Date();
  const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
  const totalDays = Math.floor((endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;

  return {
    shortDate: now.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
    fullDate: now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
    weekDay: weekDays[now.getDay()],
    dayOfYear: dayOfYear,
    remainingDays: totalDays - dayOfYear,
    year: now.getFullYear()
  };
}

function ErrorView() {
  return (
    <VStack alignment="center" frame={{ maxWidth: Infinity, maxHeight: Infinity }} padding={20} background={CATPPUCCIN.BASE}>
      <Image systemName="exclamationmark.triangle" font={40} foregroundStyle={CATPPUCCIN.RED} />
      <Text font={14} foregroundStyle={CATPPUCCIN.TEXT} padding={{ top: 8 }}>加载失败</Text>
    </VStack>
  );
}

/**
 * 辅助：卡片式网格项
 */
function ElegantGridItem(item: ProgressData) {
  return (
    <VStack padding={12} background={{ style: CATPPUCCIN.MANTLE as any, shape: { type: "rect", cornerRadius: 14 } }} frame={{ maxWidth: Infinity }} alignment="leading" spacing={8}>
      <HStack alignment="center">
        <ZStack frame={{ width: 22, height: 22 }} background={{ style: item.color as any, shape: { type: "rect", cornerRadius: 6 } }}>
          <Image systemName={item.icon} foregroundStyle={CATPPUCCIN.BASE} font={10} fontWeight="black" />
        </ZStack>
        <Spacer />
        <Text font={12} fontWeight="black" fontDesign="rounded" foregroundStyle={CATPPUCCIN.TEXT}>
          {(item.value * 100).toFixed(0)}%
        </Text>
      </HStack>
      <Text font={10} fontWeight="bold" foregroundStyle={CATPPUCCIN.SUBTEXT1}>{item.label}</Text>
      <ProgressView value={item.value} tint={item.color as any} background={CATPPUCCIN.SURFACE0} frame={{ height: 3 }} />
    </VStack>
  );
}

/**
 * Small Widget: 聚焦核心，极致排版
 */
function SmallWidgetView() {
  const birthday = getStoredBirthday();
  const item = getProgressItemByKey(getStoredSmallWidgetDisplay(), birthday) || getProgressData(birthday)[3]; 

  return (
    <VStack padding={16} alignment="leading" background={CATPPUCCIN.BASE}>
      <HStack alignment="center">
        <ZStack frame={{ width: 28, height: 28 }} background={{ style: item.color as any, shape: { type: "rect", cornerRadius: 8 } }}>
          <Image systemName={item.icon} foregroundStyle={CATPPUCCIN.BASE} font={12} fontWeight="black" />
        </ZStack>
        <Spacer />
        <VStack alignment="trailing" spacing={-2}>
          <Text font={11} fontWeight="black" foregroundStyle={CATPPUCCIN.TEXT}>时光</Text>
          <Text font={10} fontWeight="bold" foregroundStyle={CATPPUCCIN.SUBTEXT0}>记录</Text>
        </VStack>
      </HStack>
      
      <Spacer />
      
      <VStack spacing={-2} alignment="leading">
        <HStack alignment="lastTextBaseline" spacing={1}>
          <Text foregroundStyle={CATPPUCCIN.TEXT} font={46} fontWeight="black" fontDesign="rounded">
            {(item.value * 100).toFixed(0)}
          </Text>
          <Text foregroundStyle={CATPPUCCIN.SUBTEXT1} font={16} fontWeight="heavy" padding={{ bottom: 6 }}>%</Text>
        </HStack>
        <Text foregroundStyle={CATPPUCCIN.SUBTEXT0} font={11} fontWeight="bold" padding={{ leading: 2 }}>{item.label}已过</Text>
      </VStack>
      
      <Spacer />
      
      <ProgressView value={item.value} tint={item.color as any} background={CATPPUCCIN.SURFACE0} frame={{ height: 4 }} />
    </VStack>
  );
}

/**
 * Medium Widget: 左右对等，视觉平衡
 */
function MediumWidgetView() {
  const data = getProgressData(getStoredBirthday());
  const dateInfo = getDateInfo();
  const hero = data[3]; // 今年
  const items = [data[0], data[2], data[4]]; // 今日, 本月, 人生

  return (
    <HStack spacing={0} background={CATPPUCCIN.BASE} frame={{ maxWidth: Infinity, maxHeight: Infinity }}>
      {/* 左侧：主数据卡片 */}
      <VStack padding={16} alignment="leading" background={CATPPUCCIN.MANTLE} frame={{ width: 135 }}>
        <Text font={10} fontWeight="black" foregroundStyle={CATPPUCCIN.OVERLAY1}>今年进度</Text>
        <Spacer />
        <VStack spacing={0} alignment="leading">
          <Text font={36} fontWeight="black" fontDesign="rounded" foregroundStyle={CATPPUCCIN.TEXT}>
            {(hero.value * 100).toFixed(0)}%
          </Text>
          <Text font={10} fontWeight="bold" foregroundStyle={hero.color as any}>余 {dateInfo.remainingDays} 天</Text>
        </VStack>
        <Spacer />
        <ProgressView value={hero.value} tint={hero.color as any} background={CATPPUCCIN.SURFACE0} frame={{ height: 5 }} />
        <Spacer />
        <VStack alignment="leading" spacing={0}>
          <Text font={12} fontWeight="black" foregroundStyle={CATPPUCCIN.TEXT}>{dateInfo.shortDate}</Text>
          <Text font={10} fontWeight="bold" foregroundStyle={CATPPUCCIN.SUBTEXT0}>{dateInfo.weekDay}</Text>
        </VStack>
      </VStack>

      {/* 右侧：精细化列表 */}
      <VStack padding={14} spacing={10} frame={{ maxWidth: Infinity }}>
        {items.map((item) => (
          <HStack key={item.key} spacing={10} alignment="center">
            <ZStack frame={{ width: 22, height: 22 }} background={{ style: item.color as any, shape: { type: "rect", cornerRadius: 6 } }}>
              <Image systemName={item.icon} foregroundStyle={CATPPUCCIN.BASE} font={10} fontWeight="black" />
            </ZStack>
            <VStack alignment="leading" spacing={2} frame={{ maxWidth: Infinity }}>
              <HStack>
                <Text font={11} fontWeight="bold" foregroundStyle={CATPPUCCIN.TEXT}>{item.label}</Text>
                <Spacer />
                <Text font={11} fontWeight="black" fontDesign="rounded" foregroundStyle={item.color as any}>
                  {(item.value * 100).toFixed(0)}%
                </Text>
              </HStack>
              <ProgressView value={item.value} tint={item.color as any} background={CATPPUCCIN.SURFACE0} frame={{ height: 3 }} />
            </VStack>
          </HStack>
        ))}
      </VStack>
    </HStack>
  );
}

/**
 * Large Widget: 模块化看板
 */
function LargeWidgetView() {
  const data = getProgressData(getStoredBirthday());
  const dateInfo = getDateInfo();
  const hero = data[3]; // 今年
  const gridItems = [data[0], data[1], data[2], data[4]]; 

  return (
    <VStack frame={{ maxWidth: Infinity, maxHeight: Infinity }} background={CATPPUCCIN.BASE} spacing={0}>
      {/* 头部：品牌化页眉 */}
      <HStack padding={{ top: 20, horizontal: 20, bottom: 12 }} alignment="lastTextBaseline">
        <Text font={24} fontWeight="black" foregroundStyle={CATPPUCCIN.TEXT}>时光</Text>
        <Text font={24} fontWeight="light" foregroundStyle={CATPPUCCIN.SUBTEXT1} padding={{ leading: 4 }}>流逝</Text>
        <Spacer />
        <VStack alignment="trailing" spacing={0}>
           <Text font={12} fontWeight="black" foregroundStyle={CATPPUCCIN.TEXT}>{dateInfo.fullDate}</Text>
           <Text font={10} fontWeight="bold" foregroundStyle={CATPPUCCIN.SUBTEXT0}>{dateInfo.weekDay} · 第{dateInfo.dayOfYear}天</Text>
        </VStack>
      </HStack>

      {/* 年度英雄卡片 */}
      <VStack padding={{ horizontal: 20, bottom: 14 }}>
        <ZStack padding={16} background={{ style: CATPPUCCIN.MANTLE as any, shape: { type: "rect", cornerRadius: 20 } }}>
          <VStack spacing={12} alignment="leading">
            <HStack alignment="center">
               <ZStack frame={{ width: 36, height: 36 }} background={{ style: hero.color as any, shape: { type: "rect", cornerRadius: 10 } }}>
                 <Image systemName={hero.icon} foregroundStyle={CATPPUCCIN.BASE} font={16} fontWeight="black" />
               </ZStack>
               <VStack alignment="leading" spacing={0} padding={{ leading: 10 }}>
                 <Text font={16} fontWeight="black" foregroundStyle={CATPPUCCIN.TEXT}>今年进程</Text>
                 <Text font={11} fontWeight="bold" foregroundStyle={CATPPUCCIN.SUBTEXT1}>余 {dateInfo.remainingDays} 天</Text>
               </VStack>
               <Spacer />
               <Text font={22} fontWeight="black" fontDesign="rounded" foregroundStyle={hero.color as any}>
                 {(hero.value * 100).toFixed(1)}%
               </Text>
            </HStack>
            <ProgressView value={hero.value} tint={hero.color as any} background={CATPPUCCIN.SURFACE0} frame={{ height: 8 }} />
          </VStack>
        </ZStack>
      </VStack>

      {/* 辅助数据网格 */}
      <VStack padding={{ horizontal: 20 }} spacing={10}>
        <HStack spacing={10}>
           {ElegantGridItem(gridItems[0])}
           {ElegantGridItem(gridItems[1])}
        </HStack>
        <HStack spacing={10}>
           {ElegantGridItem(gridItems[2])}
           {ElegantGridItem(gridItems[3])}
        </HStack>
      </VStack>

      <Spacer />
    </VStack>
  );
}

function WidgetView() {
  const family = Widget.family;
  if (family === "systemSmall") return SmallWidgetView();
  if (family === "systemMedium") return MediumWidgetView();
  if (family === "systemLarge") return LargeWidgetView();
  return <VStack><Text>未适配</Text></VStack>;
}

async function main() {
  try {
    const view = await WidgetView();
    Widget.present(view, {
      policy: "after",
      date: new Date(Date.now() + REFRESH_INTERVAL * 1000)
    });
  } catch (error) {
    console.error("Widget主进程错误:", error);
  } finally {
    Script.exit();
  }
}

main();