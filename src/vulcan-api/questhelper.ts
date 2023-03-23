import { inject, injectable, container, DependencyContainer, Lifecycle } from "tsyringe";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ItemLocale } from "./localeclass";
import { VulcanItemEditor } from "./itemedit";
import { QuestLocale } from "./localeclass";
import { VulcanLocaleHelper } from "./localehelper"
import { VulcanMiscMethod } from "./miscmethod"
import { IQuest } from "@spt-aki/models/eft/common/tables/IQuest";
@injectable()
export class VulcanQuestHelper {

    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("DatabaseServer") protected databaseServer: DatabaseServer,
        @inject("VulcanItemEditor") protected itemEditor: VulcanItemEditor,
        @inject("VulcanLocaleHelper") protected localehelper: VulcanLocaleHelper,
        @inject("VulcanMiscMethod") protected miscMethod: VulcanMiscMethod
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
    //内部方法, 用于向击杀目标需求创建指定地图需求
    //传参: requireid: 指定击杀需求的id; location: 地图名
    //地图名接受输入: 海关/海岸线/灯塔/森林/立交桥/储备站/实验室/街区/夜间工厂/白天工厂/工厂/塔科夫全境
    private addLocation(requireid: Object, location: string) {
        switch (location) {
            case "海关": {
                return {
                    "_parent": "Location",
                    "_props": {
                        "id": `${requireid}_Location`,
                        "target": [
                            "bigmap"
                        ]
                    }
                }
            }
            case "海岸线": {
                return {
                    "_parent": "Location",
                    "_props": {
                        "id": `${requireid}_Location`,
                        "target": [
                            "Shoreline"
                        ]
                    }
                }
            }
            case "灯塔": {
                return {
                    "_parent": "Location",
                    "_props": {
                        "id": `${requireid}_Location`,
                        "target": [
                            "Lighthouse"
                        ]
                    }
                }
            }
            case "森林": {
                return {
                    "_parent": "Location",
                    "_props": {
                        "id": `${requireid}_Location`,
                        "target": [
                            "Woods"
                        ]
                    }
                }
            }
            case "立交桥": {
                return {
                    "_parent": "Location",
                    "_props": {
                        "id": `${requireid}_Location`,
                        "target": [
                            "Interchange"
                        ]
                    }
                }
            }
            case "储备站": {
                return {
                    "_parent": "Location",
                    "_props": {
                        "id": `${requireid}_Location`,
                        "target": [
                            "RezervBase"
                        ]
                    }
                }
            }
            case "实验室": {
                return {
                    "_parent": "Location",
                    "_props": {
                        "id": `${requireid}_Location`,
                        "target": [
                            "laboratory"
                        ]
                    }
                }
            }
            case "塔科夫街区": {
                return {
                    "_parent": "Location",
                    "_props": {
                        "id": `${requireid}_Location`,
                        "target": [
                            "TarkovStreets"
                        ]
                    }
                }
            }
            case "夜间工厂": {
                return {
                    "_parent": "Location",
                    "_props": {
                        "id": `${requireid}_Location`,
                        "target": [
                            "factory4_night"
                        ]
                    }
                }
            }
            case "白天工厂": {
                return {
                    "_parent": "Location",
                    "_props": {
                        "id": `${requireid}_Location`,
                        "target": [
                            "factory4_day"
                        ]
                    }
                }
            }
            case "工厂": {
                return {
                    "_parent": "Location",
                    "_props": {
                        "id": `${requireid}_Location`,
                        "target": [
                            "factory4_day",
                            "factory4_night"
                        ]
                    }
                }
            }
            case "塔科夫全境": {
                return {
                    "_parent": "Location",
                    "_props": {
                        "id": `${requireid}_Location`,
                        "target": [
                            "Interchange",
                            "Shoreline",
                            "TarkovStreets",
                            "Lighthouse",
                            "Woods",
                            "bigmap",
                            "RezervBase",
                            "laboratory",
                            "factory4_day",
                            "factory4_night"
                        ]
                    }
                }
            }
        }
    }
    //内部方法, 为击杀目标需求创建指定目标
    //传参: requireid同上; target: 击杀目标
    //target可接受参数: Scav/Bear/Usec/Pmc/Reshala/Sanitar/Glukhar/Tagilla/Killa/Shturman/Knight/BigPipe/BirdEye
    private addTarget(requireid: Object, target: string) {
        switch (target) {
            case "Scav": {
                return {
                    "_parent": "Kills",
                    "_props": {
                        "compareMethod": ">=",
                        "id": `${requireid}_KillEnemy`,
                        "target": "Savage",
                        "value": "1"
                    }
                }
            }
            case "Bear": {
                return {
                    "_parent": "Kills",
                    "_props": {
                        "compareMethod": ">=",
                        "id": `${requireid}_KillEnemy`,
                        "target": "Bear",
                        "value": "1"
                    }
                }
            }
            case "Usec": {
                return {
                    "_parent": "Kills",
                    "_props": {
                        "compareMethod": ">=",
                        "id": `${requireid}_KillEnemy`,
                        "target": "Usec",
                        "value": "1"
                    }
                }
            }
            case "Pmc": {
                return {
                    "_parent": "Kills",
                    "_props": {
                        "compareMethod": ">=",
                        "id": `${requireid}_KillEnemy`,
                        "target": "AnyPmc",
                        "value": "1"
                    }
                }
            }
            case "Knight": {
                return {
                    "_parent": "Kills",
                    "_props": {
                        "compareMethod": ">=",
                        "id": `${requireid}_KillEnemy`,
                        "savageRole": [
                            "bossKnight"
                        ],
                        "target": "Savage",
                        "value": "1"
                    }
                }
            }
            case "BigPipe": {
                return {
                    "_parent": "Kills",
                    "_props": {
                        "compareMethod": ">=",
                        "id": `${requireid}_KillEnemy`,
                        "savageRole": [
                            "followerBigPipe"
                        ],
                        "target": "Savage",
                        "value": "1"
                    }
                }
            }
            case "BirdEye": {
                return {
                    "_parent": "Kills",
                    "_props": {
                        "compareMethod": ">=",
                        "id": `${requireid}_KillEnemy`,
                        "savageRole": [
                            "followerBirdEye"
                        ],
                        "target": "Savage",
                        "value": "1"
                    }
                }
            }
            case "Reshala": {
                return {
                    "_parent": "Kills",
                    "_props": {
                        "compareMethod": ">=",
                        "id": `${requireid}_KillEnemy`,
                        "savageRole": [
                            "bossBully"
                        ],
                        "target": "Savage",
                        "value": "1"
                    }
                }
            }
            case "Sanitar": {
                return {
                    "_parent": "Kills",
                    "_props": {
                        "compareMethod": ">=",
                        "id": `${requireid}_KillEnemy`,
                        "savageRole": [
                            "bossSanitar"
                        ],
                        "target": "Savage",
                        "value": "1"
                    }
                }
            }
            case "Tagilla": {
                return {
                    "_parent": "Kills",
                    "_props": {
                        "compareMethod": ">=",
                        "id": `${requireid}_KillEnemy`,
                        "savageRole": [
                            "bossTagilla"
                        ],
                        "target": "Savage",
                        "value": "1"
                    }
                }
            }
            case "Glukhar": {
                return {
                    "_parent": "Kills",
                    "_props": {
                        "compareMethod": ">=",
                        "id": `${requireid}_KillEnemy`,
                        "savageRole": [
                            "bossGluhar"
                        ],
                        "target": "Savage",
                        "value": "1"
                    }
                }
            }
            case "Shturman": {
                return {
                    "_parent": "Kills",
                    "_props": {
                        "compareMethod": ">=",
                        "id": `${requireid}_KillEnemy`,
                        "savageRole": [
                            "bossKojaniy"
                        ],
                        "target": "Savage",
                        "value": "1"
                    }
                }
            }
            case "Killa": {
                return {
                    "_parent": "Kills",
                    "_props": {
                        "compareMethod": ">=",
                        "id": `${requireid}_KillEnemy`,
                        "savageRole": [
                            "bossKilla"
                        ],
                        "target": "Savage",
                        "value": "1"
                    }
                }
            }
        }
    }
    //创建一个击杀目标需求
    //传参: requireid: 说过很多次了......; target: 击杀目标, 接受输入同上; count: 击杀数量' autolocale: 自动本地化; location: 指定地点, 传参同上上
    public createKill(requireid: string, target: string, count: number, autolocale: boolean, location: string) {
        const db = this.databaseServer.getTables()
        const locale = db.locales.global["ch"]
        const quest = db.templates.quests
        var killcondition = this.miscMethod.copyObject(quest["5936d90786f7742b1420ba5b"].conditions.AvailableForFinish[0])
        this.itemEditor.changeID(killcondition, killcondition._props.id, requireid)
        killcondition._props.counter.conditions = []
        killcondition._props.counter.id = `${requireid}_KilledCondition`
        killcondition._props.value = count
        if (autolocale == true) {
            if (location != null) {
                if (target == "Bear") {
                    locale[requireid] = `在${location}击杀${target}干员`
                }
                else if (target == "Usec") {
                    locale[requireid] = `在${location}击杀${target}干员`
                }
                else if (target == "Pmc") {
                    locale[requireid] = `在${location}击杀任意${target}干员`
                }
                else {
                    locale[requireid] = `在${location}击杀${target}`
                }
            }
            else {
                if (target == "Bear") {
                    locale[requireid] = `消灭${target}干员`
                }
                else if (target == "Usec") {
                    locale[requireid] = `消灭${target}干员`
                }
                else if (target == "Pmc") {
                    locale[requireid] = `消灭任意${target}干员`
                }
                else {
                    locale[requireid] = `消灭${target}`
                }
            }
        }
        killcondition._props.counter.conditions.push(this.addTarget(requireid, target))
        if (location != null) {
            killcondition._props.counter.conditions.push(this.addLocation(requireid, location))
        }
        return killcondition

    }
    public createLeave(requireid: string, itemid: string, spendtime: number, count: number, zoneid: string, autolocale: boolean, zonestring: string) {
        const db = this.databaseServer.getTables()
        const locale = db.locales.global["ch"]
        if (autolocale == true) {
            if (zonestring != null) {
                locale[requireid] = `将${count}个${this.localehelper.getzhItemName(this.itemEditor.getItem(itemid))}藏匿在${zonestring}`
            }
            else {
                locale[requireid] = `将${count}个${this.localehelper.getzhItemName(this.itemEditor.getItem(itemid))}藏匿在指定地点`
            }
        }
        return {
            "_parent": "LeaveItemAtLocation",
            "_props": {
                "dogtagLevel": 0,
                "dynamicLocale": false,
                "id": requireid,
                "index": 0,
                "isEncoded": false,
                "maxDurability": 100,
                "minDurability": 0,
                "onlyFoundInRaid": false,
                "parentId": "",
                "plantTime": spendtime,
                "target": [
                    itemid
                ],
                "value": `${count}`,
                "visibilityConditions": [],
                "zoneId": zoneid
            },
            "dynamicLocale": false
        }
    }
}