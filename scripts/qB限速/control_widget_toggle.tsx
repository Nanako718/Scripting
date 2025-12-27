import { ControlWidget, ControlWidgetToggle } from "scripting"
import { ToggleQBSpeedLimitIntent, storageKey } from "./app_intents"

async function fetchSpeedLimitState() {
  return Storage.get<boolean>(storageKey) ?? false
}

async function run() {
  const enabled = await fetchSpeedLimitState()

  ControlWidget.present(
    <ControlWidgetToggle
      privacySensitive
      intent={
        ToggleQBSpeedLimitIntent({
          value: !enabled
        })
      }
      label={{
        title: "qB",
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

