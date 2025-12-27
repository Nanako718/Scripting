import { VStack, HStack, Text, Widget, Button, Image, Spacer, TapGesture, Color } from "scripting";
import { Display, ConfigData, STORAGE_KEY, DEFAULT_REFRESH_MINUTES, updateHistory, getCachedClientData, setCachedClientData } from './utils/public';
import { fetchData } from './utils/api';
import { SwitchClientIntent } from './app_intents';
import { ClientType, ClientConfig, MultiClientConfig, ClientData } from './utils/public/types';
import { Theme } from './utils/public/colors';

const MULTI_CLIENT_KEY = 'multiClientConfig';

interface VisibleClient {
  type: ClientType;
  index: number;
  config: ClientConfig;
  displayName: string;
}

function getVisibleClients(multiConfig: MultiClientConfig | null): VisibleClient[] {
  if (!multiConfig) return [];
  const clients: VisibleClient[] = [];

  (['qb', 'tr'] as ClientType[]).forEach(type => {
    const configs = multiConfig[type] || [];
    configs.forEach((config, index) => {
      if (config?.visible !== false && config?.url && config?.username && config?.password) {
        const baseName = type === 'qb' ? 'qBittorrent' : 'Transmission';
        clients.push({ type, index, config, displayName: config.alias || `${baseName} ${index + 1}` });
      }
    });
  });

  return clients;
}

async function prefetchClientData(client: VisibleClient, config: ConfigData) {
  const cached = getCachedClientData(client.type, client.index);
  if (cached) return;

  try {
    const data = await fetchData({
      ...config,
      url: client.config.url,
      username: client.config.username,
      password: client.config.password,
      clientType: client.type
    });
    if (data) setCachedClientData(client.type, client.index, data);
  } catch (e) {
    // 忽略预取错误
  }
}

function SwitchButtons({ visibleClients, currentClient }: { visibleClients: VisibleClient[]; currentClient: VisibleClient }) {
  return (
    <HStack spacing={12} alignment="center">
      {visibleClients.map((client) => {
        const isActive = client.type === currentClient.type && client.index === currentClient.index;
        const label = client.type === 'qb' ? 'QB' : 'TR';
        
        if (isActive) {
        return (
          <VStack
            key={`${client.type}-${client.index}`}
            spacing={4}
            alignment="center"
            padding={{ horizontal: 16, vertical: 8 }}
            background={Theme.Surface1}
            clipShape={{ type: 'rect', cornerRadius: 8 }}
          >
            <Text
              font={14}
              fontWeight="semibold"
              foregroundStyle={Theme.Text}
            >
              {label}
            </Text>
            <VStack
              frame={{ width: 4, height: 4 }}
              background={Theme.Blue}
              clipShape={{ type: 'rect', cornerRadius: 2 }}
            />
          </VStack>
        );
        }
        
        return (
          <Button
            key={`${client.type}-${client.index}`}
            buttonStyle="plain"
            intent={SwitchClientIntent({ clientType: client.type, clientIndex: client.index })}
          >
            <VStack
              spacing={4}
              alignment="center"
              padding={{ horizontal: 16, vertical: 8 }}
              background={Theme.Surface0}
              clipShape={{ type: 'rect', cornerRadius: 8 }}
            >
              <Text
                font={14}
                fontWeight="regular"
                foregroundStyle={Theme.Subtext}
              >
                {label}
              </Text>
              <VStack frame={{ width: 4, height: 4 }} opacity={0} />
            </VStack>
          </Button>
        );
      })}
    </HStack>
  );
}

function ErrorWidget({ message, visibleClients, currentClient }: { message: string; visibleClients: VisibleClient[]; currentClient?: VisibleClient }) {
  return (
    <VStack
      frame={{ maxWidth: Infinity, maxHeight: Infinity }}
      padding={16}
      alignment="center"
      background={Theme.Background}
    >
      <Spacer />
      <Text foregroundStyle={Theme.Text}>{message}</Text>
      <Spacer />
    </VStack>
  );
}

