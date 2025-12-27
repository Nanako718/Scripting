import { VStack, HStack, Text, TextField, SecureField, Button, useEffect, Picker, useState, useMemo, useCallback, List, Section, Widget, Image, Spacer, TapGesture, Color } from "scripting";
import { ClientType, ClientConfig, MultiClientConfig } from '../utils/public/types';

export interface ConfigData {
  url: string;
  username: string;
  password: string;
  refreshMinutes?: number;
  clientType?: ClientType;
  clientIndex?: number;
}

interface SettingsPageProps {
  onConfigSaved: (config: ConfigData) => void;
  initialConfig?: ConfigData;
  onBack?: () => void;
  onReset?: () => void;
}

const DEFAULT_REFRESH = 0.5;
const MULTI_CLIENT_KEY = 'multiClientConfig';
const CLIENT_COUNT = 3;
const CLIENT_ICON_URLS = {
  qb: 'https://avatars.githubusercontent.com/u/2131270',
  tr: 'https://avatars.githubusercontent.com/u/223312'
};

type SystemColor = "systemBlue" | "systemGreen" | "systemOrange" | "systemPurple" | "systemGray" | "systemRed";

const getDefaultMultiConfig = (): MultiClientConfig => ({
  qb: Array(CLIENT_COUNT).fill(null),
  tr: Array(CLIENT_COUNT).fill(null),
  activeClient: { type: 'qb', index: 0 }
});

const loadMultiConfig = (): MultiClientConfig => {
  const saved = Storage.get<MultiClientConfig>(MULTI_CLIENT_KEY);
  if (!saved) return getDefaultMultiConfig();
  
  return {
    qb: saved.qb?.length === CLIENT_COUNT ? saved.qb : Array(CLIENT_COUNT).fill(null).map((_, i) => saved.qb?.[i] || null),
    tr: saved.tr?.length === CLIENT_COUNT ? saved.tr : Array(CLIENT_COUNT).fill(null).map((_, i) => saved.tr?.[i] || null),
    activeClient: saved.activeClient || { type: 'qb', index: 0 }
  };
};

const saveMultiConfig = (config: MultiClientConfig) => Storage.set(MULTI_CLIENT_KEY, config);

const getIconPath = (type: ClientType) => `${FileManager.documentsDirectory}/qbit_${type}_icon.png`;

const ensureIcons = async () => {
  for (const type of ['qb', 'tr'] as ClientType[]) {
    const path = getIconPath(type);
    if (!FileManager.existsSync(path)) {
      try {
        const img = await UIImage.fromURL(CLIENT_ICON_URLS[type]);
        if (img) {
          const data = Data.fromPNG(img);
          if (data) FileManager.writeAsDataSync(path, data);
        }
      } catch (e) {
        console.log(`Failed to download icon for ${type}:`, e);
      }
    }
  }
};

const SettingField = ({ icon, color, prompt, value, onChanged }: {
  icon: string; color: SystemColor; prompt: string; value: string; onChanged: (v: string) => void;
}) => (
  <HStack spacing={12} alignment="center">
    <Image systemName={icon} foregroundStyle={color} font={18} />
    <TextField title="" prompt={prompt} value={value} onChanged={onChanged} frame={{ maxWidth: "infinity" }} />
  </HStack>
);

const SecureSettingField = ({ icon, color, prompt, value, onChanged }: {
  icon: string; color: SystemColor; prompt: string; value: string; onChanged: (v: string) => void;
}) => (
  <HStack spacing={12} alignment="center">
    <Image systemName={icon} foregroundStyle={color} font={18} />
    <SecureField title="" prompt={prompt} value={value} onChanged={onChanged} />
  </HStack>
);

const ToggleSwitch = ({ visible }: { visible: boolean }) => (
  <HStack frame={{ width: 44, height: 26 }} background={visible ? "systemGreen" : "systemFill" as Color} clipShape={{ type: 'rect', cornerRadius: 13 }} padding={2}>
    {visible ? <Spacer /> : null}
    <VStack frame={{ width: 22, height: 22 }} background="white" clipShape={{ type: 'rect', cornerRadius: 11 }} shadow={{ color: "#00000026" as Color, radius: 1, y: 1 }} />
    {!visible ? <Spacer /> : null}
  </HStack>
);

