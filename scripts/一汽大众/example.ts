// 一汽大众 API 使用示例

import { login, logout, getVehicleList, getDefaultFullVehicle, refreshVehicle, getCurrentEntitlement } from './index'
import { requestTencentCaptcha } from './tencent-captcha'

// ============ 登录示例 ============

const loginExample = async () => {
  try {
    const result = await login({
      mobile: '13800138000',
      password: 'your_password',
      deviceDid: 'VW_APP_iPhone_xxx_27.0_4.24.1',

      // 腾讯验证码回调
      onCaptcha: async (appId, callbackName) => {
        return await requestTencentCaptcha({
          appId,
          callbackName,
          title: '密码登录验证',
          description: '请完成滑块验证'
        })
      },

      // 短信验证码回调
      onSmsCode: async () => {
        const code = await Dialog.prompt({
          title: '短信验证码',
          message: '请输入收到的短信验证码',
          placeholder: '123456',
          keyboardType: 'numberPad'
        })
        if (!code?.trim()) throw new Error('验证码已取消')
        return code.trim()
      },

      // 状态回调
      onStatus: (msg) => console.log('[状态]', msg)
    })

    console.log('登录成功!', result)
    // { fawvwAccountId: '100513615', vehicleCount: 1 }
  } catch (error) {
    console.error('登录失败:', error)
  }
}

// ============ 获取车辆数据示例 ============

const getVehicleDataExample = async () => {
  try {
    // 获取车辆列表
    const vehicleList = await getVehicleList()
    console.log('车辆列表:', vehicleList.vehicles)

    // 获取当前用户权益
    const entitlement = await getCurrentEntitlement()
    console.log('当前权益:', entitlement)

    // 获取默认车辆完整数据
    const vehicle = await getDefaultFullVehicle(true)
    console.log('车辆数据:', {
      名称: vehicle.vehicle.displayName,
      车牌: vehicle.vehicle.plateNumber,
      续航: vehicle.remoteStatus.rangeKm + 'km',
      电量: vehicle.remoteStatus.batteryPercent + '%',
      锁车状态: vehicle.remoteStatus.lockState,
      位置: vehicle.location?.address
    })
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

// ============ 刷新车辆数据示例 ============

const refreshVehicleExample = async () => {
  try {
    const vehicleList = await getVehicleList()
    if (vehicleList.vehicles.length === 0) {
      console.log('没有车辆')
      return
    }

    const vehicleId = vehicleList.vehicles[0].vehicleId
    console.log('正在刷新车辆:', vehicleList.vehicles[0].displayName)

    const snapshot = await refreshVehicle(vehicleId)
    console.log('刷新结果:', {
      刷新状态: snapshot.refreshState,
      更新时间: snapshot.servedAt,
      续航: snapshot.remoteStatus.rangeKm + 'km'
    })
  } catch (error) {
    console.error('刷新失败:', error)
  }
}

// ============ 登出示例 ============

const logoutExample = () => {
  logout()
  console.log('已登出')
}

// ============ 导出 ============

export { loginExample, getVehicleDataExample, refreshVehicleExample, logoutExample }
