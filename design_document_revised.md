# design_document_revised.md

# 校园记忆播种地图 - 基于现有 HTML 的后续开发设计文档

## 0. 文档目的

本文档用于指导 Codex 在现有 `code_artifact1.html` 的基础上继续分步开发。  


本文档面向 Codex 辅助开发使用，用于把「校园记忆播种地图」拆分为可以逐轮实现、测试、验收的网页项目。项目以南京大学鼓楼校区为核心地图，支持用户在校园地点播种记忆、探索地块、查看未来种子萌发提醒，并通过大模型角色对记忆进行定制化解读。

本项目不做多用户登录与信息共享，所有数据均保存在用户本机浏览器中。用户在同一电脑、同一浏览器、同一网址多次进入网页时，应能看到之前保存的记录。

---


### 0.1 核心概念

用户可以在南京大学鼓楼校区地图上选择任意地点，像「播种」一样存下与该地点相关的记忆。记忆会按时间、地点、地块、标签被存档。用户之后可以在地图上「收获」这些记忆，也可以按校园地块进行「探索」。

项目的关键词是：

- 播种：记录不是普通上传，而是把记忆种在校园地点。
- 生长：同一地点记录越多，地图标记从种子成长为小芽、花、树。
- 探索：用户可以按地块翻看过往记录。
- 陪伴：用户可以选择 AI 角色一起探索，由不同人格对记忆进行解读。
- 萌发：未来种子会在用户设置的日期提醒用户重新查看。

后续开发原则：

1. 不从零重写项目。
2. 继续以现有单文件 HTML 为基础迭代。
3. 每一轮只完成一个明确目标。
4. 每轮结束后，网页必须仍然能打开、能交互、无明显控制台报错。
5. 已实现的地图拖拽、缩放、右键菜单、种子标记、地块 hover、基础播种弹窗、收获弹窗、探索抽屉、AI 角色选择、昼夜切换等功能不要重做，只在原有基础上补齐逻辑。
6. 项目仍然是无后端、单人本地版，不做登录、不做多人共享、不做服务器数据库。
7. 目前不做启动动画。

---

## 1. 现有代码状态归纳

现有 `code_artifact1.html` 已经完成了一个可运行的单文件 React 页面，技术形态为：

```text
HTML 单文件
React 18 UMD
ReactDOM UMD
Babel Standalone
Tailwind CDN
内联 CSS
内联 JSX
localStorage 本地保存
```

### 1.1 已实现的基础 UI 与视觉

已有：

1. 全屏主界面。
2. 毛玻璃 / 全息风格 UI。
3. 日间与夜间两套视觉样式。
4. 地图底图切换：
   - 日间：`底图2.png`
   - 夜间：`底图-夜.png`
5. 页面右侧工具栏。
6. 播种说明书按钮。
7. 探索按钮。
8. `+` / `-` 地图缩放按钮。
9. 昼夜切换按钮。
10. 页面角落提醒小人雏形。
11. 地图边界吸附，避免拖拽露底。
12. 基础动画：
    - breathe
    - orbit
    - float
    - glow-shift
    - stroke-flow

这些基础 UI 不需要重做。

### 1.2 已实现的地图交互

已有：

1. 固定地图坐标系：
   ```js
   MAP_WIDTH = 1536
   MAP_HEIGHT = 1024
   ```
2. 鼠标滚轮缩放地图。
3. 鼠标左键拖拽地图。
4. 地图缩放和平移边界限制。
5. 窗口 resize 后重新校正地图位置。
6. 地图右键获得底图坐标：
   ```js
   selectedPoint = { x, y }
   ```
7. 夜间底图坐标偏移修正：
   ```js
   NIGHT_OFFSET_Y = 8
   ```

这些功能不需要重做。

### 1.3 已实现的地块显示

已有硬编码地块：

```text
南园宿舍区
教超-驿站-食堂
北园教学区
北大楼周边
操场-体育馆
逸夫馆-费楼
```

