import {
  Button,
  Form,
  HStack,
  List,
  Navigation,
  NavigationStack,
  Script,
  Section,
  Spacer,
  Text,
  TextField,
  Toggle,
  useState,
  VStack,
  Widget,
} from "scripting"

const API_BASE = "https://wechatapp.ecej.com/livingpay/v3/xcx"
const SALT = "8796135e9f8349d998345f9f13d8bd95"
const SETTINGS_KEY = "xinao_gas_settings"
const VERSION = "1.0.0"

// MD5 简易实现
function md5(str: string): string {
  function L(k: number, d: number): number { return (k << d) | (k >>> (32 - d)) }
  function K(G: number, k: number): number {
    var I, d, F, H, x
    F = (G & 2147483648); H = (k & 2147483648)
    I = (G & 1073741824); d = (k & 1073741824)
    x = (G & 1073741823) + (k & 1073741823)
    if (I & d) return (x ^ 2147483648 ^ F ^ H)
    if (I | d) { if (x & 1073741824) return (x ^ 3221225472 ^ F ^ H); else return (x ^ 1073741824 ^ F ^ H) }
    else return (x ^ F ^ H)
  }
  function r(d: number, F: number, k: number): number { return (d & F) | ((~d) & k) }
  function q(d: number, F: number, k: number): number { return (d & k) | (F & (~k)) }
  function p(d: number, F: number, k: number): number { return (d ^ F ^ k) }
  function n(d: number, F: number, k: number): number { return (F ^ (d | (~k))) }
  function u(G: number, F: number, aa: number, Z: number, k: number, H: number, I: number): number {
    G = K(G, K(K(r(F, aa, Z), k), I)); return K(L(G, H), F)
  }
  function f(G: number, F: number, aa: number, Z: number, k: number, H: number, I: number): number {
    G = K(G, K(K(q(F, aa, Z), k), I)); return K(L(G, H), F)
  }
  function D(G: number, F: number, aa: number, Z: number, k: number, H: number, I: number): number {
    G = K(G, K(K(p(F, aa, Z), k), I)); return K(L(G, H), F)
  }
  function t(G: number, F: number, aa: number, Z: number, k: number, H: number, I: number): number {
    G = K(G, K(K(n(F, aa, Z), k), I)); return K(L(G, H), F)
  }
  function e(G: string): number[] {
    var k: number; var F = G.length; var x = F + 8; var Z = (x - (x % 64)) / 64; var H = (Z + 1) * 16
    var aa = Array(H - 1); var d = 0; var I = 0
    while (I < F) { k = (I - (I % 4)) / 4; d = (I % 4) * 8; aa[k] = (aa[k] | (G.charCodeAt(I) << d)); I++ }
    k = (I - (I % 4)) / 4; d = (I % 4) * 8; aa[k] = aa[k] | (128 << d); aa[H - 2] = F << 3; aa[H - 1] = F >>> 29; return aa
  }
  function B(x: number): string {
    var k = ""; var F: number = 0; var Z: number
    for (Z = 0; Z <= 3; Z++) { F = (x >>> (Z * 8)) & 255; var d = "0" + F.toString(16); k = k + d.substr(d.length - 2, 2) }
    return k
  }
  var C: number[] = []; var P: number, h: number, E: number, v: number, g: number, Y: number, X: number, V: number, U: number
  var S = 7, Q = 12, N = 17, M = 22; var A = 5, z = 9, y = 14, w = 20; var o = 4, m = 11, l = 16, j = 23; var W = 6, T = 10, R = 15, O = 21
  var i = e(str)
  Y = 1732584193; X = 4023233417; V = 2562383102; U = 271733878
  for (P = 0; P < i.length; P += 16) {
    h = Y; E = X; v = V; g = U
    Y = u(Y, X, V, U, i[P + 0], S, 3614090360); U = u(U, Y, X, V, i[P + 1], Q, 3905402710)
    V = u(V, U, Y, X, i[P + 2], N, 606105819); X = u(X, V, U, Y, i[P + 3], M, 3250441966)
    Y = u(Y, X, V, U, i[P + 4], S, 4118548399); U = u(U, Y, X, V, i[P + 5], Q, 1200080426)
    V = u(V, U, Y, X, i[P + 6], N, 2821735955); X = u(X, V, U, Y, i[P + 7], M, 4249261313)
    Y = u(Y, X, V, U, i[P + 8], S, 1770035416); U = u(U, Y, X, V, i[P + 9], Q, 2336552879)
    V = u(V, U, Y, X, i[P + 10], N, 4294925233); X = u(X, V, U, Y, i[P + 11], M, 2304563134)
    Y = u(Y, X, V, U, i[P + 12], S, 1804603682); U = u(U, Y, X, V, i[P + 13], Q, 4254626195)
    V = u(V, U, Y, X, i[P + 14], N, 2792965006); X = u(X, V, U, Y, i[P + 15], M, 1236535329)
    Y = f(Y, X, V, U, i[P + 1], A, 4129170786); U = f(U, Y, X, V, i[P + 6], z, 3225465664)
    V = f(V, U, Y, X, i[P + 11], y, 643717713); X = f(X, V, U, Y, i[P + 0], w, 3921069994)
    Y = f(Y, X, V, U, i[P + 5], A, 3593408605); U = f(U, Y, X, V, i[P + 10], z, 38016083)
    V = f(V, U, Y, X, i[P + 15], y, 3634488961); X = f(X, V, U, Y, i[P + 4], w, 3889429448)
    Y = f(Y, X, V, U, i[P + 9], A, 568446438); U = f(U, Y, X, V, i[P + 14], z, 3275163606)
    V = f(V, U, Y, X, i[P + 3], y, 4107603335); X = f(X, V, U, Y, i[P + 8], w, 1163531501)
    Y = f(Y, X, V, U, i[P + 13], A, 2850285829); U = f(U, Y, X, V, i[P + 2], z, 4243563512)
    V = f(V, U, Y, X, i[P + 7], y, 1735328473); X = f(X, V, U, Y, i[P + 12], w, 2368359562)
    Y = D(Y, X, V, U, i[P + 5], o, 4294588738); U = D(U, Y, X, V, i[P + 8], m, 2272392833)
    V = D(V, U, Y, X, i[P + 11], l, 1839030562); X = D(X, V, U, Y, i[P + 14], j, 4259657740)
    Y = D(Y, X, V, U, i[P + 1], o, 2763975236); U = D(U, Y, X, V, i[P + 4], m, 1272893353)
    V = D(V, U, Y, X, i[P + 7], l, 4139469664); X = D(X, V, U, Y, i[P + 10], j, 3200236656)
    Y = D(Y, X, V, U, i[P + 13], o, 681279174); U = D(U, Y, X, V, i[P + 0], m, 3936430074)
    V = D(V, U, Y, X, i[P + 3], l, 3572445317); X = D(X, V, U, Y, i[P + 6], j, 76029189)
    Y = D(Y, X, V, U, i[P + 9], o, 3654602809); U = D(U, Y, X, V, i[P + 12], m, 3873151461)
    V = D(V, U, Y, X, i[P + 15], l, 530742520); X = D(X, V, U, Y, i[P + 2], j, 3299628645)
    Y = t(Y, X, V, U, i[P + 0], W, 4096336452); U = t(U, Y, X, V, i[P + 7], T, 1126891415)
    V = t(V, U, Y, X, i[P + 14], R, 2878612391); X = t(X, V, U, Y, i[P + 5], O, 4237533241)
    Y = t(Y, X, V, U, i[P + 12], W, 1700485571); U = t(U, Y, X, V, i[P + 3], T, 2399980690)
    V = t(V, U, Y, X, i[P + 10], R, 4293915773); X = t(X, V, U, Y, i[P + 1], O, 2240044497)
    Y = t(Y, X, V, U, i[P + 8], W, 1873313359); U = t(U, Y, X, V, i[P + 15], T, 4264355552)
    V = t(V, U, Y, X, i[P + 6], R, 2734768916); X = t(X, V, U, Y, i[P + 13], O, 1309151649)
    Y = t(Y, X, V, U, i[P + 4], W, 4149444226); U = t(U, Y, X, V, i[P + 11], T, 3174756917)
    V = t(V, U, Y, X, i[P + 2], R, 718787259); X = t(X, V, U, Y, i[P + 9], O, 3951481745)
    Y = K(Y, h); X = K(X, E); V = K(V, v); U = K(U, g)
  }
  return (B(Y) + B(X) + B(V) + B(U)).toLowerCase()
}

