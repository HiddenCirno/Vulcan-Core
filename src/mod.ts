import { inject, injectable, container, DependencyContainer, Lifecycle } from "tsyringe";
import crypto from "crypto";
import { PostDBModLoader } from "@spt-aki/loaders/PostDBModLoader";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { DialogueHelper } from "@spt-aki/helpers/DialogueHelper";
import { IPostAkiLoadMod } from "@spt-aki/models/external/IPostAkiLoadMod";
import type { StaticRouterModService } from "@spt-aki/services/mod/staticRouter/StaticRouterModService";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { ImageRouter } from "@spt-aki/routers/ImageRouter";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { ITraderConfig, UpdateTime } from "@spt-aki/models/spt/config/ITraderConfig";
import { IModLoader } from "@spt-aki/models/spt/mod/IModLoader";
import { PreAkiModLoader } from "@spt-aki/loaders/PreAkiModLoader";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { Traders } from "@spt-aki/models/enums/Traders";
import { QuestStatus } from "@spt-aki/models/enums/QuestStatus";
import { MessageType } from "@spt-aki/models/enums/MessageType";
import { HashUtil } from "@spt-aki/utils/HashUtil";
import { VFS } from "@spt-aki/utils/VFS"
import { NotificationSendHelper } from "@spt-aki/helpers/NotificationSendHelper";
import { NotifierHelper } from "@spt-aki/helpers/NotifierHelper";
import { QuestHelper } from "@spt-aki/helpers/QuestHelper";
import { InventoryHelper } from "@spt-aki/helpers/InventoryHelper";
import { ItemHelper } from "@spt-aki/helpers/ItemHelper";
import { Item } from "@spt-aki/models/eft/common/tables/IItem";
import { ImporterUtil } from "@spt-aki/utils/ImporterUtil"
import { BundleLoader } from "@spt-aki/loaders/BundleLoader";
import { VulcanConsole } from "./vulcan-api/console";
import { VulcanItemEditor } from "./vulcan-api/itemedit";
import { VulcanHandBookHelper } from "./vulcan-api/handbook";
import { VulcanLocaleHelper } from "./vulcan-api/localehelper";
import { VulcanMiscMethod } from "./vulcan-api/miscmethod";
//import { TraderAppMerchandise, TraderOperateJsonOdj } from "./vulcan-api/merchantOperate";
import { TraderAppMerchandise } from "./vulcan-api/merchantOperate";
import { VulcanQuestHelper } from "./vulcan-api/questhelper";
import { VulcanTraderHelper } from "./vulcan-api/traderhelper";
import { IQuestTypePool } from "@spt-aki/models/spt/repeatable/IQuestTypePool";
import { VulcanDatabaseHelper } from "./vulcan-api/dbhelper";
import { VulcanCommon } from "./vulcan-api/Common";
import { repeatableQuestGenerator } from "./vulcan-api/questGenerator"
import { VulcanMap } from "./vulcan-api/Map";
import { RepeatableQuestRewardGenerator } from "@spt-aki/generators/RepeatableQuestRewardGenerator";
import { LootGenerator } from "@spt-aki/generators/LootGenerator";
import { RepeatableQuestGenerator } from "@spt-aki/generators/RepeatableQuestGenerator";
import { IQuestReward, IQuestRewards } from "@spt-aki/models/eft/common/tables/IQuest";
import { IBaseQuestConfig, IQuestConfig, IRepeatableQuestConfig } from "@spt-aki/models/spt/config/IQuestConfig";
import { IPreset } from "@spt-aki/models/eft/common/IGlobals";
import { BaseClasses } from "@spt-aki/models/enums/BaseClasses";
import { QuestRewardType } from "@spt-aki/models/enums/QuestRewardType";
import { ExhaustableArray } from "@spt-aki/models/spt/server/ExhaustableArray"
import { IRepeatableQuest } from "@spt-aki/models/eft/common/tables/IRepeatableQuests";
import { TraderInfo } from "@spt-aki/models/eft/common/tables/IBotBase";
import { InventoryController } from "@spt-aki/controllers/InventoryController";
import { IPmcData } from "@spt-aki/models/eft/common/IPmcData";
import { IOpenRandomLootContainerRequestData } from "@spt-aki/models/eft/inventory/IOpenRandomLootContainerRequestData";
import { IItemEventRouterResponse } from "@spt-aki/models/eft/itemEvent/IItemEventRouterResponse";
import { IAddItemsDirectRequest } from "@spt-aki/models/eft/inventory/IAddItemsDirectRequest";
//const addTrader = new TraderOperateJsonOdj
//
class Mod implements IPreAkiLoadMod {
    private static container: DependencyContainer;
    public preAkiLoad(container: DependencyContainer): void {
        Mod.container = container;
        container.register<VulcanConsole>("VulcanConsole", VulcanConsole, { lifecycle: Lifecycle.Singleton });
        container.register<VulcanItemEditor>("VulcanItemEditor", VulcanItemEditor, { lifecycle: Lifecycle.Singleton });
        container.register<VulcanHandBookHelper>("VulcanHandBookHelper", VulcanHandBookHelper, { lifecycle: Lifecycle.Singleton });
        container.register<VulcanLocaleHelper>("VulcanLocaleHelper", VulcanLocaleHelper, { lifecycle: Lifecycle.Singleton });
        container.register<TraderAppMerchandise>("TraderAppMerchandise", TraderAppMerchandise, { lifecycle: Lifecycle.Singleton });
        container.register<VulcanQuestHelper>("VulcanQuestHelper", VulcanQuestHelper, { lifecycle: Lifecycle.Singleton });
        container.register<VulcanMiscMethod>("VulcanMiscMethod", VulcanMiscMethod, { lifecycle: Lifecycle.Singleton });
        container.register<VulcanTraderHelper>("VulcanTraderHelper", VulcanTraderHelper, { lifecycle: Lifecycle.Singleton });
        container.register<VulcanDatabaseHelper>("VulcanDatabaseHelper", VulcanDatabaseHelper, { lifecycle: Lifecycle.Singleton });
        container.register<VulcanCommon>("VulcanCommon", VulcanCommon, { lifecycle: Lifecycle.Singleton });
        container.register<VulcanMap>("VulcanMap", VulcanMap, { lifecycle: Lifecycle.Singleton });
        //const repeatableQRG = Mod.container.resolve<repeatableQuestGenerator>("repeatableQuestGeneragor")
        // Wait until LauncherController gets resolved by the server and run code afterwards to replace 
        // the login() function with the one below called 'replacementFunction()
        
        //奖励生成扩展
        container.afterResolution("RepeatableQuestRewardGenerator", (_t, result: RepeatableQuestRewardGenerator) => {
            //将原逻辑复制保留
            result.generateRewardSrc = result.generateReward;
            //覆写新逻辑,委托的形式（不推荐直接赋值）
            result.generateReward = (pmcLevel: number,
                difficulty: number,
                traderId: string,
                repeatableConfig: IRepeatableQuestConfig,
                questConfig: IBaseQuestConfig,) => {
                return this.generateReward(pmcLevel, difficulty, traderId, repeatableConfig, questConfig);
            }
        }, { frequency: "Always" });

        //每日任务生成扩展
        container.afterResolution("RepeatableQuestGenerator", (_t, result: RepeatableQuestGenerator) => {
            //将原逻辑复制保留
            result.generateRepeatableQuestSrc = result.generateRepeatableQuest;
            //覆写新逻辑,委托的形式（不推荐直接赋值）
            result.generateRepeatableQuest = (pmcLevel: number,
                pmcTraderInfo: Record<string, TraderInfo>,
                questTypePool: IQuestTypePool,
                repeatableConfig: IRepeatableQuestConfig,) => {
                return this.generateRepeatableQuest(pmcLevel, pmcTraderInfo, questTypePool, repeatableConfig);
            };
        }, { frequency: "Always" });

        container.afterResolution("InventoryController", (_t, result: InventoryController) => {
            // We want to replace the original method logic with something different
            result.openRandomLootContainer = (
                pmcData: IPmcData,
                body: IOpenRandomLootContainerRequestData,
                sessionID: string,
                output: IItemEventRouterResponse,) => {
                return this.openRandomLootContainer(pmcData, body, sessionID, output)
            }
            // The modifier Always makes sure this replacement method is ALWAYS replaced
        }, { frequency: "Always" });



        //addTrader.addTraderPreAkiload(inFuncContainer,商人名字)
    }
    public postAkiLoad(container: DependencyContainer): void {
        //addTrader.addTraderPosrtDBLoad(inFuncContainer,/* SPT原版格式的assor.json */,/* BaseOdj直接接收SPT原版格式的base.json */,/* 商人名字(同上) */,/* questassort直接接收SPT原版格式的questassort,PS:也可以之后用其他办法添加 */)

        //const common = container.resolve<VulcanCommon>("VulcanCommon");
        //common.Debug(common.getzhItemName("5aa7e276e5b5b000171d0647"))
    }
    public postDBLoad(inFuncContainer: DependencyContainer): void {
    }
      /**
     * 创建任务奖励
     */
      public generateReward(
        pmcLevel: number,
        difficulty: number,
        traderId: string,
        repeatableConfig: IRepeatableQuestConfig,
        questConfig: IBaseQuestConfig,
    ): IQuestRewards {
        const repeatableQuestRewardGenerator = Mod.container.resolve("RepeatableQuestRewardGenerator");
        const common = Mod.container.resolve("VulcanCommon");
        let rewards = { Started: [], Success: [], Fail: [] };
        //加载配置里的物品
        //核心部分(强制添加任务奖励)
        //当自定义配置存在时加载自定义配置
        if (questConfig.rewards && questConfig.rewards.length > 0) {
            common.Log("自定义奖励加载成功");
            common.initQuestRewardDaily(questConfig.rewards, rewards);
        }
        else {
            //调用原逻辑
            rewards = repeatableQuestRewardGenerator.generateRewardSrc(pmcLevel, difficulty, traderId, repeatableConfig, questConfig);
        }
        return rewards;
        //common.Log("方法重写成功")
        //common.Log(JSON.stringify(questConfig, null, 4))
    }