已有：

1. `CAMPUS_AREAS` 静态地块数组。
2. 每个地块有 `polygon` 字符串。
3. SVG overlay 显示地块区域。
4. 鼠标悬停地块时出现半透明填充。
5. 鼠标悬停地块时出现流光边界动画。

待补齐：

1. 地块没有 `id`。
2. 地块 polygon 目前是字符串，不利于计算。
3. 播种时没有根据坐标自动写入 `areaId`。
4. 探索时没有按地块筛选记录。
5. 还没有地块编辑器。

### 1.4 已实现的播种与本地存储

已有：

1. 地图空白处右键菜单。
2. 选择“播种记忆”打开播种弹窗。
3. 播种弹窗可切换：
   - 记忆种子
   - 未来种子
4. 可填写主题。
5. 可填写文字内容。
6. 可选择预设标签：
   - 期末
   - 初见
   - 毕业
   - 雨天
7. 可上传图片。
8. 图片以 Base64 字符串保存在记录中。
9. 记录保存到 `memories` 状态。
10. 记录同步到：
    ```js
    localStorage.setItem('campus-memories', ...)
    ```
11. 刷新网页后可以从 localStorage 恢复记录。

待补齐：

1. 记忆种子没有用户选择的记忆日期。
2. 未来种子没有萌发日期。
3. 未来种子正文未隐藏。
4. 没有日期范围限制。
5. 没有自定义标签。
6. 没有图片大小限制。
7. 没有 `contentType`。
8. 没有 `areaId`。
9. 没有 `createdAt` / `updatedAt` 的规范字段。
10. 目前使用 localStorage，后续应升级到 IndexedDB 或至少提供备份导出。

### 1.5 已实现的种子标记与聚合

已有：

1. 根据 memories 渲染地图标记。
2. 相近坐标会聚合为一个 cluster。
3. 聚合阈值为 30。
4. 不同记录数量有不同视觉形态：
   - 1 条：小光点种子
   - 2-3 条：环绕小芽
   - 4-6 条：花
   - 7 条以上：树
5. 右键种子标记可以打开种子菜单。

待补齐：

1. 标记没有显示最近主题、地块、记录数量的 hover 卡片。
2. 删除记录后需要确保聚合实时刷新。
3. 未来种子可考虑使用特殊视觉状态。

### 1.6 已实现的收获功能

已有：

1. 右键种子标记出现菜单。
2. 菜单包含：
   - 收获记录
   - 继续播种
   - 取消
3. 点击“收获记录”打开收获弹窗。
4. 弹窗中展示该 cluster 下的记录。
5. 支持展示：
   - 标题
   - 类型
   - 标签
   - 图片
   - 文字
   - 日期

待补齐：

1. 记录未按用户选择日期排序。
2. 未来种子未到期时没有隐藏正文。
3. 没有删除功能。
4. 没有编辑功能。
5. 日期显示使用保存时的当前时间，不符合项目设定。
6. 没有空状态。

### 1.7 已实现的探索与 AI 雏形

已有：

1. 右侧探索抽屉。
2. AI 角色库：
   - 漫游者
   - 艺术家
   - Foody
   - 校园幽灵
   - 档案员
3. 可选择 AI 角色。
4. 最多选择 3 个角色。
5. 已选择角色有视觉状态。
6. 有静态 AI 对话气泡。

待补齐：

1. 没有“秘密探索 / 结伴探索”模式切换。
2. 没有地块选择。
3. 没有按地块读取记录。
4. 没有全局概览记录卡片。
5. 没有局部查看。
6. 没有左右切换记录。
7. AI 输出是静态文本，没有基于地块记忆生成。
8. AI 不应在局部查看中显示。

### 1.8 已实现的提醒小人雏形

已有：

1. 页面右下角有小人 / 晶体图标。
2. 有普通状态和提醒状态视觉变化。
3. 4 秒后会模拟出现未来种子提醒。
4. 点击“确认”可关闭模拟提醒。

