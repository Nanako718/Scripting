/**
 * 取数：请求 Home Assistant API。
 */
import { fetch } from 'scripting'
import { processUsage, nowString } from './calc'
import type { BillViewModel, HAStateResponse, SGCCSettings } from './types'

const TIMEOUT_SEC = 30

async function fetchHAState(settings: SGCCSettings): Promise<HAStateResponse> {
  const baseUrl = settings.haUrl.replace(/\/+$/, '')
  const url = `${baseUrl}/api/states/${settings.haEntityId}`
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${settings.haToken}`, 'Content-Type': 'application/json' },
    timeout: TIMEOUT_SEC,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.json()
}

export async function getBillData(settings: SGCCSettings): Promise<BillViewModel> {
  if (!settings.haUrl || !settings.haToken || !settings.haEntityId) {
    throw new Error('请先在设置中填写 Home Assistant 地址、令牌和实体标识符')
  }

  const stateRes = await fetchHAState(settings)

  console.log('[HA] 实体状态:', JSON.stringify(stateRes, null, 2))

  const update = stateRes.last_changed
    ? (() => { const d = new Date(stateRes.last_changed); const p = (n: number) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}` })()
    : nowString()
  const consName = (stateRes.attributes?.friendly_name as string) ?? settings.haEntityId
  const consNo = stateRes.entity_id
  const currentState = parseFloat(stateRes.state)

  const vm = processUsage(
    Number.isFinite(currentState) ? currentState : undefined,
    settings.electricityPrice,
    { update, consName, consNo },
  )

  console.log('[HA] BillViewModel:', JSON.stringify(vm, null, 2))
  console.log('请求成功')
  return vm
}
