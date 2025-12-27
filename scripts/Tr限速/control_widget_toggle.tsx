import { ControlWidget, ControlWidgetToggle } from "scripting"
import { ToggleTRSpeedLimitIntent, storageKey } from "./app_intents"

async function fetchSpeedLimitState() {
  return Storage.get<boolean>(storageKey) ?? false
}

async function run() {
  const enabled = await fetchSpeedLimitState()

  ControlWidget.present(
    <ControlWidgetToggle
      privacySensitive
      intent={
        ToggleTRSpeedLimitIntent({
          value: !enabled
        })
      }
      label={{
        title: "Tr",
        systemImage: "speedometer"
      }}
      activeValueLabel={{
        title: "限速已开启"
      }}
      inactiveValueLabel={{
        title: "限速已关闭"
      }}
    />
  )
}

run()