待补齐：

1. 没有课表和日程数据。
2. 没有日程面板。
3. 没有提醒引擎。
4. 没有提前 15 分钟提醒。
5. 未来种子提醒未与真实 `sproutDate` 关联。
6. 右键“我知道了”尚未按需求实现。

---

## 2. 删除或不再作为开发任务的内容

以下内容不再写入后续开发任务：

1. 启动界面 p5.js 动画。
2. 从零初始化 Vite React TypeScript 项目。
3. 从零重做地图主界面。
4. 从零重做地图缩放和平移。
5. 从零重做右键菜单。
6. 从零重做基础播种弹窗。
7. 从零重做种子标记。
8. 从零重做地块 hover 流光效果。
9. 从零重做探索抽屉。
10. 从零重做 AI 角色选择 UI。
11. 从零重做提醒小人外观。
12. Leaflet 迁移暂不作为近期任务。

后续所有任务都应以当前 `code_artifact1.html` 为基础补齐功能逻辑。

---

## 3. 后续数据模型规范

### 3.1 MemorySeed 统一结构

后续请逐步把旧记录迁移到以下结构：

```ts
type SeedType = 'memory' | 'future';
type MemoryContentType = 'text' | 'image' | 'mixed';

type MemorySeed = {
  id: string;
  seedType: SeedType;

  title: string;
  contentType: MemoryContentType;

  text?: string;
  image?: string;          // 当前单文件版本继续使用 Base64，后续可迁移 Blob

  memoryDate?: string;     // 记忆种子日期，YYYY-MM-DD
  sproutDate?: string;     // 未来种子萌发日期，YYYY-MM-DD

  mapX: number;
  mapY: number;

  areaId: string;
  areaName: string;

  tags: string[];

  createdAt: string;
  updatedAt: string;
};
```

### 3.2 CampusArea 统一结构

将现有地块数据从：

```js
{ name, polygon: "x,y x,y x,y" }
```

升级为：

```ts
type CampusArea = {
  id: string;
  name: string;
  description?: string;
  polygon: Array<[number, number]>;
};
```

为了兼容 SVG，可提供工具函数：

```ts
polygonToPointsString(polygon)
polygonToPath(polygon)
```

### 3.3 ScheduleItem 结构

```ts
type ScheduleItem = {
  id: string;
  title: string;
  date: string;        // YYYY-MM-DD
  startTime: string;   // HH:mm
  endTime?: string;
  location?: string;
  note?: string;
  type: 'class' | 'event';
  acknowledged?: boolean;
  remindedAt?: string;
  createdAt: string;
  updatedAt: string;
};
```

### 3.4 ReminderEvent 结构

```ts
type ReminderEvent = {
  id: string;
  sourceType: 'schedule' | 'futureSeed';
  sourceId: string;
  triggerAt: string;
  title: string;
  message: string;
  acknowledged: boolean;
};
```

---

## 4. 后续分轮开发计划

## Round 1 - 数据结构升级与兼容迁移

### 目标

在不破坏现有记录的前提下，统一 memory 数据结构，为日期、未来种子、地块、探索、提醒打基础。

### 技术路线

```text
继续使用 localStorage
增加 normalizeMemory()
增加 migrateMemories()
后续再决定是否升级 IndexedDB
```

### Codex 任务说明

请在 `code_artifact1.html` 中完成：

1. 新增 `normalizeMemory(oldMemory)`。
2. 页面加载时，对 localStorage 中的旧数据进行兼容迁移。
3. 将旧字段：
   - `type` 迁移为 `seedType`
   - `content` 迁移为 `text`
   - `date` 迁移为 `memoryDate` 或 `createdAt`
4. 补齐：
   - `contentType`
   - `areaId`
   - `areaName`
   - `createdAt`
   - `updatedAt`
