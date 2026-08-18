
// 使用代理后端 jc-api.i95.me

import { Button, Dialog, List, Navigation, NavigationStack, Script, Section, SecureField, Text, TextField, useEffect, useState } from 'scripting'
import { getSession } from './api'
import { login, logout } from './auth'
import { getVehicleList, getDefaultBasicVehicle, getDefaultFullVehicle, getCurrentEntitlement } from './vehicle'
import { requestTencentCaptcha } from './tencent-captcha'
import type { BasicVehicleData, FullVehicleData, VehicleListData } from './types'

// 生成设备 ID
const generateDeviceDid = (): string => {
  const uuid = crypto.randomUUID()
  const iosVersion = Device.systemVersion ?? '27.0'
  const appVersion = '4.24.1'
  return `VW_APP_iPhone_${uuid}_${iosVersion}_${appVersion}`
}

// ============ 类型定义 ============

type StatusSectionProps = {
  busy: boolean
  statusText: string
}

type LoginSectionProps = {
  busy: boolean
  mobile: string
  password: string
  onMobileChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onLogin: () => void
}

type ActionsSectionProps = {
  busy: boolean
  onSync: () => void
  onLogout: () => void
}

type VehicleListSectionProps = {
  vehicles: VehicleListData['vehicles']
}

type VehicleDetailSectionProps = {
  data: BasicVehicleData | FullVehicleData
}

// ============ 组件 ============

const StatusSection = ({ busy, statusText }: StatusSectionProps) => {
  return (
    <Section header={<Text font="headline">当前状态</Text>}>
      <Text font="footnote" foregroundStyle="secondaryLabel">
        {busy ? '处理中，请稍候...' : statusText}
      </Text>
    </Section>
  )
}

const LoginSection = ({ busy, mobile, password, onMobileChange, onPasswordChange, onLogin }: LoginSectionProps) => {
  return (
    <Section header={<Text font="headline">登录信息</Text>}>
      <TextField title="手机号" value={mobile} onChanged={onMobileChange} prompt="请输入一汽大众账号手机号" keyboardType="numberPad" />
      <SecureField title="密码" value={password} onChanged={onPasswordChange} prompt="请输入密码" />
      <Button title={busy ? '处理中...' : '密码登录并同步'} action={onLogin} />
    </Section>
  )
}

const ActionsSection = ({ busy, onSync, onLogout }: ActionsSectionProps) => {
  return (
    <Section header={<Text font="headline">操作</Text>}>
      <Button title={busy ? '处理中...' : '同步车辆数据'} action={onSync} />
      <Button title="登出账号" action={onLogout} foregroundStyle="systemRed" />
    </Section>
  )
}

const VehicleListSection = ({ vehicles }: VehicleListSectionProps) => {
  return (
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
}

const VehicleDetailSection = ({ data }: VehicleDetailSectionProps) => {
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
      <Text font="footnote" foregroundStyle="secondaryLabel">
        {lines.join('\n')}
      </Text>
    </Section>
  )
}

// ============ 主屏幕 ============

