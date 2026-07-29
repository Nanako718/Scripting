import {
  Button,
  HStack,
  List,
  Navigation,
  NavigationStack,
  Script,
  Section,
  Spacer,
  Text,
  TextField,
  useState,
  VStack,
} from "scripting"

// 本脚本逐节点遍历 HomeKit 暴露的所有 API。
// 首次点击任意按钮会自动弹出系统 HomeKit 授权框；用户拒绝后调用会以
// "HomeKit access is not authorized" 错误 reject。
// 设备/模拟器需要至少有一个 HomeKit 家庭，且至少一个配件；
// 没有的话用底部的"配对"按钮触发系统配件配对界面。

type LogEntry = {
  id: string
  ts: string
  title: string
  body: string
  ok: boolean
}

function View() {
  const [home, setHome] = useState<HMHome | null>(null)
  const [accessory, setAccessory] = useState<HMAccessory | null>(null)
  const [service, setService] = useState<HMService | null>(null)
  const [characteristic, setCharacteristic] = useState<HMCharacteristic | null>(null)
  const [actionSet, setActionSet] = useState<HMActionSet | null>(null)
  const [valueToWrite, setValueToWrite] = useState<string>("true")
  const [subscribed, setSubscribed] = useState<boolean>(false)
  const [logs, setLogs] = useState<LogEntry[]>([])

  function appendLog(title: string, body: string, ok: boolean) {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ts: new Date().toLocaleTimeString(),
      title,
      body,
      ok,
    }
    if (ok) console.log(title, body)
    else console.error(title, body)
    setLogs(prev => [entry, ...prev].slice(0, 40))
  }

  async function safe(title: string, action: () => Promise<string>) {
    try {
      const body = await action()
      appendLog(title, body, true)
    } catch (e) {
      appendLog(title, `${(e as Error).message ?? e}`, false)
    }
  }

  function requireHome(): HMHome {
    if (!home) throw new Error("请先选择一个家庭。")
    return home
  }
  function requireAccessory(): HMAccessory {
    if (!accessory) throw new Error("请先选择一个配件。")
    return accessory
  }
  function requireCharacteristic(): HMCharacteristic {
    if (!characteristic) throw new Error("请先选择一个特征值。")
    return characteristic
  }

  // 把 JS 端要写入的字符串按 metadata.format 转成 HMCharacteristicValue
  function coerceWriteValue(
    raw: string,
    ch: HMCharacteristic
  ): number | boolean | string {
    const fmt = ch.metadata?.format ?? "string"
    const trimmed = raw.trim()
    if (fmt === "bool") {
      if (trimmed === "true" || trimmed === "1") return true
      if (trimmed === "false" || trimmed === "0") return false
      throw new Error(`需要布尔值（'true'/'false'），收到 "${trimmed}"`)
    }
    if (
      fmt === "int" || fmt === "uint8" || fmt === "uint16" ||
      fmt === "uint32" || fmt === "uint64"
    ) {
      const n = Number(trimmed)
      if (!Number.isFinite(n) || !Number.isInteger(n)) {
        throw new Error(`需要整数，收到 "${trimmed}"`)
      }
      return n
    }
    if (fmt === "float") {
      const n = Number(trimmed)
      if (!Number.isFinite(n)) throw new Error(`需要数字，收到 "${trimmed}"`)
      return n
    }
    return trimmed // string / fallback
  }

  return (
    <NavigationStack>
      <List
        navigationTitle="HomeKit 演示"
        navigationBarTitleDisplayMode="inline"
      >
        <Section
          header={<Text>家庭</Text>}
          footer={
            <Text font="caption" foregroundStyle="secondaryLabel">
              已选：{home ? `${home.name} (${home.uuid})` : "（无）"}
            </Text>
          }
        >
          <Button
            title="列出并选择第一个家庭"
            action={() =>
              safe("家庭", async () => {
                const homes = await HMHomeManager.homes
                if (homes.length === 0) {
                  setHome(null)
                  return "没有家庭 — 请打开 Apple 家庭 App 创建一个，或使用下方的配对功能"
                }
                setHome(homes[0])
                // 挂载事件回调，后续在日志区看到变更
                homes[0].onAccessoriesChanged = list =>
                  appendLog(
                    "配件变更",
                    `数量=${list.length}`,
                    true
                  )
                homes[0].onRoomsChanged = list =>
                  appendLog("房间变更", `数量=${list.length}`, true)
                homes[0].onActionSetsChanged = list =>
                  appendLog(
                    "场景变更",
                    `数量=${list.length}`,
                    true
                  )
                homes[0].onNameChanged = n =>
                  appendLog("名称变更", n, true)
                return `共 ${homes.length} 个家庭；已选择「${homes[0].name}」`
              })
            }
          />
          <Button
            title="添加家庭（演示家庭）"
            action={() =>
              safe("添加家庭", async () => {
                const h = await HMHomeManager.addHome(
                  `演示家庭 ${new Date().toLocaleTimeString()}`
                )
                setHome(h)
                return `已添加「${h.name}」(${h.uuid})`
              })
            }
          />
          <Button
            title="重命名当前家庭"
            action={() =>
              safe("重命名家庭", async () => {
                // HomeKit 要求名字以字母/数字结尾；不能以特殊字符（如 '*' / 空格）结尾
                const h = requireHome()
                const stamp = new Date()
                  .toLocaleTimeString()
                  .replace(/[^A-Za-z0-9]+/g, "")
                const newName = `已重命名 ${stamp}`
                await h.rename(newName)
                return `已重命名 → ${h.name}`
              })
            }
          />
          <Button
            title="删除当前家庭"
            action={() =>
              safe("删除家庭", async () => {
                const h = requireHome()
                await HMHomeManager.removeHome(h)
                setHome(null)
                setAccessory(null)
                setService(null)
                setCharacteristic(null)
                setActionSet(null)
                return `已删除「${h.name}」`
              })
            }
          />
        </Section>

        <Section
          header={<Text>家庭详情</Text>}
          footer={
            <Text font="caption" foregroundStyle="secondaryLabel">
              作用于当前选中的家庭。`currentUser` 始终非空。
            </Text>
          }
        >
          <Button
            title="统计（房间/配件/场景/区域/服务组）"
            action={() =>
              safe("家庭统计", async () => {
                const h = requireHome()
                return [
                  `房间=${h.rooms.length}`,
                  `配件=${h.accessories.length}`,
                  `场景=${h.actionSets.length}`,
                  `区域=${h.zones.length}`,
                  `服务组=${h.serviceGroups.length}`,
                ].join(", ")
              })
            }
          />
          <Button
            title="列出房间"
            action={() =>
              safe("房间", async () => {
                const h = requireHome()
                if (h.rooms.length === 0) return "（无房间）"
                return h.rooms
                  .map(r => `${r.name}（${r.accessories.length} 个配件）`)
                  .join(", ")
              })
            }
          />
          <Button
            title="默认房间（roomForEntireHome）"
            action={() =>
              safe("默认房间", async () => {
                const r = requireHome().roomForEntireHome()
                return `${r.name}（${r.accessories.length} 个配件）`
              })
            }
          />
          <Button
            title="当前用户"
            action={() =>
              safe("当前用户", async () => {
                const u = requireHome().currentUser
                return `${u.name}（${u.uuid}）`
              })
            }
          />
        </Section>

        <Section
          header={<Text>配件</Text>}
          footer={
            <Text font="caption" foregroundStyle="secondaryLabel">
              已选：{accessory ? `${accessory.name}（${accessory.category}）` : "（无）"}
            </Text>
          }
        >
          <Button
            title="选择家庭中的第一个配件"
            action={() =>
              safe("选择配件", async () => {
                const h = requireHome()
                const list = h.accessories
                if (list.length === 0) throw new Error("家庭中没有配件 — 请先配对一个")
                const a = list[0]
                setAccessory(a)
                setService(null)
                setCharacteristic(null)
                a.onReachabilityChanged = ok =>
                  appendLog("可达性变更", String(ok), true)
                a.onNameChanged = n =>
                  appendLog("配件名称变更", n, true)
                a.onServicesChanged = list =>
                  appendLog(
                    "服务变更",
                    `数量=${list.length}`,
                    true
                  )
                a.onFirmwareVersionChanged = v =>
                  appendLog("固件版本变更", v ?? "（空）", true)
                return `${a.name} | 类别=${a.category} | 可达=${a.isReachable}`
              })
            }
          />
          <Button
            title="查看详情（厂商/型号/固件/服务）"
            action={() =>
              safe("查看配件", async () => {
                const a = requireAccessory()
                return [
                  `厂商=${a.manufacturer ?? "（空）"}`,
                  `型号=${a.model ?? "（空）"}`,
                  `固件=${a.firmwareVersion ?? "（空）"}`,
                  `房间=${a.room?.name ?? "（无）"}`,
                  `桥接=${a.isBridged}`,
                  `已阻止=${a.isBlocked}`,
                  `服务数=${a.services.length}`,
                ].join("\n")
              })
            }
          />
          <Button
            title="列出服务"
            action={() =>
              safe("服务", async () => {
                const a = requireAccessory()
                if (a.services.length === 0) return "（无服务）"
                return a.services
                  .map(
                    s =>
                      `${s.name || "（未命名）"} [${s.serviceType}] 特征值=${s.characteristics.length}${s.isPrimaryService ? " *主服务" : ""}`
                  )
                  .join("\n")
              })
            }
          />
          <Button
            title="选择第一个可写特征值"
            action={() =>
              safe("选择特征值", async () => {
                const a = requireAccessory()
                for (const s of a.services) {
                  for (const c of s.characteristics) {
                    if (c.properties.includes("writable")) {
                      setService(s)
                      setCharacteristic(c)
                      return `服务=${s.serviceType} 特征值=${c.characteristicType} 属性=[${c.properties.join(",")}]`
                    }
                  }
                }
                throw new Error("该配件没有可写特征值")
              })
            }
          />
          <Button
            title="选择第一个可读特征值"
            action={() =>
              safe("选择可读特征值", async () => {
                const a = requireAccessory()
                for (const s of a.services) {
                  for (const c of s.characteristics) {
                    if (c.properties.includes("readable")) {
                      setService(s)
                      setCharacteristic(c)
                      return `服务=${s.serviceType} 特征值=${c.characteristicType} 属性=[${c.properties.join(",")}]`
                    }
                  }
                }
                throw new Error("该配件没有可读特征值")
              })
            }
          />
          <Button
            title="识别（闪烁）"
            action={() =>
              safe("识别", async () => {
                await requireAccessory().identify()
                return "识别请求已发送"
              })
            }
          />
        </Section>

        <Section
          header={<Text>特征值读写</Text>}
          footer={
            <Text font="caption" foregroundStyle="secondaryLabel">
              {characteristic
                ? `${characteristic.characteristicType} • 格式=${characteristic.metadata?.format ?? "?"} • 属性=[${characteristic.properties.join(",")}] ${subscribed ? "• 已订阅" : ""}`
                : "请先选择一个特征值。"}
            </Text>
          }
        >
          <Button
            title="读取值"
            action={() =>
              safe("读取值", async () => {
                const c = requireCharacteristic()
                const v = await c.readValue()
                return `${typeof v} = ${JSON.stringify(v)}`
              })
            }
          />
          <Button
            title="查看元数据"
            action={() =>
              safe("元数据", async () => {
                const c = requireCharacteristic()
                return JSON.stringify(c.metadata, null, 2)
              })
            }
          />
          <TextField
            title="写入值"
            value={valueToWrite}
            onChanged={setValueToWrite}
          />
          <Button
            title="写入值"
            action={() =>
              safe("写入值", async () => {
                const c = requireCharacteristic()
                const value = coerceWriteValue(valueToWrite, c)
                await c.writeValue(value)
                return `已写入 ${typeof value}=${JSON.stringify(value)}`
              })
            }
          />
          <Button
            title="切换开关（读取 → 取反 → 写入）"
            action={() =>
              safe("切换开关", async () => {
                const c = requireCharacteristic()
                if (c.metadata?.format !== "bool") {
                  throw new Error(
                    `格式=${c.metadata?.format ?? "?"} 不是布尔类型`
                  )
                }
                const cur = await c.readValue()
                const next = !cur
                await c.writeValue(next)
                return `${cur} → ${next}`
              })
            }
          />
          <Button
            title={subscribed ? "取消订阅" : "订阅变更"}
            action={() =>
              safe(subscribed ? "取消订阅" : "订阅", async () => {
                const c = requireCharacteristic()
                if (subscribed) {
                  await c.unsubscribe()
                  setSubscribed(false)
                  return "已取消订阅"
                }
                if (!c.properties.includes("supportsEvent")) {
                  throw new Error("该特征值不支持事件订阅")
                }
                await c.subscribe((err, value) => {
                  if (err) {
                    appendLog("通知", err.message, false)
                  } else {
                    appendLog(
                      "通知",
                      `${typeof value} = ${JSON.stringify(value)}`,
                      true
                    )
                  }
                })
                setSubscribed(true)
                return "已订阅（变更时将记录日志）"
              })
            }
          />
        </Section>

        <Section
          header={<Text>场景（Scenes）</Text>}
          footer={
            <Text font="caption" foregroundStyle="secondaryLabel">
              已选：{actionSet ? `${actionSet.name} [${actionSet.type}]` : "（无）"}
            </Text>
          }
        >
          <Button
            title="列出场景"
            action={() =>
              safe("场景", async () => {
                const h = requireHome()
                if (h.actionSets.length === 0) return "（无场景）"
                return h.actionSets
                  .map(s => `${s.name} [${s.type}] 动作=${s.actions.length}`)
                  .join("\n")
              })
            }
          />
          <Button
            title="内置场景"
            action={() =>
              safe("内置场景", async () => {
                const map = requireHome().builtinActionSets()
                return [
                  `起床=${map.wakeUp?.name ?? "（无）"}`,
                  `睡觉=${map.sleep?.name ?? "（无）"}`,
                  `到家=${map.homeArrival?.name ?? "（无）"}`,
                  `离家=${map.homeDeparture?.name ?? "（无）"}`,
                ].join("\n")
              })
            }
          />
          <Button
            title="创建自定义场景"
            action={() =>
              safe("创建场景", async () => {
                const h = requireHome()
                const s = await h.addUserActionSet(
                  `演示场景 ${new Date().toLocaleTimeString()}`
                )
                setActionSet(s)
                return `已创建「${s.name}」(${s.uuid})`
              })
            }
          />
          <Button
            title="向场景添加切换动作（当前特征值）"
            action={() =>
              safe("添加动作", async () => {
                if (!actionSet) throw new Error("请先创建或选择一个场景。")
                const c = requireCharacteristic()
                const value = coerceWriteValue(valueToWrite, c)
                await actionSet.addCharacteristicAction(c, value)
                return `已添加动作：${c.characteristicType} ← ${JSON.stringify(value)}（当前共 ${actionSet.actions.length} 个动作）`
              })
            }
          />
          <Button
            title="执行当前场景"
            action={() =>
              safe("执行场景", async () => {
                if (!actionSet) throw new Error("未选择场景。")
                const h = requireHome()
                await h.executeActionSet(actionSet)
                return `已执行「${actionSet.name}」`
              })
            }
          />
          <Button
            title="删除当前场景"
            action={() =>
              safe("删除场景", async () => {
                if (!actionSet) throw new Error("未选择场景。")
                const h = requireHome()
                await h.removeActionSet(actionSet)
                const removed = actionSet.name
                setActionSet(null)
                return `已删除「${removed}」`
              })
            }
          />
        </Section>

        <Section
          header={<Text>配对</Text>}
          footer={
            <Text font="caption" foregroundStyle="secondaryLabel">
              打开系统 HomeKit"添加配件"界面。当家庭中没有配件时使用。
            </Text>
          }
        >
          <Button
            title="添加并配对配件"
            action={() =>
              safe("配对配件", async () => {
                const h = requireHome()
                const list = await h.addAndSetupAccessories()
                return `家庭当前有 ${list.length} 个配件`
              })
            }
          />
        </Section>

        <Section header={<Text>{`日志（${logs.length}）`}</Text>}>
          {logs.length === 0 ? (
            <Text foregroundStyle="secondaryLabel">
              点击上方任意按钮，操作结果将显示在此处（最新在前）。
            </Text>
          ) : (
            logs.map(entry => (
              <VStack key={entry.id} alignment="leading" spacing={2}>
                <HStack>
                  <Text foregroundStyle={entry.ok ? "systemGreen" : "systemRed"}>
                    {entry.ok ? "✓" : "✗"} {entry.title}
                  </Text>
                  <Spacer />
                  <Text foregroundStyle="secondaryLabel" font="caption">
                    {entry.ts}
                  </Text>
                </HStack>
                <Text font="caption" foregroundStyle="secondaryLabel">
                  {entry.body}
                </Text>
              </VStack>
            ))
          )}
        </Section>
      </List>
    </NavigationStack>
  )
}

async function run() {
  await Navigation.present({ element: <View /> })
  Script.exit()
}

run()