5. 保留旧记录的图片 Base64，不要丢失。
6. 确保刷新页面后旧记录仍能显示。

### 验收标准

1. 旧版本保存的记录仍能显示。
2. 新旧记录统一使用新结构。
3. 控制台无迁移报错。
4. 播种、收获、地图标记仍可用。

---

## Round 2 - 完善播种表单：日期、未来种子、自定义标签

### 目标

补齐记忆种子和未来种子的真实表单逻辑。

### 技术路线

```text
在现有 PlantModal 上增量修改
React 受控表单
日期 input
标签输入
表单校验
```

### Codex 任务说明

请完成：

1. 记忆种子增加“记忆日期”字段：
   ```text
   memoryDate
   ```
2. 未来种子增加“萌发日期”字段：
   ```text
   sproutDate
   ```
3. 日期范围限制：
   ```text
   2026-05-01 至 2033-05-01
   ```
4. 记忆种子至少需要文字或图片之一。
5. 未来种子必须填写未来留言和萌发日期。
6. 根据内容自动生成：
   ```text
   contentType: text | image | mixed
   ```
7. 支持自定义标签：
   - 输入标签
   - 添加标签
   - 删除标签
8. 图片大小限制为 3MB。
9. 保存时调用 `getAreaByPoint(mapX, mapY)` 自动写入地块信息。

### 验收标准

1. 记忆种子可以选择日期。
2. 未来种子可以选择萌发日期。
3. 日期超出范围时不能保存。
4. 自定义标签可以保存并显示。
5. 图片过大时有提示。
6. 保存后地图标记仍正常生成。

---

## Round 3 - 地块数据规范化与播种自动归类

### 目标

让程序真正使用地块边界数据，把播种点自动归入地块。

### 技术路线

```text
CAMPUS_AREAS 数据结构升级
point-in-polygon
getAreaByPoint
SVG overlay 兼容新 polygon 数据
```

### Codex 任务说明

请完成：

1. 将 `CAMPUS_AREAS` 改为包含 `id`、`name`、`polygon` 数组的结构。
2. 编写 `pointInPolygon(point, polygon)`。
3. 编写 `getAreaByPoint(mapX, mapY)`。
4. 播种保存时自动写入：
   - `areaId`
   - `areaName`
5. 如果未命中任何地块，写入：
   ```js
   areaId: 'unknown'
   areaName: '其他'
   ```
6. 保持现有 SVG 地块 hover 流光效果不变。
7. 在收获卡片中显示所属地块。

### 验收标准

1. 不同地块播种后能保存不同 `areaId`。
2. 旧地块 hover 效果仍然存在。
3. 未命中地块不会报错。
4. 记录卡片能看到地块名称。

---

## Round 4 - 地块编辑器：手动描点、保存、导出边界(已完成)

### 目标

提供一个开发者使用的地块编辑模式，让用户可以在底图上手动画地块边界，并导出 JSON。

### 技术路线

```text
新增 AreaEditor 状态
复用当前 mapX/mapY 坐标换算
SVG polyline / polygon 预览
JSON 导出 / 导入
```

### Codex 任务说明

请完成：

1. 增加一个隐藏入口，例如：
   ```text
   Shift + E 打开 / 关闭地块编辑器
   ```
   或增加临时“地块编辑”按钮。
2. 编辑器面板中可以选择当前地块。
3. 在编辑模式下，点击地图记录当前点位：
   ```js
   [mapX, mapY]
   ```
4. 显示已点击点位的小圆点。
5. 用线段连接点位。
6. 支持：
   - 撤销上一点
   - 清空当前地块
   - 闭合多边形
   - 保存当前地块
7. 支持导出 `campusAreas.json`。
8. 支持导入 `campusAreas.json`。
9. 导出格式：

```json
{
  "map": {
    "width": 1536,
    "height": 1024,
    "dayImage": "底图2.png",
    "nightImage": "底图-夜.png"
  },
  "areas": []
}
```

