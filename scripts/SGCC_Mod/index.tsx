/**
 * 电量小组件 —— 设置页（Scripting 移植版）。
 * 数据来源：Home Assistant
 *
 * 移植（Scripting 版）：SylvanRoe · telegram: @Air_QT
 * 维护：jpcnmm · telegram: @jpcnmm
 *
 * 原创UI，修改套用请注明来源
 */
import {
  Script,
  Navigation,
  NavigationStack,
  List,
  Section,
  Text,
  Button,
  Toggle,
  Picker,
  TextField,
  Widget,
  useState,
} from 'scripting'
import { loadSettings, saveSettings, resetSettings } from './lib/store'
import { DEFAULT_SETTINGS, type SGCCSettings } from './lib/types'

type PatchFn = <K extends keyof SGCCSettings>(key: K, value: SGCCSettings[K]) => void

function SettingsView() {
  const dismiss = Navigation.useDismiss()
  const [settings, setSettings] = useState<SGCCSettings>(loadSettings)
  const [status, setStatus] = useState('')

  const patch = <K extends keyof SGCCSettings>(key: K, value: SGCCSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const save = () => {
    saveSettings(settings)
    setStatus('已保存')
  }

  return (
    <NavigationStack>
      <List
        navigationTitle="电量小组件"
        navigationBarTitleDisplayMode="inline"
        toolbar={{
          cancellationAction: <Button title="关闭" action={dismiss} />,
          confirmationAction: <Button title="保存" action={save} />,
        }}
      >
        <Section
          header={<Text>Home Assistant</Text>}
          footer={<Text font="caption">填写 Home Assistant 的地址、长期访问令牌和电量传感器实体标识符。电费单价用于将电量换算为金额。</Text>}
        >
          <TextField title="地址" prompt="http://192.168.1.100:8123" value={settings.haUrl} onChanged={v => patch('haUrl', v)} />
          <TextField title="令牌" prompt="长期访问令牌" value={settings.haToken} onChanged={v => patch('haToken', v)} />
          <TextField title="实体标识符" prompt="sensor.electricity_meter" value={settings.haEntityId} onChanged={v => patch('haEntityId', v)} />
          <TextField title="电费单价（元/度）" prompt="0.56" value={settings.electricityPrice > 0 ? String(settings.electricityPrice) : ''} onChanged={v => patch('electricityPrice', parseFloat(v) || 0)} />
          {status ? <Text font="caption" foregroundStyle="secondaryLabel">{status}</Text> : null}
        </Section>

        <Section header={<Text>显示</Text>} footer={<Text font="caption">柱状图展示最近若干天的用电量。「柱状图显示度数」仅适用于 7 天及以下，启用后在柱顶标注度数。改动后请点右上角「保存」生效。</Text>}>
          <Toggle title="柱状图显示度数（≤7天）" value={settings.showChartValues} onChanged={v => patch('showChartValues', v)} />
          <Picker title="柱状图天数" value={settings.dayAmount} onChanged={(v: number) => patch('dayAmount', v)} pickerStyle="menu">
            {[5, 6, 7, 8, 9, 10, 11, 12, 14].map(n => <Text key={String(n)} tag={n}>{`${n} 天`}</Text>)}
          </Picker>
        </Section>

        <Section header={<Text>预览</Text>} footer={<Text font="caption">预览页顶部可切换参数：「真实数据」走接口（读取的是已保存的设置，改动后请先点「保存」），「演示数据」不联网、用于校对布局。</Text>}>
          <Button title="预览中号小组件" action={async () => {
            await Widget.preview<'真实数据' | '演示数据'>({
              family: 'systemMedium',
              parameters: { options: { '真实数据': '', '演示数据': 'demo' }, default: '真实数据' },
            })
          }} />
        </Section>

        <Section>
          <Button title="恢复默认设置" role="destructive" action={() => { resetSettings(); setSettings({ ...DEFAULT_SETTINGS }); setStatus('已恢复默认设置') }} />
        </Section>
      </List>
    </NavigationStack>
  )
}

async function run() {
  await Navigation.present(<SettingsView />)
  Script.exit()
}

run()
