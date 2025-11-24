import {
  Widget,
  VStack,
  HStack,
  Text,
  Spacer,
  fetch,
  DynamicShapeStyle,
  WidgetReloadPolicy,
  ZStack,
  Image,
} from "scripting"

// 设置结构定义
type MoviePilotPTSettings = {
  serverUrl: string
  username: string
  password: string
  refreshInterval: number
  sortByDanger?: boolean
}

const SETTINGS_KEY = "moviePilotPTSettings"

// API 响应类型
type LoginResponse = {
  access_token: string
  token_type: string
  super_user: boolean
  user_id: number
  user_name: string
  avatar: string
  level: number
  permissions: Record<string, any>
  widzard: boolean
}

type SiteStatisticResponse = {
  render_mode: string
  page: Array<{
    component: string
    content: Array<any>
  }>
}

type SiteStatistic = {
  totalUpload: string
  totalDownload: string
  totalSeeding: string
  totalSeedingSize: string
  sites: Array<{
    name: string
    username: string | null
    userLevel: string | null
    upload: string
    download: string
    ratio: number
    bonus: string
    seeding: number
    seedingSize: string
  }>
}

// URL 编码辅助函数
function encodeFormData(data: Record<string, string>): string {
  return Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join("&")
}

// 获取认证 Token
async function getAccessToken(serverUrl: string, username: string, password: string): Promise<string | null> {
  try {
    const url = `${serverUrl}/api/v1/login/access-token`
    const formData = {
      username: username,
      password: password,
      grant_type: "password",
      scope: "",
      client_id: "string",
      client_secret: "********",
      otp_password: "string",
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: encodeFormData(formData),
    })

    if (response.ok) {
      const data = await response.json() as LoginResponse
      console.log("✅ 登录成功")
      console.log("📋 Token 信息:", {
        access_token: data.access_token.substring(0, 20) + "...",
        token_type: data.token_type,
        user_name: data.user_name,
        user_id: data.user_id,
        super_user: data.super_user,
        level: data.level,
      })
      return data.access_token
    } else {
      console.error("❌ 登录失败，状态码:", response.status)
      const errorText = await response.text()
      console.error("❌ 错误响应:", errorText)
    }
  } catch (error) {
    console.error("🚨 登录请求异常:", error)
  }
  return null
}

