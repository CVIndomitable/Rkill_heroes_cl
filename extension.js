
//===================================

//【基础语法注意事项】
//写在前面：本文件中变量名大小写敏感,且需要注意是否有s（例如target-targets）
//filter中使用event.,不能使用trigger.。trigger.在content中使用。
//filter函数（条件函数）里的event是触发事件,但content函数（效果函数）里的trigger才是触发事件,event是当前的技能事件。
//event.getParent()是当前技能事件的上一级父事件,event.getParent(2)是当前技能事件的上二级父事件。
//"step 0"必须从0开始,引号可以是单引号或双引号,但是整个技能里面不能变。

//【yield用法】（需要无名杀版本1.10.10或更高版本）
//yield可以跨步骤储存变量,用于一个技能里需要多次选择目标/牌等造成系统自带result.targets和result.links失效的情况。
//该方法需要content:function*(event,map),并且内容中player和trigger.player需要分别使用map.player和map.trigger.player代替。
//示例：var result = yield player.chooseCardButton('选择一张牌', true, cards);

//【AI相关】
//content中的ai返回值为正数越大越容易选择目标,返回值为负数则不选择、不发动。
//ai里的ai返回值为正数则选择友方,返回值为负数则选择敌方,返回值0不发动技能。
//主动技能的ai中需要写明result例如result:{player:1,},AI才会发动技能。

//【storage使用方式】
//有直接用player.storage的方式,但是更建议使用如下三个函数（好处在于不仅会自己广播还自带初始值,联机用起来很方便）：
//getStorage() - 获取对应的storage数组,非数组均可
//setStorage() - 直接赋值storage数组,非数组均可
//markAuto()   - 向storage中添加元素（数组）

//【其他注意事项】
//nobracket:true - 该属性可以让技能显示完整名称（而不是只有前两个字）
//var player = get.player(); - 指的是当前正在做选择的角色
//useCard时机牌已经离开手牌区,牌上的tag已经清除。
//JS中数组之间==比较的是数组地址,不比较内容。不能通过card==[]判断数组为空或不为空。
//mod尽量放在主技能中。放在子技能中时会由于未知原因结算两遍。
//联机时客机出牌阶段所在的_status.event.name是game,不是phaseUse。
//.set("key",val)传递参数后使用数值时应当取后一个参数（val）。

//【命名规范】
//武将ID：拼音+_R后缀，例如：talin_R、botelan_R、sp_miyuki_R
//技能ID：纯拼音，不加前缀，参考舰R牌将风格，例如：mijian、shanzhan、huijia
//子技能ID：主技能ID+下划线+描述，例如：mijian_nores、shanzhan_reset
//舰种被动直接引用舰R牌将ID（qingxuncl、zhongxunca、fangkong2、huokongld、zhuangjiafh、dajiaoduguibi等）

//【目录】
//武将列表、武将技能、武将和技能翻译、卡牌包与卡牌技能、卡牌翻译、配置（config）、扩展简介

