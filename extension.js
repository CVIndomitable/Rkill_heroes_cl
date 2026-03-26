
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
                    //格式：武将id: ["性别", "势力", 血量上限, ["技能1", "技能2"], ["标签"]]
                    //舰种被动（装甲防护zhuangjiafh、防空fangkong2、大角度规避dajiaoduguibi、火控雷达huokongld）直接引用舰R牌将的技能ID

                    // ① 塔林 - ΒΜΦCCCP 轻巡 4血 防空+弥坚
                    rsha_talin: ["female", "ΒΜΦCCCP", 4, ["qingxuncl", "fangkong2", "rsha_mijian"], ["des:塔林，苏联轻巡洋舰"]],

                },
                translate: {//武将和技能翻译
                    rsha_talin: "塔林",
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
                    // 受到1点伤害后，四选一：摸2张牌/下一张杀无法被响应/下一次造成伤害+1/获得1护甲
                    // ============================================
                    rsha_mijian: {
                        audio: 2,
                        trigger: { player: "damageEnd" },
                        filter: function (event, player) {
                            return true;
                        },
                        check: function (event, player) {
                            return true;
                        },
                        content: function () {
                            "step 0"
                            player.chooseControl('摸两张牌', '下一张杀无法被响应', '下一次造成伤害+1', '获得一点护甲')
                                .set('prompt', get.prompt('rsha_mijian'))
                                .set('prompt2', get.prompt2('rsha_mijian'))
                                .set('ai', function () {
                                    var player = get.player();
                                    if (player.hp <= 1) return 3;//低血量优先护甲
                                    if (player.countCards('h') < 2) return 0;//手牌少优先摸牌
                                    return 2;//默认选伤害+1
                                });
                            "step 1"
                            switch (result.index) {
                                case 0:
                                    player.draw(2);
                                    break;
                                case 1:
                                    player.addTempSkill('rsha_mijian_nores');
                                    break;
                                case 2:
                                    player.addTempSkill('rsha_mijian_jiashang');
                                    break;
                                case 3:
                                    player.changeHujia(1);
                                    break;
                            }
                        },
                        intro: {
                            content: function () {
                                return get.translation('rsha_mijian_info');
                            },
                        },
                    },
                    rsha_mijian_nores: {//弥坚子技能：下一张杀不可被响应
                        trigger: { player: "useCard" },
                        forced: true,
                        filter: function (event, player) {
                            return event.card.name == "sha" || event.card.name == "sheji9";
                        },
                        content: function () {
                            trigger.directHit.addArray(game.players);
                            player.removeSkill('rsha_mijian_nores');
                        },
                        charlotte: true,
                    },
                    rsha_mijian_jiashang: {//弥坚子技能：下一次造成伤害+1
                        trigger: { source: "damageBegin1" },
                        forced: true,
                        content: function () {
                            trigger.num++;
                            player.removeSkill('rsha_mijian_jiashang');
                        },
                        charlotte: true,
                    },

                },
                translate: {//技能翻译

                    rsha_mijian: "弥坚",
                    rsha_mijian_info: "当你受到伤害后，你可以选择一项：1.摸两张牌；2.下一张使用的【杀】无法被响应；3.下一次造成的伤害+1；4.获得一点护甲。",

                },
            },
            intro: "sonnet扩展",
            author: "",
            version: "1.0",
        }, files: { "character": [], "card": [], "skill": [] }
    }
});
