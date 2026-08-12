# 一汽大众 API 模块

基于 JoinerCar 项目的 API 逻辑，使用代理后端 `jc-api.i95.me` 访问一汽大众官方 API。

## 文件结构

```
一汽大众/
├── index.ts      # 入口文件，导出所有 API
├── api.ts        # 核心 API 客户端（AES-GCM 加密）
├── auth.ts       # 登录/登出逻辑
├── vehicle.ts    # 车辆数据获取
├── crypto.ts     # AES-GCM 加密/解密
├── types.ts      # 类型定义
├── example.ts    # 使用示例
└── README.md     # 说明文档
```

## 快速开始

```typescript
import { login, getVehicleList, getDefaultFullVehicle } from './一汽大众'

// 1. 登录
const result = await login({
  mobile: '你的手机号',
  password: '你的密码',
  deviceDid: 'VW_APP_iPhone_xxx_27.0_4.24.1',
  onCaptcha: async (appId, callbackName) => {
    // 腾讯验证码回调
    return await requestTencentCaptcha({ appId, callbackName, ... })
  },
  onSmsCode: async () => {
    // 短信验证码回调
    return '123456'
  },
  onStatus: (msg) => console.log(msg)
})

// 2. 获取车辆列表
const vehicleList = await getVehicleList()
console.log(vehicleList.vehicles)

// 3. 获取车辆数据
const vehicle = await getDefaultFullVehicle()
console.log(vehicle.remoteStatus.rangeKm)  // 续航里程
console.log(vehicle.remoteStatus.batteryPercent)  // 电量
console.log(vehicle.location?.address)  // 位置
```

## API 列表

### 登录相关

| 函数 | 说明 |
|------|------|
| `login(options)` | 完整登录流程 |
| `logout()` | 登出 |
| `getLoginOptions()` | 获取登录配置 |
| `loginByPassword(mobile, password, deviceDid, ticket, randstr)` | 密码登录 |
| `sendSmsCode(mobile, deviceDid)` | 发送短信验证码 |
| `verifySmsCode(mobile, deviceDid, code)` | 验证短信验证码 |
| `syncMe()` | 同步用户信息 |
| `syncRuntimeConfig()` | 同步运行时配置 |

### 车辆数据

| 函数 | 说明 |
|------|------|
| `getVehicleList()` | 获取车辆列表 |
| `refreshVehicleList()` | 刷新车辆列表 |
| `getDefaultBasicVehicle()` | 获取默认车辆基础数据 |
| `getBasicVehicle(vehicleId)` | 获取指定车辆基础数据 |
| `getDefaultFullVehicle(includeStaticMap?)` | 获取默认车辆完整数据 |
| `getFullVehicle(vehicleId, includeStaticMap?)` | 获取指定车辆完整数据 |
| `refreshVehicle(vehicleId)` | 手动刷新车辆数据 |

### 权益管理

| 函数 | 说明 |
|------|------|
| `getCurrentEntitlement()` | 获取当前权益 |
| `redeemCode(code)` | 兑换权益码 |

### 工具函数

| 函数 | 说明 |
|------|------|
| `formatRange(remoteStatus)` | 格式化续航里程 |
| `formatOil(remoteStatus)` | 格式化油量 |
| `formatCharging(remoteStatus)` | 格式化充电状态 |
| `formatLocation(location?)` | 格式化位置 |
| `formatLockState(remoteStatus)` | 格式化锁车状态 |
| `formatUpdateTime(timeStr)` | 格式化更新时间 |

## 技术细节

- **代理后端**: `https://jc-api.i95.me`
- **加密方式**: AES-GCM-V1
- **认证方式**: JWT Bearer Token
- **会话管理**: 自动注册/刷新终端会话

## 注意事项

1. 需要有效的手机号和密码
2. 登录需要完成腾讯验证码
3. 首次登录可能需要短信验证
4. Token 会自动刷新，无需手动处理
5. 所有请求都经过 AES-GCM 加密