// 从 Vuetify 页面结构中提取统计数据
function extractStatisticData(response: SiteStatisticResponse): SiteStatistic | null {
  try {
    console.log("🔍 开始解析统计数据...")
    console.log("📋 响应结构:", {
      render_mode: response.render_mode,
      page_count: response.page?.length || 0,
      first_page_component: response.page?.[0]?.component,
    })
    
    const page = response.page?.[0]
    if (!page) {
      console.error("❌ 页面结构无效: 缺少 page")
      return null
    }

    // page[0] 本身就是 VRow 组件
    if (page.component !== "VRow") {
      console.error(`❌ 页面结构无效: 期望 VRow，实际是 ${page.component}`)
      return null
    }

    if (!page.content || !Array.isArray(page.content)) {
      console.error("❌ 页面结构无效: 缺少 VRow 的 content 或 content 不是数组")
      console.error("📋 page 结构:", JSON.stringify(page, null, 2))
      return null
    }

    const cols = page.content.filter((item: any) => item.component === "VCol")
    console.log(`📊 找到 ${cols.length} 个 VCol 组件`)
    
    // 提取统计卡片数据
    let totalUpload = "0.0B"
    let totalDownload = "0.0B"
    let totalSeeding = "0"
    let totalSeedingSize = "0.0B"

    // 前4个卡片是统计数据
    console.log("🔍 开始提取统计卡片数据...")
    for (let i = 0; i < Math.min(4, cols.length); i++) {
      const col = cols[i]
      const card = col.content?.[0]
      if (!card || card.component !== "VCard") {
        console.warn(`⚠️ 第 ${i + 1} 个 VCol 中没有找到 VCard`)
        continue
      }

      const cardText = card.content?.[0]
      if (!cardText || cardText.component !== "VCardText") {
        console.warn(`⚠️ 第 ${i + 1} 个 VCard 中没有找到 VCardText`)
        continue
      }

      const textContent = cardText.content?.[1]
      if (!textContent || !textContent.content) {
        console.warn(`⚠️ 第 ${i + 1} 个 VCardText 中没有找到文本内容`)
        continue
      }

      const label = textContent.content[0]?.text
      const value = textContent.content[1]?.content?.[0]?.text

      console.log(`📋 卡片 ${i + 1}:`, {
        标签: label,
        值: value,
        完整结构: JSON.stringify(textContent.content, null, 2),
      })

      if (label === "总上传量") {
        totalUpload = value || "0.0B"
      } else if (label === "总下载量") {
        totalDownload = value || "0.0B"
      } else if (label === "总做种数") {
        totalSeeding = value || "0"
      } else if (label === "总做种体积") {
        totalSeedingSize = value || "0.0B"
      }
    }

    console.log("📊 提取的统计数据:", {
      总上传量: totalUpload,
      总下载量: totalDownload,
      总做种数: totalSeeding,
      总做种体积: totalSeedingSize,
    })

    // 提取表格数据
    console.log("🔍 开始提取表格数据...")
    const tableCol = cols.find((col: any) => {
      const content = col.content?.[0]
      return content?.component === "VTable"
    })

    const sites: SiteStatistic["sites"] = []
    if (tableCol) {
      console.log("✅ 找到 VTable 组件")
      const table = tableCol.content[0]
      const tbody = table.content?.find((item: any) => item.component === "tbody")
      if (tbody && tbody.content) {
        console.log(`📋 找到 ${tbody.content.length} 行表格数据`)
        tbody.content.forEach((row: any, index: number) => {
          if (row.component === "tr" && row.content) {
            const cells = row.content.filter((cell: any) => cell.component === "td")
            if (cells.length >= 9) {
              // 处理 ratio：可能是数字或字符串
              const ratioText = cells[5]?.text
              let ratio = 0
              if (typeof ratioText === "number") {
                ratio = ratioText
              } else if (typeof ratioText === "string") {
                ratio = parseFloat(ratioText.replace(/,/g, "")) || 0
              }

              // 处理 bonus：移除逗号
              const bonusText = cells[6]?.text
              const bonus = typeof bonusText === "string" 
                ? bonusText.replace(/,/g, "") 
                : (bonusText?.toString() || "0.0")

              // 处理 seeding：可能是数字或字符串
              const seedingText = cells[7]?.text
              let seeding = 0
              if (typeof seedingText === "number") {
                seeding = seedingText
              } else if (typeof seedingText === "string") {
                seeding = parseInt(seedingText.replace(/,/g, "")) || 0
              }

              const siteData = {
                name: cells[0]?.text || "",
                username: cells[1]?.text || null,
                userLevel: cells[2]?.text || null,
                upload: cells[3]?.text || "0.0B",
                download: cells[4]?.text || "0.0B",
                ratio: ratio,
                bonus: bonus,
                seeding: seeding,
                seedingSize: cells[8]?.text || "0.0B",
              }
              sites.push(siteData)
              console.log(`📋 站点 ${index + 1}:`, {
                站点: siteData.name,
                用户名: siteData.username,
                用户等级: siteData.userLevel,
                上传: siteData.upload,
                下载: siteData.download,
                分享率: siteData.ratio,
                魔力值: siteData.bonus,
                做种数: siteData.seeding,
                做种体积: siteData.seedingSize,
              })
            } else {
              console.warn(`⚠️ 第 ${index + 1} 行数据不完整，只有 ${cells.length} 个单元格`)
            }
          }
        })
      } else {
        console.warn("⚠️ 未找到 tbody 或 tbody.content")
      }
    } else {
      console.warn("⚠️ 未找到 VTable 组件")
    }

    const result = {
      totalUpload,
      totalDownload,
      totalSeeding,
      totalSeedingSize,
      sites,
    }

    console.log("✅ 数据提取完成，共提取", sites.length, "个站点")
    return result
  } catch (error) {
    console.error("❌ 解析统计数据失败:", error)
    return null
  }
}