function genAppKey(): string {
  const now = new Date()
  const pad = (n: number) => n < 10 ? "0" + n : "" + n
  const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  return ts + md5(ts + SALT)
}

function makeHeaders(token: string) {
  return {
    "Content-Type": "application/x-www-form-urlencoded",
    "token": token,
    "token-type": "2",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 27_0 like Mac OS X)",
    "Referer": "https://servicewechat.com/wxd722317df8c566fe/258/page-frame.html",
  }
}

async function getCards(token: string) {
  const appKey = genAppKey()
  const res = await fetch(`${API_BASE}/getBingCardListV2.json`, {
    method: "POST",
    headers: makeHeaders(token),
    body: `token=${token}&appKey=${appKey}&clientType=gaswx&moduleCode=0`,
  })
  const json = await res.json()
  if (json.resultCode !== 200) throw new Error(json.message || "获取卡列表失败")
  return json.data as any[]
}

async function getBill(token: string, companyCode: string, platformCardNo: string) {
  const appKey = genAppKey()
  const params = `token=${token}&clientType=gaswx&appKey=${appKey}&companyCode=${companyCode}&platformOnlyCardNo=${platformCardNo}`
  const res = await fetch(`${API_BASE}/getBillV2.json?${params}`, {
    method: "GET",
    headers: {
      "token": token,
      "token-type": "2",
      "Content-Type": "application/json;charset=UTF-8",
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 27_0 like Mac OS X)",
      "Referer": "https://servicewechat.com/wxd722317df8c566fe/258/page-frame.html",
    },
  })
  const json = await res.json()
  if (json.resultCode !== 200) throw new Error(json.message || "获取账单失败")
  return json.data
}