const StatusBadge = ({ saved, hasChanges, isConfigured, onSave }: {
  saved: boolean; hasChanges: boolean; isConfigured: boolean; onSave: () => void;
}) => {
  if (hasChanges && isConfigured) {
    return (
      <Button buttonStyle="plain" action={onSave}>
        <HStack spacing={4} padding={{ horizontal: 12, vertical: 8 }} background="systemBlue" clipShape={{ type: 'rect', cornerRadius: 6 }}>
          <Image systemName="checkmark" foregroundStyle="white" font={12} />
          <Text font={13} foregroundStyle="white" fontWeight="medium">保存</Text>
        </HStack>
      </Button>
    );
  }
  
  if (saved && !hasChanges) {
    return (
      <HStack spacing={4} padding={{ horizontal: 12, vertical: 8 }} background="systemGreen" clipShape={{ type: 'rect', cornerRadius: 6 }}>
        <Image systemName="checkmark" foregroundStyle="white" font={12} />
        <Text font={13} foregroundStyle="white" fontWeight="medium">已保存</Text>
      </HStack>
    );
  }
  
  if (!isConfigured) {
    return (
      <HStack spacing={4} padding={{ horizontal: 12, vertical: 8 }} background={"#FF3B30" as Color} clipShape={{ type: 'rect', cornerRadius: 6 }}>
        <Image systemName="xmark" foregroundStyle="white" font={12} />
        <Text font={13} foregroundStyle="white" fontWeight="medium">未配置</Text>
      </HStack>
    );
  }
  
  return (
    <Button buttonStyle="plain" action={onSave}>
      <HStack spacing={4} padding={{ horizontal: 12, vertical: 8 }} background="systemBlue" clipShape={{ type: 'rect', cornerRadius: 6 }}>
        <Image systemName="checkmark" foregroundStyle="white" font={12} />
        <Text font={13} foregroundStyle="white" fontWeight="medium">保存</Text>
      </HStack>
    </Button>
  );
};

function ClientItem({ config, onUpdate, onReset }: {
  config: ClientConfig | null; onUpdate: (config: ClientConfig) => void; onReset: () => void;
}) {
  const [alias, setAlias] = useState(config?.alias || '');
  const [url, setUrl] = useState(config?.url || '');
  const [username, setUsername] = useState(config?.username || '');
  const [password, setPassword] = useState(config?.password || '');
  const [visible, setVisible] = useState(config?.visible ?? false);
  const [saved, setSaved] = useState(!!(config?.url && config?.username && config?.password));

  useEffect(() => {
    setAlias(config?.alias || '');
    setUrl(config?.url || '');
    setUsername(config?.username || '');
    setPassword(config?.password || '');
    setVisible(config?.visible ?? false);
    setSaved(!!(config?.url && config?.username && config?.password));
  }, [config]);

  const hasChanges = useMemo(() => {
    return alias !== (config?.alias || '') ||
           url !== (config?.url || '') ||
           username !== (config?.username || '') ||
           password !== (config?.password || '') ||
           visible !== (config?.visible ?? false);
  }, [alias, url, username, password, visible, config]);

  const isConfigured = useMemo(() => !!(url && username && password), [url, username, password]);

  const handleSave = useCallback(() => {
    onUpdate({ url, username, password, alias, visible });
    setSaved(true);
  }, [url, username, password, alias, visible, onUpdate]);

  const handleFieldChange = useCallback((setter: (v: string) => void) => (v: string) => {
    setter(v);
    setSaved(false);
  }, []);

  const handleToggleVisible = useCallback(() => {
    setVisible(v => !v);
    setSaved(false);
  }, []);

  return (
    <VStack spacing={10} padding={{ vertical: 8 }}>
      <HStack spacing={8} alignment="center">
        <Image systemName="eye" foregroundStyle="systemBlue" font={14} />
        <Text font={14}>在小组件中显示</Text>
        <Spacer />
        <Button buttonStyle="plain" action={handleToggleVisible}>
          <ToggleSwitch visible={visible} />
        </Button>
      </HStack>

      <SettingField icon="tag" color="systemPurple" prompt="别名（可选）" value={alias} onChanged={handleFieldChange(setAlias)} />
      <SettingField icon="server.rack" color="systemBlue" prompt="http://192.168.1.1:8080" value={url} onChanged={handleFieldChange(setUrl)} />
      <SettingField icon="person.fill" color="systemGreen" prompt="用户名" value={username} onChanged={handleFieldChange(setUsername)} />
      <SecureSettingField icon="lock.fill" color="systemOrange" prompt="密码" value={password} onChanged={handleFieldChange(setPassword)} />

      <HStack spacing={8} alignment="center">
        <StatusBadge saved={saved} hasChanges={hasChanges} isConfigured={isConfigured} onSave={handleSave} />
        <Button buttonStyle="plain" action={onReset}>
          <HStack spacing={4} padding={{ horizontal: 12, vertical: 8 }} background="systemGray" clipShape={{ type: 'rect', cornerRadius: 6 }}>
            <Image systemName="arrow.counterclockwise" foregroundStyle="white" font={12} />
            <Text font={13} foregroundStyle="white" fontWeight="medium">重置</Text>
          </HStack>
        </Button>
      </HStack>
    </VStack>
  );
}