     /**
     * 创建每日任务
     */
    public generateRepeatableQuest(
        pmcLevel: number,
        pmcTraderInfo: Record<string, TraderInfo>,
        questTypePool: IQuestTypePool,
        repeatableConfig: IRepeatableQuestConfig,
    ): IRepeatableQuest {
        const randomUtil = Mod.container.resolve("RandomUtil");
        const common = Mod.container.resolve("VulcanCommon");
        const repeatableQuestGenerator = Mod.container.resolve("RepeatableQuestGenerator");
        const questType = randomUtil.drawRandomFromList(questTypePool.types)[0];

        let resultQuest = null;
        //自定义任务处理
        if (questType == "RITCCustom") {
            let traders = repeatableConfig.traderid;
            common.Log("自定义每日任务生成成功");
            resultQuest = this.generateCustomPickupQuest(pmcLevel, traders, questTypePool, repeatableConfig);
        }
        else {
            //调用原逻辑
            resultQuest = repeatableQuestGenerator.generateRepeatableQuestSrc(pmcLevel, pmcTraderInfo, questTypePool, repeatableConfig);
        }
        return resultQuest;

    }
    /**
     * 创建自定义任务
     */
    public generateCustomPickupQuest(
        pmcLevel: number,
        traderId: string,
        questTypePool: IQuestTypePool,
        repeatableConfig: IRepeatableQuestConfig,
    ): IRepeatableQuest {
        const pickupConfig = repeatableConfig.questConfig.RITCCustom;
        const common = Mod.container.resolve("VulcanCommon");
        const quest = this.generateRepeatableTemplate("Completion", traderId, repeatableConfig.side, repeatableConfig);
        const repeatableQuestRewardGenerator = Mod.container.resolve("RepeatableQuestRewardGenerator");

        //common.Log(JSON.stringify(quest, null, 4))
        quest.conditions.AvailableForFinish = [];
        quest.conditions.AvailableForStart = [];
        quest.conditions.Fail = [];
        common.initQuestCondDaily(pickupConfig.conds, quest);
        //common.Log(JSON.stringify(quest, null, 4))
        // Add rewards
        quest.rewards = repeatableQuestRewardGenerator.generateReward(pmcLevel, 1, traderId, repeatableConfig, pickupConfig);
        return quest;
    }
    
