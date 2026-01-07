import {
  VStack,
  HStack,
  Text,
  Spacer,
  Image,
  Chart,
  LineChart,
  Button,
  Link,
} from "scripting";
import { RefreshIntent } from "../../app_intents";

export function View({ data }: { data: any }) {
  const { cityName, oilName, currentPrice, currentStatus, trendData } = data;
  
  // 取最近30条数据用于显示
  const displayData = trendData.length > 0 ? trendData.slice(-30) : [];
  const values = displayData.length > 0 ? displayData.map((d: any) => d.price) : [currentPrice || 0];
  const minY = Math.min(...values);
  const maxY = Math.max(...values);
  const range = maxY - minY || 1;

  const lastInfo = displayData.length > 1 ? displayData[displayData.length - 2] : null;

  const dif = currentStatus;
  const state = dif > 0;
  const symbol = state ? "+" : "";
  const color = state ? "systemRed" : dif < 0 ? "systemGreen" : dif === 0 ? "#52CAF0" : "secondaryLabel";
  
  // 计算百分比
  let percentage = 0;
  if (lastInfo && currentPrice && lastInfo.price) {
    percentage = ((currentPrice - lastInfo.price) / lastInfo.price) * 100;
  } else if (currentPrice && dif !== 0) {
    percentage = (dif / (currentPrice - dif)) * 100;
  }

  const shadowSize = 5;
  
  return (
    <VStack padding alignment="leading" spacing={1}>
      <Link url={"https://cx.sinopecsales.com/yjkqiantai"} buttonStyle={"plain"}>
        <VStack alignment={"leading"} spacing={1} padding={{ bottom: -2 }}>
          <HStack alignment="center" spacing={3}>
            <Image
              foregroundStyle={color}
              systemName={
                state ? "arrowtriangle.up.fill" : dif < 0 ? "arrowtriangle.down.fill" : "minus"
              }
            />
            <Text font={"headline"}>
              {cityName}
            </Text>
          </HStack>
          <Text
            font={9}
            foregroundStyle={"secondaryLabel"}
            fontWeight={"medium"}>
            {oilName} 汽油
          </Text>
        </VStack>
      </Link>

      <Button intent={RefreshIntent(undefined)} buttonStyle={"plain"}>
        <VStack spacing={0}>
          {displayData.length > 0 ? (
            <Chart
              chartXAxis={"hidden"}
              chartYAxis={"hidden"}
              padding={{ top: 4, bottom: 4 }}>
              <LineChart
                marks={displayData.map((item: any) => ({
                  label: item.date,
                  value: (item.price - minY) / range,
                  foregroundStyle: color,
                  shadow: {
                    color: color,
                    radius: shadowSize,
                    y: 2,
                  },
                }))}
              />
            </Chart>
          ) : null}

          <HStack alignment={"bottom"} padding={{ top: displayData.length > 0 ? -4 : 0 }}>
            <HStack alignment={"bottom"} spacing={1}>
              <Text
                monospacedDigit={true}
                font={"title"}
                fontWidth={"compressed"}>
                {currentPrice?.toFixed(2) || "0.00"}
              </Text>
              <Text
                font={8}
                foregroundStyle={"secondaryLabel"}
                fontWeight={"regular"}
                padding={{ bottom: 2 }}>
                元/升
              </Text>
            </HStack>
            <Spacer />
            <VStack spacing={0} alignment={"trailing"}>
              <Text
                monospacedDigit={true}
                font={9}
                fontWeight={"semibold"}
                foregroundStyle={color}>
                {symbol + dif.toFixed(2)}
              </Text>
              {percentage !== 0 ? (
                <Text
                  monospacedDigit={true}
                  font={8}
                  fontWeight={"medium"}
                  foregroundStyle={color}>
                  {symbol + percentage.toFixed(2)}%
                </Text>
              ) : null}
            </VStack>
          </HStack>
        </VStack>
      </Button>
    </VStack>
  );
}

