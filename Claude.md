# R杀武将扩展包 — Claude Code 开发指南

## 最高优先级：先读牌将扩展代码

**在写任何一行代码之前**，你必须先完成以下操作：

```bash
# 1. 找到项目中的牌将扩展
find . -path "*/extension/*" -name "extension.js" | head -20
find . -path "*/extension/*牌将*" -type d
find . -path "*/extension/*paijiang*" -type d

# 2. 完整阅读牌将扩展的 extension.js
cat <牌将扩展路径>/extension.js

# 3. 搜索项目中已有的舰种被动技能实现
grep -rn "装甲防护\|防空\|大角度规避\|火控雷达" --include="*.js" .
grep -rn "zhuangjia\|fangkong\|dajiaodu\|huokong" --include="*.js" .

# 4. 搜索横置/阴阳等关键机制
grep -rn "link\|unlink\|横置\|重置" --include="*.js" . | head -30
grep -rn "阴\|阳\|yinyang\|yin_yang" --include="*.js" . | head -20
```

**所有代码必须严格仿照牌将扩展的写法**——包括变量命名风格、技能结构、translate 格式、武将定义数组格式等。以下模板仅供参考，如与牌将扩展实际代码冲突，以牌将扩展为准。

---

## 项目概述

为无名杀（noname）开发一个武将扩展包，包含 11 名舰船拟人化武将。逐一实现，每个武将做完提交一次。

## 扩展代码参考模板

以下是无名杀标准扩展的 `extension.js` 基本框架。**实际格式以你读到的牌将扩展代码为准。**

```javascript
game.import("extension", function (lib, game, ui, get, ai, _status) {
  return {
    name: "rsha",
    content: function (config, pack) {},
    precontent: function () {},
    config: {},
    package: {
      character: {
        character: {
          // 武将定义：[性别, 势力, 体力值, [技能列表], [描述/标签]]
          // 格式严格对齐牌将扩展中已有武将的写法
          rsha_talin: ["male", "bmcccp", 4, ["rsha_fangkong", "rsha_mijian"]],
          rsha_botelan: ["male", "usn", 4, ["rsha_huokong", "rsha_shanzhan"]],
          // ... 其他武将
        },
        translate: {
          rsha_talin: "塔林",
          rsha_botelan: "波特兰",
          // ... 其他翻译
        },
      },
      card: {
        card: {},
        translate: {},
        list: [],
      },
      skill: {
        skill: {
          // ============================================
          // 塔林 - 弥坚
          // ============================================
          rsha_mijian: {
            audio: 2,
            trigger: { player: "damageEnd" },
            frequent: false,
            filter: function (event, player) {
              return true;
            },
            content: function () {
              "step 0";
              player
                .chooseControl(
                  "摸两张牌",
                  "下一张杀无法被响应",
                  "下一次造成伤害+1",
                  "获得一点护甲"
                )
                .set("prompt", "弥坚：请选择一项")
                .set("ai", function () {
                  if (player.hp <= 1) return 0;
                  return 2;
                });
              "step 1";
              switch (result.index) {
                case 0:
                  player.draw(2);
                  break;
                case 1:
                  player.addTempSkill("rsha_mijian_wuxiao");
                  break;
                case 2:
                  player.addTempSkill("rsha_mijian_jiashang");
                  break;
                case 3:
                  player.changeHujia(1);
                  break;
              }
            },
          },
          // 弥坚子技能：杀不可被响应
          rsha_mijian_wuxiao: {
            trigger: { player: "useCard" },
            forced: true,
            filter: function (event, player) {
              return event.card.name == "sha";
            },
            content: function () {
              trigger.directHit.addArray(game.players);
              player.removeSkill("rsha_mijian_wuxiao");
            },
            charlotte: true,
          },
          // 弥坚子技能：伤害+1
          rsha_mijian_jiashang: {
            trigger: { source: "damageBegin1" },
            forced: true,
            content: function () {
              trigger.num++;
              player.removeSkill("rsha_mijian_jiashang");
            },
            charlotte: true,
          },

          // ============================================
          // 波特兰 - 善战
          // ============================================
          rsha_shanzhan: {
            // 每轮限X+1次，将基本牌当任意基本牌使用/打出
            // X为本局累计造成伤害数
            enable: ["chooseToUse", "chooseToRespond"],
            filterCard: function (card, player) {
              return get.type(card) == "basic";
            },
            viewAs: function (cards, player) {
              // 需要先让玩家选择要转化为哪种基本牌
              // 参考牌将扩展中类似的 viewAs 技能实现
            },
            position: "hs",
            // ... 次数限制和伤害计数器逻辑
          },
          // ... 后续武将技能按同样格式继续
        },
        translate: {
          rsha_mijian: "弥坚",
          rsha_mijian_info:
            "当你受到一点伤害后，你可以选择一项：1.摸两张牌；2.下一张使用的【杀】无法被响应；3.下一次造成的伤害+1；4.获得一点护甲。",
          rsha_shanzhan: "善战",
          rsha_shanzhan_info:
            "每轮限X+1次，你可以将一张基本牌当作任意一张基本牌打出或使用(X为你本局累计造成伤害数)。",
          // ... 其他技能翻译
        },
      },
      intro: "R杀武将扩展包",
      author: "",
      diskURL: "",
      forumURL: "",
      version: "1.0",
    },
    files: { character: [], card: [], skill: [] },
  };
});
```