async function fetchCurrentClientData(client: VisibleClient, config: ConfigData): Promise<ClientData | null> {
  const cached = getCachedClientData(client.type, client.index);
  
  if (cached) {
    // 后台更新缓存
    fetchData({
      ...config,
      url: client.config.url,
      username: client.config.username,
      password: client.config.password,
      clientType: client.type
    }).then(freshData => {
      if (freshData) setCachedClientData(client.type, client.index, freshData);
    }).catch(() => {});
    
    return cached;
  }
  
  // 没有缓存，获取新数据
  const freshData = await fetchData({
    ...config,
    url: client.config.url,
    username: client.config.username,
    password: client.config.password,
    clientType: client.type
  });
  
  if (freshData) setCachedClientData(client.type, client.index, freshData);
  return freshData;
}

async function main() {
  const config = Storage.get<ConfigData>(STORAGE_KEY);
  const multiConfig = Storage.get<MultiClientConfig>(MULTI_CLIENT_KEY);
  const visibleClients = getVisibleClients(multiConfig);

  if (visibleClients.length === 0) {
    Widget.present(<ErrorWidget message="请先在应用中配置客户端" visibleClients={[]} />);
    return;
  }

  // 找到当前激活的客户端
  const activeType = config?.clientType || 'qb';
  const activeIndex = config?.clientIndex ?? 0;
  const currentClient = visibleClients.find(c => c.type === activeType && c.index === activeIndex) || visibleClients[0];

  // 获取当前客户端数据
  const data = await fetchCurrentClientData(currentClient, config!);

  // 预取其他客户端数据
  if (config) {
    visibleClients.forEach(client => {
      if (client !== currentClient) {
        prefetchClientData(client, config);
      }
    });
  }

  if (!data) {
    Widget.present(<ErrorWidget message="获取数据失败" visibleClients={visibleClients} currentClient={currentClient} />);
    return;
  }

  const history = updateHistory(data);
  const refreshMinutes = config?.refreshMinutes ?? DEFAULT_REFRESH_MINUTES;
  const size: 'small' | 'medium' | 'large' = 
    Widget.family === 'systemLarge' ? 'large' : 
    Widget.family === 'systemMedium' ? 'medium' : 'small';

  // 找到下一个客户端用于切换
  const getNextClient = () => {
    if (visibleClients.length <= 1) return null;
    const currentIndex = visibleClients.findIndex(c => c.type === currentClient.type && c.index === currentClient.index);
    const nextIndex = (currentIndex + 1) % visibleClients.length;
    return visibleClients[nextIndex];
  };

  const nextClient = getNextClient();
  // 计算当前客户端索引用于动画
  const currentClientIndex = visibleClients.findIndex(c => c.type === currentClient.type && c.index === currentClient.index);

  Widget.present(
    <VStack
      frame={{ maxWidth: Infinity, maxHeight: Infinity }}
      padding={size === 'small' ? 12 : 16}
      alignment="center"
      background={Theme.Background}
      animation={nextClient ? {
        animation: Animation.default(),
        value: currentClientIndex
      } : undefined}
    >
      {nextClient ? (
        <Button
          buttonStyle="plain"
          intent={SwitchClientIntent({ clientType: nextClient.type, clientIndex: nextClient.index })}
          frame={{ maxWidth: Infinity, maxHeight: Infinity }}
        >
          <VStack
            frame={{ maxWidth: Infinity, maxHeight: Infinity }}
            alignment="center"
          >
            {size === 'small' ? <Spacer /> : null}
            <Display data={data} history={history} size={size} clientType={currentClient.type} />
            <Spacer />
          </VStack>
        </Button>
      ) : (
        <VStack
          frame={{ maxWidth: Infinity, maxHeight: Infinity }}
          alignment="center"
        >
          {size === 'small' ? <Spacer /> : null}
          <Display data={data} history={history} size={size} clientType={currentClient.type} />
          <Spacer />
        </VStack>
      )}
    </VStack>,
    refreshMinutes > 0
      ? { policy: "after", date: new Date(Date.now() + 1000 * 60 * refreshMinutes) }
      : undefined
  );
}

main();
