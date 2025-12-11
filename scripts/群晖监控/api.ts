import { fetch } from "scripting";

export type SynologySettings = {
  serverUrl: string;
  username: string;
  password: string;
  deviceName?: string;
};

type LoginResponse = {
  success: boolean;
  data: {
    sid: string;
  };
};

type StorageInfoResponse = {
  success: boolean;
  data: {
    volumes: Array<{
      id: string;
      status: string;
      size: {
        total: string;
        used: string;
        total_device?: string;
      };
    }>;
  };
};

export function normalizeServerUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export async function login(
  serverUrl: string,
  username: string,
  password: string
): Promise<string | null> {
  try {
    const apiInfoUrl = `${normalizeServerUrl(serverUrl)}/webapi/query.cgi?api=SYNO.API.Info&version=1&method=query&query=SYNO.API.Auth`;
    const apiInfoResponse = await fetch(apiInfoUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    let authVersion = "3";
    if (apiInfoResponse.ok) {
      try {
        const apiInfo = await apiInfoResponse.json();
        if (apiInfo?.data?.["SYNO.API.Auth"]?.maxVersion) {
          authVersion = String(apiInfo.data["SYNO.API.Auth"].maxVersion);
        }
      } catch (e) {
        // 使用默认版本
      }
    }

    const url = `${normalizeServerUrl(serverUrl)}/webapi/auth.cgi?api=SYNO.API.Auth&version=${authVersion}&method=login&account=${encodeURIComponent(username)}&passwd=${encodeURIComponent(password)}&session=FileStation&format=sid`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json() as LoginResponse;
      if (data.success && data.data?.sid) {
        return data.data.sid;
      }
    }
  } catch (error) {
    console.error("登录失败:", error);
  }
  return null;
}

export async function logout(serverUrl: string, sid: string): Promise<void> {
  try {
    const url = `${normalizeServerUrl(serverUrl)}/webapi/auth.cgi?api=SYNO.API.Auth&version=3&method=logout&session=FileStation&_sid=${sid}`;
    await fetch(url, { method: "GET" });
  } catch (error) {
    // 忽略登出错误
  }
}

export async function getSystemInfo(
  serverUrl: string,
  sid: string
): Promise<{
  cpu: number;
  memory: number;
  network: { rx: number; tx: number };
  ping: number;
} | null> {
  try {
    const startTime = Date.now();
    const utilizationUrl = `${normalizeServerUrl(serverUrl)}/webapi/entry.cgi?api=SYNO.Core.System.Utilization&version=1&method=get&_sid=${sid}`;
    const utilizationResponse = await fetch(utilizationUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    const ping = Date.now() - startTime;

    if (utilizationResponse.ok) {
      const utilizationData = await utilizationResponse.json();
      
      if (utilizationData.success && utilizationData.data) {
        let cpuUsage = 0;
        if (utilizationData.data.cpu) {
          const cpu = utilizationData.data.cpu;
          const userLoad = cpu.user_load || 0;
          const systemLoad = cpu.system_load || 0;
          
          if (userLoad < 1 && systemLoad < 1) {
            cpuUsage = (userLoad + systemLoad) * 100;
          } else {
            cpuUsage = userLoad + systemLoad;
          }
        }

        let memoryUsage = 0;
        if (utilizationData.data.memory) {
          memoryUsage = utilizationData.data.memory.real_usage || 0;
        }

        let totalRx = 0;
        let totalTx = 0;
        if (utilizationData.data.network && Array.isArray(utilizationData.data.network)) {
          const totalInterface = utilizationData.data.network.find((iface: any) => iface.device === 'total');
          if (totalInterface) {
            totalRx = totalInterface.rx || 0;
            totalTx = totalInterface.tx || 0;
          } else {
            utilizationData.data.network.forEach((iface: any) => {
              totalRx += iface.rx || 0;
              totalTx += iface.tx || 0;
            });
          }
        }

        return {
          cpu: Math.min(100, Math.max(0, cpuUsage)),
          memory: Math.min(100, Math.max(0, memoryUsage)),
          network: { rx: totalRx, tx: totalTx },
          ping,
        };
      }
    }
  } catch (error) {
    console.error("获取系统信息失败:", error);
  }
  return null;
}

export async function getStorageInfo(
  serverUrl: string,
  sid: string
): Promise<number | null> {
  try {
    const url = `${normalizeServerUrl(serverUrl)}/webapi/entry.cgi?api=SYNO.Storage.CGI.Storage&version=1&method=load_info&_sid=${sid}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json() as StorageInfoResponse;
      
      if (data.success && data.data?.volumes && data.data.volumes.length > 0) {
        let totalUsed = 0;
        let totalSize = 0;
        
        data.data.volumes.forEach((volume) => {
          if (volume.status === "normal" && volume.size) {
            const totalStr = volume.size.total_device || volume.size.total || "0";
            const usedStr = volume.size.used || "0";
            const used = parseFloat(usedStr) || 0;
            const total = parseFloat(totalStr) || 0;
            totalUsed += used;
            totalSize += total;
          }
        });

        if (totalSize > 0) {
          return (totalUsed / totalSize) * 100;
        }
      }
    }
  } catch (error) {
    console.error("获取存储信息失败:", error);
  }
  return null;
}

export function formatNetworkSpeed(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B/s`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB/s`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB/s`;
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB/s`;
  }
}

export async function getMonitorData(
  settings: SynologySettings
): Promise<{
  cpu: number;
  memory: number;
  disk: number;
  network: { rx: number; tx: number };
  ping: number;
  online: boolean;
} | null> {
  const serverUrl = normalizeServerUrl(settings.serverUrl);
  if (!serverUrl || !settings.username || !settings.password) {
    return null;
  }

  const sid = await login(serverUrl, settings.username, settings.password);
  if (!sid) {
    return null;
  }

  try {
    const [systemInfo, diskUsage] = await Promise.all([
      getSystemInfo(serverUrl, sid),
      getStorageInfo(serverUrl, sid),
    ]);

    if (systemInfo) {
      return {
        cpu: systemInfo.cpu,
        memory: systemInfo.memory,
        disk: diskUsage || 0,
        network: systemInfo.network,
        ping: systemInfo.ping,
        online: true,
      };
    }
  } catch (error) {
    console.error("获取监控数据失败:", error);
  }

  return null;
}