### 关键格式要求（已确认，覆盖原模板）

1. **武将 ID**：拼音 + `_R` 后缀，SP 武将用 `sp_拼音_R`。例：`talin_R`、`botelan_R`、`sp_miyuki_R`。**不使用 `rsha_` 前缀**。
2. **技能 ID**：纯拼音，无前缀，对齐舰R牌将风格。例：`mijian`、`shanzhan`、`hangmucv`。子技能：`主技能id_描述`，例：`mijian_nores`、`shanzhan_reset`。
3. **势力标识**：直接用舰R牌将 content 函数中注册的字符串：`ΒΜΦCCCP`（苏联）、`USN`（美）、`KMS`（德）、`IJN`（日）、`RN`（英）、`MN`（法）、`PLAN`（共）。
4. **技能结构**：`trigger` / `filter` / `content` / `check` 的写法对齐牌将扩展。
5. **content 中用 `"step 0"` / `"step 1"` 分步**：这是无名杀标准写法，content 函数中用字符串 `"step N"` 做步骤分隔。
6. **子技能独立定义**（不用嵌套 `subSkill`），在 `group` 中关联，用 `charlotte: true` 隐藏。
7. **translate 中 `_info` 后缀**：技能描述的 key 格式为 `技能id_info`。
8. **content 函数不要给参数**（1.10.15+ 版本会报错 `this.content is not a function`），正确写法是 `content: function() {}`，在函数体内直接用 `player` / `event` / `trigger` / `result` 等隐式变量。
9. **注释风格**：尽量详细，说明每个属性/逻辑的含义和目的，帮助理解代码。在关键代码旁用行内注释，在技能块上方用多行注释说明实现思路。

---

## 公共机制（先搜已有实现）

| 机制 | 做法 | 涉及武将 |
|------|------|----------|
| 装甲防护 | 先 grep 项目，有则引用技能ID，无则实现 | 阿拉斯加、提尔比茨 |
| 防空 | 同上 | 德意志A59、塔林、SP大淀 |
| 大角度规避 | 同上 | SP深雪、初霜 |
| 火控雷达 | 同上 | 波特兰 |
| 横置/重置 | 搜索 `player.link` 用法 | 阿拉斯加 |
| 阴/阳切换 | 搜索已有实现 | 阿拉斯加 |

**如果舰种被动在牌将扩展中已存在，直接在武将技能列表中引用其技能 ID，不要重新实现。**

---

## 武将清单与实现顺序（由简到难，逐个实现）

### ① 塔林 `talin` — ⭐
- 势力 BMCCCP | 4/4 | 轻巡 | 防空
- **弥坚**：受到1点伤害后四选一（摸牌/杀不可响应/伤害+1/护甲）
- 纯触发技 + chooseControl，最简单
- 模板代码已在上方给出

### ② 波特兰 `botelan` — ⭐⭐
- 势力 USN | 4/4 | 重巡 | 火控雷达
- **善战**：每轮限X+1次，基本牌转化（X=累计伤害）
- 需要维护 `storage` 伤害计数 + `roundCount` 次数限制 + viewAs

