// 京东多合一小组件
// 顶部：JD Logo + 大标题 + 副标题 + JD Dog
// 下方：昵称/京豆 + 信誉分/白条

import {
  HStack,
  Image,
  Spacer,
  Text,
  VStack,
  Widget
} from 'scripting'

// 颜色常量
const TITLE_COLOR = '#f9f9fa'     // 主标题文字 — 浅灰白
const SUBTITLE_COLOR = '#e1e1e4'  // 副标题文字 — 稍深灰
const SECONDARY_COLOR = '#e1e1e4' // 次要元素 — 纯白

// 图片链接
const JD_LOGO_URL = 'https://raw.githubusercontent.com/Nanako718/Scripting/main/images/jdlogo.PNG'
const JD_DOG_URL = 'https://raw.githubusercontent.com/Nanako718/Scripting/main/images/jddog.PNG'

// 数据接口
interface JDData {
  nickname: string
  beanCount: string
  xbKeepScore: string
  baitiaoAmount: string
  baitiaoTitle: string
}

// 存储
const SETTINGS_KEY = 'jd_settings'

function loadSettings(): { cookie: string; username: string } {
  return Storage.get(SETTINGS_KEY) ?? { cookie: '', username: '' }
}

// API
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'

async function getUserInfo(cookie: string) {
  const res = await fetch('https://me-api.jd.com/user_new/info/GetJDUserInfoUnion?isLogin=1', {
    headers: { 'Cookie': cookie, 'User-Agent': UA },
  })
  return res.json()
}

async function getBaitiao(cookie: string) {
  const res = await fetch('https://ms.jr.jd.com/gw/generic/bt/h5/m/firstScreenNew', {
    method: 'POST',
    headers: { 'Cookie': cookie, 'User-Agent': UA },
    body: 'reqData={"clientType":"ios","clientVersion":"13.2.3","deviceId":"","environment":"3"}',
  })
  return res.json()
}

// 获取数据
async function fetchWidgetData(cookie: string): Promise<JDData> {
  const data: JDData = {
    nickname: '',
    beanCount: '0',
    xbKeepScore: '',
    baitiaoAmount: '',
    baitiaoTitle: '',
  }

  try {
    const userInfo = await getUserInfo(cookie)
    if (userInfo.retcode === '0' && userInfo.data) {
      data.nickname = userInfo.data.userInfo.baseInfo.nickname
      data.beanCount = userInfo.data.assetInfo.beanNum?.toString() || '0'
      data.xbKeepScore = userInfo.data.userInfo.xbKeepScore?.toString() || ''
    }
  } catch (e) { }

  try {
    const bt = await getBaitiao(cookie)
    if (bt.resultCode === 0) {
      data.baitiaoTitle = bt.resultData.data.bill.title
      data.baitiaoAmount = bt.resultData.data.bill.amount
    }
  } catch (e) { }

  return data
}

// 组件视图
const WidgetView = ({ data }: { data: JDData }) => {
  return (
    <VStack padding={{ top: 5, leading: 14, bottom: 12, trailing: 14 }} spacing={0}>
      {/* 标题行：Logo + 标题 + JD Dog */}
      <HStack alignment="center" padding={{ bottom: 0 }} spacing={6}>
        <Image
          imageUrl={JD_LOGO_URL}
          resizable
          scaleToFit
          frame={{ width: 38, height: 38 }}
        />
        <VStack alignment="leading" spacing={1}>
          <Text font="subheadline" fontWeight="bold" foregroundStyle={TITLE_COLOR}>京东</Text>
          <Text font="caption2" foregroundStyle={SUBTITLE_COLOR}>多·快·好·省</Text>
        </VStack>
        <Spacer />
        <Image
          imageUrl={JD_DOG_URL}
          resizable
          scaleToFit
          frame={{ width: 72, height: 72 }}
        />
      </HStack>

      {/* 数据卡片 - 2x2 网格 */}
      <VStack spacing={4}>
        {/* 第一行：昵称 + 京豆 */}
        <HStack spacing={4}>
          <VStack
            alignment="leading"
            spacing={2}
            padding={10}
            frame={{ maxWidth: Infinity }}
            widgetBackground={{
              style: { light: "rgba(0,0,0,0.05)", dark: "rgba(255,255,255,0.08)" },
              shape: { type: "rect", cornerRadius: 10, style: "continuous" },
            }}
          >
            <Text font={9} foregroundStyle={SUBTITLE_COLOR}>昵称</Text>
            <Text font={14} fontWeight="semibold" foregroundStyle={TITLE_COLOR} lineLimit={1}>
              {data.nickname}
            </Text>
          </VStack>

          <VStack
            alignment="leading"
            spacing={2}
            padding={10}
            frame={{ maxWidth: Infinity }}
            widgetBackground={{
              style: { light: "rgba(0,0,0,0.05)", dark: "rgba(255,255,255,0.08)" },
              shape: { type: "rect", cornerRadius: 10, style: "continuous" },
            }}
          >
            <Text font={9} foregroundStyle={SUBTITLE_COLOR}>京豆</Text>
            <Text font={14} fontWeight="bold" foregroundStyle="#FF6B00">
              {data.beanCount}
            </Text>
          </VStack>
        </HStack>

        {/* 第二行：信誉分 + 当月待还 */}
        <HStack spacing={4}>
          <VStack
            alignment="leading"
            spacing={2}
            padding={10}
            frame={{ maxWidth: Infinity }}
            widgetBackground={{
              style: { light: "rgba(0,0,0,0.05)", dark: "rgba(255,255,255,0.08)" },
              shape: { type: "rect", cornerRadius: 10, style: "continuous" },
            }}
          >
            <Text font={9} foregroundStyle={SUBTITLE_COLOR}>信誉分</Text>
            <Text font={14} fontWeight="bold" foregroundStyle={TITLE_COLOR}>
              {data.xbKeepScore || '-'}
            </Text>
          </VStack>

          <VStack
            alignment="leading"
            spacing={2}
            padding={10}
            frame={{ maxWidth: Infinity }}
            widgetBackground={{
              style: { light: "rgba(0,0,0,0.05)", dark: "rgba(255,255,255,0.08)" },
              shape: { type: "rect", cornerRadius: 10, style: "continuous" },
            }}
          >
            <Text font={9} foregroundStyle={SUBTITLE_COLOR}>
              {data.baitiaoTitle || '当月待还'}
            </Text>
            <Text font={14} fontWeight="bold" foregroundStyle="#eed49f">
              {data.baitiaoAmount ? `¥${data.baitiaoAmount}` : '-'}
            </Text>
          </VStack>
        </HStack>
      </VStack>
    </VStack>
  )
}

// 组件运行逻辑
const runWidget = async () => {
  const settings = loadSettings()
  const { cookie, username } = settings

  if (!cookie || !username) {
    Widget.present(
      <VStack
        alignment="center"
        spacing={8}
        padding={16}
        frame={{ maxWidth: 'infinity', maxHeight: 'infinity' }}
      >
        <Image
          imageUrl={JD_LOGO_URL}
          resizable
          scaleToFit
          frame={{ width: 40, height: 40 }}
        />
        <Text font="headline" foregroundStyle={SECONDARY_COLOR}>
          京东多合一
        </Text>
        <Text font="caption" foregroundStyle={SECONDARY_COLOR}>
          请先在 App 中登录
        </Text>
      </VStack>
    )
    return
  }

  const data = await fetchWidgetData(cookie)
  Widget.present(<WidgetView data={data} />)
}

runWidget()
