# Scripting

一个用于创建 iOS 小组件的脚本项目，使用 TypeScript 和 React/JSX 编写。

## 项目结构

```
Scripting/
├── dts/                    # TypeScript 类型定义
│   ├── global.d.ts        # 全局类型定义
│   └── scripting.d.ts     # 脚本系统类型定义
├── scripts/               # 脚本目录
│   └── 联通/              # 中国联通脚本
│       ├── index.tsx      # 设置页面
│       ├── widget.tsx     # 小组件页面
│       └── script.json    # 脚本配置
└── tsconfig.json          # TypeScript 配置
```

## 功能特性

### 联通脚本

- 📊 **流量显示**：显示剩余通用流量和其他流量（省内流量、闲时流量等）
- 💰 **话费查询**：实时显示账户余额
- 📞 **语音查询**：显示剩余通话时长
- 🎨 **暗色模式支持**：自动适配浅色/暗色模式
- ⚙️ **自定义配置**：支持自定义颜色、刷新间隔等设置
- 🔄 **自动刷新**：可配置自动刷新频率

## 开发环境

### 前置要求

- Node.js（推荐使用最新 LTS 版本）
- TypeScript
- 支持 JSX 的脚本运行环境

### 安装依赖

```bash
# 安装 TypeScript（如果尚未安装）
npm install -g typescript

# 或使用项目本地安装
npm install
```

### 编译

```bash
# 编译 TypeScript 文件
tsc
```

## 使用说明

### 联通脚本配置

1. **获取 Cookie**
   - 打开联通营业厅 App
   - 登录您的账户
   - 获取登录后的 Cookie（具体方法请参考相关文档）

2. **配置脚本**
   - 运行脚本后进入设置页面
   - 粘贴获取的 Cookie
   - 配置刷新间隔（分钟）
   - 自定义颜色主题（支持浅色/暗色模式）
   - 配置流量显示选项

3. **流量匹配设置**
   - **flowType**：按流量类型匹配（推荐使用 `flowType="3"` 匹配所有其他类型流量）
   - **addupItemCode**：按套餐代码匹配（如 `addupItemCode="40026"`）

## 脚本配置

每个脚本都包含一个 `script.json` 配置文件，用于定义脚本的元数据：

- `name`: 脚本名称
- `version`: 版本号
- `author`: 作者信息
- `description`: 脚本描述
- `icon`: 图标名称
- `color`: 主题颜色
- `localizedNames`: 多语言名称
- `localizedDescriptions`: 多语言描述

## 技术栈

- **TypeScript**: 类型安全的 JavaScript
- **React/JSX**: 用于构建用户界面
- **Scripting API**: 自定义脚本系统 API

## 开发指南

### 添加新脚本

1. 在 `scripts/` 目录下创建新文件夹
2. 创建以下文件：
   - `index.tsx`: 设置页面组件
   - `widget.tsx`: 小组件显示组件
   - `script.json`: 脚本配置文件

3. 参考 `联通/` 目录下的示例代码

### 类型定义

项目使用 TypeScript 进行类型检查，类型定义位于 `dts/` 目录：

- `global.d.ts`: 全局类型和 API
- `scripting.d.ts`: 脚本系统 API 类型定义

### 构建配置

`tsconfig.json` 配置了项目的编译选项：

- 目标版本：ESNext
- JSX 支持：React 模式
- 模块系统：CommonJS
- 路径别名：`scripting` 指向类型定义文件

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

本项目采用 MIT 许可证。

## 作者

- 优化开发：@DTZSGHNR

## 版本历史

- **v1.0.0**: 初始版本，支持联通流量、话费、语音查询
