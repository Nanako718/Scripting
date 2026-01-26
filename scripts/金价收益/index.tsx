import {
  Navigation,
  Form,
  Section,
  Button,
  useState,
  Text,
  VStack,
  Spacer,
  TextField,
} from "scripting";
import { fetchGoldPrice } from "./util/api";

type GoldProfitSettings = {
  grams: string;
  buyPrice: string;
};

const SETTINGS_KEY = "goldProfitSettings";

const defaultSettings: GoldProfitSettings = {
  grams: "",
  buyPrice: "",
};

function SettingsPage() {
  const dismiss = Navigation.useDismiss();
  const initialSettings = Storage.get<GoldProfitSettings>(SETTINGS_KEY) ?? defaultSettings;

  const [grams, setGrams] = useState(initialSettings.grams);
  const [buyPrice, setBuyPrice] = useState(initialSettings.buyPrice);

  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [profit, setProfit] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const newSettings: GoldProfitSettings = {
      grams: grams.trim(),
      buyPrice: buyPrice.trim(),
    };

    Storage.set(SETTINGS_KEY, newSettings);
    dismiss();
  };

  const handleCalcProfit = async () => {
    setError(null);
    setProfit(null);
    setLoading(true);

    const gramsNum = parseFloat(grams.trim());
    const buyPriceNum = parseFloat(buyPrice.trim());

    if (Number.isNaN(gramsNum) || Number.isNaN(buyPriceNum)) {
      setLoading(false);
      setError("请先正确填写买入克数和买入价格");
      return;
    }

    const goldData = await fetchGoldPrice();
    setLoading(false);

    if (goldData == null || goldData.currentPrice == null) {
      setError("无法获取当前金价，请稍后重试");
      return;
    }

    setCurrentPrice(goldData.currentPrice);
    const p = (goldData.currentPrice - buyPriceNum) * gramsNum;
    setProfit(p);
  };

  return (
    <VStack>
      <Form>
        <Section title="金价收益设置">
          <TextField
            title="买入克数"
            prompt="例如 10"
            value={grams}
            onChanged={setGrams}
          />
          <TextField
            title="买入单价"
            prompt="每克价格，例如 500"
            value={buyPrice}
            onChanged={setBuyPrice}
          />
          <Text font="caption" foregroundStyle="secondaryLabel">
            请输入您买入的黄金克数和买入单价。小组件将根据当前金价计算大致盈亏，仅供参考。
          </Text>
        </Section>

        <Section title="收益预估">
          {currentPrice != null ? (
            <Text>
              当前参考金价：{currentPrice.toFixed(2)}
            </Text>
          ) : (
            <Text>点击下方按钮获取当前金价并计算收益。</Text>
          )}

          {profit != null ? (
            <Text>
              预估盈亏：{profit >= 0 ? "+" : ""}
              {profit.toFixed(2)}
            </Text>
          ) : null}

          {error ? (
            <Text foregroundStyle="red">
              {error}
            </Text>
          ) : null}

          {loading ? (
            <Text>正在获取金价并计算...</Text>
          ) : (
            <Button title="获取当前金价并计算收益" action={handleCalcProfit} />
          )}
        </Section>

        <Button title="保存设置" action={handleSave} />
      </Form>
      <Spacer />
    </VStack>
  );
}

Navigation.present(<SettingsPage />);

