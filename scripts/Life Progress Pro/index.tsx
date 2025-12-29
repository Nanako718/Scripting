import { 
  NavigationStack, VStack, HStack, ZStack, Text, ProgressView, Image, Spacer, 
  useState, useEffect, DatePicker, useObservable, Widget, Navigation, Script, Divider,
  List, Section
} from "scripting";
import { WidgetDisplayOption, ProgressData } from "./shared/types";
import { 
  WIDGET_FAMILIES,
  ERROR_MESSAGES,
  COLORS,
  CATPPUCCIN
} from "./shared/constants";
import { 
  getStoredBirthday,
  setStoredBirthday, 
  getStoredSmallWidgetDisplay,
  setStoredSmallWidgetDisplay,
  formatPercentage,
  getProgressData,
  getWidgetDisplayOptions
} from "./shared/utils";

// 通用高级卡片容器
const Card = ({ children, padding = 16, background }: { children: any, padding?: number, background?: any }) => (
  <VStack 
    padding={padding}
    background={background || {
      style: CATPPUCCIN.MANTLE,
      shape: { type: "rect", cornerRadius: 20 }
    }}
    frame={{ maxWidth: Infinity }}
  >
    {children}
  </VStack>
);

// 概览摘要组件
function SummaryCard({ data }: { data: ProgressData[] }) {
  const hero = data[3]; // 今年
  return (
    <Card background={{ style: CATPPUCCIN.BASE, shape: { type: "rect", cornerRadius: 24 } }}>
      <VStack spacing={16} alignment="leading">
        <HStack alignment="center">
          <ZStack frame={{ width: 40, height: 40 }} background={{ style: hero.color as any, shape: { type: "rect", cornerRadius: 12 } }}>
            <Image systemName={hero.icon} foregroundStyle={CATPPUCCIN.BASE} font={18} fontWeight="black" />
          </ZStack>
          <VStack alignment="leading" spacing={0} padding={{ leading: 12 }}>
            <Text font={18} fontWeight="black" foregroundStyle={CATPPUCCIN.TEXT}>{hero.label}进程</Text>
            <Text font={12} fontWeight="bold" foregroundStyle={CATPPUCCIN.SUBTEXT1}>时光荏苒，珍惜当下</Text>
          </VStack>
          <Spacer />
          <Text font={24} fontWeight="black" fontDesign="rounded" foregroundStyle={hero.color as any}>
            {(hero.value * 100).toFixed(1)}%
          </Text>
        </HStack>
        <ProgressView value={hero.value} tint={hero.color as any} background={CATPPUCCIN.SURFACE0} frame={{ height: 10 }} />
        
        <HStack spacing={12}>
          {data.filter(i => i.key !== 'year').map(item => (
            <VStack key={item.key} spacing={4} alignment="center" frame={{ maxWidth: Infinity }}>
              <Text font={10} fontWeight="black" foregroundStyle={CATPPUCCIN.SUBTEXT1}>{item.label}</Text>
              <Text font={13} fontWeight="black" fontDesign="rounded" foregroundStyle={item.color as any}>
                {(item.value * 100).toFixed(0)}%
              </Text>
            </VStack>
          ))}
        </HStack>
      </VStack>
    </Card>
  );
}

const SettingRow = ({ icon, title, children, color }: { icon: string, title: string, children: any, color?: any }) => (
  <HStack alignment="center" spacing={12} padding={{ vertical: 4 }}>
    <ZStack frame={{ width: 32, height: 32 }} background={{
      style: (color || CATPPUCCIN.SURFACE0) as any,
      shape: { type: "rect", cornerRadius: 8 }
    }}>
      <Image systemName={icon} font={14} fontWeight="black" foregroundStyle={color ? CATPPUCCIN.BASE : CATPPUCCIN.TEXT} />
    </ZStack>
    <Text font={15} fontWeight="bold" foregroundStyle={CATPPUCCIN.TEXT}>{title}</Text>
    <Spacer />
    {children}
  </HStack>
);

