// 京东多合一 Widget
// 基于 Scripting 框架

import {
  Button,
  Font,
  Form,
  HStack,
  Image,
  Navigation,
  Section,
  Spacer,
  Text,
  VStack,
} from 'scripting'

// ============================================================
// MARK: - 存储
// ============================================================

const SETTINGS_KEY = 'jd_settings'

type JDSettings = {
  cookie: string
  username: string
}

// ============================================================
// MARK: - API
// ============================================================

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'

async function getUserInfo(cookie: string) {
  const res = await fetch('https://me-api.jd.com/user_new/info/GetJDUserInfoUnion?isLogin=1', {
    headers: { 'Cookie': cookie, 'User-Agent': UA },
  })
  return res.json()
}

async function getJingxiangValue(cookie: string) {
  const body = encodeURIComponent(JSON.stringify({
    paramData: { token: 'a243ca12-6642-4754-bc5e-0ff012681710' }
  }))
  const res = await fetch(`https://api.m.jd.com/?functionId=pg_channel_page_data&appid=vip_h5&body=${body}`, {
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

async function getRedPackage(cookie: string) {
  const res = await fetch('https://wq.jd.com/user/info/QueryUserRedEnvelopesV2?type=1&orgFlag=JD_PinGou_New&page=1&cashRedType=1&redBalanceFlag=1&channel=3&sceneval=2&g_login_type=1', {
    headers: {
      'Cookie': cookie,
      'User-Agent': UA,
      'Referer': 'https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&',
    },
  })
  return res.json()
}

async function getJintie(cookie: string) {
  const res = await fetch('https://ms.jr.jd.com/gw/generic/uc/h5/m/mySubsidyBalance', {
    headers: {
      'Cookie': cookie,
      'User-Agent': UA,
      'Referer': 'https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&',
    },
  })
  return res.json()
}

async function getGangbeng(cookie: string) {
  const res = await fetch('https://coin.jd.com/m/gb/getBaseInfo.html', {
    headers: {
      'Cookie': cookie,
      'User-Agent': UA,
      'Referer': 'https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&',
    },
  })
  return res.json()
}

async function getFarm(cookie: string) {
  const res = await fetch('https://api.m.jd.com/client.action?functionId=initForFarm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0',
      'Cookie': cookie,
    },
    body: 'body=version:4&appid=wh5&clientVersion=9.1.0',
  })
  return res.json()
}

// ============================================================
// MARK: - 数据获取
// ============================================================

interface JDData {
  nickname: string
  avatarUrl: string
  beanCount: string
  isPlus: boolean
  xbKeepScore: string
  baitiaoAmount: string
  baitiaoTitle: string
  jintie: string
  farmProgress: string
}

async function fetchAllData(cookie: string): Promise<JDData> {
  const data: JDData = {
    nickname: '',
    avatarUrl: 'https://img11.360buyimg.com/jdphoto/s120x120_jfs/t21160/90/706848746/2813/d1060df5/5b163ef9N4a3d7aa6.png',
    beanCount: '0',
    isPlus: false,
    xbKeepScore: '',
    baitiaoAmount: '',
    baitiaoTitle: '',
    jintie: '',
    farmProgress: '',
  }

  try {
    const userInfo = await getUserInfo(cookie)
    if (userInfo.retcode === '0' && userInfo.data) {
      data.nickname = userInfo.data.userInfo.baseInfo.nickname
      const imgUrl = userInfo.data.userInfo.baseInfo.headImageUrl?.replace(/big/, 'mid')
      if (imgUrl) data.avatarUrl = imgUrl
      data.beanCount = userInfo.data.assetInfo.beanNum?.toString() || '0'
      data.isPlus = userInfo.data.userInfo.isPlusVip === '1'
      data.xbKeepScore = userInfo.data.userInfo.xbKeepScore?.toString() || ''
    }
  } catch (e) { console.log('用户信息获取失败:', e) }

  try {
    const bt = await getBaitiao(cookie)
    if (bt.resultCode === 0) {
      data.baitiaoTitle = bt.resultData.data.bill.title
      data.baitiaoAmount = bt.resultData.data.bill.amount
    }
  } catch (e) { console.log('白条获取失败:', e) }

  try {
    const jt = await getJintie(cookie)
    if (jt.resultCode === 0) data.jintie = jt.resultData.data.balance?.toString() || ''
  } catch (e) { console.log('金贴获取失败:', e) }

  try {
    const fm = await getFarm(cookie)
    if (fm.farmUserPro) {
      data.farmProgress = Math.floor((fm.farmUserPro.treeEnergy / fm.farmUserPro.treeTotalEnergy) * 100) + '%'
    }
  } catch (e) { console.log('农场获取失败:', e) }

  return data
}

// ============================================================
// MARK: - 登录
// ============================================================

async function login(): Promise<JDSettings | null> {
  const controller = new WebViewController()
  await controller.loadURL('https://mcr.jd.com/credit_home/pages/index.html?btPageType=BT&channelName=024')
  await controller.present({ navigationTitle: '京东登录' })

  const cookies = await controller.getAllCookies()
  controller.dispose()

  const cookieParts: string[] = []
  let username = ''

  for (const item of cookies) {
    const value = `${item.name}=${item.value}`
    if (item.name === 'pt_key') cookieParts.push(value)
    if (item.name === 'pt_pin') {
      username = item.value
      cookieParts.push(value)
    }
  }

  const cookie = cookieParts.join('; ')

  if (cookie && username) {
    const settings: JDSettings = { cookie, username }
    Storage.set(SETTINGS_KEY, settings)
    console.log(`登录成功: ${decodeURIComponent(username)}`)
    return settings
  }

  console.log('登录失败')
  return null
}

function logout() {
  Storage.set(SETTINGS_KEY, { cookie: '', username: '' })
  console.log('已退出登录')
}

// ============================================================
// MARK: - UI
// ============================================================

function SettingsPage({ data }: { data: JDData | null }) {
  const dismiss = Navigation.useDismiss()
  const settings = Storage.get<JDSettings>(SETTINGS_KEY) ?? { cookie: '', username: '' }
  const isLoggedIn = !!settings.cookie && !!settings.username

  const handleLogin = () => {
    login().then((result) => {
      if (result) dismiss()
    }).catch((e) => console.error('登录失败:', e))
  }

  const handleLogout = () => {
    logout()
    dismiss()
  }

  return (
    <VStack>
      <Form navigationTitle="京东多合一" navigationBarTitleDisplayMode="inline">
        <Section header={<Text>账号状态</Text>}>
          {isLoggedIn && data ? (
            <HStack alignment="center" spacing={12}>
              <Image imageUrl={data.avatarUrl} resizable scaleToFit frame={{ width: 40, height: 40 }} clipShape="circle" />
              <VStack alignment="leading" spacing={4}>
                <Text font="headline">{data.nickname}</Text>
                <Text font="caption" foregroundStyle="secondaryLabel">已登录</Text>
              </VStack>
            </HStack>
          ) : (
            <HStack alignment="center" spacing={12}>
              <Image systemName="person.circle" foregroundStyle="systemGray" frame={{ width: 40, height: 40 }} />
              <VStack alignment="leading" spacing={4}>
                <Text font="headline" foregroundStyle="secondaryLabel">未登录</Text>
                <Text font="caption" foregroundStyle="tertiaryLabel">点击下方按钮登录</Text>
              </VStack>
            </HStack>
          )}
        </Section>

        {isLoggedIn && data ? (
          <Section header={<Text>账号信息</Text>}>
            <HStack>
              <Text>京豆</Text>
              <Spacer />
              <Text foregroundStyle="secondaryLabel">{data.beanCount}</Text>
            </HStack>
            <HStack>
              <Text>PLUS会员</Text>
              <Spacer />
              <Text foregroundStyle={data.isPlus ? "systemGreen" : "secondaryLabel"}>
                {data.isPlus ? "是" : "否"}
              </Text>
            </HStack>
            {data.xbKeepScore ? (
              <HStack>
                <Text>信誉分</Text>
                <Spacer />
                <Text foregroundStyle="secondaryLabel">{data.xbKeepScore}</Text>
              </HStack>
            ) : null}
            {data.jingxiang ? (
              <HStack>
                <Text>京享值</Text>
                <Spacer />
                <Text foregroundStyle="secondaryLabel">{data.jingxiang}</Text>
              </HStack>
            ) : null}
            {data.baitiaoAmount ? (
              <HStack>
                <Text>{data.baitiaoTitle}</Text>
                <Spacer />
                <Text foregroundStyle="secondaryLabel">¥{data.baitiaoAmount}</Text>
              </HStack>
            ) : null}
            {data.redPacket ? (
              <HStack>
                <Text>红包</Text>
                <Spacer />
                <Text foregroundStyle="secondaryLabel">¥{data.redPacket}</Text>
              </HStack>
            ) : null}
            {data.jintie ? (
              <HStack>
                <Text>金贴</Text>
                <Spacer />
                <Text foregroundStyle="secondaryLabel">{data.jintie}</Text>
              </HStack>
            ) : null}
            {data.gangbeng ? (
              <HStack>
                <Text>钢镚</Text>
                <Spacer />
                <Text foregroundStyle="secondaryLabel">{data.gangbeng}</Text>
              </HStack>
            ) : null}
            {data.farmProgress ? (
              <HStack>
                <Text>农场进度</Text>
                <Spacer />
                <Text foregroundStyle="secondaryLabel">{data.farmProgress}</Text>
              </HStack>
            ) : null}
          </Section>
        ) : null}

        <Section header={<Text>操作</Text>}>
          {isLoggedIn ? (
            <Button title="退出登录" foregroundStyle="systemRed" action={handleLogout} />
          ) : (
            <Button title="登录京东" action={handleLogin} />
          )}
        </Section>
      </Form>
      <Spacer />
    </VStack>
  )
}

// ============================================================
// MARK: - 入口
// ============================================================

async function main() {
  const settings = Storage.get<JDSettings>(SETTINGS_KEY) ?? { cookie: '', username: '' }
  const isLoggedIn = !!settings.cookie && !!settings.username

  let data: JDData | null = null
  if (isLoggedIn) {
    data = await fetchAllData(settings.cookie)
    console.log(`京豆 ${data.beanCount}`)
    console.log(`昵称 ${data.nickname}`)
    console.log(`PLUS ${data.isPlus ? '是' : '否'}`)
    console.log(`信誉分 ${data.xbKeepScore}`)
    if (data.jingxiang) console.log(`京享值 ${data.jingxiang}`)
    if (data.baitiaoAmount) console.log(`白条 ${data.baitiaoTitle} ${data.baitiaoAmount}`)
    if (data.redPacket) console.log(`红包 ${data.redPacket}元`)
    if (data.jintie) console.log(`金贴 ${data.jintie}`)
    if (data.gangbeng) console.log(`钢镚 ${data.gangbeng}`)
    if (data.farmProgress) console.log(`农场 ${data.farmProgress}`)
  }

  Navigation.present(<SettingsPage data={data} />)
}

main()
