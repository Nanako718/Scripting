// 一汽大众设置页
// version: 2026-09-21-2310 ui-v2.6-agibot-font
// Dialog / Storage / Device 等为 Scripting 全局对象，禁止从 'scripting' import Dialog

import { Button, List, Navigation, NavigationStack, Picker, Script, Section, SecureField, Text, TextField, Toggle, HStack, Spacer, Image, Widget, useRef, useState } from 'scripting'
import { getSession, hasVehicleAccountSession, getFawVwDeviceUuid } from './api'
import { login, logout } from './auth'
import { getVehicleList, getDefaultBasicVehicle, getDefaultFullVehicle, getCurrentEntitlement } from './vehicle'
import { requestTencentCaptcha } from './tencent-captcha'
import { provinces } from './oilPriceApi'
import type { BasicVehicleData, FullVehicleData, VehicleListData } from './types'

// 中型组件样式（与 widget.tsx / widgetUiStyle.ts 使用同一 Storage key）
type WidgetUiStyle = 'classic' | 'magotan'
const WIDGET_UI_STYLE_KEY = 'yqdz_widget_ui_style'
const widgetUiStyleOptions: { label: string; value: WidgetUiStyle }[] = [
  { label: '第一套·经典', value: 'classic' },
  { label: '第二套·MAGOTAN', value: 'magotan' },
]
const readWidgetUiStyle = (): WidgetUiStyle => {
  const stored = Storage.get<string>(WIDGET_UI_STYLE_KEY)
  return stored === 'magotan' ? 'magotan' : 'classic'
}
const writeWidgetUiStyle = (style: WidgetUiStyle): void => {
  Storage.set(WIDGET_UI_STYLE_KEY, style)
}

// ============ 油价设置 ============

type OilSettings = {
  oilGrade: string
  tankCapacity: string
  useManualProvince: boolean
  manualProvinceId: string
}

const OIL_SETTINGS_KEY = 'oilPriceSettings'

const defaultOilSettings: OilSettings = {
  oilGrade: '95',
  tankCapacity: '',
  useManualProvince: false,
  manualProvinceId: '33',
}

const getOilSettings = (): OilSettings => {
  return Storage.get<OilSettings>(OIL_SETTINGS_KEY) ?? defaultOilSettings
}

const saveOilSettings = (settings: OilSettings) => {
  Storage.set(OIL_SETTINGS_KEY, settings)
}

const generateDeviceDid = (): string => {
  const iosVersion = Device.systemVersion ?? '27.0'
  const appVersion = '4.24.1'
  return `VW_APP_iPhone_${getFawVwDeviceUuid()}_${iosVersion}_${appVersion}`
}

const reloadWidgets = (): void => {
  try {
    Widget.reloadAll()
    Widget.reloadUserWidgets()
  } catch (error) {
    console.warn('[小组件] 刷新失败:', error)
  }
}

// ============ 组件 ============

const StatusSection = ({ busy, statusText }: { busy: boolean; statusText: string }) => (
  <Section header={<Text font="headline">当前状态</Text>}>
    <Text font="footnote" foregroundStyle="secondaryLabel">
      {busy ? '处理中，请稍候...' : statusText}
    </Text>
  </Section>
)

const LoginSection = ({
  busy,
  mobile,
  password,
  onMobileChange,
  onPasswordChange,
  onLoginClick
}: {
  busy: boolean
  mobile: string
  password: string
  onMobileChange: (v: string) => void
  onPasswordChange: (v: string) => void
  onLoginClick: () => void
}) => (
  <Section header={<Text font="headline">登录信息</Text>}>
    <TextField title="手机号" value={mobile} onChanged={onMobileChange} prompt="请输入一汽大众账号手机号" keyboardType="numberPad" />
    <SecureField title="密码" value={password} onChanged={onPasswordChange} prompt="请输入密码" />
    <Button title={busy ? '处理中...' : '密码登录并同步'} action={onLoginClick} />
  </Section>
)

const ActionsSection = ({
  busy,
  onSyncClick,
  onLogoutClick
}: {
  busy: boolean
  onSyncClick: () => void
  onLogoutClick: () => void
}) => (
  <Section header={<Text font="headline">操作</Text>}>
    <Button title={busy ? '处理中...' : '同步车辆数据'} action={onSyncClick} />
    <Button title={busy ? '处理中...' : '退出登录'} action={onLogoutClick} foregroundStyle="systemRed" />
  </Section>
)