### ③ SP深雪 `sp_miyuki` — ⭐⭐
- 势力 IJN | 3/3 | 驱逐 | 大角度规避
- **彗袭**：出牌阶段开始时将手牌当任意基本/非延时锦囊使用，之后本回合锁定类别
- `phaseUseBegin` 触发 + `mod.cardEnabled` 限制

### ④ 德意志A59 `deyi_a59` — ⭐⭐
- 势力 KMS | 3/3 | 轻巡 | 防空
- **多能**：摸牌阶段放弃摸牌→观看顶4张→获取类别不同的牌→排列其余
- **代课**：回合内使用基本/普通锦囊结算后→令非目标角色摸1张→弃其1张

### ⑤ SP大淀 `sp_oyodo` — ⭐⭐⭐
- 势力 IJN | 3/3 | 轻巡 | 防空
- **末代旗舰**：使用锦囊时管理"讯"牌（`addToExpansion` 扣置）
- **海天通讯**：判定牌生效前打出"讯"代替（参考鬼道类技能）；失去所有"讯"后回复1体力

### ⑥ 加贺 `jiage` — ⭐⭐⭐
- 势力 IJN | 4/4 | 航母
- **机动舰队**：锁定技，♦基本牌视为♣（`mod.suit`）；黑色杀对有防具角色伤害+1
- **舰攻出击**：杀造成伤害后观看手牌→获得1张→非黑色则视为对你使用杀

### ⑦ 提尔比茨 `tirpitz` — ⭐⭐⭐
- 势力 KMS | 4/4 | 战列BB | 装甲防护
- **牵制**：锁定，手牌装备牌视为闪；回合外装备不可移动；有俾斯麦则装备当任意基本牌
- **北宅**：弃牌阶段黑色牌不计入手牌数；阶段结束弃两张黑色手牌→随机装备

### ⑧ 阿拉斯加 `alasijia` — ⭐⭐⭐⭐
- 势力 USN | 3/4 | 战列BB | 装甲防护
- **先锋**：使用牌指定目标后→令未横置目标无效并横置其武将牌
- **狂欢开幕**：阳面—使角色横置时摸1牌；阴面—弃1牌令角色重置并摸1牌

### ⑨ 齐柏林伯爵 `qibolin` — ⭐⭐⭐⭐
- 势力 KMS | 4/4 | 航母
- **枭啸**：锁定技，其他角色对/被你造成伤害后获得"俯冲"标记
- **鹰返**：结束阶段，指定有"俯冲"角色二选一→交手牌/失去体力上限且永久免疫

### ⑩ 初霜 `hatsushimo` — ⭐⭐⭐⭐⭐
- 势力 IJN | 3/3 | 驱逐 | 大角度规避
- **不太合格的护卫**：开局选护卫→目标牌结算后摸1展示→视为你使用→体力变动可换人
- **泥头船来啦**：限定技，结束阶段弃你所有牌→选角色→牌名匹配每张造成1伤害

---

## 开发流程（对每个武将重复执行）

```
1. 阅读牌将扩展中一个已有武将的完整代码，确认格式
2. 在 extension.js 的 character.character 中添加武将定义
3. 在 skill.skill 中实现所有技能（含子技能）
4. 在 character.translate 和 skill.translate 中添加翻译
5. 保存，在游戏中测试该武将
6. 确认无误后 git commit
7. 再做下一个武将
```

## 自检清单

- [ ] 武将 ID、技能 ID 命名风格与牌将扩展一致
- [ ] 武将能正常选择出场
- [ ] 所有技能在正确时机触发
- [ ] 技能描述文本（`_info`）显示正确
- [ ] 锁定技（`forced: true`）自动触发不弹框
- [ ] 限定技（`limited: true` / `skillAnimation: true`）只能用一次
- [ ] `storage` / 标记在角色死亡时正确清理
- [ ] 不与牌将扩展已有武将冲突

## 关键提醒

- **不要一次写完所有武将**，按上面顺序一个一个来
- **遇到 API 不确定**：先在牌将扩展代码和游戏核心代码中 grep 类似技能的实现
- **舰种被动如果已存在**：直接引用技能 ID，不重新实现
- **content 函数不要给参数**（1.10.15+ 版本会报错），正确写法 `content: function() {}`，函数体内直接用 `player` / `event` / `trigger` / `result`