//===================================
import { lib, game, ui, get, ai, _status } from '../../noname.js'
game.import("extension", function (lib, game, ui, get, ai, _status) {

    return {
        name: "sonnet",
        content: function (config, pack) {

        }, precontent: function () {

        }, help: {}, config: {

        }, package: {
            character: {
                character: {//武将注册
                    //格式：武将id: ["性别", "势力", 血量上限, ["技能1", "技能2"], ["des:描述"]]
                    //武将ID使用拼音+_R后缀，SP武将使用sp_拼音_R
                    //舰种被动技能直接引用舰R牌将中已有的技能ID，不在本扩展中重复实现

                    // ① 塔林 - ΒΜΦCCCP 轻巡 4血 防空+弥坚
                    talin_R: ["female", "ΒΜΦCCCP", 4, ["qingxuncl", "fangkong2", "mijian"], ["des:塔林，苏联轻巡洋舰"]],

                    // ② 波特兰 - USN 重巡 4血 火控雷达+善战
                    botelan_R: ["female", "USN", 4, ["zhongxunca", "huokongld", "shanzhan"], ["des:波特兰，美国重巡洋舰"]],

                    // ③ SP深雪 - IJN 驱逐 3血 大角度规避+彗袭
                    sp_shenyue_R: ["female", "IJN", 3, ["quzhudd", "dajiaoduguibi", "huijie"], ["des:SP深雪，日本驱逐舰"]],

                    // ④ 德意志A59 - KMS 轻巡 3血 防空+多能+代课
                    deyizhi_R: ["female", "KMS", 3, ["qingxuncl", "fangkong2", "duoneng", "daike"], ["des:德意志A59，德国轻巡洋舰"]],

                    // ⑤ SP大淀 - IJN 轻巡 3血 防空+末代旗舰+海天通讯
                    sp_dadian_R: ["female", "IJN", 3, ["qingxuncl", "fangkong2", "modaiqijian", "haitiantongxun"], ["des:SP大淀，日本轻巡洋舰旗舰"]],

                    // ⑥ 加贺 - IJN 航母 4血 机动舰队+舰攻出击
                    jiage_R: ["female", "IJN", 4, ["hangmucv", "jidongjiandui", "jiangongchuji"], ["des:加贺，日本舰队航空母舰"]],

                    // ⑦ 提尔比茨 - KMS 战列BB 4血 装甲防护+牵制+北宅
                    tirpitz_R: ["female", "KMS", 4, ["zhuangjiafh", "qianzhi", "beizhai"], ["des:提尔比茨，德国战列舰"]],

                    // ⑧ 阿拉斯加 - USN 战列BB 4血 装甲防护+先锋+狂欢开幕
                    alasijia_R: ["female", "USN", 4, ["zhuangjiafh", "xianfeng", "kuanhuankaimu"], ["des:阿拉斯加，美国大型巡洋舰"]],

                    // ⑨ 齐柏林伯爵 - KMS 航母 4血 枭啸+鹰返
                    qibolin_R: ["female", "KMS", 4, ["hangmucv", "xiaoxiao", "yingfan"], ["des:齐柏林伯爵，德国航空母舰"]],

                },
                translate: {//武将名称翻译
                    talin_R: "塔林",
                    botelan_R: "波特兰",
                    sp_shenyue_R: "SP深雪",
                    deyizhi_R: "德意志A59",
                    sp_dadian_R: "SP大淀",
                    jiage_R: "加贺",
                    tirpitz_R: "提尔比茨",
                    alasijia_R: "阿拉斯加",
                    qibolin_R: "齐柏林伯爵",
                },
            },
            card: {
                card: {},
                translate: {},
                list: [],
            },
            skill: {//技能
                skill: {

                    // ============================================
                    // ① 塔林 - 弥坚
                    // 触发时机：damageEnd（受到伤害后）
                    // 效果：四选一 - 摸2张/杀不可响应/伤害+1/护甲+1
                    // ============================================
                    mijian: {
                        audio: 2,//语音编号，2表示有两条语音交替播放
                        trigger: { player: "damageEnd" },//受到伤害结算完毕后触发，player表示受害者是自己
                        filter: function (event, player) {
                            return true;//任何情况下都可以触发（无额外条件）
                        },
                        check: function (event, player) {
                            return true;//AI判断：始终愿意发动（四个选项均有益）
                        },
                        content: function () {
                            "step 0"
                            //弹出四选一控制框，AI逻辑在ai回调中
                            player.chooseControl('摸两张牌', '下一张杀无法被响应', '下一次造成伤害+1', '获得一点护甲')
                                .set('prompt', get.prompt('mijian'))//技能名作为标题
                                .set('prompt2', get.prompt2('mijian'))//技能描述作为副标题
                                .set('ai', function () {
                                    var player = get.player();//get.player()获取当前做选择的角色
                                    if (player.hp <= 1) return 3;//濒死时优先护甲以抵御下次伤害
                                    if (player.countCards('h') < 2) return 0;//手牌极少时优先摸牌补充资源
                                    return 2;//默认选伤害+1，攻击性更强
                                });
                            "step 1"
                            //result.index是chooseControl的选项索引（从0开始）
                            switch (result.index) {
                                case 0:
                                    player.draw(2);//摸两张牌
                                    break;
                                case 1:
                                    //添加临时技能标记，下次使用杀时触发
                                    player.addTempSkill('mijian_nores');
                                    break;
                                case 2:
                                    //添加临时技能标记，下次造成伤害时触发
                                    player.addTempSkill('mijian_jiashang');
                                    break;
                                case 3:
                                    player.changeHujia(1);//护甲+1
                                    break;
                            }
                        },
                        intro: {
                            content: function () {
                                return get.translation('mijian_info');
                            },
                        },
                    },
                    mijian_nores: {//弥坚子技能：下一张杀不可被响应（无法闪避）
                        trigger: { player: "useCard" },//使用牌时触发
                        forced: true,//锁定触发，不询问玩家
                        filter: function (event, player) {
                            //只对杀和自制杀（sheji9）生效
                            return event.card.name == "sha" || event.card.name == "sheji9";
                        },
                        content: function () {
                            //directHit：令所有角色对此牌直接命中（不能使用闪响应）
                            trigger.directHit.addArray(game.players);
                            player.removeSkill('mijian_nores');//效果触发一次后移除，实现"下一次"限制
                        },
                        charlotte: true,//不在武将牌上显示此技能名
                    },
                    mijian_jiashang: {//弥坚子技能：下一次造成伤害+1
                        trigger: { source: "damageBegin1" },//造成伤害开始时触发，source表示伤害来源是自己
                        forced: true,
                        content: function () {
                            trigger.num++;//伤害值+1
                            player.removeSkill('mijian_jiashang');//触发一次后移除
                        },
                        charlotte: true,
                    },

                    // ============================================
                    // ② 波特兰 - 善战
                    // 触发方式：主动技（出牌阶段使用/响应阶段打出）
                    // 效果：每轮限X+1次，弃一张基本牌，视为使用/打出任意基本牌
                    //       X=本局累计造成的伤害点数（通过shanzhan_count子技能统计）
                    // 实现思路：
                    //   - shanzhan主技能：弹出目标牌类型选择框（chooseButton），再选手牌消耗
                    //   - shanzhan_count：监听damageEnd事件，累计伤害到storage中
                    //   - shanzhan_reset：监听phaseBegin（自己回合开始），清空本轮使用计数
                    // ============================================
                    shanzhan: {
                        audio: 2,
                        enable: ['chooseToUse', 'chooseToRespond'],//出牌阶段和响应阶段均可发动
                        group: ['shanzhan_count', 'shanzhan_reset'],//关联的子技能组
                        filter: function (event, player) {
                            //检查本轮使用次数是否已达上限（上限=累计伤害数+1）
                            var maxUse = (player.getStorage('shanzhan_damage') || 0) + 1;
                            if (player.countMark('shanzhan_used') >= maxUse) return false;
                            //检查手牌中有没有基本牌可以消耗
                            if (!player.countCards('hs', function (card) { return get.type(card) == 'basic'; })) return false;
                            //检查当前情境下有没有至少一种基本牌可以使用/打出
                            for (var name of ['sha', 'shan', 'tao', 'jiu']) {
                                if (event.filterCard({ name: name, isCard: true }, player, event)) return true;
                            }
                            return false;
                        },
                        chooseButton: {
                            dialog: function (event, player) {
                                //构建可选的目标牌类型列表（只显示当前情境下能用的）
                                var vcards = [];
                                for (var name of ['sha', 'shan', 'tao', 'jiu']) {
                                    var card = { name: name, isCard: true };
                                    if (event.filterCard(card, player, event)) {
                                        //vcard格式：['牌类型分类', '花色', '牌名']
                                        vcards.push(['基本', '', name]);
                                    }
                                }
                                return ui.create.dialog('善战', [vcards, 'vcard'], 'hidden');
                            },
                            backup: function (links, player) {
                                //links[0]是玩家选中的按钮对应的vcard数组，links[0][2]是牌名
                                return {
                                    filterCard: function (card, player) {
                                        return get.type(card) == 'basic';//消耗一张基本牌
                                    },
                                    selectCard: 1,//选择1张牌
                                    viewAs: {
                                        name: links[0][2],//视为玩家选择的牌类型
                                        isCard: true,
                                    },
                                    check: function (card) {
                                        return 5 - get.value(card);//AI：优先消耗价值低的牌
                                    },
                                    precontent: function () {
                                        player.logSkill('shanzhan');//记录技能发动日志
                                        player.addMark('shanzhan_used', 1, false);//本轮使用次数+1（false=不显示标记）
                                    },
                                };
                            },
                            prompt: function (links, player) {
                                return '善战：将一张基本牌当作【' + get.translation(links[0][2]) + '】使用或打出';
                            },
                            check: function (button, player) {
                                //AI选择要转化成哪种牌：优先有效果的
                                var event = _status.event;
                                if (event.filterCard({ name: button.link[2], isCard: true }, player, event)) return 1;
                                return 0;
                            },
                        },
                        ai: {
                            result: { player: 1 },//AI认为此技能对自己有益，会主动发动
                        },
                    },
                    shanzhan_count: {//善战子技能：统计本局累计造成伤害
                        trigger: { source: "damageEnd" },//造成伤害结算完毕后触发，source表示伤害来源是自己
                        forced: true,
                        charlotte: true,
                        content: function () {
                            //累计伤害存入storage（trigger.num是本次伤害点数）
                            player.setStorage('shanzhan_damage', (player.getStorage('shanzhan_damage') || 0) + trigger.num);
                        },
                    },
                    shanzhan_reset: {//善战子技能：每回合开始时重置本轮使用次数
                        trigger: { player: "phaseBegin" },//自己回合开始时触发
                        forced: true,
                        charlotte: true,
                        content: function () {
                            //清除本轮已使用次数的标记
                            var used = player.countMark('shanzhan_used');
                            if (used > 0) player.removeMark('shanzhan_used', used);
                        },
                    },

                    // ============================================
                    // ③ SP深雪 - 彗袭
                    // 触发时机：phaseUseBegin（出牌阶段开始时）
                    // 效果：
                    //   1. 玩家从按钮列表中选择一种基本牌/非延时锦囊类型
                    //   2. 本回合内获得一次机会：可以将任意一张手牌视为所选类型使用（子技能huijie_viewas）
                    //   3. 本回合内锁定类别：只能使用所选类别的牌（子技能huijie_lock，mod.cardEnabled限制）
                    // ============================================
                    huijie: {
                        audio: 2,
                        trigger: { player: "phaseUseBegin" },//出牌阶段开始时触发
                        filter: function (event, player) {
                            return player.countCards('h') > 0;//手牌不为空才能发动
                        },
                        check: function (event, player) {
                            return player.countCards('h') > 1;//AI：手牌充足时才发动，避免手牌耗尽
                        },
                        content: function () {
                            "step 0"
                            //构建可选类型列表（基本牌+非延时锦囊）
                            var vcards = [];
                            //基本牌
                            for (var name of ['sha', 'shan', 'tao', 'jiu']) {
                                if (lib.card[name]) vcards.push(['基本', '', name]);
                            }
                            //非延时锦囊（标准牌中的普通锦囊）
                            for (var name of ['wuge', 'guohe', 'shunshou', 'jiedao', 'juedou', 'wanjian', 'nanman', 'wugu']) {
                                //get.type2检查是否为延时锦囊，过滤掉delay类
                                if (lib.card[name] && get.type2(name) != 'delay') {
                                    vcards.push(['锦囊', '', name]);
                                }
                            }
                            player.chooseButton('彗袭：选择本回合可视为使用的牌类型', [vcards, 'vcard'], true)
                                .set('ai', function () {
                                    //AI优先选杀（攻击性更强）
                                    return _status.event.dialog.buttons[0];
                                });
                            "step 1"
                            if (!result.bool) { event.finish(); return; }//玩家取消则不发动
                            var name = result.links[0][2];//选中的牌名（如'sha'）
                            //存储选中的牌名供viewas子技能使用
                            player.setStorage('huijie_viewas_name', name);
                            //存储锁定的类别（'basic'或'trick'）供lock子技能使用
                            player.setStorage('huijie_locked', get.type(name));
                            //添加视为技能：本回合可将任意手牌视为选中类型使用一次
                            player.addTempSkill('huijie_viewas', { player: 'phaseEnd' });
                            //添加锁定技能：本回合只能使用同类别的牌
                            player.addTempSkill('huijie_lock', { player: 'phaseEnd' });
                        },
                        intro: {
                            content: function () {
                                return get.translation('huijie_info');
                            },
                        },
                    },
                    huijie_viewas: {//彗袭子技能：将手牌视为选中类型使用（本回合1次）
                        //此技能由addTempSkill在phaseUseBegin时临时添加，phaseEnd时自动移除
                        charlotte: true,
                        enable: 'chooseToUse',//出牌阶段可主动发动
                        usable: 1,//本回合仅可使用1次（usable按回合重置，与addTempSkill配合实现精确1次限制）
                        filter: function (event, player) {
                            //有存储的目标牌名，且手上有牌可消耗
                            return !!player.getStorage('huijie_viewas_name') && player.countCards('h') > 0;
                        },
                        filterCard: function (card, player) {
                            return true;//任意手牌均可选为消耗
                        },
                        viewAs: function (cards, player) {
                            //视为使用storage中存储的牌类型
                            return { name: player.getStorage('huijie_viewas_name'), isCard: true };
                        },
                        position: 'h',//从手牌中选择
                        check: function (card) {
                            return 5 - get.value(card);//AI：优先消耗价值低的牌
                        },
                        ai: { result: { player: 1 } },
                    },
                    // ============================================
                    // ④ 德意志A59 - 多能
                    // 触发时机：phaseDrawBegin（摸牌阶段开始时）
                    // 效果：放弃摸牌 → 观看牌堆顶4张 → 取类别各不同的牌 → 剩余放回顶部
                    // 实现思路：
                    //   step 0: skip('phaseDraw')跳过摸牌，get.cards(4)取4张展示
                    //   step 1: chooseButton让玩家选取，filterButton限制同类型只选1张
                    //   step 2: gain获得选中牌，cardsGotoPile将剩余放回牌堆顶
                    // ============================================
                    duoneng: {
                        audio: 2,
                        trigger: { player: "phaseDrawBegin" },//摸牌阶段开始时触发
                        filter: function (event, player) {
                            return !event.numFixed;//摸牌数未被固定（未被其他效果锁定）才能放弃摸牌
                        },
                        check: function (event, player) {
                            return player.countCards('h') < player.maxHp;//AI：手牌未满时发动（摸4张比摸2张更有可能补充资源）
                        },
                        content: function () {
                            "step 0"
                            player.skip('phaseDraw');//放弃本次摸牌阶段
                            //从牌堆顶取4张并展示给所有人（cardsGotoOrdering使牌进入公开区域）
                            event.drawCards = get.cards(4);
                            game.cardsGotoOrdering(event.drawCards);
                            "step 1"
                            //玩家从4张中选取类别各不相同的牌（每种类型最多选1张）
                            var next = player.chooseButton(
                                ['多能：选取类别各不同的牌（每类最多1张）', [event.drawCards, 'card']],
                                [0, 3]//最少0张，最多3张（基本/锦囊/装备各1张）
                            );
                            next.set('filterButton', function (button) {
                                //检查已选中按钮中是否有同类型的牌
                                var selected = ui.selected.buttons;
                                var cardType = get.type(button.link);
                                for (var b of selected) {
                                    if (get.type(b.link) == cardType) return false;//同类型已选，不允许再选
                                }
                                return true;
                            });
                            next.set('ai', function (button) {
                                return get.value(button.link, get.player());//AI优先选价值高的牌
                            });
                            "step 2"
                            //result.links是玩家选中的card对象数组
                            var gained = (result.bool && result.links && result.links.length > 0) ? result.links : [];
                            //过滤出未被选中的剩余牌
                            var remaining = event.drawCards.filter(function (c) { return !gained.includes(c); });
                            //玩家获得选中的牌（'draw'表示从牌堆获得的动画效果）
                            if (gained.length > 0) player.gain(gained, 'draw');
                            //剩余牌放回牌堆顶（按原顺序，最前面的在顶部）
                            if (remaining.length > 0) {
                                game.cardsGotoPile(
                                    remaining.slice().reverse(),//reverse使原顺序第一张排在最顶部
                                    ['top_cards', remaining],
                                    function (evt, card) {
                                        if (evt.top_cards.includes(card)) return ui.cardPile.firstChild;
                                        return null;//放到牌堆顶部
                                    }
                                );
                            }
                        },
                        intro: {
                            content: function () { return get.translation('duoneng_info'); },
                        },
                    },

                    // ============================================
                    // ④ 德意志A59 - 代课
                    // 触发时机：useCardAfter（使用基本牌/普通锦囊后）
                    // 效果：选一名非目标角色 → 令其摸1张牌 → 再令其弃1张手牌
                    // 设计意图：干扰敌人（摸牌可能帮助了敌人，但弃牌作为惩罚；对友军则纯收益）
                    // ============================================
                    daike: {
                        audio: 2,
                        trigger: { player: "useCardAfter" },//自己使用牌结算后触发
                        filter: function (event, player) {
                            var type = get.type(event.card);
                            var type2 = get.type2(event.card);
                            //只对基本牌和普通锦囊触发，不含延时锦囊
                            if (type != 'basic' && (type != 'trick' || type2 == 'delay')) return false;
                            //必须有非目标玩家（被目标的玩家已被直接影响，不重复操作）
                            var targets = event.targets || [];
                            return game.hasPlayer(function (current) {
                                return current != player && !targets.includes(current);
                            });
                        },
                        check: function (event, player) {
                            //AI：场上有敌人（用代课干扰敌人）时发动
                            return game.hasPlayer(function (current) {
                                return get.attitude(player, current) < 0;
                            });
                        },
                        content: function () {
                            "step 0"
                            //选择一名非目标角色（非自己、非此次使用牌的目标）
                            var triggerTargets = trigger.targets || [];
                            player.chooseTarget(get.prompt('daike'), function (card, player, target) {
                                var evt = _status.event.getTrigger();//获取触发的useCard事件
                                var tgts = evt.targets || [];
                                return target != player && !tgts.includes(target);
                            }).set('ai', function (target) {
                                var player = get.player();
                                //AI优先对敌人发动（摸牌弃牌相当于换一张手牌，可消耗敌人优质手牌）
                                return -get.attitude(player, target);
                            });
                            "step 1"
                            if (!result.bool) { event.finish(); return; }
                            event.daikeTarget = result.targets[0];
                            player.line(event.daikeTarget, 'green');//画一条绿色连线表示效果指向
                            event.daikeTarget.draw(1);//目标摸1张牌
                            "step 2"
                            //目标弃置1张手牌
                            if (event.daikeTarget.countCards('h') > 0) {
                                event.daikeTarget.chooseDiscard('h', true, '代课：弃置一张手牌')
                                    .set('ai', function (card) {
                                        return 6 - get.value(card);//AI弃价值低的牌
                                    });
                            }
                        },
                        intro: {
                            content: function () { return get.translation('daike_info'); },
                        },
                    },

                    // ============================================
                    // ⑨ 齐柏林伯爵 - 枭啸
                    // 锁定技：与齐柏林发生伤害关系的角色（打齐柏林或被打）获得"俯冲"标记
                    // 触发时机：damageEnd（双向监听：player=被打到, source=打出伤害）
                    // 判定：
                    //   - 我是受害者（trigger.player == player）→ 攻击者（trigger.source）获得俯冲
                    //   - 我是攻击者（trigger.source == player）→ 受害者（trigger.player）获得俯冲
                    // 有yingfan_immune标记的角色免疫，不获得俯冲
                    // ============================================
                    xiaoxiao: {
                        audio: 2,
                        forced: true,//锁定技
                        trigger: { player: "damageEnd", source: "damageEnd" },
                        //双向监听：player=被打时触发；source=打人时触发
                        filter: function (event, player) {
                            //排除自伤（攻击自己）
                            if (event.player == event.source) return false;
                            //情况一：我是被打方，攻击者是别人
                            if (event.player == player && event.source && event.source != player) return true;
                            //情况二：我是攻击方，受害者是别人
                            if (event.source == player && event.player && event.player != player) return true;
                            return false;
                        },
                        content: function () {
                            //确定获得俯冲标记的目标
                            var markTarget;
                            if (trigger.player == player) {
                                markTarget = trigger.source;//有人打了我 → 攻击者获得俯冲
                            } else {
                                markTarget = trigger.player;//我打了别人 → 被打者获得俯冲
                            }
                            if (markTarget && !markTarget.hasSkill('yingfan_immune')) {
                                markTarget.addMark('fuzong', 1);//俯冲标记+1（可见，供鹰返选择）
                            }
                        },
                        intro: {
                            content: function () { return get.translation('xiaoxiao_info'); },
                        },
                    },

                    // ============================================
                    // ⑨ 齐柏林伯爵 - 鹰返
                    // 触发时机：phaseJieshuBegin（结束阶段）
                    // 效果：选一名有俯冲标记的角色→该角色二选一：
                    //   ① 将全部手牌交给齐柏林（失去手牌但无永久损失）
                    //   ② 失去1点体力上限 + 永久免疫（不再获得俯冲，不再被鹰返选中）
                    // 实现：
                    //   - 选目标后移除其俯冲标记
                    //   - target.chooseControl让目标自选
                    //   - 方案②通过addSkill('yingfan_immune')实现永久免疫
                    // ============================================
                    yingfan: {
                        audio: 2,
                        trigger: { player: "phaseJieshuBegin" },//结束阶段开始时触发
                        filter: function (event, player) {
                            //需要场上有至少一名（非自己）持有俯冲标记的角色
                            return game.hasPlayer(function (t) {
                                return t != player && t.countMark('fuzong') > 0;
                            });
                        },
                        check: function (event, player) {
                            return true;//AI总是愿意发动（对敌人有害）
                        },
                        content: function () {
                            "step 0"
                            //选择一名有俯冲标记的角色作为目标
                            player.chooseTarget(get.prompt('yingfan'), function (card, player, target) {
                                return target != player && target.countMark('fuzong') > 0;
                            }).set('ai', function (target) {
                                //AI：优先选敌人（负态度=优先攻击对象）
                                return -get.attitude(get.player(), target);
                            });
                            "step 1"
                            if (!result.bool || !result.targets || !result.targets.length) {
                                event.finish(); return;
                            }
                            var target = result.targets[0];
                            event.yingfanTarget = target;
                            //移除该目标的所有俯冲标记（已被鹰返"收割"）
                            target.removeMark('fuzong', target.countMark('fuzong'));
                            //让目标自主选择：交手牌 or 失去体力上限+免疫
                            target.chooseControl('交出所有手牌', '失去1点体力上限并获得永久免疫')
                                .set('prompt', get.translation(player) + '的鹰返：请选择一项')
                                .set('ai', function () {
                                    var t = get.player();//此AI视角是目标
                                    //濒死或体力上限为1时，不能失去体力上限
                                    if (t.hp <= 1 || t.maxHp <= 1) return 0;
                                    //计算手牌总价值，若价值较高则宁可失去体力上限
                                    var cardValue = t.getCards('h').reduce(function (sum, c) {
                                        return sum + (get.value(c, t) || 0);
                                    }, 0);
                                    return cardValue > 8 ? 1 : 0;//手牌价值高则选免疫
                                });
                            "step 2"
                            var target = event.yingfanTarget;
                            if (result.index == 0) {
                                //方案①：目标将所有手牌交给齐柏林
                                var cards = target.getCards('h');
                                if (cards.length > 0) {
                                    player.gain(cards, target, 'give');//齐柏林获得目标所有手牌
                                }
                            } else {
                                //方案②：目标失去1点体力上限 + 永久免疫
                                target.loseMaxHp();//体力上限-1
                                target.addSkill('yingfan_immune');//永久免疫技能
                                game.log(target, '永久免疫了齐柏林伯爵的连环效果');
                            }
                        },
                        intro: {
                            content: function () { return get.translation('yingfan_info'); },
                        },
                    },
                    yingfan_immune: {//鹰返免疫子技能：防止再次获得俯冲标记和被鹰返选中
                        //此技能通过addSkill永久添加到目标角色，不会自动移除
                        charlotte: false,//在武将牌上显示（让玩家知道自己免疫）
                        intro: {
                            content: function () { return '已免疫齐柏林伯爵的枭啸和鹰返效果。'; },
                        },
                    },

                    // ============================================
                    // ⑧ 阿拉斯加 - 先锋
                    // 锁定技：使用牌并指定目标后，对于每个【未横置】的目标：
                    //   1. 将该目标从本次牌的目标列表中移除（本次牌对其无效）
                    //   2. 横置该目标的武将牌（link/连环状态）
                    //   3. 通知狂欢开幕（阳面）效果：摸1张牌（每次横置一个角色摸一张）
                    // 实现思路：
                    //   - trigger: useCard（使用牌后，目标已确定但效果未结算）
                    //   - 复制targets避免在遍历时修改原数组
                    //   - noname无独立link触发事件，阳面摸牌直接在先锋content中通过logSkill('kuanhuankaimu')归因
                    // ============================================
                    xianfeng: {
                        audio: 2,
                        forced: true,//锁定技：自动触发，不询问玩家
                        trigger: { player: "useCard" },//使用牌后触发（targets已确定）
                        filter: function (event, player) {
                            //需要有目标，且至少一个目标未横置
                            return event.targets && event.targets.length > 0
                                && event.targets.some(function (t) { return !t.isLinked(); });
                        },
                        content: function () {
                            //复制targets列表（防止在遍历中修改原数组导致跳过）
                            var targets = trigger.targets.slice();
                            var linkedTargets = [];//记录本次横置的目标（用于摸牌计数）
                            for (var i = 0; i < targets.length; i++) {
                                var t = targets[i];
                                if (!t.isLinked()) {
                                    //从本次牌的目标列表移除：此次牌对其无效
                                    trigger.targets.remove(t);
                                    t.link();//横置目标武将牌（连环状态）
                                    linkedTargets.push(t);
                                }
                            }
                            //狂欢开幕（阳面）：令角色横置时摸1张牌
                            //noname无link专属触发，此处直接在先锋content中实现，通过logSkill归因给狂欢开幕
                            if (linkedTargets.length > 0 && player.hasSkill('kuanhuankaimu')) {
                                player.logSkill('kuanhuankaimu');//日志显示狂欢开幕而非先锋
                                player.draw(linkedTargets.length);//每横置一人摸1张
                            }
                        },
                        intro: {
                            content: function () { return get.translation('xianfeng_info'); },
                        },
                    },

                    // ============================================
                    // ⑧ 阿拉斯加 - 狂欢开幕
                    // 两个效果（不使用翻面机制，两个效果均可用）：
                    //   阳面：当先锋令角色横置时，摸1张牌（已整合到先锋content中）
                    //   阴面：主动技，出牌阶段，弃置1张手牌→令一名横置角色重置→该角色摸1张牌
                    // 实现：
                    //   - 阳面效果集成到先锋（xianfeng）的content中，通过logSkill('kuanhuankaimu')归因
                    //   - 阴面效果作为phaseUse触发（每回合1次），玩家主动选择是否使用
                    //   - group: ['kuanhuankaimu_yin'] 关联阴面子技能
                    // ============================================
                    kuanhuankaimu: {
                        audio: 2,
                        nobracket: true,//防止4字以上技能名被截断
                        group: ['kuanhuankaimu_yin'],//阴面效果作为子技能
                        intro: {
                            content: function () { return get.translation('kuanhuankaimu_info'); },
                        },
                    },
                    kuanhuankaimu_yin: {//狂欢开幕子技能（阴面）：弃牌令横置角色重置并摸1
                        //phaseUse触发一次，玩家可选择弃置1张手牌来执行效果
                        charlotte: true,
                        trigger: { player: "phaseUse" },//出牌阶段开始时触发一次
                        usable: 1,//每回合仅能发动1次
                        filter: function (event, player) {
                            //需要有手牌可弃，且场上有横置的角色
                            return player.countCards('h') > 0
                                && game.hasPlayer(function (t) { return t.isLinked(); });
                        },
                        check: function (event, player) {
                            //AI：如果有横置的友方角色，值得解除其连环
                            return game.hasPlayer(function (t) {
                                return t.isLinked() && get.attitude(player, t) > 0;
                            });
                        },
                        content: function () {
                            "step 0"
                            //玩家选择弃置1张手牌（代价）
                            player.chooseCard('h', get.prompt('kuanhuankaimu'), '弃置一张手牌，令一名横置角色重置并摸1张牌', false)
                                .set('ai', function (card) {
                                    return 6 - get.value(card);//AI：优先弃价值低的牌
                                });
                            "step 1"
                            if (!result.bool || !result.cards || !result.cards.length) {
                                event.finish(); return;//玩家取消
                            }
                            player.discard(result.cards);//弃置所选手牌
                            player.logSkill('kuanhuankaimu');//记录技能发动日志
                            //选择目标：一名横置（连环状态）的角色
                            player.chooseTarget('狂欢开幕：选择一名横置的角色，令其重置并摸1张牌', function (card, player, target) {
                                return target.isLinked();//只能选横置的角色
                            }).set('ai', function (target) {
                                //AI：优先解除友方横置（态度>0则解除，<0则帮助敌人失去横置护盾）
                                return get.attitude(get.player(), target);
                            });
                            "step 2"
                            if (!result.bool || !result.targets || !result.targets.length) {
                                event.finish(); return;
                            }
                            var t = result.targets[0];
                            t.link();//重置：link()切换状态，从横置变为正常（因已横置，再link()则恢复）
                            t.draw(1);//该角色摸1张牌
                        },
                    },

                    // ============================================
                    // ⑦ 提尔比茨 - 牵制
                    // 锁定技，三个复合效果：
                    // 1. 手牌装备视为闪（无俾斯麦时激活，chooseToRespond）
                    // 2. 回合外装备不可移动（暂简化：通过mod.targetEnabled2阻止顺手牵羊/过河拆桥）
                    // 3. 有俾斯麦时，装备当任意基本牌（chooseToUse/Respond）
                    // 实现思路：
                    //   - group关联两个子技能分别处理效果1和效果3
                    //   - 效果1(qianzhi_shan)在无俾斯麦时激活
                    //   - 效果3(qianzhi_bismarck)在有俾斯麦时激活（并覆盖效果1）
                    //   - mod.targetEnabled2实现效果2（回合外保护装备）
                    // ============================================
                    qianzhi: {
                        audio: 2,
                        forced: true,//锁定技
                        group: ['qianzhi_shan', 'qianzhi_bismarck'],//两个子技能分别处理不同情境
                        mod: {
                            targetEnabled2: function (card, player, target) {
                                //回合外：他人不能对提尔比茨使用顺手牵羊/过河拆桥拿走装备
                                //target有此技能意味着target是提尔比茨本人
                                if (_status.currentPhase != target && player != target) {
                                    //顺手牵羊、过河拆桥可以移动他人装备
                                    if (card.name == 'shunshou' || card.name == 'guohe') return false;
                                }
                            }
                        },
                        intro: {
                            content: function () { return get.translation('qianzhi_info'); },
                        },
                    },
                    qianzhi_shan: {//牵制子技能：无俾斯麦时，手牌装备视为闪
                        //此技能在没有俾斯麦时激活，让提尔比茨可以用手牌装备代替闪响应杀
                        charlotte: true,
                        enable: 'chooseToRespond',//仅在响应阶段（被杀攻击时）可用
                        filter: function (event, player) {
                            //只有场上没有俾斯麦时才激活（有俾斯麦时由qianzhi_bismarck处理）
                            if (game.hasPlayer(function (p) { return p.name == 'bismarck_R' && p.isIn(); })) return false;
                            //只有当前情境可以使用闪时才激活
                            if (!event.filterCard({ name: 'shan', isCard: true }, player, event)) return false;
                            //手牌或装备区有装备牌才能发动
                            return player.countCards('hs', function (card) { return get.type(card) == 'equip'; }) > 0;
                        },
                        filterCard: function (card, player) {
                            return get.type(card) == 'equip';//选择一张装备牌
                        },
                        position: 'hs',//从手牌和装备区选择
                        viewAs: { name: 'shan', isCard: true },//视为闪使用
                        check: function (card) {
                            return 6 - get.value(card);//AI：优先消耗价值低的装备
                        },
                        ai: {
                            respondSha: true,//AI会在需要响应杀时尝试发动此技能
                        },
                    },
                    qianzhi_bismarck: {//牵制子技能：有俾斯麦时，手牌装备当任意基本牌
                        //当场上有俾斯麦时激活，功能更强：装备可以当任意基本牌（含闪）
                        charlotte: true,
                        enable: ['chooseToUse', 'chooseToRespond'],//出牌和响应阶段均可
                        filter: function (event, player) {
                            //只有场上有俾斯麦（bismarck_R）时激活
                            if (!game.hasPlayer(function (p) { return p.name == 'bismarck_R' && p.isIn(); })) return false;
                            if (!player.countCards('hs', function (card) { return get.type(card) == 'equip'; })) return false;
                            //当前情境下至少有一种基本牌可用/可打出
                            for (var name of ['sha', 'shan', 'tao', 'jiu']) {
                                if (event.filterCard({ name: name, isCard: true }, player, event)) return true;
                            }
                            return false;
                        },
                        chooseButton: {
                            dialog: function (event, player) {
                                //展示当前情境可用的基本牌类型
                                var vcards = [];
                                for (var name of ['sha', 'shan', 'tao', 'jiu']) {
                                    if (event.filterCard({ name: name, isCard: true }, player, event)) {
                                        vcards.push(['基本', '', name]);
                                    }
                                }
                                return ui.create.dialog('牵制（俾斯麦加成）', [vcards, 'vcard'], 'hidden');
                            },
                            backup: function (links, player) {
                                return {
                                    filterCard: function (card) { return get.type(card) == 'equip'; },
                                    position: 'hs',
                                    selectCard: 1,
                                    viewAs: { name: links[0][2], isCard: true },//视为玩家选择的基本牌
                                    check: function (card) { return 6 - get.value(card); },
                                    precontent: function () { player.logSkill('qianzhi'); },
                                };
                            },
                            prompt: function (links, player) {
                                return '牵制（俾斯麦）：将一张装备当作【' + get.translation(links[0][2]) + '】使用或打出';
                            },
                        },
                        ai: { result: { player: 1 } },
                    },

                    // ============================================
                    // ⑦ 提尔比茨 - 北宅
                    // 效果一：弃牌阶段，黑色手牌不计入手牌上限（通过addTempSkill+mod实现）
                    // 效果二：弃牌阶段结束，可弃置2张黑色手牌，获得随机装备
                    // 实现思路：
                    //   - group: ['beizhai_limitadd', 'beizhai_gain'] 分别处理两个效果
                    //   - beizhai_limitadd在phaseDiscardBegin触发，添加限制mod的临时技能
                    //   - beizhai_limit（临时）修改maxHandcard，让黑色牌不计入上限
                    //   - beizhai_gain在phaseDiscardEnd触发，提供弃2黑→随机装备的选项
                    // ============================================
                    beizhai: {
                        audio: 2,
                        group: ['beizhai_limitadd', 'beizhai_gain'],
                        intro: {
                            content: function () { return get.translation('beizhai_info'); },
                        },
                    },
                    beizhai_limitadd: {//北宅子技能：弃牌阶段开始时添加黑色牌不计入限制
                        charlotte: true,
                        trigger: { player: "phaseDiscardBegin" },//弃牌阶段开始
                        forced: true,
                        content: function () {
                            //添加临时技能，让黑色手牌在本次弃牌阶段不计入手牌数
                            //addTempSkill第二参数{player:'phaseDiscardEnd'}表示回合弃牌阶段结束时自动移除
                            player.addTempSkill('beizhai_limit', { player: 'phaseDiscardEnd' });
                        },
                    },
                    beizhai_limit: {//北宅临时子技能：实际执行黑色牌不计入maxHandcard
                        //此技能通过addTempSkill动态添加，仅在弃牌阶段生效
                        charlotte: true,
                        mod: {
                            maxHandcard: function (player, num) {
                                //将手牌中黑色牌的数量加到手牌上限中
                                //等效于"黑色牌不计入手牌数"——有N张黑色牌，就把上限提高N
                                var blackCount = player.countCards('h', function (card) {
                                    return get.color(card) == 'black';
                                });
                                return num + blackCount;
                            }
                        },
                    },
                    beizhai_gain: {//北宅子技能：弃牌阶段结束，弃2黑色牌获得随机装备
                        charlotte: true,
                        trigger: { player: "phaseDiscardEnd" },//弃牌阶段结束时触发
                        filter: function (event, player) {
                            //需要手牌中有至少2张黑色牌才能发动
                            return player.countCards('h', function (card) {
                                return get.color(card) == 'black';
                            }) >= 2;
                        },
                        check: function (event, player) {
                            return true;//AI：总是愿意发动（装备牌是资源）
                        },
                        content: function () {
                            "step 0"
                            //玩家选择2张黑色手牌弃置
                            player.chooseCard('h', '北宅：弃置两张黑色手牌以获得随机装备', [2, 2], function (card) {
                                return get.color(card) == 'black';//只能选黑色牌
                            }).set('ai', function (card) {
                                return 6 - get.value(card);//AI：优先弃价值低的黑色牌
                            });
                            "step 1"
                            if (!result.bool || !result.cards || result.cards.length < 2) {
                                event.finish(); return;
                            }
                            player.discard(result.cards);//弃置选中的两张黑色牌
                            //从牌堆随机取一张装备牌
                            var equip = get.cardPile(function (card) {
                                return get.type(card) == 'equip';
                            });
                            if (equip) {
                                player.gain(equip, 'gain2');//'gain2'=从牌堆获得牌的动画效果
                            }
                        },
                    },

                    // ============================================
                    // ⑥ 加贺 - 机动舰队
                    // 锁定技，两个复合效果：
                    // 1. mod.suit: ♦基本牌视为♣（方块基本牌在花色判定时当梅花处理）
                    //    - 意义：♦杀 → ♣杀（黑色），可进一步触发黑色加成效果
                    // 2. trigger: 黑色杀对有防具角色造成伤害时，伤害+1
                    // 实现思路：
                    //   - mod对象始终生效（不需要触发，是属性修改）
                    //   - forced: true + trigger实现锁定触发（自动不询问）
                    // ============================================
                    jidongjiandui: {
                        audio: 2,
                        nobracket: true,//防止4字技能名截断显示
                        forced: true,//锁定技：自动触发，不询问玩家
                        mod: {
                            suit: function (card, suit) {
                                //将方块基本牌视为梅花（mod.suit参数：card=牌对象, suit=原始花色字符串）
                                //返回新花色字符串则替换，不返回则保持原花色
                                if (suit == 'diamond' && get.type(card) == 'basic') return 'club';
                            }
                        },
                        trigger: { source: "damageBegin1" },//加贺作为伤害来源时（source=加贺）触发
                        filter: function (event, player) {
                            //条件一：造成伤害的牌是杀
                            if (!event.card || event.card.name != 'sha') return false;
                            //条件二：该杀是黑色的（♠或♣，含经mod转换后的♦杀→♣杀）
                            if (get.color(event.card, player) != 'black') return false;
                            //条件三：受伤目标有防具（getEquip(2)返回防具槽装备，null=没有）
                            return event.player.getEquip(2) != null;
                        },
                        content: function () {
                            trigger.num++;//伤害点数+1
                        },
                        intro: {
                            content: function () { return get.translation('jidongjiandui_info'); },
                        },
                    },

                    // ============================================
                    // ⑥ 加贺 - 舰攻出击
                    // 触发时机：source: damageEnd（加贺用杀造成伤害后）
                    // 效果：
                    //   1. 观看受伤目标手牌，选取1张（chooseButton展示目标手牌）
                    //   2. 若取到非黑色牌，该目标视为对加贺使用一张无距限杀（可能反伤）
                    // 设计意图：
                    //   - 高风险高回报：强行取牌，但若取到红色牌则被反打
                    //   - 黑色牌（含由机动舰队转换来的♣）安全，红色牌（♥♦）有风险
                    // ============================================
                    jiangongchuji: {
                        audio: 2,
                        nobracket: true,
                        trigger: { source: "damageEnd" },//加贺造成伤害结算完毕后触发
                        filter: function (event, player) {
                            //只对杀造成的伤害触发，且目标需要在场且有手牌
                            return event.card && event.card.name == 'sha'
                                && event.player.isIn()
                                && event.player.countCards('h') > 0;
                        },
                        check: function (event, player) {
                            //AI判断：对敌人（态度<0）且其有手牌时发动
                            return get.attitude(player, event.player) < 0;
                        },
                        content: function () {
                            "step 0"
                            var target = trigger.player;//受伤目标（被加贺打到的人）
                            event.jiagaTarget = target;
                            //展示目标的手牌供加贺选择（仅加贺可见，其他人不知道内容）
                            player.chooseButton(
                                ['舰攻出击：观看并选取一张' + get.translation(target) + '的手牌',
                                    [target.getCards('h'), 'card']],
                                true//true=必须选择（不可取消）
                            ).set('ai', function (button) {
                                var p = get.player();
                                var v = get.value(button.link, p);
                                //黑色牌不会触发反击，更安全，稍微加权
                                if (get.color(button.link) == 'black') v += 1;
                                return v;
                            });
                            "step 1"
                            if (!result.bool || !result.links || !result.links.length) {
                                event.finish(); return;
                            }
                            event.jiagaCard = result.links[0];//选中的牌
                            //加贺获得目标手中的该牌（'give'表示从他人手中夺取的动画效果）
                            player.gain(event.jiagaCard, event.jiagaTarget, 'give');
                            "step 2"
                            //判断取到的牌是否为黑色（♠♣）
                            if (get.color(event.jiagaCard) != 'black') {
                                //非黑色：目标视为对加贺使用一张无距离限制的杀
                                var t = event.jiagaTarget;
                                if (t.isIn() && player.isIn()) {
                                    //useCard: target(t)使用虚拟杀对player(加贺)
                                    //第三参数false: 非连锁（不因技能触发而连锁使用）
                                    var next = t.useCard({ name: 'sha', isCard: true }, player, false);
                                    next.set('addCount', false);//不计入t的出牌次数
                                    next.set('nodistance', true);//绕过距离限制
                                }
                            }
                        },
                        intro: {
                            content: function () { return get.translation('jiangongchuji_info'); },
                        },
                    },

                    // ============================================
                    // ⑤ SP大淀 - 末代旗舰
                    // 触发时机：useCard（使用普通锦囊时）
                    // 效果：将一张手牌扣置到角色牌上，作为"讯"牌储备供海天通讯使用
                    // 实现：
                    //   - addToExpansion + gaintag('modaiqijian') 实现扣置
                    //   - intro.content: "expansion" 在武将牌上显示当前讯牌数
                    //   - onremove 在技能失去时清空剩余讯牌（防止残留数据）
                    // ============================================
                    modaiqijian: {
                        audio: 2,
                        nobracket: true,//防止"末代旗舰"被截断为"末代"
                        trigger: { player: "useCard" },//使用锦囊牌后触发
                        filter: function (event, player) {
                            //只有使用普通锦囊（非延时）时触发，且需要有手牌可以扣置
                            return get.type(event.card) == 'trick'
                                && get.type2(event.card) != 'delay'
                                && player.countCards('h') > 0;
                        },
                        check: function (event, player) {
                            return true;//AI：始终愿意囤积讯牌（是资源，囤积越多越有利）
                        },
                        content: function () {
                            "step 0"
                            //玩家选一张手牌，将其扣置为"讯"牌储备
                            player.chooseCard('h', get.prompt('modaiqijian'), true)
                                .set('ai', function (card) {
                                    return 6 - get.value(card);//AI：优先扣置价值较低的牌
                                });
                            "step 1"
                            if (!result.bool || !result.cards || result.cards.length == 0) {
                                event.finish(); return;
                            }
                            //addToExpansion将选中牌从手牌区移到扩展区（角色牌上的附属牌槽）
                            //gaintag("modaiqijian")标记这些牌属于末代旗舰，供getExpansions检索
                            player.addToExpansion(result.cards, player, "give").gaintag.add("modaiqijian");
                        },
                        intro: {
                            //在武将牌上显示当前扣置的讯牌（展示扩展区中的所有讯牌）
                            content: "expansion",
                            markcount: "expansion",
                        },
                        onremove: function (player, skill) {
                            //武将死亡或技能移除时，将所有剩余讯牌弃置到弃牌堆（清理数据）
                            var cards = player.getExpansions(skill);
                            if (cards.length) player.loseToDiscardpile(cards);
                        },
                    },

                    // ============================================
                    // ⑤ SP大淀 - 海天通讯
                    // 触发时机：global judge（任意角色判定时，判定牌翻开前）
                    // 效果：
                    //   - 打出一张"讯"牌替换判定牌（改变判定结果）
                    //   - 失去最后一张讯牌时，回复1点体力
                    // 实现思路（参考guidao鬼道的判定牌替换模式）：
                    //   1. 弃置旧判定牌（game.cardsDiscard）
                    //   2. 讯牌替换到判定位（trigger.player.judging[0] = xun）
                    //   3. 将讯牌加入结算追踪队列（trigger.orderingCards.addArray）
                    //   4. 提前保存"是否是最后一张讯牌"标志，避免异步计数出错
                    // ============================================
                    haitiantongxun: {
                        audio: 2,
                        nobracket: true,//防止"海天通讯"被截断
                        trigger: { global: "judge" },//全局监听：任意角色进行判定时触发
                        filter: function (event, player) {
                            //自己的扩展区有讯牌才能发动
                            return player.getExpansions('modaiqijian').length > 0;
                        },
                        direct: true,//直接触发（不显示"是否发动"确认框），与guidao鬼道一致
                        content: function () {
                            "step 0"
                            var expansions = player.getExpansions('modaiqijian');
                            //展示当前判定情况及可选讯牌，玩家自行决定是否打出
                            player.chooseButton(
                                [
                                    get.translation(trigger.player) + '的' +
                                    (trigger.judgestr || '') + '判定为' +
                                    get.translation(trigger.player.judging[0]) +
                                    '，' + get.prompt('haitiantongxun'),
                                    [expansions, 'card']
                                ],
                                false//false=可取消，不强制选择
                            ).set('ai', function (button) {
                                var triggerEvt = _status.event.getTrigger();
                                var target = triggerEvt.player;
                                var p = get.player();
                                //judge()返回值：正数表示该牌对判定目标有利，负数表示不利
                                var cardScore = triggerEvt.judge(button.link);
                                var curScore = triggerEvt.judge(triggerEvt.player.judging[0]);
                                var att = get.attitude(p, target);
                                //友方：希望判定有利（cardScore高更好）；敌方：希望判定不利（cardScore低更好）
                                if (att > 0) return cardScore - curScore;
                                return curScore - cardScore;
                            }).set('prompt', get.prompt('haitiantongxun'));
                            "step 1"
                            if (!result.bool || !result.links || !result.links.length) {
                                event.finish(); return;//玩家取消或AI认为不值，放弃发动
                            }
                            var xun = result.links[0];//选中的讯牌
                            //提前记录"是否是最后一张讯牌"——因为之后异步移动可能导致计数不及时
                            event.wasLastXun = (player.getExpansions('modaiqijian').length == 1);
                            player.logSkill('haitiantongxun', trigger.player);//记录技能发动日志
                            //旧判定牌弃置（与鬼道不同的是这里直接弃置，不归还给玩家）
                            game.cardsDiscard(trigger.player.judging[0]);
                            //讯牌替换成新判定牌（引擎通过judging[0]引用获取最终判定结果）
                            trigger.player.judging[0] = xun;
                            //加入结算追踪队列（引擎以此物理移动讯牌到判定区位置）
                            trigger.orderingCards.addArray([xun]);
                            game.log(trigger.player, '的判定牌改为', xun);
                            game.delay(2);//等待视觉效果完成
                            "step 2"
                            //检查是否是最后一张讯牌（使用后扩展区清空）
                            if (event.wasLastXun) {
                                player.recover(1);//失去最后一张讯牌时，回复1点体力
                            }
                        },
                        intro: {
                            content: function () { return get.translation('haitiantongxun_info'); },
                        },
                    },

                    huijie_lock: {//彗袭子技能：锁定类别，本回合只能使用同类别的牌
                        charlotte: true,
                        mod: {
                            cardEnabled: function (card, player) {
                                var locked = player.getStorage('huijie_locked');
                                if (!locked) return;//没有锁定则不干预
                                var type = get.type(card);
                                //装备牌和延时锦囊不受限制（不影响正常装备和判定）
                                if (type == 'equip' || type == 'delay') return;
                                //只允许使用与锁定类别相同的牌
                                if (type != locked) return false;
                            },
                        },
                    },

                },
                translate: {//技能翻译

                    mijian: "弥坚",
                    mijian_info: "当你受到伤害后，你可以选择一项：1.摸两张牌；2.下一张使用的【杀】无法被响应；3.下一次造成的伤害+1；4.获得一点护甲。",

                    shanzhan: "善战",
                    shanzhan_info: "每轮限X+1次，你可以将一张基本牌当作任意一张基本牌使用或打出（X为你本局累计造成伤害点数）。",

                    huijie: "彗袭",
                    huijie_info: "出牌阶段开始时，你可以选择一种基本牌或非延时锦囊类型：本回合可将任意一张手牌视为该类型使用一次，且本回合只能使用该类别的牌。",

                    duoneng: "多能",
                    duoneng_info: "摸牌阶段，你可以放弃摸牌，改为观看牌堆顶4张牌，获取其中类别各不相同的牌，然后将剩余牌放回牌堆顶。",

                    daike: "代课",
                    daike_info: "你使用基本牌或普通锦囊结算后，你可以令一名非目标角色摸一张牌，然后弃置一张手牌。",

                    xiaoxiao: "枭啸",
                    xiaoxiao_info: "锁定技。其他角色对你造成伤害，或你对其他角色造成伤害后，该角色获得1枚「俯冲」标记（有永久免疫者除外）。",

                    yingfan: "鹰返",
                    yingfan_info: "结束阶段，你可以选择一名有「俯冲」标记的角色，令其选择：①交出所有手牌；②失去1点体力上限并永久免疫枭啸和鹰返效果。",

                    yingfan_immune: "永久免疫",
                    fuzong: "俯冲",

                    xianfeng: "先锋",
                    xianfeng_info: "锁定技。当你使用牌指定目标后，对于其中未横置的目标，该牌对其无效，然后横置其武将牌，若有狂欢开幕则摸1张牌。",

                    kuanhuankaimu: "狂欢开幕",
                    kuanhuankaimu_info: "（阳面）先锋令角色横置时，你摸1张牌。（阴面）出牌阶段，你可以弃置1张手牌，令一名横置的角色重置，然后该角色摸1张牌。",

                    qianzhi: "牵制",
                    qianzhi_info: "锁定技。你手牌中的装备牌可以当作【闪】使用；回合外，他人不能以【顺手牵羊】【过河拆桥】针对你；若场上有俾斯麦，你的手牌装备牌可当任意基本牌使用或打出。",

                    beizhai: "北宅",
                    beizhai_info: "弃牌阶段，你手牌中的黑色牌不计入手牌数。弃牌阶段结束时，你可以弃置两张黑色手牌，然后从牌堆获得一张随机装备牌。",

                    jidongjiandui: "机动舰队",
                    jidongjiandui_info: "锁定技。你的♦基本牌视为♣。你使用黑色【杀】对有防具的角色造成伤害时，该伤害+1。",

                    jiangongchuji: "舰攻出击",
                    jiangongchuji_info: "当你用【杀】对一名角色造成伤害后，你可以观看其手牌并获得其中一张；若该牌不是黑色，其视为对你使用一张无距离限制的【杀】。",

                    modaiqijian: "末代旗舰",
                    modaiqijian_info: "当你使用普通锦囊后，你可以将一张手牌扣置于你的武将牌上（称为"讯"牌）。",

                    haitiantongxun: "海天通讯",
                    haitiantongxun_info: "当一名角色判定时，你可以打出一张"讯"牌替换该判定牌。若你失去了最后一张"讯"牌，你回复1点体力。",

                },
            },
            intro: "sonnet扩展",
            author: "",
            version: "1.0",
        }, files: { "character": [], "card": [], "skill": [] }
    }
});
