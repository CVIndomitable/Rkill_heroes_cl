
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

                },
                translate: {//武将和技能翻译

                },
            },
            card: {
                card: {//卡牌技能

                },
                translate: {//卡牌翻译

                },
                list: [],//牌堆
            },
            skill: {//技能
                skill: {

                },
                translate: {//技能翻译

                },
            },
            intro: "sonnet扩展",
            author: "",
            version: "1.0",
        }, files: { "character": [], "card": [], "skill": [] }
    }
});
