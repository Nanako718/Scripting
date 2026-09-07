import { fetch } from "scripting";

export type ChartMetricKey = "cpu" | "temp" | "ram" | "tx" | "rx";

export type SynologySettings = {
  serverUrl: string;
  username: string;
  password: string;
  deviceName?: string;
  chartMetrics?: ChartMetricKey[];
};

// ─────────────────────────────────────────────
// 登录返回
// ─────────────────────────────────────────────

type LoginResponse = {
  success: boolean;
  data?: {
    sid?: string;
  };
};

// ─────────────────────────────────────────────
// 存储返回
// ─────────────────────────────────────────────

type StorageInfoResponse = {
  success: boolean;
  data?: {
    volumes?: Array<{
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

// ─────────────────────────────────────────────
// 温度
// ─────────────────────────────────────────────

export type SynologyTemperature = {
  system: number | null;
  gpu: number | null;
};

// ─────────────────────────────────────────────
// 风扇
// ─────────────────────────────────────────────

export type SynologyFan = {
  id: number;
  rpm: number;
};

// ─────────────────────────────────────────────
// 网络
// ─────────────────────────────────────────────

export type SynologyNetwork = {
  rx: number;
  tx: number;
};

// ─────────────────────────────────────────────
// 系统信息
// ─────────────────────────────────────────────

export type SynologySystemInfo = {
  cpu: number;
  memory: number;
  network: SynologyNetwork;

  // HTTP API 响应时间
  latency: number;
};

// ─────────────────────────────────────────────
// 最终监控数据
// ─────────────────────────────────────────────

export type SynologyMonitorData = {
  cpu: number;
  memory: number;
  disk: number;

  network: SynologyNetwork;

  // HTTP API 延迟
  latency: number;

  temperature: SynologyTemperature;

  fans: SynologyFan[];

  online: boolean;
};

// ─────────────────────────────────────────────
// 标准化服务器地址
// ─────────────────────────────────────────────

export function normalizeServerUrl(
  url: string
): string {
  const trimmed = url.trim();

  if (!trimmed) {
    return trimmed;
  }

  if (
    !trimmed.startsWith("http://") &&
    !trimmed.startsWith("https://")
  ) {
    return `https://${trimmed}`;
  }

  return trimmed.replace(/\/+$/, "");
}

// ─────────────────────────────────────────────
// 登录
// ─────────────────────────────────────────────

export async function login(
  serverUrl: string,
  username: string,
  password: string
): Promise<string | null> {
  try {
    const baseUrl =
      normalizeServerUrl(serverUrl);

    // 查询 Auth API 版本
    const apiInfoUrl =
      `${baseUrl}/webapi/query.cgi` +
      `?api=SYNO.API.Info` +
      `&version=1` +
      `&method=query` +
      `&query=SYNO.API.Auth`;

    const apiInfoResponse =
      await fetch(apiInfoUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

    let authVersion = "3";

    if (apiInfoResponse.ok) {
      try {
        const apiInfo =
          await apiInfoResponse.json();

        if (
          apiInfo?.data?.["SYNO.API.Auth"]?.maxVersion
        ) {
          authVersion = String(
            apiInfo.data[
              "SYNO.API.Auth"
            ].maxVersion
          );
        }
      } catch {
        // 使用默认版本
      }
    }

    // 登录
    const url =
      `${baseUrl}/webapi/auth.cgi` +
      `?api=SYNO.API.Auth` +
      `&version=${authVersion}` +
      `&method=login` +
      `&account=${encodeURIComponent(username)}` +
      `&passwd=${encodeURIComponent(password)}` +
      `&session=FileStation` +
      `&format=sid`;

    const response =
      await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

    if (!response.ok) {
      console.error(
        "❌ 登录 HTTP 错误:",
        response.status
      );

      return null;
    }

    const data =
      await response.json() as LoginResponse;

    if (
      data.success &&
      data.data?.sid
    ) {
      console.log(
        "✅ 群晖登录成功"
      );

      return data.data.sid;
    }

    console.error(
      "❌ 群晖登录失败:",
      data
    );
  } catch (error) {
    console.error(
      "❌ 群晖登录异常:",
      error
    );
  }

  return null;
}

// ─────────────────────────────────────────────
// 登出
// ─────────────────────────────────────────────

export async function logout(
  serverUrl: string,
  sid: string
): Promise<void> {
  try {
    const url =
      `${normalizeServerUrl(serverUrl)}/webapi/auth.cgi` +
      `?api=SYNO.API.Auth` +
      `&version=3` +
      `&method=logout` +
      `&session=FileStation` +
      `&_sid=${encodeURIComponent(sid)}`;

    await fetch(url, {
      method: "GET",
    });
  } catch {
    // 忽略登出错误
  }
}

// ─────────────────────────────────────────────
// CPU / 内存 / 网络
// ─────────────────────────────────────────────

export async function getSystemInfo(
  serverUrl: string,
  sid: string
): Promise<SynologySystemInfo | null> {
  try {
    const startTime =
      Date.now();

    const url =
      `${normalizeServerUrl(serverUrl)}/webapi/entry.cgi` +
      `?api=SYNO.Core.System.Utilization` +
      `&version=1` +
      `&method=get` +
      `&_sid=${encodeURIComponent(sid)}`;

    const response =
      await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

    const latency =
      Date.now() - startTime;

    if (!response.ok) {
      console.error(
        "❌ 获取系统信息 HTTP 错误:",
        response.status
      );

      return null;
    }

    const data =
      await response.json();

    if (
      !data.success ||
      !data.data
    ) {
      console.error(
        "❌ 获取系统信息失败:",
        data
      );

      return null;
    }

    // ─────────────────────
    // CPU
    // ─────────────────────

    let cpuUsage = 0;

    if (data.data.cpu) {
      const cpu =
        data.data.cpu;

      const userLoad =
        Number(
          cpu.user_load || 0
        );

      const systemLoad =
        Number(
          cpu.system_load || 0
        );

      if (
        userLoad < 1 &&
        systemLoad < 1
      ) {
        cpuUsage =
          (userLoad +
            systemLoad) *
          100;
      } else {
        cpuUsage =
          userLoad +
          systemLoad;
      }
    }

    // ─────────────────────
    // 内存
    // ─────────────────────

    let memoryUsage = 0;

    if (data.data.memory) {
      memoryUsage =
        Number(
          data.data.memory
            .real_usage || 0
        );
    }

    // ─────────────────────
    // 网络
    // ─────────────────────

    let totalRx = 0;
    let totalTx = 0;

    if (
      Array.isArray(
        data.data.network
      )
    ) {
      const totalInterface =
        data.data.network.find(
          (iface: any) =>
            iface.device ===
            "total"
        );

      if (totalInterface) {
        totalRx =
          Number(
            totalInterface.rx || 0
          );

        totalTx =
          Number(
            totalInterface.tx || 0
          );
      } else {
        data.data.network.forEach(
          (iface: any) => {
            totalRx +=
              Number(
                iface.rx || 0
              );

            totalTx +=
              Number(
                iface.tx || 0
              );
          }
        );
      }
    }

    return {
      cpu: Math.min(
        100,
        Math.max(0, cpuUsage)
      ),

      memory: Math.min(
        100,
        Math.max(0, memoryUsage)
      ),

      network: {
        rx: totalRx,
        tx: totalTx,
      },

      latency,
    };
  } catch (error) {
    console.error(
      "❌ 获取系统信息异常:",
      error
    );
  }

  return null;
}

// ─────────────────────────────────────────────
// 存储
// ─────────────────────────────────────────────

export async function getStorageInfo(
  serverUrl: string,
  sid: string
): Promise<number | null> {
  try {
    const url =
      `${normalizeServerUrl(serverUrl)}/webapi/entry.cgi` +
      `?api=SYNO.Storage.CGI.Storage` +
      `&version=1` +
      `&method=load_info` +
      `&_sid=${encodeURIComponent(sid)}`;

    const response =
      await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

    if (!response.ok) {
      console.error(
        "❌ 获取存储信息 HTTP 错误:",
        response.status
      );

      return null;
    }

    const data =
      await response.json() as StorageInfoResponse;

    if (
      data.success &&
      data.data?.volumes &&
      data.data.volumes.length > 0
    ) {
      let totalUsed = 0;
      let totalSize = 0;

      data.data.volumes.forEach(
        (volume) => {
          if (
            volume.status ===
              "normal" &&
            volume.size
          ) {
            const totalStr =
              volume.size
                .total_device ||
              volume.size.total ||
              "0";

            const usedStr =
              volume.size.used ||
              "0";

            const total =
              parseFloat(
                totalStr
              ) || 0;

            const used =
              parseFloat(
                usedStr
              ) || 0;

            totalUsed +=
              used;

            totalSize +=
              total;
          }
        }
      );

      if (totalSize > 0) {
        return (
          (totalUsed /
            totalSize) *
          100
        );
      }
    }
  } catch (error) {
    console.error(
      "❌ 获取存储信息异常:",
      error
    );
  }

  return null;
}

// ─────────────────────────────────────────────
// 温度 + 风扇
//
// 根据你实际 DSM 返回：
//
// data.sys_temp
// data.gpu.temperature_c
// data.fan_list
// ─────────────────────────────────────────────

export async function getTemperature(
  serverUrl: string,
  sid: string
): Promise<{
  temperature: SynologyTemperature;
  fans: SynologyFan[];
}> {
  const temperature: SynologyTemperature = {
    system: null,
    gpu: null,
  };

  const fans: SynologyFan[] = [];

  try {
    const baseUrl =
      normalizeServerUrl(
        serverUrl
      );

    const url =
      `${baseUrl}/webapi/entry.cgi` +
      `?api=SYNO.Core.System` +
      `&version=1` +
      `&method=info` +
      `&_sid=${encodeURIComponent(sid)}`;

    const response =
      await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

    if (!response.ok) {
      console.error(
        "❌ 获取温度 HTTP 错误:",
        response.status
      );

      return {
        temperature,
        fans,
      };
    }

    const data =
      await response.json();

    if (
      !data.success ||
      !data.data
    ) {
      console.error(
        "❌ 获取系统温度失败:",
        data
      );

      return {
        temperature,
        fans,
      };
    }

    // ─────────────────────
    // 系统温度
    // ─────────────────────

    if (
      data.data.sys_temp !==
        undefined &&
      data.data.sys_temp !==
        null
    ) {
      const value =
        Number(
          data.data.sys_temp
        );

      if (
        Number.isFinite(value)
      ) {
        temperature.system =
          value;

        console.log(
          `🌡️ NAS 温度: ${value}°C`
        );
      }
    }

    // ─────────────────────
    // GPU 温度
    // ─────────────────────

    if (
      data.data.gpu?.temperature_c !==
        undefined &&
      data.data.gpu?.temperature_c !==
        null
    ) {
      const value =
        Number(
          data.data.gpu
            .temperature_c
        );

      if (
        Number.isFinite(value)
      ) {
        temperature.gpu =
          value;

        console.log(
          `🎮 GPU 温度: ${value}°C`
        );
      }
    }

    // ─────────────────────
    // 风扇
    //
    // 你的返回：
    //
    // "fan_list": [
    //   1205
    // ]
    // ─────────────────────

    if (
      Array.isArray(
        data.data.fan_list
      )
    ) {
      data.data.fan_list.forEach(
        (
          rpmValue: any,
          index: number
        ) => {
          const rpm =
            Number(rpmValue);

          if (
            Number.isFinite(rpm)
          ) {
            fans.push({
              id: index + 1,
              rpm,
            });

            console.log(
              `🌀 风扇 ${
                index + 1
              }: ${rpm} RPM`
            );
          }
        }
      );
    }

    // ─────────────────────
    // 温度警告
    // ─────────────────────

    if (
      data.data.sys_tempwarn !==
        undefined
    ) {
      console.log(
        `🌡️ 温度警告: ${
          data.data.sys_tempwarn
            ? "是"
            : "否"
        }`
      );
    }

    return {
      temperature,
      fans,
    };
  } catch (error) {
    console.error(
      "❌ 获取温度异常:",
      error
    );
  }

  return {
    temperature,
    fans,
  };
}

// ─────────────────────────────────────────────
// 网络速度格式化
// ─────────────────────────────────────────────

export function formatNetworkSpeed(
  bytes: number
): string {
  if (bytes < 1024) {
    return `${bytes} B/s`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB/s`;
  }

  if (
    bytes <
    1024 *
      1024 *
      1024
  ) {
    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB/s`;
  }

  return `${(
    bytes /
    (1024 *
      1024 *
      1024)
  ).toFixed(1)} GB/s`;
}

// ─────────────────────────────────────────────
// 获取完整监控数据
// ─────────────────────────────────────────────

export async function getMonitorData(
  settings: SynologySettings
): Promise<SynologyMonitorData | null> {
  const serverUrl =
    normalizeServerUrl(
      settings.serverUrl
    );

  if (
    !serverUrl ||
    !settings.username ||
    !settings.password
  ) {
    console.error(
      "❌ 群晖配置不完整"
    );

    return null;
  }

  // ─────────────────────
  // 登录
  // ─────────────────────

  const sid =
    await login(
      serverUrl,
      settings.username,
      settings.password
    );

  if (!sid) {
    return null;
  }

  try {
    // ─────────────────────
    // 并行请求
    // ─────────────────────

    const [
      systemInfo,
      diskUsage,
      temperatureInfo,
    ] = await Promise.all([
      getSystemInfo(
        serverUrl,
        sid
      ),

      getStorageInfo(
        serverUrl,
        sid
      ),

      getTemperature(
        serverUrl,
        sid
      ),
    ]);

    if (!systemInfo) {
      console.error(
        "❌ 系统信息获取失败"
      );

      return null;
    }

    const monitorData:
      SynologyMonitorData = {
      cpu: systemInfo.cpu,

      memory:
        systemInfo.memory,

      disk:
        diskUsage ?? 0,

      network:
        systemInfo.network,

      latency:
        systemInfo.latency,

      temperature:
        temperatureInfo.temperature,

      fans:
        temperatureInfo.fans,

      online: true,
    };

    // ─────────────────────
    // 控制台输出
    // ─────────────────────

    console.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );

    console.log(
      "📊 群晖监控数据"
    );

    console.log(
      `🖥️ CPU: ${monitorData.cpu.toFixed(0)}%`
    );

    console.log(
      `🧠 内存: ${monitorData.memory.toFixed(0)}%`
    );

    console.log(
      `💾 存储: ${monitorData.disk.toFixed(1)}%`
    );

    console.log(
      `🌡️ NAS 温度: ${
        monitorData.temperature.system ??
        "未知"
      }°C`
    );

    console.log(
      `🎮 GPU 温度: ${
        monitorData.temperature.gpu ??
        "未知"
      }°C`
    );

    console.log(
      `🌀 风扇: ${
        monitorData.fans
          .map(
            (fan) =>
              `${fan.rpm} RPM`
          )
          .join(", ") ||
        "未知"
      }`
    );

    console.log(
      `📥 RX: ${formatNetworkSpeed(
        monitorData.network.rx
      )}`
    );

    console.log(
      `📤 TX: ${formatNetworkSpeed(
        monitorData.network.tx
      )}`
    );

    console.log(
      `⏱️ API 延迟: ${monitorData.latency} ms`
    );

    console.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );

    return monitorData;
  } catch (error) {
    console.error(
      "❌ 获取监控数据异常:",
      error
    );
  }

  return null;
}