    public generateRepeatableTemplate(type: string, traderId: string, side: string, repeatableConfig): IRepeatableQuest {
        const jsonUtil = Mod.container.resolve("JsonUtil");
        const databaseServer = Mod.container.resolve<DatabaseServer>("DatabaseServer");
        const common = Mod.container.resolve("VulcanCommon")
        const questClone = jsonUtil.clone<IRepeatableQuest>(
            databaseServer.getTables().templates.repeatableQuests.templates[type],
        );
        questClone._id = common.generateHash(`${repeatableConfig.questConfig.RITCCustom.name}_${performance.now()}`);
        questClone.traderId = traderId;

        /*  in locale, these id correspond to the text of quests
            template ids -pmc  : Elimination = 616052ea3054fc0e2c24ce6e / Completion = 61604635c725987e815b1a46 / Exploration = 616041eb031af660100c9967
            template ids -scav : Elimination = 62825ef60e88d037dc1eb428 / Completion = 628f588ebb558574b2260fe5 / Exploration = 62825ef60e88d037dc1eb42c
        */

        // Get template id from config based on side and type of quest
        questClone.templateId = `${repeatableConfig.questConfig.RITCCustom.name}`

        questClone.name = repeatableConfig.questConfig.RITCCustom.name;
        questClone.note = questClone.note.replace("{traderId}", traderId).replace(
            "{templateId}",
            questClone.templateId,
        );
        questClone.description = questClone.description.replace("{traderId}", traderId).replace(
            "{templateId}",
            questClone.templateId,
        );
        questClone.successMessageText = questClone.successMessageText.replace("{traderId}", traderId).replace(
            "{templateId}",
            questClone.templateId,
        );
        questClone.failMessageText = questClone.failMessageText.replace("{traderId}", traderId).replace(
            "{templateId}",
            questClone.templateId,
        );
        questClone.startedMessageText = questClone.startedMessageText.replace("{traderId}", traderId).replace(
            "{templateId}",
            questClone.templateId,
        );
        questClone.changeQuestMessageText = questClone.changeQuestMessageText.replace("{traderId}", traderId).replace(
            "{templateId}",
            questClone.templateId,
        );
        questClone.acceptPlayerMessage = questClone.acceptPlayerMessage.replace("{traderId}", traderId).replace(
            "{templateId}",
            questClone.templateId,
        );
        questClone.declinePlayerMessage = questClone.declinePlayerMessage.replace("{traderId}", traderId).replace(
            "{templateId}",
            questClone.templateId,
        );
        questClone.completePlayerMessage = questClone.completePlayerMessage.replace("{traderId}", traderId).replace(
            "{templateId}",
            questClone.templateId,
        );

        return questClone;
    }
    public openRandomLootContainer(
        pmcData: IPmcData,
        body: IOpenRandomLootContainerRequestData,
        sessionID: string,
        output: IItemEventRouterResponse,
    ): void {
        const logger = Mod.container.resolve("WinstonLogger");
        const importerUtil = Mod.container.resolve("ImporterUtil");
        const preAkiModLoader = Mod.container.resolve("PreAkiModLoader");
        const weightedRandomHelper = Mod.container.resolve("WeightedRandomHelper");
        const itemFilterService = Mod.container.resolve("ItemFilterService");
        const randomUtil = Mod.container.resolve("RandomUtil");
        const presetHelper = Mod.container.resolve("PresetHelper");
        const itemHelper = Mod.container.resolve("ItemHelper");
        const localisationService = Mod.container.resolve("LocalisationService");
        const mathUtil = Mod.container.resolve("MathUtil");
        const hashUtil = Mod.container.resolve("HashUtil");
        const jsonUtil = Mod.container.resolve("JsonUtil");
        const vfs = Mod.container.resolve("VFS")
        const ModPath = preAkiModLoader.getModPath("[火神之心]VulcanCore")
        const common = Mod.container.resolve("VulcanCommon")
        const repeatableQuestRewardGenerator = Mod.container.resolve("RepeatableQuestRewardGenerator")
        const lootGenerator = Mod.container.resolve("LootGenerator")
        const inventoryHelper = Mod.container.resolve("InventoryHelper")
        /** Container player opened in their inventory */
        const openedItem = pmcData.Inventory.items.find((item) => item._id === body.item);
        const containerDetailsDb = itemHelper.getItem(openedItem._tpl);
        const isSealedWeaponBox = containerDetailsDb[1]._name.includes("event_container_airdrop");

        const isadvBox = containerDetailsDb[1]._props.isadvGiftBox
        const isStaticBox = containerDetailsDb[1]._props.isStaticBox
        let foundInRaid = openedItem.upd?.SpawnedInSession;
        const rewards: Item[][] = [];
        //common.Log(JSON.stringify(containerDetailsDb[1], null, 4))
        if (isadvBox) {
            //只是测试, 抽卡算法还没做
            const BoxData = containerDetailsDb[1]._props.advBoxData
            const giftdata = common.getGiftData(BoxData.giftdata)
            var count = BoxData.count
            
            foundInRaid = BoxData.forcefindinraid ? true : foundInRaid
            
            //测试抽卡算法
            //感觉要出事
            //好像没问题嘿
            //需要把卡池独立出来, 然后用字符串查询引导
            //先压测一波
            for (var i = 0; i < count; i++) {
                rewards.push(this.getadvGiftBoxContainer(giftdata, pmcData))
            }
            //common.Log(JSON.stringify(rewards, null, 4))
        }
        else if(isStaticBox){
            const BoxData = containerDetailsDb[1]._props.StaticBoxData
            foundInRaid = BoxData.forcefindinraid ? true : foundInRaid 
            for(var i = 0; i < BoxData.giftdata.length; i++){
                rewards.push(common.getGiftItemByType(BoxData.giftdata[i]))
            }
        }
        else {
            if (isSealedWeaponBox) {
                const containerSettings = inventoryHelper.getInventoryConfig().sealedAirdropContainer;
                rewards.push(...lootGenerator.getSealedWeaponCaseLoot(containerSettings));

                if (containerSettings.foundInRaid) {
                    foundInRaid = containerSettings.foundInRaid;
                }
            }
            else {
                const rewardContainerDetails = inventoryHelper.getRandomLootContainerRewardDetails(openedItem._tpl);
                rewards.push(...lootGenerator.getRandomLootContainerLoot(rewardContainerDetails));

                if (rewardContainerDetails.foundInRaid) {
                    foundInRaid = rewardContainerDetails.foundInRaid;
                }
            }
        }
        var exportarr = [
        ]
        var test = {
            pmcData: pmcData,
            body: body,
            openedItem: openedItem,
            containerDetailsDb: containerDetailsDb,
            isSealedWeaponBox: isSealedWeaponBox,
            rewards: rewards
        }
        //vfs.writeFile(`${ModPath}export.json`, JSON.stringify(test, null, 4))
        const addItemsRequest: IAddItemsDirectRequest = {
            itemsWithModsToAdd: rewards,
            foundInRaid: foundInRaid,
            callback: null,
            useSortingTable: true,
        };
        inventoryHelper.addItemsToStash(sessionID, addItemsRequest, pmcData, output);
        if (output.warnings.length > 0) {
            return;
        }

        // Find and delete opened container item from player inventory
        inventoryHelper.removeItem(pmcData, body.item, sessionID, output);
    }
    public getadvGiftBoxContainer(giftdata, pmcdata) {
        const logger = Mod.container.resolve("WinstonLogger");
        const importerUtil = Mod.container.resolve("ImporterUtil");
        const preAkiModLoader = Mod.container.resolve("PreAkiModLoader");
        const weightedRandomHelper = Mod.container.resolve("WeightedRandomHelper");
        const itemFilterService = Mod.container.resolve("ItemFilterService");
        const randomUtil = Mod.container.resolve("RandomUtil");
        const presetHelper = Mod.container.resolve("PresetHelper");
        const itemHelper = Mod.container.resolve("ItemHelper");
        const localisationService = Mod.container.resolve("LocalisationService");
        const mathUtil = Mod.container.resolve("MathUtil");
        const hashUtil = Mod.container.resolve("HashUtil");
        const jsonUtil = Mod.container.resolve("JsonUtil");
        const vfs = Mod.container.resolve("VFS")
        const ModPath = preAkiModLoader.getModPath("[火神之心]VulcanCore")
        const common = Mod.container.resolve("VulcanCommon")
        const repeatableQuestRewardGenerator = Mod.container.resolve("RepeatableQuestRewardGenerator")
        const lootGenerator = Mod.container.resolve("LootGenerator")
        const inventoryHelper = Mod.container.resolve("InventoryHelper")
        //卡池关键字初始化
        if (!pmcdata.GiftData) {
            pmcdata.GiftData = {}
        }
        //定义常量, 方便调用
        const basedata = giftdata.basereward
        const itempool = giftdata.itempool
        const sr = basedata.superrare
        const srpool = itempool.superrare
        const r = basedata.rare
        const rpool = itempool.rare
        const normal = basedata.normal
        const normalpool = itempool.normal
        //卡池存档信息初始化
        if (!pmcdata.GiftData[giftdata.name]) {
            pmcdata.GiftData[giftdata.name] = {
                superrare: {
                    addchance: 0,
                    count: 0,
                    upaddchance: 0,
                    havebasechance: sr.havebasereward
                },
                rare: {
                    addchance: 0,
                    count: 0,
                    upaddchance: 0,
                    havebasechance: r.havebasereward
                }
            }
        }
        const srdata = pmcdata.GiftData[giftdata.name].superrare
        const rdata = pmcdata.GiftData[giftdata.name].rare
        //计算本次抽卡概率与up概率
        var randomchance = Math.floor(Math.random() * 1000) / 1000
        var srrealchance = Math.floor((1/(sr.chancegrowcount + 1 + ((1-sr.chance)/sr.chancegrowpercount)))*1000)/1000
        var upchance = Math.floor(Math.random() * 100) / 100
        if (sr.havebasereward) {
            //保底计算
            srdata.count++
            if (srdata.count > sr.chancegrowcount) {
                srdata.addchance += sr.chancegrowpercount
            }
        }
        if (r.havebasereward) {
            //保底计算
            rdata.count++
            if (rdata.count > r.chancegrowcount) {
                rdata.addchance += r.chancegrowpercount
            }
        }
        //金
        //common.Access(`金色数据: 累加概率: ${srdata.addchance}, 抽取次数: ${srdata.count}, 保底叠加概率: ${srdata.upaddchance}`)
        //common.Access(`紫色数据: 累加概率: ${rdata.addchance}, 抽取次数: ${rdata.count}, 保底叠加概率: ${rdata.upaddchance}`)
        //common.Log(`金色概率: ${randomchance} / ${srrealchance + srdata.addchance}`)
        if ((randomchance <= (srrealchance + srdata.addchance))||(srdata.count == (sr.chancegrowcount + 1 + ((1-sr.chance)/sr.chancegrowpercount)))) {
            
            if(srdata.count == (sr.chancegrowcount + 1 + ((1-sr.chance)/sr.chancegrowpercount))){
                //common.Log("吃满保底啦!")
            }
            else{
                //common.Log("没吃满")
            }
            srdata.addchance = 0
            srdata.count = 0
            rdata.addchance = 0
            rdata.count = 0
            common.Warn(`你抽到了金色传说!`)
            //common.Access(`金色数据: 累加概率: ${srdata.addchance}, 抽取次数: ${srdata.count}, 保底叠加概率: ${srdata.upaddchance}`)
            //common.Access(`紫色数据: 累加概率: ${rdata.addchance}, 抽取次数: ${rdata.count}, 保底叠加概率: ${rdata.upaddchance}`)
            //up命中
            if (upchance <= (sr.upchance + srdata.upaddchance) ) {
                //common.Log(`保底没歪`)
                srdata.upaddchance = 0
                return common.getGiftItemByType(common.drawFromArray(srpool.chanceup), srdata.count)
            }
            else {
                //common.Log(`哎呀, 保底歪了!`)
                srdata.upaddchance += sr.upaddchance
                return common.getGiftItemByType(common.drawFromArray(srpool.normal), srdata.count)
            }
        }
        //紫
        else if (randomchance <= (r.chance)||(rdata.count == (r.chancegrowcount + 1 + ((1-r.chance)/r.chancegrowpercount)))) {
            rdata.addchance = 0
            rdata.count = 0
            //common.Warn(`你抽到了紫色史诗! 保底已复位`)
            //common.Access(`金色数据: 累加概率: ${srdata.addchance}, 抽取次数: ${srdata.count}, 保底叠加概率: ${srdata.upaddchance}`)
            //common.Access(`紫色数据: 累加概率: ${rdata.addchance}, 抽取次数: ${rdata.count}, 保底叠加概率: ${rdata.upaddchance}`)
            //up命中
            if (upchance <= (r.upchance + rdata.upaddchance)) {
                //common.Log(`保底没歪`)
                rdata.upaddchance = 0
                return common.getGiftItemByType(common.drawFromArray(rpool.chanceup), rdata.count)
            }
            else {
                //common.Log(`哎呀, 保底歪了!`)
                rdata.upaddchance += r.upaddchance
                return common.getGiftItemByType(common.drawFromArray(rpool.normal), rdata.count)
            }
        }
        else {
            //common.Error(`很遗憾, 你抽到了一坨垃圾:(`)
            //common.Log(`无需灰心, 霉运乃人生常事, 少侠请重新来过`)
            //common.Access(`金色数据: 累加概率: ${srdata.addchance}, 抽取次数: ${srdata.count}, 保底叠加概率: ${srdata.upaddchance}`)
            //common.Access(`紫色数据: 累加概率: ${rdata.addchance}, 抽取次数: ${rdata.count}, 保底叠加概率: ${rdata.upaddchance}`)
            //common.Log("抽卡统计结束")
            //up命中
            if (upchance < normal.upchance) {
                return common.getGiftItemByType(common.drawFromArray(normalpool.chanceup), 0)
            }
            else {
                return common.getGiftItemByType(common.drawFromArray(normalpool.normal), 0)
            }

        }


    }
}
module.exports = { mod: new Mod() }