const MainScreen = () => {
  const dismiss = Navigation.useDismiss()
  const session = getSession()

  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [statusText, setStatusText] = useState(session ? '已登录' : '未登录')
  const [loggedIn, setLoggedIn] = useState(!!session)
  const [vehicleList, setVehicleList] = useState<VehicleListData | null>(null)
  const [vehicleData, setVehicleData] = useState<BasicVehicleData | FullVehicleData | null>(null)

  // 打印完整车辆数据到控制台
  const logVehicleData = (data: BasicVehicleData | FullVehicleData) => {
    const v = data.vehicle
    console.log('\n========== 车辆完整数据 ==========')
    console.log('\n【车辆信息】')
    console.log('  车辆ID:', v.vehicleId)
    console.log('  VIN:', v.vin)
    console.log('  显示名称:', v.displayName)
    console.log('  副标题:', v.subtitle)
    console.log('  车牌号:', v.plateNumber)
    console.log('  是否新能源:', v.isNewEnergy)
    console.log('  车辆版本:', v.vehicleVersion)
    console.log('  图片URL:', v.imageUrl)
    console.log('\n【远程状态】')
    console.log('  续航里程:', v.rangeKm, 'km')
    console.log('  续航百分比:', v.rangePercent, '%')
    if (v.batteryPercent !== null) console.log('  电池电量:', v.batteryPercent, '%')
    if (v.outsideTemperatureC !== null) console.log('  车外温度:', v.outsideTemperatureC, '°C')
    console.log('  停车灯:', v.parkingLights)
    console.log('  驻车制动:', v.parkingBrakeActive)
    console.log('  锁车状态:', v.lockState)
    console.log('  是否已锁:', v.isLocked)
    console.log('  车门状态:', v.doorStatus)
    console.log('  车窗状态:', v.windowStatus)
    console.log('  状态状态:', v.statusState)
    console.log('  App刷新时间:', v.appRefreshedAt)
    if (v.charging) {
      console.log('\n【充电信息】')
      console.log('  当前SOC:', v.charging.currentSOCPct, '%')
      console.log('  纯电续航:', v.charging.cruisingRangeElectricKm, 'km')
      console.log('  充电状态:', v.charging.chargingState)
      console.log('  充电模式:', v.charging.chargeMode)
      console.log('  充电功率:', v.charging.chargePower, 'kW')
      console.log('  插枪状态:', v.charging.plugConnectionState)
    }
    if (data.featureTier === 'FULL') {
      const full = data as FullVehicleData
      if (full.vehicle.oil) {
        console.log('\n【油量信息】')
        console.log('  支持:', full.vehicle.oil.supported)
        console.log('  油量百分比:', full.vehicle.oil.levelPercent, '%')
        console.log('  油量升数:', full.vehicle.oil.volumeLiters, 'L')
        console.log('  有效:', full.vehicle.oil.valid)
        console.log('  状态:', full.vehicle.oil.status)
      }
      if (full.vehicle.access) {
        console.log('\n【车门详情】')
        console.log('  总体状态:', full.vehicle.access.overallStatus)
        console.log('  车门:', JSON.stringify(full.vehicle.access.doors))
        console.log('  车窗:', JSON.stringify(full.vehicle.access.windows))
      }
      if (full.vehicle.location) {
        console.log('\n【位置信息】')
        console.log('  经度:', full.vehicle.location.longitude)
        console.log('  纬度:', full.vehicle.location.latitude)
        console.log('  地址:', full.vehicle.location.address)
      }
    }
    console.log('\n=====================================\n')
  }

  // 同步车辆数据
  const handleSync = async () => {
    if (busy) return
    setBusy(true)
    setStatusText('正在同步车辆数据...')
    console.log('[同步] 开始同步车辆数据')

    try {
      setStatusText('正在获取车辆列表...')
      const list = await getVehicleList()
      setVehicleList(list)
      console.log('[同步] 车辆列表:', list.vehicles.length, '台')

      if (list.vehicles.length > 0) {
        setStatusText(`正在获取车辆数据: ${list.vehicles[0].displayName}...`)
        const ent = await getCurrentEntitlement()
        let data
        if (ent.featureTier === 'FULL') {
          console.log('[同步] 使用完整数据接口')
          data = await getDefaultFullVehicle(true)
        } else {
          console.log('[同步] 使用基础数据接口 (权益:', ent.featureTier, ')')
          data = await getDefaultBasicVehicle()
        }
        setVehicleData(data)
        logVehicleData(data)
      }

      console.log('[同步] 数据同步完成')
      setStatusText('数据同步完成')
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('[同步] 同步失败:', message)
      setStatusText(`同步失败: ${message}`)
      await Dialog.alert({ title: '同步失败', message })
    } finally {
      setBusy(false)
    }
  }

  // 登录
  const handleLogin = async () => {
    if (busy) return
    if (!mobile.trim()) {
      await Dialog.alert({ title: '请输入手机号', message: '手机号不能为空' })
      return
    }
    if (!password.trim()) {
      await Dialog.alert({ title: '请输入密码', message: '密码不能为空' })
      return
    }

    setBusy(true)
    setStatusText('正在登录...')
    console.log('[登录] 开始登录，手机号:', mobile.trim())

    try {
      const result = await login({
        mobile: mobile.trim(),
        password: password.trim(),
        deviceDid: generateDeviceDid(),
        onCaptcha: async (appId, callbackName) => {
          console.log('[登录] 启动腾讯验证码, appId:', appId)
          setStatusText('请完成安全验证...')
          return await requestTencentCaptcha({
            appId,
            callbackName,
            title: '一汽大众登录验证',
            description: '请完成滑块验证，验证成功后会自动登录。'
          })
        },
        onSmsCode: async () => {
          console.log('[登录] 需要短信验证码')
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
          console.log('[登录] 短信验证码已输入')
          return code.trim()
        },
        onStatus: (msg) => {
          console.log('[登录]', msg)
          setStatusText(msg)
        }
      })

      console.log('[登录] 登录成功:', result)
      setStatusText(`登录成功！账号: ${result.fawvwAccountId}`)
      setLoggedIn(true)

      // 登录后自动同步
      console.log('[登录] 登录成功，开始自动同步')
      await handleSync()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('[登录] 登录失败:', message)
      setStatusText(`登录失败: ${message}`)
      await Dialog.alert({ title: '登录失败', message })
    } finally {
      setBusy(false)
    }
  }

  // 登出
  const handleLogout = async () => {
    if (busy) return
    const confirmed = await Dialog.confirm({
      title: '登出账号',
      message: '将清除登录状态，是否继续？',
      confirmLabel: '登出',
      cancelLabel: '取消'
    })
    if (!confirmed) return

    logout()
    setLoggedIn(false)
    setVehicleList(null)
    setVehicleData(null)
    setStatusText('已登出')
    console.log('[登出] 登出成功')
  }

  // 已登录时自动同步
  useEffect(() => {
    if (session && !busy) {
      console.log('[自动同步] 检测到已登录，开始自动同步')
      handleSync()
    }
  }, [])

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
            onLogin={handleLogin}
          />
        ) : null}

        {loggedIn ? (
          <ActionsSection busy={busy} onSync={handleSync} onLogout={handleLogout} />
        ) : null}

        {loggedIn && vehicleList ? (
          <VehicleListSection vehicles={vehicleList.vehicles} />
        ) : null}

        {loggedIn && vehicleData ? (
          <VehicleDetailSection data={vehicleData} />
        ) : null}
      </List>
    </NavigationStack>
  )
}

// ============ 启动应用 ============

const main = async () => {
  console.log('=== 一汽大众 ===')
  console.log('[启动] 应用初始化')
  try {
    await Navigation.present({
      element: <MainScreen />
    })
    console.log('[启动] 页面已关闭')
  } catch (error) {
    console.error('[启动] 应用启动失败:', error)
  } finally {
    Script.exit()
  }
}

main()
