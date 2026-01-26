import {
  VStack,
  HStack,
  Text,
  Spacer,
  Image,
  Button,
} from "scripting";
import { RefreshIntent } from "../../app_intents";

export function View({ data }: { data: any }) {
  const { currentPrice, buyPrice, grams, profit, priceDiff, percentage } = data;
  
  const state = profit > 0;
  const symbol = state ? "+" : "";
  const color = state ? "systemRed" : profit < 0 ? "systemGreen" : "secondaryLabel";
  
  return (
    <VStack padding alignment="leading" spacing={1}>
      <VStack alignment={"leading"} spacing={1} padding={{ bottom: 0 }}>
        <HStack alignment="center" spacing={3}>
          <Image
            foregroundStyle={color}
            systemName={
              state ? "arrowtriangle.up.fill" : profit < 0 ? "arrowtriangle.down.fill" : "minus"
            }
          />
          <Text font={"headline"} fontWeight={"semibold"}>
            金价收益
          </Text>
        </HStack>
        <Text
          font={"caption2"}
          foregroundStyle={"secondaryLabel"}
          fontWeight={"medium"}>
          持有 {grams.toFixed(2)} 克 | 买入价 {buyPrice.toFixed(2)} 元/克
        </Text>
      </VStack>

      <Button intent={RefreshIntent(undefined)} buttonStyle={"plain"}>
        <VStack spacing={0}>
          <HStack alignment={"bottom"} padding={{ top: 0 }}>
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
                padding={{ bottom: 3 }}>
                元/克
              </Text>
            </HStack>
            <Spacer />
            <VStack spacing={0} alignment={"trailing"}>
              <Text
                monospacedDigit={true}
                font={"caption2"}
                fontWeight={"semibold"}
                foregroundStyle={color}>
                {symbol + profit.toFixed(2)} 元
              </Text>
              {percentage !== 0 ? (
                <Text
                  monospacedDigit={true}
                  font={8}
                  fontWeight={"semibold"}
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