const ClientIcon = ({ type, size = 16 }: { type: ClientType; size?: number }) => {
  const path = getIconPath(type);
  if (FileManager.existsSync(path)) {
    return <Image filePath={path} frame={{ width: size, height: size }} clipShape={{ type: 'rect', cornerRadius: size * 0.2 }} resizable />;
  }
  return <Image systemName={type === 'qb' ? 'q.circle.fill' : 't.circle.fill'} frame={{ width: size, height: size }} foregroundStyle="systemBlue" />;
};

export function SettingsPage({ onConfigSaved, initialConfig, onBack, onReset }: SettingsPageProps) {
  const [multiConfig, setMultiConfig] = useState<MultiClientConfig>(loadMultiConfig);
  const [currentType, setCurrentType] = useState<ClientType>('qb');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [refreshMinutes, setRefreshMinutes] = useState(initialConfig?.refreshMinutes ?? DEFAULT_REFRESH);

  useEffect(() => { ensureIcons(); }, []);

  const handleUpdateClient = useCallback((type: ClientType, index: number, config: ClientConfig) => {
    setMultiConfig(prev => {
      const newConfig = { ...prev };
      newConfig[type][index] = config;
      saveMultiConfig(newConfig);
      Widget.reloadUserWidgets();
      return newConfig;
    });
  }, []);

  const handleResetClient = useCallback((type: ClientType, index: number) => {
    setMultiConfig(prev => {
      const newConfig = { ...prev };
      newConfig[type][index] = null;
      if (newConfig.activeClient?.type === type && newConfig.activeClient?.index === index) {
        newConfig.activeClient = { type: 'qb', index: 0 };
      }
      saveMultiConfig(newConfig);
      Widget.reloadUserWidgets();
      return newConfig;
    });
  }, []);

  const handleSave = useCallback(async () => {
    const active = multiConfig.activeClient || { type: 'qb', index: 0 };
    const activeConfig = multiConfig[active.type][active.index];
    if (activeConfig) {
      onConfigSaved({
        url: activeConfig.url,
        username: activeConfig.username,
        password: activeConfig.password,
        refreshMinutes,
        clientType: active.type,
        clientIndex: active.index
      });
    }
    await Widget.reloadUserWidgets();
  }, [multiConfig, refreshMinutes, onConfigSaved]);

  const handleResetAll = useCallback(() => {
    const newConfig = getDefaultMultiConfig();
    setMultiConfig(newConfig);
    saveMultiConfig(newConfig);
    onReset?.();
  }, [onReset]);

  const handleTypeChange = useCallback((type: ClientType) => {
    setCurrentType(type);
    setExpandedIndex(null);
  }, []);

  const handleToggleExpand = useCallback((i: number) => {
    setExpandedIndex(prev => prev === i ? null : i);
  }, []);

  const clientName = currentType === 'qb' ? 'qBittorrent' : 'Transmission';

  const tabHeader = useMemo(() => (
    <HStack spacing={0} frame={{ maxWidth: Infinity }} background="systemFill" clipShape={{ type: 'rect', cornerRadius: 9 }} padding={2}>
      {(['qb', 'tr'] as ClientType[]).map(type => (
        <Button key={type} buttonStyle="plain" action={() => handleTypeChange(type)}>
          <HStack spacing={6} padding={{ vertical: 6 }} frame={{ maxWidth: Infinity }}
            background={currentType === type ? "secondarySystemGroupedBackground" : "clear" as Color}
            clipShape={{ type: 'rect', cornerRadius: 7 }}
            shadow={currentType === type ? { color: "#00000026" as Color, radius: 2, y: 1 } : undefined}>
            <ClientIcon type={type} size={16} />
            <Text font={13} fontWeight={currentType === type ? "semibold" : "medium"} foregroundStyle="label" textCase={null}>
              {type === 'qb' ? 'qBittorrent' : 'Transmission'}
            </Text>
          </HStack>
        </Button>
      ))}
    </HStack>
  ), [currentType, handleTypeChange]);

  const clientItems = useMemo(() => (
    Array.from({ length: CLIENT_COUNT }, (_, i) => {
      const cfg = multiConfig[currentType][i];
      const name = cfg?.alias || `${clientName} ${i + 1}`;
      const isConfigured = !!(cfg?.url && cfg?.username && cfg?.password);
      return (
        <VStack key={`${currentType}-${i}`} spacing={0}>
          <HStack
            padding={{ vertical: 10 }}
            frame={{ maxWidth: Infinity }}
            contentShape="rect"
            gesture={{ gesture: TapGesture().onEnded(() => handleToggleExpand(i)), mask: 'gesture' }}
          >
            <ClientIcon type={currentType} size={18} />
            <Text font={15} fontWeight="medium" padding={{ leading: 8 }}>{name}</Text>
            <Spacer />
            <Text font={13} foregroundStyle={isConfigured ? "systemGreen" : "secondaryLabel"}>{isConfigured ? "已配置" : "未配置"}</Text>
            <Image systemName={expandedIndex === i ? "chevron.up" : "chevron.down"} foregroundStyle="tertiaryLabel" font={12} padding={{ leading: 8 }} />
          </HStack>
          {expandedIndex === i ? (
            <ClientItem
              config={cfg}
              onUpdate={(c) => handleUpdateClient(currentType, i, c)}
              onReset={() => handleResetClient(currentType, i)}
            />
          ) : null}
        </VStack>
      );
    })
  ), [multiConfig, currentType, clientName, expandedIndex, handleToggleExpand, handleUpdateClient, handleResetClient]);

  const refreshSection = useMemo(() => (
    <HStack spacing={12} alignment="center">
      <Image systemName="clock.fill" foregroundStyle="systemPurple" font={18} />
      <Picker title="刷新间隔" pickerStyle="menu" value={refreshMinutes} onChanged={setRefreshMinutes} frame={{ maxWidth: "infinity" }}>
        <Text tag={0}>不刷新</Text>
        <Text tag={0.5}>30秒</Text>
        <Text tag={1}>1分钟</Text>
        <Text tag={2}>2分钟</Text>
        <Text tag={5}>5分钟</Text>
      </Picker>
    </HStack>
  ), [refreshMinutes]);

  const dangerSection = useMemo(() => onReset ? (
    <Section header={<Text>危险操作</Text>} footer={<Text>清空所有客户端配置信息，此操作不可撤销</Text>}>
      <HStack
        padding={{ vertical: 14 }}
        frame={{ maxWidth: Infinity }}
        contentShape="rect"
        gesture={{ gesture: TapGesture().onEnded(handleResetAll), mask: 'gesture' }}
      >
        <HStack frame={{ width: 32, height: 32 }} background={"#FF3B30" as Color} clipShape={{ type: 'rect', cornerRadius: 7 }}>
          <Image systemName="arrow.counterclockwise" foregroundStyle="white" font={16} />
        </HStack>
        <Text padding={{ leading: 12 }} font={17} foregroundStyle="#FF3B30">重置所有配置</Text>
        <Spacer />
      </HStack>
    </Section>
  ) : null, [onReset, handleResetAll]);

  return (
    <List navigationTitle="设置" toolbar={{
      topBarLeading: onBack ? <Button title="返回" systemImage="chevron.left" action={onBack} /> : undefined,
      topBarTrailing: <Button title="保存" action={handleSave} />
    }}>
      <Section header={tabHeader} footer={<Text>选择客户端类型，点击展开配置</Text>}>
        {clientItems}
      </Section>

      <Section header={<Text>小组件设置</Text>} footer={<Text>设置小组件自动刷新的时间间隔</Text>}>
        {refreshSection}
      </Section>

      {dangerSection}
    </List>
  );
}
