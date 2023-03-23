import { inject, injectable, container, DependencyContainer, Lifecycle } from "tsyringe";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ItemLocale } from "./localeclass";
import { VulcanItemEditor } from "./itemedit";
import { QuestLocale } from "./localeclass";
import { VulcanLocaleHelper } from "./localehelper"
import { IQuest } from "@spt-aki/models/eft/common/tables/IQuest";
@injectable()
export class VulcanQuestHelper {

    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("DatabaseServer") protected databaseServer: DatabaseServer,
        @inject("VulcanItemEditor") protected itemEditor: VulcanItemEditor,
        @inject("VulcanLocaleHelper") protected localehelper: VulcanLocaleHelper
    ) { }
    //创建空白任务(使用copyItem方法拷贝信息并清空信息)
    //参数说明 questid: 创建的新任务的任务id; traderid: 任务所属的商人id; type: 任务显示的类型
    //返回一个任务对象
    public createQuest(questid: string, traderid: string, type: string) {
        const db = this.databaseServer.getTables()
        const quest: IQuest = db.templates.quests["5967733e86f774602332fc84"]
        var newquest = this.itemEditor.copyItem(quest)
        newquest.type = type
        newquest.conditions.AvailableForFinish = []
        newquest.rewards.Success = []
        newquest.acceptPlayerMessage = `${questid} acceptPlayerMessage`
        newquest.changeQuestMessageText = `${questid} changeQuestMessageText`
        newquest.completePlayerMessage = `${questid} completePlayerMessage`
        newquest.description = `${questid} description`
        newquest.failMessageText = `${questid} failMessageText`
        newquest.name = `${questid} name`
        newquest.note = `${questid} note`
        newquest.startedMessageText = `${questid} startedMessageText`
        newquest.successMessageText = `${questid} successMessageText`
        newquest.templateId = questid
        newquest._id = questid
        newquest.traderId = traderid
        return newquest
    }
    //将任务对象写入服务端数据库
    //参数说明 quest: 任务对象
    public addQuest(quest: Object) {
        const db = this.databaseServer.getTables()
        const questid = quest._id
        db.templates.quests[questid] = quest
    }
    //为任务创建完成需求
    //参数说明: quest: 任务对象; requirement: 任务完成需求对象/数组
    public createRequire(quest: Object, requirement: object) {
        if (Array.isArray(requirement)) {
            for (var i = 0; i < requirement.length; i++) {
                quest.conditions.AvailableForFinish.push(requirement[i])
            }
        }
        else {
            quest.conditions.AvailableForFinish.push(requirement)
        }
    }
    //创建一个上交物品的需求
    //参数说明: requireid: 需求本身的id, 本地化也需要用到这个id; itemid: 上交物品的id; count: 上交物品的数量; isfoundinraid: 是否要求上交在战局中找到的物品; autolocale: 自动生成本地化文本
    //返回一个对象
    public createHandover(requireid: string, itemid: string, count: number, isfoundinraid: boolean, autolocale: boolean) {
        const db = this.databaseServer.getTables()
        const locale = db.locales.global["ch"]
        if (autolocale == true) {
            if (isfoundinraid == true) {
                locale[requireid] = `上交在战局中找到的${this.localehelper.getzhItemName(this.itemEditor.getItem(itemid))}`
            }
            else {
                locale[requireid] = `交付${this.localehelper.getzhItemName(this.itemEditor.getItem(itemid))}`
            }
        }
        return {
            "_parent": "HandoverItem",
            "_props": {
                "dogtagLevel": 0,
                "dynamicLocale": false,
                "id": requireid,
                "index": 0,
                "isEncoded": false,
                "maxDurability": 100,
                "minDurability": 0,
                "onlyFoundInRaid": isfoundinraid,
                "parentId": "",
                "target": [
                    itemid
                ],
                "value": count,
                "visibilityConditions": []
            },
            "dynamicLocale": false
        }
    }
    //创建一个寻找物品需求
    //参数说明: requireid: 需求本身的id; itemid: 寻找物品的id, count: 寻找物品的数量; autolocale: 自动生成本地化文本; autohandover: 自动生成对应的上交物品需求
    //如果使用自动生成上交物品需求, 则返回一个数组; 如果不使用自动生成上交物品需求, 则返回一个对象
    public createFind(requireid: string, itemid: string, count: number, autolocale: boolean, autohandover: boolean) {
        const db = this.databaseServer.getTables()
        const locale = db.locales.global["ch"]
        if (autohandover == true) {
            if (autolocale == true) {
                locale[requireid] = `在战局中找到${this.localehelper.getzhItemName(this.itemEditor.getItem(itemid))}`
                locale[`${requireid}handover`] = `上交在战局中找到的${this.localehelper.getzhItemName(this.itemEditor.getItem(itemid))}`
            }
            return [
                {
                    "_parent": "FindItem",
                    "_props": {
                        "countInRaid": false,
                        "dogtagLevel": 0,
                        "dynamicLocale": false,
                        "id": requireid,
                        "index": 0,
                        "isEncoded": false,
                        "maxDurability": 100,
                        "minDurability": 0,
                        "onlyFoundInRaid": true,
                        "parentId": "",
                        "target": [
                            itemid
                        ],
                        "value": count,
                        "visibilityConditions": []
                    },
                    "dynamicLocale": false
                },
                {
                    "_parent": "HandoverItem",
                    "_props": {
                        "dogtagLevel": 0,
                        "dynamicLocale": false,
                        "id": `${requireid}handover`,
                        "index": 1,
                        "isEncoded": false,
                        "maxDurability": 100,
                        "minDurability": 0,
                        "onlyFoundInRaid": true,
                        "parentId": "",
                        "target": [
                            itemid
                        ],
                        "value": count,
                        "visibilityConditions": []
                    },
                    "dynamicLocale": false
                }
            ]
        }
        else {
            if (autolocale == true) {
                locale[requireid] = `在战局中找到${this.localehelper.getzhItemName(this.itemEditor.getItem(itemid))}`
            }
            return {
                "_parent": "FindItem",
                "_props": {
                    "countInRaid": false,
                    "dogtagLevel": 0,
                    "dynamicLocale": false,
                    "id": requireid,
                    "index": 0,
                    "isEncoded": false,
                    "maxDurability": 100,
                    "minDurability": 0,
                    "onlyFoundInRaid": true,
                    "parentId": "",
                    "target": [
                        itemid
                    ],
                    "value": count,
                    "visibilityConditions": []
                },
                "dynamicLocale": false
            }
        }
    }
}