const VehicleListSection = ({ vehicles }: { vehicles: VehicleListData['vehicles'] }) => (
  <Section header={<Text font="headline">车辆列表</Text>}>
    {vehicles.length === 0 ? (
      <Text font="footnote" foregroundStyle="secondaryLabel">暂无车辆</Text>
    ) : (
      vehicles.map((v, i) => (
        <Text key={v.vehicleId} font="footnote">
          {`${i + 1}. ${v.displayName} (${v.plateNumber || '无车牌'})`}
        </Text>
      ))
    )}
  </Section>
)

const VehicleDetailSection = ({ data }: { data: BasicVehicleData | FullVehicleData }) => {
  const v = data.vehicle
  const lines = [
    `车辆: ${v.displayName}`,
    `车牌: ${v.plateNumber || '未设置'}`,
    `VIN: ${v.vin}`,
    '',
    `续航: ${v.rangeKm}km (${v.rangePercent}%)`,
    `锁车: ${v.isLocked ? '已锁车' : '未锁车'}`,
    `更新: ${data.servedAt}`
  ]
  if (v.batteryPercent !== null) {
    lines.splice(5, 0, `电量: ${v.batteryPercent}%`)
  }
  if (data.featureTier === 'FULL' && (data as FullVehicleData).vehicle.location) {
    const loc = (data as FullVehicleData).vehicle.location!
    lines.push('', `位置: ${loc.address || `${loc.longitude}, ${loc.latitude}`}`)
  }
  return (
    <Section header={<Text font="headline">车辆详情</Text>}>
      <Text font="footnote" foregroundStyle="secondaryLabel">{lines.join('\n')}</Text>
    </Section>
  )
}