10. 普通模式下，编辑器不显示，不影响播种和收获。

### 验收标准

1. 可以手动点击生成多边形。
2. 可以撤销和清空。
3. 可以导出 JSON。
4. 导入 JSON 后地块 overlay 正常显示。
5. 地块编辑模式不会影响普通播种功能。

---

## Round 5 - 收获面板升级：排序、未来种子隐藏、删除

### 目标

让收获面板符合“按时间收获记忆”和“未来种子萌发”的需求。

### 技术路线

```text
在现有 HarvestModal 上增量修改
日期排序
未来种子日期判断
删除记录
```

### Codex 任务说明

请完成：

1. 记录按日期倒序或正序展示，可提供切换按钮。
2. 记忆种子显示：
   - 主题
   - 记忆日期
   - 地块
   - 标签
   - 图片
   - 文字
3. 未来种子未到 `sproutDate` 时：
   - 显示标题
   - 显示萌发日期
   - 显示标签
   - 隐藏正文
   - 显示“这颗未来种子尚未萌发”
4. 到达 `sproutDate` 当天及之后：
   - 显示未来留言
   - 显示“已萌发”
5. 每条记录支持删除。
6. 删除后：
   - localStorage 更新
   - 地图 cluster 自动刷新
   - 当前 cluster 无记录时关闭收获面板或显示空状态

### 验收标准

1. 收获面板日期显示正确。
2. 未来种子未到期时正文不可见。
3. 到期后正文可见。
4. 删除记录后地图标记实时变化。

---

## Round 6 - 探索界面升级：地块选择、模式切换、全局概览

### 目标

把当前探索抽屉从“AI 对话展示”升级为真正的地块探索界面。

### 技术路线

```text
保留现有 ExploreDrawer 外观
增加 area selector
增加 exploreMode state
按 areaId 筛选 memories
增加记录卡片网格
```

### Codex 任务说明

请完成：

1. 在探索抽屉顶部增加地块选择。
2. 地块列表来自 `CAMPUS_AREAS`，并包含“其他”。
3. 每个地块显示记录数量。
4. 增加探索模式切换：
   - 秘密探索
   - 结伴探索
5. 秘密探索模式：
   - 只显示该地块记录卡片
   - 不显示 AI 对话
6. 结伴探索模式：
   - 显示 AI 角色选择
   - 显示 AI 对话
   - 显示该地块记录卡片
7. 全局概览中平铺该地块所有记录。
8. 如果该地块无记录，显示空状态。

### 验收标准

1. 可以选择不同地块。
2. 每个地块只显示自己的记录。
3. 秘密探索不显示 AI。
4. 结伴探索显示角色选择与对话。
5. 无记录地块有清晰提示。

---

## Round 7 - 局部查看：记录详情与左右切换

### 目标

完成探索界面的“局部查看”功能。

### 技术路线

```text
selectedMemoryIndex
全局概览 / 局部查看两种视图
左右按钮
键盘方向键
```

### Codex 任务说明

请完成：

1. 在探索全局概览中点击某条记录，进入局部查看。
2. 局部查看中用大卡片重点展示当前记录。
3. 支持左 / 右按钮切换记录。
4. 支持键盘方向键切换记录。
5. 支持返回全局概览。
6. 局部查看时不显示 AI 对话。
7. 未来种子的隐藏 / 萌发逻辑与收获面板保持一致。

### 验收标准

1. 点击记录可进入局部查看。
2. 左右切换不会越界。
3. 返回全局概览后状态正常。
4. 局部查看不显示 AI 对话。

---

## Round 8 - AI Mock 解读从静态文本改为基于地块记录生成

### 目标

让 AI 角色对话基于当前地块的真实记录，而不是固定文案。

### 技术路线

```text
buildAreaMemorySummary()
mockGenerateInsight(role, area, memories)
保持无后端
```

### Codex 任务说明

请完成：