// 从 BoxJs 读取 Token
async function fetchTokenFromBoxJs(boxJsUrl: string): Promise<string | null> {
  try {
    const url = `${boxJsUrl.replace(/\/$/, "")}/query/data/xinao_gas.token`
    const response = await fetch(url, { headers: { "Accept": "application/json" } })
    if (response.ok) {
      const data = await response.json()
      const token = data?.val
      if (token && typeof token === "string" && token.trim()) return token.trim()
    }
  } catch (error) {
    console.log("从 BoxJs 读取 Token 异常:", error)
  }
  return null
}

type Settings = {
  enableBoxJs: boolean
  boxJsUrl: string
  token: string
}

type LogEntry = {
  ts: string
  api: string
  ok: boolean
  detail: string
}

const LOG_KEY = "xinao_gas_logs"

function SettingsPage() {
  const saved = Storage.get<Settings>(SETTINGS_KEY)
  const [enableBoxJs, setEnableBoxJs] = useState(saved?.enableBoxJs ?? false)
  const [boxJsUrl, setBoxJsUrl] = useState(saved?.boxJsUrl ?? "http://boxjs.com")
  const [token, setToken] = useState(saved?.token ?? "")
  const [logs, setLogs] = useState<LogEntry[]>(Storage.get<LogEntry[]>(LOG_KEY) ?? [])

  function handleSave() {
    Storage.set<Settings>(SETTINGS_KEY, { enableBoxJs, boxJsUrl, token })
    Script.exit()
  }

  function refreshLogs() {
    setLogs(Storage.get<LogEntry[]>(LOG_KEY) ?? [])
  }

  function clearLogs() {
    Storage.set<LogEntry[]>(LOG_KEY, [])
    setLogs([])
  }

  return (
    <VStack>
      <Form>
        <Section
          header={<Text>BoxJs 配置</Text>}
          footer={<Text>开启后将从 BoxJs 读取 xinao_gas.token。开启后优先使用 BoxJs 中的 Token。</Text>}
        >
          <Toggle title="启用 BoxJs" value={enableBoxJs} onChanged={setEnableBoxJs} />
          {enableBoxJs ? (
            <TextField title="BoxJs 地址" value={boxJsUrl} prompt="例如：http://boxjs.com" onChanged={setBoxJsUrl} />
          ) : null}
        </Section>

        <Section
          header={<Text>手动配置</Text>}
          footer={<Text>如果不使用 BoxJs，可在此手动输入 Token。从微信小程序抓包获取。</Text>}
        >
          <TextField title="Token" value={token} onChanged={setToken} prompt="粘贴抓包获取的 Token" />
        </Section>

        <Button title="保存设置" action={handleSave} />

        <Section
          header={<Text>请求日志</Text>}
          footer={<Text>显示最近 20 条 API 请求记录</Text>}
        >
          <Button title="刷新日志" action={refreshLogs} />
          {logs.length === 0 ? (
            <Text foregroundStyle="secondaryLabel">暂无日志</Text>
          ) : (
            logs.slice().reverse().map((log, i) => (
              <HStack key={i} frame={{ maxWidth: Infinity }}>
                <VStack alignment="leading" spacing={2}>
                  <HStack spacing={4}>
                    <Text font="caption2" foregroundStyle={log.ok ? "systemGreen" : "systemRed"}>
                      {log.ok ? "✓" : "✗"}
                    </Text>
                    <Text font="caption2" fontWeight="medium">{log.api}</Text>
                    <Text font="caption2" foregroundStyle="tertiaryLabel">{log.ts}</Text>
                  </HStack>
                  <Text font="caption2" foregroundStyle="secondaryLabel" lineLimit={1}>
                    {log.detail}
                  </Text>
                </VStack>
              </HStack>
            ))
          )}
          {logs.length > 0 ? (
            <Button title="清空日志" action={clearLogs} foregroundStyle="systemRed" />
          ) : null}
        </Section>
      </Form>
      <Spacer />
      <VStack alignment="center" spacing={4} padding={{ bottom: 10 }}>
        <HStack alignment="center" spacing={4}>
          <Text font="caption2" foregroundStyle="secondaryLabel">开发：</Text>
          <Text font="caption2" foregroundStyle="accentColor">@DTZSGHNR</Text>
        </HStack>
        <Text font="caption2" foregroundStyle="secondaryLabel">Version {VERSION}</Text>
      </VStack>
    </VStack>
  )
}

async function run() {
  await Navigation.present({ element: <SettingsPage /> })
  Script.exit()
}

run()
