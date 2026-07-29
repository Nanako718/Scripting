# Scripting 小组件 — 功能总览与 UI 设计规范

> 基于 Scripting Documentation 整理，涵盖所有可实现功能及 UI 设计使用规范。

---

## 目录

- [第一部分：功能总览](#第一部分功能总览)
  - [1. 小组件（Widget）](#1-小组件widget)
  - [2. 控件（Control Widget）](#2-控件control-widget)
  - [3. 通知（Notification）](#3-通知notification)
  - [4. 日历与事件](#4-日历与事件)
  - [5. 提醒事项（Reminder）](#5-提醒事项reminder)
  - [6. 网络请求（Fetch）](#6-网络请求fetch)
  - [7. WebSocket 与 Socket.IO](#7-websocket-与-socketio)
  - [8. WebView](#8-webview)
  - [9. 视频与音频播放](#9-视频与音频播放)
  - [10. 位置与地理](#10-位置与地理)
  - [11. 天气](#11-天气)
  - [12. 设备信息](#12-设备信息)
  - [13. 联系人](#13-联系人)
  - [14. 邮件与短信](#14-邮件与短信)
  - [15. 文件与文档](#15-文件与文档)
  - [16. PDF 处理](#16-pdf-处理)
  - [17. 文本识别（Vision）](#17-文本识别vision)
  - [18. 翻译](#18-翻译)
  - [19. 加密与安全](#19-加密与安全)
  - [20. 本地认证（生物识别）](#20-本地认证生物识别)
  - [21. OAuth2 授权](#21-oauth2-授权)
  - [22. 键盘管理](#22-键盘管理)
  - [23. 自定义键盘](#23-自定义键盘)
  - [24. 代码编辑器](#24-代码编辑器)
  - [25. 快速预览（QuickLook）](#25-快速预览quicklook)
  - [26. 音频会话管理](#26-音频会话管理)
  - [27. Assistant Tool（智能助手工具）](#27-assistant-tool智能助手工具)
  - [28. 路径处理（Path）](#28-路径处理path)
  - [29. UUID 生成](#29-uuid-生成)
  - [30. 重复规则（Recurrence）](#30-重复规则recurrence)
  - [31. 日期组件（DateComponents）](#31-日期组件datecomponents)
  - [32. 导航与视图呈现](#32-导航与视图呈现)
- [第二部分：UI 设计规范](#第二部分ui-设计规范)
  - [1. 布局系统](#1-布局系统)
  - [2. 文本与输入](#2-文本与输入)
  - [3. 颜色系统](#3-颜色系统)
  - [4. 形状与裁剪](#4-形状与裁剪)
  - [5. 样式与渐变](#5-样式与渐变)
  - [6. 对齐方式](#6-对齐方式)
  - [7. 工具栏](#7-工具栏)
  - [8. 菜单](#8-菜单)
  - [9. 时间标签组件](#9-时间标签组件)
  - [10. 深色模式适配](#10-深色模式适配)
  - [11. 小组件开发约束](#11-小组件开发约束)

---

# 第一部分：功能总览

## 1. 小组件（Widget）

**核心能力：** 在 iOS 主屏幕、锁屏展示自定义 UI 内容。

| 功能 | API / 说明 |
|------|-----------|
| 渲染小组件 UI | `Widget.present(element, reloadPolicy?)` |
| 获取小组件尺寸 | `Widget.family` — `systemSmall` / `systemMedium` / `systemLarge` / `accessoryRectangular` / `accessoryCircular` |
| 获取显示尺寸 | `Widget.displaySize` — `{ width, height }`（单位：点） |
| 获取用户参数 | `Widget.parameter` — 用户在小组件配置中设置的自定义参数 |
| 预览小组件 | `Widget.preview(options?)` — 仅在 `index.tsx` 中使用 |
| 刷新所有小组件 | `Widget.reloadAll()` — 请求 WidgetKit 重新加载时间线 |
| 刷新策略 | `atEnd`（默认）/ `after`（指定时间后刷新） |

**约束：**
- 小组件中 Hooks 不生效（一次性渲染）
- 内存限制约 30MB
- `Widget.present()` 调用后上下文立即销毁
- 预览与实际主屏幕渲染可能有差异

---

## 2. 控件（Control Widget）

**核心能力：** 在控制中心或锁屏添加按钮/开关控件。

| 组件 | 说明 |
|------|------|
| `ControlWidgetButton` | 按钮控件，绑定 AppIntent 触发操作 |
| `ControlWidgetToggle` | 开关控件，自动管理布尔状态 |
| `ControlWidget.present(element)` | 呈现控件 UI |
| `ControlWidget.parameter` | 用户配置的参数值 |
| `ControlWidget.reloadButtons()` | 刷新所有按钮控件 |
| `ControlWidget.reloadToggles()` | 刷新所有开关控件 |

**控件属性：**
- `privacySensitive` — 锁屏时隐藏内容
- `intent` — 绑定的 AppIntent
- `label` — 标题 + SF Symbols 图标
- `activeValueLabel` / `inactiveValueLabel` — 状态标签

---

## 3. 通知（Notification）

**核心能力：** 安排本地通知，支持多种触发方式和富交互界面。

### 触发器类型

| 触发器 | 说明 |
|--------|------|
| `TimeIntervalNotificationTrigger` | 指定秒数后触发，支持重复 |
| `CalendarNotificationTrigger` | 根据日期/时间触发（每日、每周等） |
| `LocationNotificationTrigger` | 进入/离开地理区域时触发 |

### 通知功能

| 功能 | 说明 |
|------|------|
| 标题/副标题/正文 | `title` / `subtitle` / `body` |
| 角标 | `badge` — 应用图标角标数字 |
| 静默投递 | `silent: true` |
| 重要级别 | `interruptionLevel` — `active` / `passive` / `timeSensitive` |
| 自定义数据 | `userInfo` — 附加的自定义数据 |
| 分组标识 | `threadIdentifier` |
| 操作按钮 | `actions` — 展开后显示的操作按钮 |
| 富通知 UI | `customUI: true` + `notification.tsx` + `Notification.present(<JSX>)` |
| 点击行为 | `tapAction` — `none` / `runScript` / `openURL` |

### 通知管理

- `getAllDelivereds()` / `getAllPendings()` — 获取通知
- `removeAllDelivereds()` / `removeAllPendings()` — 移除通知
- `setBadgeCount(count)` — 设置角标
- `Notification.current` — 获取当前通知上下文

---

## 4. 日历与事件

### 日历管理（Calendar）

| 功能 | API |
|------|-----|
| 获取默认日历 | `Calendar.defaultForEvents()` / `Calendar.defaultForReminders()` |
| 列出日历 | `Calendar.forEvents()` / `Calendar.forReminders()` |
| 创建日历 | `Calendar.create({ title, entityType, sourceType, color? })` |
| 日历选择器 | `Calendar.presentChooser(allowMultipleSelection?)` |
| 获取账户源 | `Calendar.getSources()` |
| 删除/保存 | `calendar.remove()` / `calendar.save()` |

### 日历事件（CalendarEvent）

| 功能 | API |
|------|-----|
| 创建事件 | `new CalendarEvent()` + 设置属性 + `save()` |
| 获取事件 | `CalendarEvent.getAll(startDate, endDate, calendars?)` |
| 创建视图 | `CalendarEvent.presentCreateView()` |
| 编辑视图 | `event.presentEditView()` |
| 删除事件 | `event.remove()` |
| 重复规则 | `event.addRecurrenceRule(rule)` / `event.removeRecurrenceRule(rule)` |

**事件属性：** `title`, `notes`, `url`, `isAllDay`, `startDate`, `endDate`, `location`, `timeZone`, `attendees`, `recurrenceRules`

---

## 5. 提醒事项（Reminder）

| 功能 | API |
|------|-----|
| 创建提醒 | `new Reminder()` + 设置属性 + `save()` |
| 获取全部 | `Reminder.getAll(calendars?)` |
| 未完成提醒 | `Reminder.getIncompletes({ startDate?, endDate?, calendars? })` |
| 已完成提醒 | `Reminder.getCompleteds({ startDate?, endDate?, calendars? })` |
| 标记完成 | `reminder.isCompleted = true` + `save()` |
| 删除提醒 | `reminder.remove()` |
| 重复规则 | `addRecurrenceRule()` / `removeRecurrenceRule()` |

**属性：** `title`, `notes`, `isCompleted`, `priority`, `completionDate`, `dueDateComponents`, `recurrenceRules`

---

## 6. 网络请求（Fetch）

**核心能力：** 与 Web 标准兼容的 `fetch` 接口。

| 功能 | 说明 |
|------|------|
| GET/POST/PUT/DELETE | `fetch(url, init?)` |
| 请求头管理 | `Headers` 类 — append/get/set/delete/forEach |
| 表单上传 | `FormData` — 支持 multipart/form-data |
| 请求取消 | `AbortController` / `AbortSignal` |
| 超时控制 | `timeout` / `connectTimeout` / `receiveTimeout` |
| 重定向控制 | `shouldAllowRedirect` 回调 |
| 非安全请求 | `allowInsecureRequest: true`（允许 HTTP） |
| 调试标签 | `debugLabel` — 日志显示 |
| Cookie 访问 | `Response.cookies` |
| 响应格式 | `json()` / `text()` / `data()` / `bytes()` / `arrayBuffer()` / `formData()` |

---

## 7. WebSocket 与 Socket.IO

### WebSocket

| 功能 | 说明 |
|------|------|
| 创建连接 | `new WebSocket(url)` |
| 发送数据 | `send(string \| Data)` |
| 接收消息 | `onmessage` / `addEventListener("message", ...)` |
| 关闭连接 | `close(code?, reason?)` |
| 事件监听 | `open` / `error` / `message` / `close` |

### Socket.IO

| 功能 | 说明 |
|------|------|
| 管理器 | `SocketManager(url, config?)` — 管理多个命名空间 |
| 客户端 | `SocketIOClient` — 单个 socket 连接 |
| 发送事件 | `emit(event, data)` |
| 监听事件 | `on(event, callback)` |
| 自动重连 | `reconnects` / `reconnectAttempts` / `reconnectWait` |
| 命名空间 | `manager.socket("/namespace")` |
| 配置 | `compress` / `connectParams` / `cookies` / `extraHeaders` |

---

## 8. WebView

**核心能力：** 加载和交互 Web 内容。

| 功能 | API |
|------|-----|
| 加载 URL | `loadURL(url)` |
| 加载 HTML | `loadHTML(html, baseURL?)` |
| 加载数据 | `loadData(data, mimeType, encoding, baseURL)` |
| 执行 JS | `evaluateJavaScript<T>(javascript)` |
| 消息通信 | `addScriptMessageHandler(name, handler)` |
| 导航 | `goBack()` / `goForward()` / `reload()` / `canGoBack()` / `canGoForward()` |
| 获取 HTML | `getHTML()` |
| 模态展示 | `present({ fullscreen?, navigationTitle? })` |
| 关闭/释放 | `dismiss()` / `dispose()` |
| 请求拦截 | `shouldAllowRequest` 回调 — 拦截/过滤请求 |
| 嵌入组件 | `<WebView controller={controller} />` |

---

## 9. 视频与音频播放

### VideoPlayer

| 功能 | 说明 |
|------|------|
| 创建播放器 | `new AVPlayer()` |
| 设置源 | `player.setSource(url)` |
| 播放控制 | `play()` / `pause()` / `stop()` |
| 音量/速率 | `volume` / `rate` / `numberOfLoops` |
| 事件回调 | `onReadyToPlay` / `onEnded` / `onError` / `onTimeControlStatusChanged` |
| 覆盖 UI | `<VideoPlayer player={player} overlay={<JSX>} />` |
| 释放资源 | `player.dispose()` |

### MediaPlayer（Now Playing Center）

| 功能 | 说明 |
|------|------|
| 设置播放信息 | `MediaPlayer.nowPlayingInfo = { title, artist, albumTitle, artwork, ... }` |
| 播放状态 | `playbackState` — `unknown` / `playing` / `paused` / `stopped` / `interrupted` |
| 可用命令 | `setAvailableCommands(["play", "pause", "nextTrack", ...])` |
| 命令处理 | `commandHandler = (command, event) => { ... }` |
| 支持命令 | play / pause / stop / nextTrack / previousTrack / seekForward / seekBackward / skipForward / skipBackward / rating / like / dislike / bookmark / changeRepeatMode / changeShuffleMode |

---

## 10. 位置与地理

| 功能 | API |
|------|-----|
| 获取当前位置 | `Location.requestCurrent({ forceRequest? })` |
| 地图选点 | `Location.pickFromMap()` |
| 逆地理编码 | `Location.reverseGeocode({ latitude, longitude, locale? })` |
| 设置精度 | `Location.setAccuracy("best" / "tenMeters" / "hundredMeters" / "kilometer" / "threeKilometers")` |
| 权限检查 | `Location.isAuthorizedForWidgetUpdates()` |

**LocationPlacemark 包含：** `country`, `administrativeArea`, `locality`, `subLocality`, `thoroughfare`, `subThoroughfare`, `postalCode`, `isoCountryCode`, `name`, `areasOfInterest`, `timeZone` 等。

---

## 11. 天气

| 功能 | API |
|------|-----|
| 当前天气 | `Weather.requestCurrent(location)` — 温度、体感温度、湿度、风速、天气状况 |
| 每日预报 | `Weather.requestDailyForecast(location, { startDate?, endDate? })` |
| 每小时预报 | `Weather.requestHourlyForecast(location, { startDate?, endDate? })` |

**天气状况：** `clear` / `rain` / `snow` / `thunderstorms` / `cloudy` / `windy` 等。

---

## 12. 设备信息

| 属性 | 说明 |
|------|------|
| `Device.model` | 设备型号 |
| `Device.systemVersion` | 系统版本 |
| `Device.systemName` | 系统名称（"iOS"） |
| `Device.isiPad` / `Device.isiPhone` | 设备类型判断 |
| `Device.isiOSAppOnMac` | 是否在 Mac 上运行 |
| `Device.batteryState` | 电池状态 — `full` / `charging` / `unplugged` / `unknown` |
| `Device.batteryLevel` | 电池电量（0.0 ~ 1.0） |
| `Device.screen` | 屏幕尺寸 `{ width, height, scale }` |
| `Device.isLandscape` / `Device.isPortrait` / `Device.isFlat` | 设备方向 |
| `Device.colorScheme` | 外观 — `light` / `dark` |
| `Device.systemLocale` / `Device.systemLocales` | 区域设置 |
| `Device.systemLanguageTag` / `Device.systemLanguageCode` | 语言信息 |
| `Device.setWakeLockEnabled(bool)` | 唤醒锁 — 防止自动熄屏 |

---

## 13. 联系人

| 功能 | API |
|------|-----|
| 创建联系人 | `Contact.createContact({ givenName, familyName, phoneNumbers, ... })` |
| 更新联系人 | `Contact.updateContact({ identifier, ... })` |
| 查询联系人 | `Contact.fetchContact(id)` / `Contact.fetchAllContacts()` |
| 删除联系人 | `Contact.deleteContact(id)` |
| 容器管理 | `Contact.fetchContainers()` / `Contact.defaultContainerIdentifier` |
| 组管理 | `Contact.createGroup()` / `Contact.fetchGroups()` / `Contact.deleteGroup()` |
| 组关系 | `Contact.addContactToGroup()` / `Contact.removeContactFromGroup()` |

**联系人字段：** `givenName`, `familyName`, `phoneNumbers`, `emailAddresses`, `postalAddresses`, `socialProfiles`, `instantMessageAddresses`, `imageData` 等。

---

## 14. 邮件与短信

### 邮件（Mail）

| 功能 | API |
|------|-----|
| 检测可用性 | `Mail.isAvailable` |
| 发送邮件 | `Mail.present({ toRecipients, ccRecipients?, bccRecipients?, subject?, body?, attachments? })` |
| 返回状态 | `"sent"` / `"cancelled"` / `"failed"` / `"saved"` |

### 短信（MessageUI）

| 功能 | API |
|------|-----|
| 检测可用性 | `MessageUI.isAvailable` / `MessageUI.canSendSubject` / `MessageUI.canSendAttachments` |
| 发送短信 | `MessageUI.present({ recipients, body, subject?, attachments? })` |
| 返回状态 | `"sent"` / `"cancelled"` / `"failed"` |

---

## 15. 文件与文档

### 文档选择器（DocumentPicker）

| 功能 | API |
|------|-----|
| 选择文件 | `DocumentPicker.pickFiles({ initialDirectory?, types?, allowsMultipleSelection? })` |
| 选择目录 | `DocumentPicker.pickDirectory(initialDirectory?)` |
| 导出文件 | `DocumentPicker.exportFiles({ files: [{ data, name }] })` |
| 释放资源 | `DocumentPicker.stopAcessingSecurityScopedResources()` |

### 路径处理（Path）

| 方法 | 说明 |
|------|------|
| `Path.normalize(path)` | 规范化路径 |
| `Path.isAbsolute(path)` | 判断是否为绝对路径 |
| `Path.join(...args)` | 拼接路径段 |
| `Path.dirname(path)` | 获取目录名 |
| `Path.basename(path, ext?)` | 获取文件名 |
| `Path.extname(path)` | 获取扩展名 |
| `Path.parse(path)` | 解析为结构化对象 |

---

## 16. PDF 处理

### PDFDocument

| 功能 | API |
|------|-----|
| 从文件加载 | `PDFDocument.fromFilePath(path)` |
| 从数据加载 | `PDFDocument.fromData(data)` |
| 获取页面 | `doc.pageAt(index)` |
| 插入/删除页面 | `doc.insertPageAt(page, index)` / `doc.removePageAt(index)` |
| 交换页面 | `doc.exchangePage(index1, index2)` |
| 获取文本 | `await doc.string` |
| 获取数据 | `await doc.data` |
| 元数据 | `doc.documentAttributes` — author / title / creationDate / keywords 等 |
| 保存 | `doc.write(path, options?)` / `doc.writeSync(path, options?)` |
| 加密保存 | `options: { ownerPassword, userPassword, burnInAnnotations, saveTextFromOCR }` |
| 解锁 | `doc.unlock(password)` |

### PDFPage

| 功能 | API |
|------|-----|
| 从图片创建 | `PDFPage.fromImage(image)` |
| 获取文本 | `await page.string` |
| 获取数据 | `await page.data` |

---

## 17. 文本识别（Vision）

| 功能 | API |
|------|-----|
| 图片文本识别 | `Vision.recognizeText(image, options?)` |
| 相机扫描文档 | `Vision.scanDocument(options?)` |

**识别选项：**
- `recognitionLevel` — `"accurate"` / `"fast"`
- `recognitionLanguages` — 语言数组（如 `["zh-Hans", "en"]`）
- `usesLanguageCorrection` — 语言纠错
- `minimumTextHeight` — 最小文本高度
- `customWords` — 补充词汇表

**识别结果：** `text`（完整文本）、`candidates`（文本块数组，含 `content`、`confidence`、`boundingBox`）

---

## 18. 翻译

| 功能 | API |
|------|-----|
| 翻译文本 | `Translation.shared.translate({ text, source?, target? })` |
| 批量翻译 | `Translation.shared.translateBatch({ texts, source?, target? })` |

- 语言代码使用 ISO 639-1 标准
- 支持自动检测源语言
- iOS 18.0+ 支持

---

## 19. 加密与安全

### 哈希

| 算法 | API |
|------|-----|
| MD5 | `Crypto.md5(data)` |
| SHA-1 | `Crypto.sha1(data)` |
| SHA-256 | `Crypto.sha256(data)` |
| SHA-384 | `Crypto.sha384(data)` |
| SHA-512 | `Crypto.sha512(data)` |

### HMAC

| 算法 | API |
|------|-----|
| HMAC-MD5/SHA1/SHA224/SHA256/SHA384/SHA512 | `Crypto.hmacXXX(data, key)` |

### 对称加密

| 功能 | API |
|------|-----|
| 生成密钥 | `Crypto.generateSymmetricKey(size?)` — 默认 256 位 |
| AES-GCM 加密 | `Crypto.encryptAESGCM(data, key, { iv?, aad? })` |
| AES-GCM 解密 | `Crypto.decryptAESGCM(data, key, aad?)` |

---

## 20. 本地认证（生物识别）

| 功能 | API |
|------|-----|
| 检测可用性 | `LocalAuth.isAvailable` / `LocalAuth.isBiometricsAvailable` |
| 生物识别类型 | `LocalAuth.biometryType` — `faceID` / `touchID` / `opticID` / `none` |
| 执行认证 | `LocalAuth.authenticate(reason, useBiometrics?)` |

---

## 21. OAuth2 授权

| 功能 | API |
|------|-----|
| 创建实例 | `new OAuth2({ consumerKey, consumerSecret, authorizeUrl, accessTokenUrl?, responseType })` |
| 发起授权 | `oauth.authorize({ scope, state, callbackURL?, parameters?, headers?, codeVerifier?, codeChallenge?, codeChallengeMethod? })` |
| 刷新令牌 | `oauth.renewAccessToken({ refreshToken, parameters?, headers? })` |

**支持：** 标准授权码流程、PKCE、Basic 认证、自定义回调 URL。

---

## 22. 键盘管理

| 功能 | API |
|------|-----|
| 检查可见性 | `Keyboard.visible` |
| 隐藏键盘 | `Keyboard.hide()` |
| 监听变化 | `Keyboard.addVisibilityListener(fn)` / `Keyboard.removeVisibilityListener(fn)` |
| Hook | `useKeyboardVisible()` — 响应式跟踪键盘状态 |

---

## 23. 自定义键盘

**环境要求：** 在 `keyboard.tsx` 文件中开发。

| 功能 | API |
|------|-----|
| 展示键盘 | `CustomKeyboard.present(node)` |
| 输入状态 | `textBeforeCursor` / `textAfterCursor` / `selectedText` / `hasText` |
| 输入特征 | `useTraits()` — `keyboardType` / `returnKeyType` / `textContentType` 等 |
| 插入文本 | `CustomKeyboard.insertText(text)` |
| 删除字符 | `CustomKeyboard.deleteBackward()` |
| 移动光标 | `CustomKeyboard.moveCursor(offset)` |
| 标记文本 | `setMarkedText()` / `unmarkText()` |
| 关闭键盘 | `CustomKeyboard.dismiss()` |
| 切换键盘 | `CustomKeyboard.nextKeyboard()` |
| 调整高度 | `CustomKeyboard.requestHeight(height)` — 推荐 216~360pt |
| 语音按钮 | `setHasDictationKey(bool)` |
| 工具栏 | `setToolbarVisible(bool)` |
| 返回首页 | `CustomKeyboard.dismissToHome()` |
| 按键音 | `CustomKeyboard.playInputClick()` |
| 事件监听 | `addListener(event, callback)` — `textWillChange` / `textDidChange` / `selectionWillChange` / `selectionDidChange` |

---

## 24. 代码编辑器

| 功能 | API |
|------|-----|
| 创建控制器 | `new EditorController({ content?, ext?, readOnly? })` |
| 支持语言 | `tsx` / `ts` / `js` / `jsx` / `txt` / `md` / `css` / `html` / `json` |
| 内容变更 | `onContentChanged` — 约 100ms 防抖 |
| 模态展示 | `controller.present({ navigationTitle?, scriptName?, fullscreen? })` |
| 关闭/释放 | `controller.dismiss()` / `controller.dispose()` |
| 内联组件 | `<Editor controller={controller} scriptName? showAccessoryView? />` |

---

## 25. 快速预览（QuickLook）

| 功能 | API |
|------|-----|
| 预览文本 | `QuickLook.previewText(text, fullscreen?)` |
| 预览图片 | `QuickLook.previewImage(image, fullscreen?)` |
| 预览文件 | `QuickLook.previewURLs(urls, fullscreen?)` |

---

## 26. 音频会话管理

| 功能 | API |
|------|-----|
| 设置类别 | `SharedAudioSession.setCategory(category, options?)` |
| 设置模式 | `SharedAudioSession.setMode(mode)` |
| 激活会话 | `SharedAudioSession.setActive(bool)` |
| 采样率 | `setPreferredSampleRate(rate)` |
| 中断监听 | `addInterruptionListener(fn)` / `removeInterruptionListener(fn)` |
| 查询能力 | `availableCategories` / `availableModes` |

**类别：** `ambient` / `multiRoute` / `playAndRecord` / `playback` / `record` / `soloAmbient`
**模式：** `default` / `gameChat` / `measurement` / `moviePlayback` / `spokenAudio` / `videoChat` / `videoRecording` / `voiceChat` / `voicePrompt`

---

## 27. Assistant Tool（智能助手工具）

**核心能力：** 为智能助手提供系统功能扩展。

| 功能 | 说明 |
|------|------|
| 注册需批准的工具 | `AssistantTool.registerApprovalRequest(fn)` |
| 注册带批准的执行 | `AssistantTool.registerExecuteToolWithApproval(fn)` |
| 注册无需批准的工具 | `AssistantTool.registerExecuteTool(fn)` |

**配置文件 `assistant_tool.json`：** `displayName`, `id`, `description`, `icon`, `color`, `parameters`, `requireApproval`, `autoApprove`, `scriptEditorOnly`

---

## 28. 路径处理（Path）

见 [15. 文件与文档](#15-文件与文档) 中的 Path 部分。

---

## 29. UUID 生成

| 功能 | API |
|------|-----|
| 生成 UUID | `UUID.string()` — 返回标准 UUID 格式字符串 |

---

## 30. 重复规则（Recurrence）

| 类型 | 说明 |
|------|------|
| `RecurrenceFrequency` | `daily` / `weekly` / `monthly` / `yearly` |
| `RecurrenceWeekday` | `sunday` ~ `saturday` |
| `RecurrenceDayOfWeek` | 简单 weekday 或 `{ weekday, weekNumber }` |
| `RecurrenceEnd` | `fromCount(n)` / `fromDate(date)` |
| `RecurrenceRule.create(options)` | 创建完整重复规则 |

**规则属性：** `frequency`, `interval`, `daysOfTheWeek`, `daysOfTheMonth`, `monthsOfTheYear`, `weeksOfTheYear`, `daysOfTheYear`, `setPositions`, `recurrenceEnd`

---

## 31. 日期组件（DateComponents）

| 功能 | API |
|------|-----|
| 创建组件 | `new DateComponents({ year?, month?, day?, hour?, minute?, ... })` |
| 从 Date 创建 | `DateComponents.fromDate(date)` |
| 每小时 | `DateComponents.forHourly(date)` |
| 每天 | `DateComponents.forDaily(date)` |
| 每周 | `DateComponents.forWeekly(date)` |
| 每月 | `DateComponents.forMonthly(date)` |
| 验证 | `components.isValidDate` |
| 转换 | `components.date` |

**可设置字段：** `era`, `year`, `quarter`, `month`, `weekOfMonth`, `weekOfYear`, `weekday`, `weekdayOrdinal`, `day`, `hour`, `minute`, `second`, `nanosecond`, `dayOfYear`

---

## 32. 导航与视图呈现

| 功能 | API |
|------|-----|
| 呈现视图 | `Navigation.present({ element })` |
| 关闭视图 | `Navigation.useDismiss()` — 返回 dismiss 函数 |
| 导航容器 | `<NavigationStack>` — 启用导航行为 |
| 导航标题 | `navigationTitle` 属性 |
| 标题显示模式 | `navigationBarTitleDisplayMode` — `"inline"` 等 |
| 脚本退出 | `Script.exit()` — 释放资源，避免内存泄漏 |

---

# 第二部分：UI 设计规范

## 1. 布局系统

### 堆叠布局

| 组件 | 说明 |
|------|------|
| `<VStack>` | 垂直堆叠 — 子视图从上到下排列 |
| `<HStack>` | 水平堆叠 — 子视图从左到右排列 |
| `<ZStack>` | 层叠布局 — 子视图在同一位置叠加 |
| `<Grid>` | 网格布局 |
| `<Spacer>` | 弹性空间，用于推挤对齐 |

### 常用布局属性

- `padding` — 内边距
- `spacing` — 子视图间距
- `frame: { width?, height? }` — 固定尺寸
- `alignment` — 对齐方式

---

## 2. 文本与输入

### 文本组件

| 组件 | 用途 |
|------|------|
| `<Text>` | 显示文本，支持 `font`、`foregroundStyle` 等修饰 |
| `<Label>` | 图标 + 文本组合 |
| `<DateLabel>` | 时间标签（date / time / timer / relative / offset） |
| `<DateRangeLabel>` | 时间范围标签 |
| `<DateIntervalLabel>` | 时间区间标签 |
| `<TimerIntervalLabel>` | 实时计时器标签 |

### 输入组件

| 组件 | 用途 |
|------|------|
| `<TextField>` | 文本输入框 — 支持单行/多行、提示文字、自动聚焦、焦点事件 |
| `<SecureField>` | 安全输入框 — 密码等敏感信息，内容自动隐藏 |
| `<Editor>` | 代码编辑器 — 语法高亮、只读模式 |

**TextField 关键属性：**
- `title` / `label` — 标签（二选一）
- `value` + `onChanged` — 双向绑定
- `prompt` — 占位提示
- `axis` — `"horizontal"`（单行）/ `"vertical"`（多行滚动）
- `lineLimit: { min, max }` — 行数限制
- `autofocus` / `onFocus` / `onBlur` — 焦点控制

---

## 3. 颜色系统

### 支持格式

| 格式 | 示例 |
|------|------|
| HEX | `"#FF5733"` / `"#333"` |
| RGBA | `"rgba(255, 0, 0, 0.8)"` |
| 关键字 | `"red"` / `"systemBlue"` / `"accentColor"` |

### 系统颜色

- **主题色：** `accentColor`, `systemRed`, `systemGreen`, `systemBlue`, `systemOrange`, `systemYellow`, `systemPink`, `systemPurple`, `systemTeal`, `systemIndigo`, `systemBrown`, `systemMint`, `systemCyan`

### 语义颜色

- **标签：** `label`, `secondaryLabel`, `tertiaryLabel`, `quaternaryLabel`
- **填充：** `systemFill`, `secondarySystemFill`, `tertiarySystemFill`, `quaternarySystemFill`
- **背景：** `systemBackground`, `secondarySystemBackground`, `tertiarySystemBackground`, `systemGroupedBackground`, `secondarySystemGroupedBackground`, `tertiarySystemGroupedBackground`
- **分割线：** `separator`, `opaqueSeparator`

### 传统颜色

`black`, `darkGray`, `lightGray`, `white`, `gray`, `red`, `green`, `blue`, `cyan`, `yellow`, `magenta`, `orange`, `purple`, `brown`, `clear`

---

## 4. 形状与裁剪

### 内建形状

| 形状 | 说明 |
|------|------|
| `"rect"` | 矩形 |
| `"circle"` | 圆形（基于最短边） |
| `"capsule"` | 胶囊形 |
| `"ellipse"` | 椭圆 |
| `"buttonBorder"` | 系统按钮边框 |
| `"containerRelative"` | 继承容器形状 |

### 自定义圆角矩形

```tsx
// 统一圆角
clipShape={{ type: 'rect', cornerRadius: 12, style: 'continuous' }}

// 每个角独立控制
clipShape={{
  type: 'rect',
  cornerRadii: { topLeading: 10, topTrailing: 20, bottomLeading: 0, bottomTrailing: 30 }
}}

// 椭圆角
clipShape={{ type: 'rect', cornerSize: { width: 10, height: 20 } }}
```

### 圆角风格

- `"circular"` — 传统圆形圆角
- `"continuous"`（默认）— 连续平滑圆角，现代设计风格

---

## 5. 样式与渐变

### ShapeStyle 类型

| 类型 | 用途 |
|------|------|
| Material | 系统模糊材质 — `regularMaterial`, `thinMaterial`, `ultraThickMaterial` 等 |
| Color | 纯色 — 关键字、HEX、RGBA |
| LinearGradient | 线性渐变 |
| RadialGradient | 径向渐变 |
| AngularGradient | 角向渐变（圆锥渐变） |
| MeshGradient | 网格渐变（iOS 18.0+） |

### 渐变使用方式

```tsx
// 线性渐变
background={gradient("linear", {
  colors: ['green', 'blue'],
  startPoint: 'top',
  endPoint: 'bottom'
})}

// 径向渐变
background={gradient("radial", {
  colors: ['red', 'yellow'],
  center: { x: 0.5, y: 0.5 },
  startRadius: 0,
  endRadius: 100
})}

// 角向渐变
fill={gradient("angular", {
  colors: ["blue", "purple", "pink"],
  center: "center",
  startAngle: 0,
  endAngle: 360
})}
```

### 带透明度和渐变的颜色

```tsx
background={{ color: 'blue', gradient: true, opacity: 0.8 }}
```

---

## 6. 对齐方式

### 基础对齐

- `top` / `center` / `bottom` / `leading` / `trailing`

### 复合对齐

- `topLeading` / `topTrailing` / `bottomLeading` / `bottomTrailing`

### 文本基线对齐

- `centerFirstTextBaseline` / `centerLastTextBaseline`
- `leadingFirstTextBaseline` / `leadingLastTextBaseline`
- `trailingFirstTextBaseline` / `trailingLastTextBaseline`

---

## 7. 工具栏

通过 `toolbar` 属性为导航栏、底部工具栏或键盘附加区域添加操作项。

### 放置位置

| 位置 | 说明 |
|------|------|
| `topBarLeading` | 导航栏前导位置（左侧） |
| `topBarTrailing` | 导航栏尾部位置（右侧） |
| `principal` | 导航栏中间区域 |
| `bottomBar` | 底部工具栏 |
| `keyboard` | 键盘弹出时显示在附加区域 |
| `cancellationAction` | "取消"操作（模态界面） |
| `confirmationAction` | "确认"操作（模态界面） |
| `destructiveAction` | 破坏性操作（红色强调） |
| `primaryAction` | 主要操作 |
| `navigation` | 导航行为（返回/关闭） |

**建议：** 使用 `ControlGroup` 组织功能相关的按钮。

---

## 8. 菜单

`<Menu>` 组件用于将多个操作整合为一个统一入口。

### 属性

| 属性 | 说明 |
|------|------|
| `title` + `systemImage?` | 文字标签 + 可选 SF Symbols 图标 |
| `label` | 自定义视图标签 |
| `primaryAction` | 点击菜单本身的默认操作 |
| `children` | 菜单内容（Button / 嵌套 Menu） |

### 使用场景

- 工具栏中的操作菜单
- 上下文菜单
- 多级嵌套菜单

---

## 9. 时间标签组件

| 组件 | 样式 | 示例输出 |
|------|------|---------|
| `<DateLabel timestamp={...} style="date" />` | 日期 | "June 3, 2019" |
| `<DateLabel style="time" />` | 时间 | "11:23PM" |
| `<DateLabel style="timer" />` | 计时器 | "2:32" |
| `<DateLabel style="relative" />` | 相对时间 | "2 hours, 23 minutes" |
| `<DateLabel style="offset" />` | 偏移 | "+2 hours" |
| `<DateRangeLabel from={...} to={...} />` | 时间范围 | "June 3 – June 5" |
| `<DateIntervalLabel from={...} to={...} />` | 时间区间 | "9:30 AM – 3:30 PM" |
| `<TimerIntervalLabel from={...} to={...} countsDown? />` | 倒计时/正计时 | 实时更新 |

---

## 10. 深色模式适配

使用 `DynamicShapeStyle` 为浅色/深色模式分别定义样式：

```tsx
const dynamicStyle: DynamicShapeStyle = {
  light: "blue",
  dark: "gray"
}

<Text foregroundStyle={dynamicStyle} />
```

**支持：** 纯色、渐变、材质均可作为 light/dark 的值。

**检测当前模式：** `Device.colorScheme` — `"light"` / `"dark"`

---

## 11. 小组件开发约束

### 渲染限制

- **一次性渲染** — Hooks 不生效，无持续交互生命周期
- **内存限制** — 约 30MB，避免过多嵌套视图和图像资源
- **上下文销毁** — `Widget.present()` 调用后代码不再执行

### 尺寸适配

| Family | 说明 |
|--------|------|
| `systemSmall` | 小尺寸 |
| `systemMedium` | 中尺寸 |
| `systemLarge` | 大尺寸 |
| `accessoryCircular` | 锁屏圆形 |
| `accessoryRectangular` | 锁屏矩形 |

使用 `Widget.family` 和 `Widget.displaySize` 动态适配布局。

### 预览限制

应用内预览与主屏幕实际渲染可能有差异：
- 文字对齐
- 小组件尺寸
- 圆角效果
- 布局行为

**建议：** 始终在主屏幕上测试小组件。

### 交互支持

- 使用 `<Button>` 或 `<Toggle>` 触发 AppIntent
- 通过 `Widget.reloadAll()` 刷新小组件

---

> 文档生成时间：2026-07-29
> 基于 Scripting Documentation 中文版整理