const ProvinceSelectionPage = ({
  currentProvinceId,
  onProvinceSelected
}: {
  currentProvinceId: string
  onProvinceSelected: (id: string) => void
}) => {
  const dismiss = Navigation.useDismiss()
  return (
    <List navigationTitle="选择省份">
      <Section>
        {provinces.map((province) => (
          <Button
            key={province.value}
            action={() => {
              onProvinceSelected(province.value)
              dismiss()
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
  )
}

const oilGradeOptions = [
  { label: '92#', value: '92' },
  { label: '95#', value: '95' },
  { label: '98#', value: '98' },
]

const WidgetStyleSection = ({
  style,
  onStyleChange
}: {
  style: WidgetUiStyle
  onStyleChange: (style: WidgetUiStyle) => void
}) => (
  <Section header={<Text font="headline">中型组件样式</Text>}>
    <Picker title="组件 UI" value={style} onChanged={(v) => onStyleChange(v as WidgetUiStyle)}>
      {widgetUiStyleOptions.map((opt) => (
        <Text key={opt.value} tag={opt.value}>{opt.label}</Text>
      ))}
    </Picker>
  </Section>
)

const OilSettingsSection = ({
  oilSettings,
  onOilSettingsChange,
  onSaveClick
}: {
  oilSettings: OilSettings
  onOilSettingsChange: (s: OilSettings) => void
  onSaveClick: () => void
}) => {
  const selectedProvince = provinces.find((p) => p.value === oilSettings.manualProvinceId)
  const update = (patch: Partial<OilSettings>) => onOilSettingsChange({ ...oilSettings, ...patch })

  return (
    <Section header={<Text font="headline">油价设置</Text>}>
      <Picker title="汽油标号" value={oilSettings.oilGrade} onChanged={(v) => update({ oilGrade: v })}>
        {oilGradeOptions.map((opt) => (
          <Text key={opt.value} tag={opt.value}>{opt.label}</Text>
        ))}
      </Picker>
      <TextField title="油箱容量 (L)" value={oilSettings.tankCapacity} onChanged={(v) => update({ tankCapacity: v })} prompt="例如: 50" keyboardType="decimalPad" />
      <Toggle title="手动选择省份" value={oilSettings.useManualProvince} onChanged={(v) => update({ useManualProvince: v })} />
      {oilSettings.useManualProvince ? (
        <Button
          action={() => {
            Navigation.present(
              <ProvinceSelectionPage
                currentProvinceId={oilSettings.manualProvinceId}
                onProvinceSelected={(id) => update({ manualProvinceId: id })}
              />
            )
          }}
        >
          <HStack alignment="center" spacing={8}>
            <Text font="body">选择省份</Text>
            <Spacer />
            <Text font="body" foregroundStyle="secondaryLabel">{selectedProvince?.label || '未选择'}</Text>
            <Image systemName="chevron.right" foregroundStyle="tertiaryLabel" />
          </HStack>
        </Button>
      ) : null}
      <Button title="保存设置" action={onSaveClick} />
    </Section>
  )
}

// ============ 主屏幕 ============

const MainScreen = () => {
  const dismiss = Navigation.useDismiss()
  const session = getSession()
  const accountLoggedIn = hasVehicleAccountSession(session)

  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [statusText, setStatusText] = useState(accountLoggedIn ? '已登录' : '未登录')
  const [loggedIn, setLoggedIn] = useState(accountLoggedIn)
  const [vehicleList, setVehicleList] = useState<VehicleListData | null>(null)
  const [vehicleData, setVehicleData] = useState<BasicVehicleData | FullVehicleData | null>(null)
  const [oilSettings, setOilSettingsState] = useState<OilSettings>(getOilSettings())
  const [widgetUiStyle, setWidgetUiStyleState] = useState<WidgetUiStyle>(readWidgetUiStyle())
  const busyLockRef = useRef(false)

  const handleWidgetUiStyleChange = (style: WidgetUiStyle) => {
    setWidgetUiStyleState(style)
    writeWidgetUiStyle(style)
    console.log('[设置] 中型组件样式:', style)
    reloadWidgets()
  }

  const handleSync = () => {
    if (busyLockRef.current) return
    if (!hasVehicleAccountSession(getSession())) {
      setLoggedIn(false)
      setStatusText('未登录')
      return
    }
    busyLockRef.current = true
    setBusy(true)
    setStatusText('正在同步车辆数据...')
    console.log('[同步] 开始同步车辆数据')

    const run = async () => {
      try {
        const list = await getVehicleList()
        setVehicleList(list)
        if (list.vehicles.length > 0) {
          setStatusText(`正在获取车辆数据: ${list.vehicles[0].displayName}...`)
          const ent = await getCurrentEntitlement()
          const data = ent.featureTier === 'FULL'
            ? await getDefaultFullVehicle(true)
            : await getDefaultBasicVehicle()
          setVehicleData(data)
        }
        setStatusText('数据同步完成')
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error('[同步] 同步失败:', message)
        setStatusText(`同步失败: ${message}`)
        try {
          await Dialog.alert({ title: '同步失败', message })
        } catch (dialogError) {
          console.error('[同步] 弹窗失败:', dialogError)
        }
      } finally {
        busyLockRef.current = false
        setBusy(false)
      }
    }

    run().catch((error) => console.error('[同步] 未捕获错误:', error))
  }

  const handleLogin = () => {
    if (busyLockRef.current) return
    if (!mobile.trim()) {
      try { void Dialog.alert({ title: '请输入手机号', message: '手机号不能为空' }) } catch (e) { console.error(e) }
      return
    }
    if (!password.trim()) {
      try { void Dialog.alert({ title: '请输入密码', message: '密码不能为空' }) } catch (e) { console.error(e) }
      return
    }

    busyLockRef.current = true
    setBusy(true)
    setStatusText('正在登录...')
    console.log('[登录] 开始登录，手机号:', mobile.trim())

    const run = async () => {
      try {
        const result = await login({
          mobile: mobile.trim(),
          password: password.trim(),
          deviceDid: generateDeviceDid(),
          onCaptcha: async (appId, callbackName) => {
            setStatusText('请完成安全验证...')
            return await requestTencentCaptcha({
              appId,
              callbackName,
              title: '一汽大众登录验证',
              description: '请完成滑块验证，验证成功后会自动登录。'
            })
          },
          onSmsCode: async () => {
            setStatusText('等待短信验证码...')
            const code = await Dialog.prompt({
              title: '短信验证码',
              message: '当前账号需要短信验证码确认新设备，请输入收到的验证码。',
              placeholder: '123456',
              keyboardType: 'numberPad',
              cancelLabel: '取消',
              confirmLabel: '确认'
            })
            if (!code?.trim()) throw new Error('验证码已取消')
            return code.trim()
          },
          onStatus: (msg) => {
            console.log('[登录]', msg)
            setStatusText(msg)
          }
        })
        setStatusText(`登录成功！账号: ${result.fawvwAccountId}`)
        setLoggedIn(true)
        reloadWidgets()
        busyLockRef.current = false
        setBusy(false)
        handleSync()
        return
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error('[登录] 登录失败:', message)
        setStatusText(`登录失败: ${message}`)
        try {
          await Dialog.alert({ title: '登录失败', message })
        } catch (dialogError) {
          console.error('[登录] 弹窗失败:', dialogError)
        }
      } finally {
        busyLockRef.current = false
        setBusy(false)
      }
    }

    run().catch((error) => console.error('[登录] 未捕获错误:', error))
  }

  const handleLogout = () => {
    if (busyLockRef.current) {
      try { void Dialog.alert({ title: '暂时无法退出', message: '当前正在处理登录或同步，请稍候再试。' }) } catch (e) { console.error(e) }
      return
    }

    const run = async () => {
      const confirmed = await Dialog.confirm({
        title: '退出登录',
        message: '将清除终端会话和车辆数据，保留油价设置。',
        confirmLabel: '退出',
        cancelLabel: '取消'
      })
      if (!confirmed) return
      try {
        logout()
        setLoggedIn(false)
        setVehicleList(null)
        setVehicleData(null)
        setStatusText('已退出登录')
        console.log('[登出] 登出成功')
        reloadWidgets()
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error('[登出] 登出失败:', message)
        setStatusText(`登出失败: ${message}`)
        try {
          await Dialog.alert({ title: '退出失败', message })
        } catch (dialogError) {
          console.error('[登出] 弹窗失败:', dialogError)
        }
      }
    }

    run().catch((error) => console.error('[登出] 未捕获错误:', error))
  }

  return (
    <NavigationStack>
      <List
        key={loggedIn ? 'logged-in' : 'logged-out'}
        navigationTitle="一汽大众"
        navigationBarTitleDisplayMode="large"
        interactiveDismissDisabled={busy}
        toolbar={{
          cancellationAction: <Button title={busy ? '处理中...' : '完成'} action={dismiss} />
        }}
      >
        <StatusSection busy={busy} statusText={statusText} />
        {!loggedIn ? (
          <LoginSection
            busy={busy}
            mobile={mobile}
            password={password}
            onMobileChange={setMobile}
            onPasswordChange={setPassword}
            onLoginClick={handleLogin}
          />
        ) : null}
        {loggedIn ? (
          <ActionsSection busy={busy} onSyncClick={handleSync} onLogoutClick={handleLogout} />
        ) : null}
        {loggedIn && vehicleList ? (
          <VehicleListSection vehicles={vehicleList.vehicles} />
        ) : null}
        {loggedIn && vehicleData ? (
          <VehicleDetailSection data={vehicleData} />
        ) : null}
        <WidgetStyleSection style={widgetUiStyle} onStyleChange={handleWidgetUiStyleChange} />
        <OilSettingsSection
          oilSettings={oilSettings}
          onOilSettingsChange={(s) => {
            setOilSettingsState(s)
            saveOilSettings(s)
          }}
          onSaveClick={() => {
            saveOilSettings(oilSettings)
            dismiss()
          }}
        />
      </List>
    </NavigationStack>
  )
}

const FallbackScreen = ({ message }: { message: string }) => (
  <NavigationStack>
    <List navigationTitle="一汽大众">
      <Section header={<Text font="headline">启动失败</Text>}>
        <Text font="footnote" foregroundStyle="secondaryLabel">{message}</Text>
        <Text font="caption" foregroundStyle="secondaryLabel">
          请完全退出 Scripting App 后重新打开再试
        </Text>
      </Section>
    </List>
  </NavigationStack>
)

const main = async () => {
  console.log('=== 一汽大众 ===')
  console.log('[启动] version 2026-09-21-2310 ui-v2.6-agibot-font')
  try {
    await Navigation.present({ element: <MainScreen /> })
    console.log('[启动] 页面已关闭')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[启动] 应用启动失败:', error)
    try {
      await Navigation.present({ element: <FallbackScreen message={message} /> })
    } catch (fallbackError) {
      console.error('[启动] 兜底页也失败:', fallbackError)
      try {
        await Dialog.alert({ title: '一汽大众启动失败', message })
      } catch (dialogError) {
        console.error('[启动] Dialog 也失败:', dialogError)
      }
    }
  } finally {
    Script.exit()
  }
}

main()
