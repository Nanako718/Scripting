// 一汽大众 API 模块入口
// 使用代理后端 jc-api.i95.me，无需自己计算签名

export {
  requestJson,
  requestAuthedJson,
  ensureSession,
  registerTerminal,
  refreshSession,
  getSession,
  setSession,
  clearTerminalSession,
  hasVehicleAccountSession,
  markFawVwAccountLogoutPending,
  clearFawVwAccountLogoutPending,
  bindFawVwAccountToSession,
  getTerminalDeviceId,
  getFawVwDeviceUuid
} from './api'
export { ApiError } from './api'

export { login, logout, getLoginOptions, loginByPassword, sendSmsCode, verifySmsCode, syncMe, syncRuntimeConfig } from './auth'

export {
  getVehicleList,
  refreshVehicleList,
  getDefaultBasicVehicle,
  getBasicVehicle,
  getDefaultFullVehicle,
  getFullVehicle,
  refreshVehicle,
  getCurrentEntitlement,
  redeemCode,
  formatRange,
  formatOil,
  formatCharging,
  formatLocation,
  formatLockState,
  formatUpdateTime
} from './vehicle'

export type {
  TerminalSession,
  TerminalCryptoConfig,
  TerminalCryptoEnvelope,
  FeatureTier,
  VehicleListItem,
  VehicleListData,
  BasicVehicle,
  FullVehicle,
  BasicVehicleData,
  FullVehicleData,
  VehicleData,
  VehicleSnapshot,
  VehicleRemoteStatus,
  VehicleLocation,
  CurrentUserEntitlement,
  RuntimeConfigData,
  TerminalMeData,
  LoginResult,
  SmsSendResult
} from './types'
export type { CaptchaResult } from './vehicle-types'

export { encrypt, decrypt, isCryptoEnvelope } from './crypto'
export { CryptoError } from './crypto'
