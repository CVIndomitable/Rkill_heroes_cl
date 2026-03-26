
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

                },
                translate: {//武将名称翻译
                    talin_R: "塔林",
                    botelan_R: "波特兰",
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

                },
                translate: {//技能翻译

                    mijian: "弥坚",
                    mijian_info: "当你受到伤害后，你可以选择一项：1.摸两张牌；2.下一张使用的【杀】无法被响应；3.下一次造成的伤害+1；4.获得一点护甲。",

                    shanzhan: "善战",
                    shanzhan_info: "每轮限X+1次，你可以将一张基本牌当作任意一张基本牌使用或打出（X为你本局累计造成伤害点数）。",

                },
            },
            intro: "sonnet扩展",
            author: "",
            version: "1.0",
        }, files: { "character": [], "card": [], "skill": [] }
    }
});
