# Scripting 小组件使用说明

## 联通

推荐使用 BoxJS 代理缓存。

### 第一步：安装 BoxJS

#### Loon 安装 BoxJS

**安装路径：**
配置 > 插件 > 插件

**插件地址：**
```
https://raw.githubusercontent.com/chavyleung/scripts/master/box/rewrite/boxjs.rewrite.loon.plugin
```

#### Quantumult X 安装 BoxJS

**安装路径：**
风车 > 重写 > 引用

**重写路径：**
```
https://raw.githubusercontent.com/chavyleung/scripts/master/box/rewrite/boxjs.rewrite.quanx.conf
```

### 第二步：添加 BoxJS 订阅

**不论是 QX 还是 Loon 都需要添加以下 BoxJS 订阅：**

```
https://raw.githubusercontent.com/Nanako718/Scripting/refs/heads/main/BoxJs/DTZSGHNR.json
```

### 第三步：添加 Cookie 抓取规则

#### Quantumult X

**添加重写：**
```
https://raw.githubusercontent.com/Nanako718/Scripting/refs/heads/main/Quantumult%20X/10010_cookie.conf
```

#### Loon

**添加插件：**
```
http://script.hub/file/_start_/https://raw.githubusercontent.com/Nanako718/Scripting/refs/heads/main/QuantumultX/10010_cookie.conf/_end_/10010_cookie.plugin?n=%E8%81%94%E9%80%9ACookie%2B%20%E8%87%AA%E5%8A%A8%E6%8A%93%E5%8F%96%E4%B8%AD%E5%9B%BD%E8%81%94%E9%80%9A%20riskSync%20%E8%AF%B7%E6%B1%82%E7%9A%84%20Cookie%20%E5%B9%B6%E4%BF%9D%E5%AD%98%E5%88%B0BoxJS&type=qx-rewrite&target=loon-plugin&del=true&jqEnabled=true&icon=%E4%B8%AD%E5%9B%BD%E8%81%94%E9%80%9A
```

---

## PT

### 设置公网地址

```
https://域名:端口
```

### 账号密码

在小组件设置中输入 MoviePilot 的账号和密码。

---

## 油价

一个显示中石化油价趋势的小组件，支持自动定位和多种油号显示。

### 功能特点

- **自动定位**：使用高德地图API自动获取当前省份，无需手动设置
- **趋势图表**：显示最近30条历史价格数据，直观展示油价走势
- **多种油号**：支持E92、E95、E98、0#、-10#等多种油号类型
- **涨跌显示**：实时显示价格涨跌金额和百分比，颜色区分涨跌
- **多尺寸支持**：提供小尺寸和中等尺寸两种widget
- **自动刷新**：点击widget可手动刷新数据

### 使用方法

1. **添加Widget**：在Scripting应用中添加"油价"小组件
2. **设置参数**（可选）：在widget设置中配置要显示的油号
   - 默认值：`E92`（E92#汽油）
   - 可选值：
     - `E92` - E92#汽油
     - `E95` - E95#汽油
     - `E98` - E98#汽油
     - `CHAI_0` - 0#柴油
     - `CHAI_10` - -10#柴油
     - `CHAI_20` - -20#柴油
     - `CHAI_35` - -35#柴油
     - `GAS_92` - 92#汽油
     - `GAS_95` - 95#汽油
     - `GAS_98` - 98#汽油
     - `AIPAO95` - 爱跑95#
     - `AIPAO98` - 爱跑98#
     - `AIPAOE92` - 爱跑E92#
     - `AIPAOE95` - 爱跑E95#
     - `AIPAOE98` - 爱跑E98#

3. **查看数据**：
   - 顶部显示当前省份和选择的油号
   - 中间显示价格趋势图
   - 底部显示当前价格、涨跌金额和百分比

### 数据来源

- 油价数据：中石化官方API

### 注意事项

- 首次使用需要网络连接以获取定位和油价数据
- 不同省份支持的油号可能不同，如果选择的油号在当前省份不可用，将显示为空
- 数据更新可能有延迟，请以加油站实际价格为准

