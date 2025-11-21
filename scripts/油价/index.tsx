import {
  Navigation,
  Form,
  Section,
  Button,
  useState,
  Text,
  VStack,
  Spacer,
  Toggle,
  List,
  HStack,
  Image,
} from "scripting";
import { provinces } from "./util/api";

// 定义设置结构
type OilPriceSettings = {
  useManualProvince: boolean;
  manualProvinceId: string;
};

const SETTINGS_KEY = "oilPriceSettings";

// 默认设置
const defaultSettings: OilPriceSettings = {
  useManualProvince: false,
  manualProvinceId: "33", // 默认浙江
};

function ProvinceSelectionPage({
  currentProvinceId,
  onProvinceSelected,
}: {
  currentProvinceId: string;
  onProvinceSelected: (provinceId: string) => void;
}) {
  const dismiss = Navigation.useDismiss();

  return (
    <List>
      <Section title="选择省份">
        {provinces.map((province) => (
          <Button
            key={province.value}
            action={() => {
              onProvinceSelected(province.value);
              dismiss();
            }}
          >
            <HStack alignment="center" spacing={8}>
              <Text font="body">{province.label}</Text>
              <Spacer />
              {province.value === currentProvinceId ? (
                <Image systemName="checkmark" foregroundStyle="accentColor" />
              ) : null}
            </HStack>
          </Button>
        ))}
      </Section>
    </List>
  );
}

function SettingsPage() {
  const dismiss = Navigation.useDismiss();
  const initialSettings = Storage.get<OilPriceSettings>(SETTINGS_KEY) ?? defaultSettings;

  // State for the form fields
  const [useManualProvince, setUseManualProvince] = useState(initialSettings.useManualProvince);
  const [manualProvinceId, setManualProvinceId] = useState(initialSettings.manualProvinceId);

  const handleSave = () => {
    const newSettings: OilPriceSettings = {
      useManualProvince,
      manualProvinceId,
    };
    Storage.set(SETTINGS_KEY, newSettings);
    dismiss();
  };

  const selectedProvince = provinces.find((p) => p.value === manualProvinceId);

  return (
    <VStack>
      <Form>
        <Section
          title="省份设置"
          footer={
            <Text>
              开启手动选择省份后，小组件将使用您选择的省份获取油价数据，而不是自动定位。
              如果定位失败或需要查看其他省份的油价，可以开启此选项。
            </Text>
          }
        >
          <Toggle
            title="手动选择省份"
            value={useManualProvince}
            onChanged={setUseManualProvince}
          />
          {useManualProvince ? (
            <Button
              action={() => {
                Navigation.present(
                  <ProvinceSelectionPage
                    currentProvinceId={manualProvinceId}
                    onProvinceSelected={setManualProvinceId}
                  />
                );
              }}
            >
              <HStack alignment="center" spacing={8}>
                <Text font="body">选择省份</Text>
                <Spacer />
                <Text font="body" foregroundStyle="secondaryLabel">
                  {selectedProvince?.label || "未选择"}
                </Text>
                <Image systemName="chevron.right" foregroundStyle="tertiaryLabel" />
              </HStack>
            </Button>
          ) : null}
        </Section>

        <Button title="保存设置" action={handleSave} />
      </Form>
      <Spacer />
    </VStack>
  );
}

Navigation.present(<SettingsPage />);