// 获取站点统计数据
async function getSiteStatistic(serverUrl: string, token: string): Promise<SiteStatistic | null> {
  try {
    const url = `${serverUrl}/api/v1/plugin/page/SiteStatistic`
    const response = await fetch(url, {
      headers: {
        "accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })

    if (response.ok) {
      const data = await response.json() as SiteStatisticResponse
      console.log("✅ 获取统计数据成功")
      console.log("📋 原始响应结构:", {
        render_mode: data.render_mode,
        page_count: data.page?.length || 0,
        first_page_component: data.page?.[0]?.component,
        first_page_content_count: data.page?.[0]?.content?.length || 0,
      })
      
      // 打印完整的原始响应（用于调试）
      console.log("📋 完整原始响应:", JSON.stringify(data, null, 2))
      
      const statistic = extractStatisticData(data)
      if (statistic) {
        console.log("📊 解析后的统计数据:", {
          totalUpload: statistic.totalUpload,
          totalDownload: statistic.totalDownload,
          totalSeeding: statistic.totalSeeding,
          totalSeedingSize: statistic.totalSeedingSize,
          sites_count: statistic.sites.length,
          active_sites: statistic.sites.filter(s => s.username !== null).length,
        })
        console.log("📋 站点列表详情:", statistic.sites.map(s => ({
          name: s.name,
          username: s.username,
          upload: s.upload,
          download: s.download,
          ratio: s.ratio,
        })))
      }
      return statistic
    } else {
      console.error("❌ 获取统计数据失败，状态码:", response.status)
      const errorText = await response.text()
      console.error("❌ 错误响应:", errorText)
    }
  } catch (error) {
    console.error("❌ 获取统计数据失败:", error)
  }
  return null
}

// 统计卡片组件
function StatCard({
  title,
  value,
  icon,
  iconColor,
  compact = false,
}: {
  title: string
  value: string
  icon: string
  iconColor: DynamicShapeStyle
  compact?: boolean
}) {
  if (compact) {
    return (
      <HStack
        alignment="center"
        padding={{ top: 10, leading: 10, bottom: 10, trailing: 10 }}
        spacing={2}
        frame={{ minWidth: 0, maxWidth: Infinity }}
        widgetBackground={{
          style: {
            light: "rgba(30, 102, 245, 0.1)",
            dark: "rgba(140, 170, 238, 0.12)",
          },
          shape: {
            type: "rect",
            cornerRadius: 8,
            style: "continuous",
          },
        }}
      >
        {/* 左侧图标 */}
        <Image
          systemName={icon}
          font={20}
          fontWeight="medium"
          foregroundStyle={iconColor}
        />
        {/* 右侧标题和数据 */}
        <VStack alignment="leading" spacing={3} frame={{ minWidth: 0, maxWidth: Infinity }}>
          <Text
            font={15}
            fontWeight="medium"
            foregroundStyle={{
              light: "#5c5f77",
              dark: "#b5bfe2",
            }}
            lineLimit={1}
            minScaleFactor={0.8}
          >
            {title}
          </Text>
          <Text
            font={15}
            fontWeight="bold"
            foregroundStyle={{
              light: "#4c4f69",
              dark: "#c6d0f5",
            }}
            lineLimit={1}
            minScaleFactor={0.6}
          >
            {value}
          </Text>
        </VStack>
      </HStack>
    )
  }

  return (
    <VStack
      alignment="center"
      padding={{ top: 6, leading: 6, bottom: 6, trailing: 6 }}
      spacing={3}
      frame={{ minWidth: 0, maxWidth: Infinity }}
      widgetBackground={{
        style: {
          light: "rgba(30, 102, 245, 0.1)",
          dark: "rgba(140, 170, 238, 0.12)",
          },
        shape: {
          type: "rect",
          cornerRadius: 6,
          style: "continuous",
        },
      }}
    >
      <Image
        systemName={icon}
        font={12}
        fontWeight="medium"
        foregroundStyle={iconColor}
      />
      <VStack alignment="center" spacing={1} frame={{ minWidth: 0, maxWidth: Infinity }}>
        <Text
          font={8}
          fontWeight="medium"
          foregroundStyle={{
            light: "#5c5f77",
            dark: "#b5bfe2",
          }}
          lineLimit={1}
          minScaleFactor={0.8}
          frame={{ minWidth: 0, maxWidth: Infinity }}
        >
          {title}
        </Text>
        <Text
          font={11}
          fontWeight="bold"
          foregroundStyle={{
            light: "#4c4f69",
            dark: "#c6d0f5",
          }}
          lineLimit={1}
          minScaleFactor={0.6}
          frame={{ minWidth: 0, maxWidth: Infinity }}
        >
          {value}
        </Text>
      </VStack>
    </VStack>
  )
}

// 表格表头组件
function TableHeader({
  titleStyle,
}: {
  titleStyle: DynamicShapeStyle
}) {
  return (
    <HStack
      alignment="center"
      padding={{ top: 6, leading: 4, bottom: 6, trailing: 4 }}
      spacing={1}
      frame={{ minWidth: 0, maxWidth: Infinity }}
      widgetBackground={{
        style: {
          light: "rgba(204, 208, 218, 0.5)",
          dark: "rgba(65, 69, 89, 0.3)",
        },
        shape: {
          type: "rect",
          cornerRadius: 4,
          style: "continuous",
        },
      }}
    >
      <Text font={9} fontWeight="semibold" foregroundStyle={titleStyle} frame={{ width: 50 }} lineLimit={1} minScaleFactor={0.7}>
        站点
      </Text>
      <Text font={9} fontWeight="semibold" foregroundStyle={titleStyle} frame={{ width: 60 }} lineLimit={1} minScaleFactor={0.6}>
        上传量
      </Text>
      <Text font={9} fontWeight="semibold" foregroundStyle={titleStyle} frame={{ width: 60 }} lineLimit={1} minScaleFactor={0.6}>
        下载量
      </Text>
      <Text font={9} fontWeight="semibold" foregroundStyle={titleStyle} frame={{ width: 40 }} lineLimit={1} minScaleFactor={0.7}>
        分享率
      </Text>
      <Text font={9} fontWeight="semibold" foregroundStyle={titleStyle} frame={{ width: 35 }} lineLimit={1} minScaleFactor={0.7}>
        做种数
      </Text>
      <Text font={9} fontWeight="semibold" foregroundStyle={titleStyle} frame={{ width: 60 }} lineLimit={1} minScaleFactor={0.6}>
        做种体积
      </Text>
    </HStack>
  )
}

// 站点表格行组件
function SiteTableRow({
  site,
  titleStyle,
  descStyle,
}: {
  site: SiteStatistic["sites"][0]
  titleStyle: DynamicShapeStyle
  descStyle: DynamicShapeStyle
}) {
  const hasData = site.username !== null

  return (
    <HStack
      alignment="center"
      padding={{ top: 6, leading: 4, bottom: 6, trailing: 4 }}
      spacing={1}
      frame={{ minWidth: 0, maxWidth: Infinity }}
      widgetBackground={{
        style: {
          light: "rgba(204, 208, 218, 0.3)",
          dark: "rgba(65, 69, 89, 0.15)",
        },
        shape: {
          type: "rect",
          cornerRadius: 4,
          style: "continuous",
        },
      }}
    >
      {/* 站点名称 */}
      <Text
        font={10}
        fontWeight="semibold"
        foregroundStyle={titleStyle}
        frame={{ width: 50 }}
        lineLimit={1}
        minScaleFactor={0.7}
      >
        {site.name}
      </Text>

      {/* 上传量 */}
      <Text
        font={9}
        fontWeight="medium"
        foregroundStyle={{
          light: "#40a02b",
          dark: "#a6d189",
        }}
        frame={{ width: 60 }}
        lineLimit={1}
        minScaleFactor={0.5}
      >
        {hasData ? site.upload : "-"}
      </Text>

      {/* 下载量 */}
      <Text
        font={9}
        fontWeight="medium"
        foregroundStyle={{
          light: "#d20f39",
          dark: "#e78284",
        }}
        frame={{ width: 60 }}
        lineLimit={1}
        minScaleFactor={0.5}
      >
        {hasData ? site.download : "-"}
      </Text>

      {/* 分享率 */}
      <Text
        font={9}
        fontWeight="medium"
        foregroundStyle={descStyle}
        frame={{ width: 40 }}
        lineLimit={1}
        minScaleFactor={0.7}
      >
        {hasData ? (site.ratio >= 100 ? "∞" : site.ratio.toFixed(2)) : "-"}
      </Text>

      {/* 做种数 */}
      <Text
        font={9}
        fontWeight="medium"
        foregroundStyle={descStyle}
        frame={{ width: 35 }}
        lineLimit={1}
        minScaleFactor={0.7}
      >
        {hasData ? site.seeding.toString() : "-"}
      </Text>

      {/* 做种体积 */}
      <Text
        font={9}
        fontWeight="medium"
        foregroundStyle={descStyle}
        frame={{ width: 60 }}
        lineLimit={1}
        minScaleFactor={0.5}
      >
        {hasData ? site.seedingSize : "-"}
      </Text>
    </HStack>
  )
}

// 中等尺寸组件视图
function MediumWidgetView({
  statistic,
  titleStyle,
  descStyle,
}: {
  statistic: SiteStatistic
  titleStyle: DynamicShapeStyle
  descStyle: DynamicShapeStyle
}) {
  return (
    <VStack 
      alignment="leading" 
      padding={{ top: 8, leading: 8, bottom: 8, trailing: 8 }} 
      spacing={6}
      frame={{ minWidth: 0, maxWidth: Infinity }}
    >
      {/* 标题行 */}
      <HStack alignment="center" spacing={4} frame={{ minWidth: 0, maxWidth: Infinity }}>
        <Image
          systemName="server.rack"
          font={12}
          fontWeight="medium"
          foregroundStyle={{
            light: "#1e66f5",
            dark: "#8caaee",
          }}
        />
        <Text
          font={11}
          fontWeight="bold"
          foregroundStyle={titleStyle}
          lineLimit={1}
          minScaleFactor={0.8}
        >
          MoviePilot PT
        </Text>
        <Spacer />
      </HStack>

      {/* 第一行统计卡片 */}
      <HStack alignment="center" spacing={4} frame={{ minWidth: 0, maxWidth: Infinity }}>
        <StatCard
          title="总上传量"
          value={statistic.totalUpload}
          icon="arrow.up.circle.fill"
          iconColor={{
            light: "#1e66f5",
            dark: "#8caaee",
          }}
          compact={true}
        />
        <StatCard
          title="总下载量"
          value={statistic.totalDownload}
          icon="arrow.down.circle.fill"
          iconColor={{
            light: "#d20f39",
            dark: "#e78284",
          }}
          compact={true}
        />
      </HStack>

      {/* 第二行统计卡片 */}
      <HStack alignment="center" spacing={4} frame={{ minWidth: 0, maxWidth: Infinity }}>
        <StatCard
          title="总做种数"
          value={statistic.totalSeeding}
          icon="leaf.fill"
          iconColor={{
            light: "#40a02b",
            dark: "#a6d189",
          }}
          compact={true}
        />
        <StatCard
          title="做种体积"
          value={statistic.totalSeedingSize}
          icon="externaldrive.fill"
          iconColor={{
            light: "#fe640b",
            dark: "#ef9f76",
          }}
          compact={true}
        />
      </HStack>
    </VStack>
  )
}

// 大尺寸组件视图
function LargeWidgetView({
  statistic,
  titleStyle,
  descStyle,
}: {
  statistic: SiteStatistic
  titleStyle: DynamicShapeStyle
  descStyle: DynamicShapeStyle
}) {
  const settings = Storage.get<MoviePilotPTSettings>(SETTINGS_KEY)
  const sortByDanger = settings?.sortByDanger ?? false
  
  let validSites = statistic.sites.filter((s) => s.username !== null)
  
  // 如果启用了危险度排序，按分享率升序排序（分享率越低越靠前）
  if (sortByDanger) {
    validSites = [...validSites].sort((a, b) => {
      // 处理分享率为 null 或 undefined 的情况
      const ratioA = a.ratio ?? 0
      const ratioB = b.ratio ?? 0
      return ratioA - ratioB
    })
  }
  
  const totalSites = statistic.sites.length
  const activeSites = validSites.length

  return (
    <ZStack>
      <VStack alignment="leading" padding={{ top: 25, leading: 10, bottom: 10, trailing: 10 }} spacing={8}>
        {/* 标题行：标题靠左，刷新时间靠右 */}
        <HStack alignment="center" spacing={0} frame={{ minWidth: 0, maxWidth: Infinity }}>
          <Image
            systemName="server.rack"
            font={20}
            fontWeight="medium"
            foregroundStyle={{
              light: "#1e66f5",
              dark: "#8caaee",
            }}
          />
          <VStack alignment="leading" spacing={1} frame={{ minWidth: 0, maxWidth: Infinity }} padding={{ leading: -150 }}>
            <Text
              font={12}
              fontWeight="bold"
              foregroundStyle={titleStyle}
              lineLimit={1}
            >
              MoviePilot PT
            </Text>
            <Text
              font={10}
              foregroundStyle={descStyle}
              lineLimit={1}
            >
              {activeSites}/{totalSites} 站点活跃
            </Text>
          </VStack>
          <Spacer />
          <HStack alignment="center" spacing={4}>
            <Image
              systemName="arrow.clockwise"
              font={9}
              fontWeight="medium"
              foregroundStyle={{
                light: "#7c7f93",
                dark: "#949cbb",
              }}
            />
            <Text
              font={10}
              fontWeight="medium"
              foregroundStyle={{
                light: "#7c7f93",
                dark: "#949cbb",
              }}
              lineLimit={1}
            >
              {new Date().toLocaleTimeString("zh-CN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </Text>
          </HStack>
        </HStack>

        {/* 统计卡片 */}
        <HStack alignment="center" spacing={6}>
          <StatCard
            title="总上传量"
            value={statistic.totalUpload}
            icon="arrow.up.circle.fill"
            iconColor={{
              light: "#1e66f5",
              dark: "#8caaee",
            }}
          />
          <StatCard
            title="总下载量"
            value={statistic.totalDownload}
            icon="arrow.down.circle.fill"
            iconColor={{
              light: "#d20f39",
              dark: "#e78284",
            }}
          />
          <StatCard
            title="总做种数"
            value={statistic.totalSeeding}
            icon="leaf.fill"
            iconColor={{
              light: "#40a02b",
              dark: "#a6d189",
            }}
          />
          <StatCard
            title="总做种体积"
            value={statistic.totalSeedingSize}
            icon="externaldrive.fill"
            iconColor={{
              light: "#fe640b",
              dark: "#ef9f76",
            }}
          />
        </HStack>

        {/* 站点表格 */}
        {validSites.length > 0 ? (
          <VStack alignment="leading" spacing={3}>
            <Text
              font={11}
              fontWeight="semibold"
              foregroundStyle={titleStyle}
            >
              站点列表
            </Text>
            {/* 表头 */}
            <TableHeader titleStyle={titleStyle} />
            {/* 表格行 */}
            <VStack alignment="leading" spacing={2}>
              {validSites.slice(0, 8).map((site, index) => (
                <SiteTableRow
                  key={index}
                  site={site}
                  titleStyle={titleStyle}
                  descStyle={descStyle}
                />
              ))}
              {validSites.length > 8 ? (
                <HStack alignment="center" frame={{ minWidth: 0, maxWidth: Infinity }} padding={{ top: 4 }}>
                  <Text
                    font={9}
                    foregroundStyle={{
                      light: "#7c7f93",
                      dark: "#949cbb",
                    }}
                  >
                    还有 {validSites.length - 8} 个站点...
                  </Text>
                </HStack>
              ) : null}
            </VStack>
          </VStack>
        ) : (
          <VStack alignment="center" spacing={4} padding={{ top: 20 }}>
            <Text font={12} foregroundStyle={descStyle}>
              暂无有效站点数据
            </Text>
          </VStack>
        )}

        <Spacer />
      </VStack>
    </ZStack>
  )
}

function WidgetView({
  statistic,
}: {
  statistic: SiteStatistic
}) {
  const titleStyle: DynamicShapeStyle = {
    light: "#5c5f77",
    dark: "#b5bfe2",
  }
  const descStyle: DynamicShapeStyle = {
    light: "#4c4f69",
    dark: "#c6d0f5",
  }

  // 只支持 medium 和 large 两种尺寸
  if (Widget.family === "systemMedium") {
    return <MediumWidgetView statistic={statistic} titleStyle={titleStyle} descStyle={descStyle} />
  }

  // 默认使用 large 尺寸
  return <LargeWidgetView statistic={statistic} titleStyle={titleStyle} descStyle={descStyle} />
}

// 规范化服务器地址
function normalizeServerUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return trimmed
  // 如果没有协议，添加 http://
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `http://${trimmed}`
  }
  return trimmed
}

async function render() {
  const settings = Storage.get<MoviePilotPTSettings>(SETTINGS_KEY)

  const refreshInterval = settings?.refreshInterval ?? 15
  const nextUpdate = new Date(Date.now() + refreshInterval * 60 * 1000)
  const reloadPolicy: WidgetReloadPolicy = {
    policy: "after",
    date: nextUpdate,
  }

  if (!settings || !settings.serverUrl || !settings.username || !settings.password) {
    Widget.present(
      <Text>请先在主应用中设置服务器地址、用户名和密码。</Text>,
      reloadPolicy
    )
    return
  }

  const serverUrl = normalizeServerUrl(settings.serverUrl)

  // 获取认证 Token
  const token = await getAccessToken(serverUrl, settings.username, settings.password)
  if (!token) {
    Widget.present(<Text>登录失败，请检查服务器地址和账号密码。</Text>, reloadPolicy)
    return
  }

  // 获取站点统计数据
  const statistic = await getSiteStatistic(serverUrl, token)

  if (!statistic) {
    Widget.present(<Text>获取数据失败，请检查网络连接。</Text>, reloadPolicy)
    return
  }

  Widget.present(<WidgetView statistic={statistic} />, reloadPolicy)
}

render()