function MainView() {
  const birthday = getStoredBirthday();
  const birthdayObs = useObservable(birthday || new Date("2000-01-01"));
  const [smallWidgetDisplay, setSmallWidgetDisplayState] = useState(getStoredSmallWidgetDisplay());
  const now = new Date();

  useEffect(() => {
    setStoredBirthday(birthdayObs.value);
    Widget.reloadAll();
  }, [birthdayObs.value]);

  useEffect(() => {
    setStoredSmallWidgetDisplay(smallWidgetDisplay);
    Widget.reloadAll();
  }, [smallWidgetDisplay]);

  const items = getProgressData(birthdayObs.value);
  const widgetOptions = getWidgetDisplayOptions();

  return (
    <NavigationStack>
      <VStack 
        background={CATPPUCCIN.BASE} 
        spacing={20}
        padding={{ top: 80, bottom: 30 }}
        frame={{ maxWidth: Infinity, maxHeight: Infinity }}
      >
        {/* 页眉 */}
        <VStack spacing={4} padding={{ top: 30, horizontal: 24 }} alignment="leading">
          <Text font={12} fontWeight="black" foregroundStyle={CATPPUCCIN.MAUVE}>
            {`${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 · ${["周日", "周一", "周二", "周三", "周四", "周五", "周六"][now.getDay()]}`}
          </Text>
          <HStack alignment="lastTextBaseline" spacing={4}>
            <Text font={32} fontWeight="black" foregroundStyle={CATPPUCCIN.TEXT}>时光</Text>
            <Text font={32} fontWeight="light" foregroundStyle={CATPPUCCIN.SUBTEXT1}>进度</Text>
          </HStack>
        </VStack>

        {/* 概览卡片 */}
        <VStack padding={{ horizontal: 20 }}>
          <SummaryCard data={items} />
        </VStack>

        {/* 设置区域 */}
        <VStack spacing={16} padding={{ horizontal: 20 }}>
          <Text font={18} fontWeight="black" foregroundStyle={CATPPUCCIN.TEXT} padding={{ leading: 4 }}>配置</Text>
          
          <Card padding={20}>
            <VStack spacing={16}>
              <SettingRow icon="gift.fill" title="出生日期" color={CATPPUCCIN.PEACH}>
                <DatePicker 
                  value={birthdayObs}
                  displayedComponents={["date"]}
                  title=""
                />
              </SettingRow>
              
              <Divider background={CATPPUCCIN.SURFACE1} />
              
              <VStack spacing={12} alignment="leading">
                <SettingRow icon="rectangle.3.group.fill" title="小组件首选展示" color={CATPPUCCIN.BLUE} children={null} />
                <VStack spacing={8} padding={{ top: 4 }}>
                  {widgetOptions.map((option) => {
                    const isSelected = smallWidgetDisplay === option.value;
                    return (
                      <HStack
                        key={option.value}
                        padding={{ vertical: 12, horizontal: 16 }}
                        background={{
                          style: isSelected ? CATPPUCCIN.SURFACE1 : CATPPUCCIN.BASE,
                          shape: { type: "rect", cornerRadius: 14 }
                        }}
                        onTapGesture={() => {
                          setSmallWidgetDisplayState(option.value);
                        }}
                        alignment="center"
                      >
                        <Text 
                          font={14} 
                          fontWeight={isSelected ? "black" : "bold"}
                          foregroundStyle={isSelected ? CATPPUCCIN.TEXT : CATPPUCCIN.SUBTEXT1}
                        >
                          {option.label}
                        </Text>
                        <Spacer />
                        {isSelected && (
                          <Image systemName="checkmark.circle.fill" foregroundStyle={CATPPUCCIN.GREEN} font={16} />
                        )}
                      </HStack>
                    );
                  })}
                </VStack>
              </VStack>
            </VStack>
          </Card>
        </VStack>

        <Spacer />
        
        <VStack spacing={4} alignment="center">
          <Text font={11} fontWeight="black" foregroundStyle={CATPPUCCIN.SURFACE2}>
            LIFE PROGRESS PRO
          </Text>
          <Text font={9} fontWeight="bold" foregroundStyle={CATPPUCCIN.SURFACE1}>
            Version 1.1.0 · Designed by Apple Style
          </Text>
        </VStack>
      </VStack>
    </NavigationStack>
  );
}

async function run() {
  await Navigation.present(<MainView />);
  Script.exit();
}

run();