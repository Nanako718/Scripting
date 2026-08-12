// AES-GCM 加密/解密模块

import type { TerminalCryptoConfig, TerminalCryptoEnvelope } from './types'

const CRYPTO_VERSION = 'AES_GCM_V1'
const KEY_BYTES = 32
const IV_BYTES = 12
const IV_BITS = 96

export class CryptoError extends Error {
  reason: string
  constructor(reason: string, message: string) {
    super(message)
    this.name = 'CryptoError'
    this.reason = reason
  }
}

const getKeyData = (crypto: TerminalCryptoConfig): Data => {
  if (!crypto.enabled || crypto.version !== CRYPTO_VERSION || !crypto.keyId || !crypto.key) {
    throw new CryptoError('invalid_key', '无效的加密配置')
  }
  const keyData = Data.fromBase64String(crypto.key)
  if (!keyData || keyData.size !== KEY_BYTES) {
    throw new CryptoError('invalid_key', '无效的加密密钥')
  }
  return keyData
}

export const isCryptoEnvelope = (value: unknown): value is TerminalCryptoEnvelope => {
  if (typeof value !== 'object' || value === null) return false
  const env = value as Partial<TerminalCryptoEnvelope>
  return (
    env.version === CRYPTO_VERSION &&
    typeof env.keyId === 'string' &&
    typeof env.iv === 'string' &&
    typeof env.ciphertext === 'string'
  )
}

export const encrypt = (body: object, crypto: TerminalCryptoConfig): TerminalCryptoEnvelope => {
  const keyData = getKeyData(crypto)
  const plaintextData = Data.fromRawString(JSON.stringify(body))
  if (!plaintextData) throw new CryptoError('invalid_plaintext', '加密明文无效')

  const ivData = Crypto.generateSymmetricKey(IV_BITS)
  const encryptedData = Crypto.encryptAESGCM(plaintextData, keyData, { iv: ivData })
  if (!encryptedData) throw new CryptoError('encrypt_failed', '加密失败')

  // 提取密文（去掉 IV 前缀）
  const ciphertextData = encryptedData.slice(IV_BYTES)

  return {
    version: CRYPTO_VERSION,
    keyId: crypto.keyId,
    iv: ivData.toBase64String(),
    ciphertext: ciphertextData.toBase64String()
  }
}

export const decrypt = (envelope: TerminalCryptoEnvelope, crypto: TerminalCryptoConfig): unknown => {
  const keyData = getKeyData(crypto)

  const ivData = Data.fromBase64String(envelope.iv)
  if (!ivData || ivData.size !== IV_BYTES) {
    throw new CryptoError('invalid_iv', '无效的 IV')
  }

  const ciphertextData = Data.fromBase64String(envelope.ciphertext)
  if (!ciphertextData) throw new CryptoError('invalid_ciphertext', '无效的密文')

  // 拼接 IV + 密文
  const encryptedData = Data.combine([ivData, ciphertextData])
  const plaintextData = Crypto.decryptAESGCM(encryptedData, keyData)
  if (!plaintextData) throw new CryptoError('decrypt_failed', '解密失败')

  const plaintext = plaintextData.toRawString()
  if (!plaintext) throw new CryptoError('invalid_plaintext', '解密结果无效')

  try {
    return JSON.parse(plaintext)
  } catch (error) {
    throw new CryptoError('invalid_json', error instanceof Error ? error.message : String(error))
  }
}