1. 编写 `buildAreaMemorySummary(area, memories)`。
2. 编写 `mockGenerateInsight(roleId, area, memories)`。
3. 不同角色输出不同风格：
   - 漫游者：空间、路线、偶遇
   - 艺术家：形式美、诗意
   - Foody：只关注食物相关记录
   - 校园幽灵：神秘但不恐怖
   - 档案员：时间线、标签、主题总结
4. AI 输出基于当前选择地块的记录数量、主题、标签、文字。
5. 不要编造具体不存在的事实。
6. 当前地块无记录时，不生成 AI 解读。
7. AI 仍只在“结伴探索”的全局概览中展示。

### 验收标准

1. 不同地块的 AI 解读不同。
2. 不同角色的语气不同。
3. 无记录时不生成伪内容。
4. 切换地块后 AI 文案更新。

---

## Round9 - 简单后端用于 API 请求

### 目标：引入一个最小后端，实现 AI 角色解读请求接口。

### 任务要求：

使用 Node.js + Express（或 Fastify）搭建简单后端。
实现 /api/ai POST 接口，接收 JSON 请求：
{
  "areaId": "library",
  "memories": [
    {
      "id": "uuid",
      "title": "记忆主题",
      "content": "文字内容",
      "tags": ["期末"]
    }
  ],
  "selectedRoles": ["漫游者","档案员"]
}
返回模拟 AI 解读 JSON：
{
  "responses": [
    {"role": "漫游者", "text": "漫游者解读内容..."},
    {"role": "档案员", "text": "档案员总结..."}
  ]
}
配置 CORS，允许前端调用。
前端调用此接口获取 AI 对话内容，替代纯本地 Mock。

### 交付物：

server/ 文件夹：API 实现
package.json 依赖
前端测试调用 /api/ai 的示例
## Round10 - AI 角色整合

### 目标：前端探索界面调用后端 API 获取真实或 Mock AI 输出。

### 任务要求：

修改 AIInsightPanel 调用 /api/ai 接口。
显示角色对话气泡和头像。
增加加载状态提示（Spinner/Typing）。
保留前端 Mock 备用方案。

### 交付物：

更新后的 AIInsightPanel.tsx
前端 API 调用集成
加载和异常提示功能
## Round11 - 提醒与未来种子

### 目标：完善课程、日程和未来种子提醒功能。

### 任务要求：

ReminderPet 角落图标显示提醒。
检测当天未来种子萌发。
用户右键菜单包含“我知道了”。
确保课程/日程提醒功能正常。

### 交付物：

ReminderPet.tsx 更新逻辑
未来种子通知功能
本地日程/课程提醒功能
## Round12 - 探索与数据备份

### 目标：完成探索界面和备份功能。

### 任务要求：

全局概览和局部查看功能完整。
JSON 导入/导出备份功能。
确认 point-in-polygon 判定正确，播种点归属地块准确。

### 交付物：

BackupPanel.tsx 与相关工具函数
JSON 导入/导出功能验证
探索界面更新，显示 areaId 对应记录
## Round13、14 - 删除
启动动画及相关功能不再实现。
其他 round13、14 功能全部删除。
## Round15 - 最终打包

### 目标：生成生产环境可部署版本。

### 任务要求：

前端运行 npm run build 生成生产包。
验证前端调用后端 API 正常工作。
资源优化、压缩。
准备 dist/ 文件夹用于部署。
更新 README，包含本地运行说明。

### 交付物：

dist/ 生产版本
README 使用说明
前端/后端接口集成验证
八、通用说明给 Codex
前端使用 Vite + React + TypeScript。
数据存储仍为 IndexedDB / Dexie。
现有 UI 功能保持不变，开发应在现有基础上扩展。
Round9 为最小后端引入 API；Round10-12 在此基础上实现功能。
Round13、14 功能已删除。
Round15 为生产打包。
开发顺序建议：后端API → AI整合 → 提醒与未来种子 → 探索与备份 → 打包。
