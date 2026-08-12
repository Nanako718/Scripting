// 一汽大众 API 类型定义

export type FeatureTier = 'BASIC' | 'FULL'

export type TerminalCryptoConfig = {
  enabled: boolean
  version: 'AES_GCM_V1'
  keyId: string
  key: string
}

export type TerminalCryptoEnvelope = {
  version: 'AES_GCM_V1'
  keyId: string
  iv: string
  ciphertext: string
}

export type TerminalSession = {
  terminalId: string
  terminalStatus: string
  accessToken: string
  refreshToken: string
  expiresIn: number
  expiresAt: number
  crypto: TerminalCryptoConfig
  featureTier: FeatureTier
  entitlementExpiresAt: string | null
  fawvwAccountId: string | null
}

export type TerminalApiResponse = {
  code: string
  message: string
  requestId: string
  data: unknown
  error?: {
    reason: string
    retryable: boolean
  }
}

export type RegisterTerminalData = {
  terminal: {
    terminalId: string
    platform: string
    status: string
  }
  token: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
  crypto: TerminalCryptoConfig
  featureTier: FeatureTier
  entitlementExpiresAt: string | null
  fawvwAccountId: string | null
}

export type TerminalMeData = {
  user: {
    userId: string
    status: string
  }
  terminal: {
    terminalId: string
    platform: string
    status: string
  }
  featureTier: FeatureTier
  entitlementExpiresAt: string | null
  fawvwAccountId: string | null
}

export type RuntimeConfigData = {
  featureTier: FeatureTier
  entitlementExpiresAt: string | null
  features: {
    basicVehicleData: boolean
    fullVehicleData: boolean
    manualRefresh: boolean
    position: boolean
  }
  limits: {
    maxRefreshRequestsPerHour: number
  }
}

// 车辆列表项
export type VehicleListItem = {
  vehicleId: string
  vin: string
  displayName: string
  subtitle: string
  plateNumber: string
  imageUrl: string
  isNewEnergy: boolean
  vehicleVersion: string
}

export type VehicleListData = {
  featureTier: FeatureTier
  entitlementExpiresAt: string | null
  vehicles: VehicleListItem[]
}

// 基础车辆数据（API 直接返回）
export type BasicVehicle = {
  vehicleId: string
  vin: string
  displayName: string
  subtitle: string
  plateNumber: string
  imageUrl: string
  isNewEnergy: boolean
  vehicleVersion: string
  rangeKm: number
  rangePercent: number
  batteryPercent: number | null
  outsideTemperatureC: number | null
  parkingLights: string
  parkingBrakeActive: boolean | null
  lockState: string
  isLocked: boolean
  doorStatus: string[]
  windowStatus: string[]
  windowDetails: { name: string; state: string; openPercent: number | null }[]
  statusState: string
  appRefreshedAt: string
  charging?: {
    currentSOCPct: number
    cruisingRangeElectricKm: number
    chargingState: string
    chargeMode: string
    chargePower: number
    chargeRate: number
    chargeType: string
    remainingChargingTimeToCompleteMin: number
    plugConnectionState: string
    plugLockState: string
    externalPower: string
    batteryUpdatedAt: string
    chargingUpdatedAt: string
    plugUpdatedAt: string
  }
}

export type BasicVehicleData = {
  featureTier: 'BASIC'
  vehicle: BasicVehicle
  refreshState: string
  servedAt: string
}

// 完整车辆数据（API 直接返回）
export type FullVehicle = BasicVehicle & {
  imageDesc: string
  totalMileageKm: number
  oil?: {
    supported: boolean
    levelPercent: number | null
    volumeLiters?: number
    valid?: boolean
    minWarningActive?: boolean
    status: string
  }
  access?: {
    overallStatus: string
    doors: { name: string; status: string[] }[]
    windows: { name: string; status: string[] }[]
    sourceUpdatedAt: string
  }
  locationState?: string
  locationMessage?: string
  locationUnavailableReason?: string
  location?: {
    longitude: number
    latitude: number
    sourceUpdatedAt?: string
    address: string
    staticMapUrl?: string
  }
  sourceUpdatedAt: string
}

export type FullVehicleData = {
  featureTier: 'FULL'
  entitlementExpiresAt: string | null
  vehicle: FullVehicle
  refreshState: string
  servedAt: string
}

export type VehicleData = BasicVehicleData | FullVehicleData

export type CurrentUserEntitlement = {
  featureTier: FeatureTier
  status: string
  startsAt: string | null
  expiresAt: string | null
}

export type LoginResult = {
  loginState: 'SUCCEEDED' | 'SMS_REQUIRED'
  fawvwAccountId?: string
  vehicleCount?: number
  smsType?: string
}

export type SmsSendResult = {
  loginState: 'SMS_SENT'
}
