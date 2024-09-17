import { inject, injectable, container, DependencyContainer, Lifecycle } from "tsyringe";
import crypto from "crypto";
import { PostDBModLoader } from "@spt/loaders/PostDBModLoader";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { DialogueHelper } from "@spt/helpers/DialogueHelper";
import { IPostSptLoadMod } from "@spt/models/external/IPostSptLoadMod";
import type { StaticRouterModService } from "@spt/services/mod/staticRouter/StaticRouterModService";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ImageRouter } from "@spt/routers/ImageRouter";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { ITraderConfig, UpdateTime } from "@spt/models/spt/config/ITraderConfig";
import { IModLoader } from "@spt/models/spt/mod/IModLoader";
import { PreSptModLoader } from "@spt/loaders/PreSptModLoader";
import { JsonUtil } from "@spt/utils/JsonUtil";
import { Traders } from "@spt/models/enums/Traders";
import { QuestStatus } from "@spt/models/enums/QuestStatus";
import { MessageType } from "@spt/models/enums/MessageType";
import { HashUtil } from "@spt/utils/HashUtil";
import { VFS } from "@spt/utils/VFS"
import { NotificationSendHelper } from "@spt/helpers/NotificationSendHelper";
import { NotifierHelper } from "@spt/helpers/NotifierHelper";
import { QuestHelper } from "@spt/helpers/QuestHelper";
import { InventoryHelper } from "@spt/helpers/InventoryHelper";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { Item } from "@spt/models/eft/common/tables/IItem";
import { ImporterUtil } from "@spt/utils/ImporterUtil"
import { BundleLoader } from "@spt/loaders/BundleLoader";
//import { TraderAppMerchandise, TraderOperateJsonOdj } from "./vulcan-api/merchantOperate";
import { VulcanCommon } from "./vulcan-api/Common";
import { RepeatableQuestRewardGenerator } from "@spt/generators/RepeatableQuestRewardGenerator";
import { LootGenerator } from "@spt/generators/LootGenerator";
import { RepeatableQuestGenerator } from "@spt/generators/RepeatableQuestGenerator";
import { IQuestReward, IQuestRewards } from "@spt/models/eft/common/tables/IQuest";
import { IBaseQuestConfig, IQuestConfig, IRepeatableQuestConfig } from "@spt/models/spt/config/IQuestConfig";
import { IPreset } from "@spt/models/eft/common/IGlobals";
import { BaseClasses } from "@spt/models/enums/BaseClasses";
import { QuestRewardType } from "@spt/models/enums/QuestRewardType";
import { ExhaustableArray } from "@spt/models/spt/server/ExhaustableArray"
import { IRepeatableQuest } from "@spt/models/eft/common/tables/IRepeatableQuests";
import { TraderInfo } from "@spt/models/eft/common/tables/IBotBase";
import { IQuestTypePool } from "@spt/models/spt/repeatable/IQuestTypePool";
import { InventoryController } from "@spt/controllers/InventoryController";
import { IPmcData } from "@spt/models/eft/common/IPmcData";
import { IOpenRandomLootContainerRequestData } from "@spt/models/eft/inventory/IOpenRandomLootContainerRequestData";
import { IItemEventRouterResponse } from "@spt/models/eft/itemEvent/IItemEventRouterResponse";
import { IAddItemsDirectRequest } from "@spt/models/eft/inventory/IAddItemsDirectRequest";
import { PaymentHelper } from "@spt/helpers/PaymentHelper";
import { HandbookHelper } from "@spt/helpers/HandbookHelper";
import { TradeHelper } from "@spt/helpers/TradeHelper";
import { Money } from "@spt/models/enums/Money";
import { VulcanMap } from "./vulcan-api/Map";
import { IProcessSellTradeRequestData } from "@spt/models/eft/trade/IProcessSellTradeRequestData";
import { PaymentService } from "@spt/services/PaymentService";
import { FenceService } from "@spt/services/FenceService";
import { HttpResponseUtil } from "@spt/utils/HttpResponseUtil";
import { SkillTypes } from "@spt/models/enums/SkillTypes";
//const addTrader = new TraderOperateJsonOdj
//
class Mod implements IPreSptLoadMod {
    private static container: DependencyContainer;
    public preSptLoad(container: DependencyContainer): void {
        Mod.container = container;
        container.register<VulcanMap>("VulcanMap", VulcanMap, { lifecycle: Lifecycle.Singleton });
        container.register<VulcanCommon>("VulcanCommon", VulcanCommon, { lifecycle: Lifecycle.Singleton });
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

        //自定义货币交易处理
        container.afterResolution("TradeHelper", (_t, result: TradeHelper) => {
            //将原逻辑复制保留
            //result.giveProfileMoneySrc = result.giveProfileMoney;
            //覆写新逻辑,委托的形式（不推荐直接赋值）
            result.sellItem = (
                profileWithItemsToSell: IPmcData,
                profileToReceiveMoney: IPmcData,
                sellRequest: IProcessSellTradeRequestData,
                sessionID: string,
                output: IItemEventRouterResponse,) => {
                return this.sellItem(profileWithItemsToSell, profileToReceiveMoney, sellRequest, sessionID, output);
            };
            //result.giveProfileMoney = this.giveProfileMoney
        }, { frequency: "Always" });

        /*
        //修复任务奖励的配方处理(暂时性, 310dev已修)
        container.afterResolution("QuestHelper", (_t, result: QuestHelper) => {
            //将原逻辑复制保留
            //result.giveProfileMoneySrc = result.giveProfileMoney;
            //覆写新逻辑,委托的形式（不推荐直接赋值）
            result.findAndAddHideoutProductionIdToProfile = (
                pmcData: IPmcData,
                craftUnlockReward: IQuestReward,
                questDetails: IQuest,
                sessionID: string,
                response: IItemEventRouterResponse,) => {
                return this.addHideoutRecipe(pmcData, craftUnlockReward, questDetails, sessionID, response);
            };
            //result.giveProfileMoney = this.giveProfileMoney
        }, { frequency: "Always" });
        //修复每日任务免费刷新次数(暂时性, 310dev已修)
        container.afterResolution("RepeatableQuestController", (_t, result: RepeatableQuestController) => {
            //将原逻辑复制保留
            //result.giveProfileMoneySrc = result.giveProfileMoney;
            //覆写新逻辑,委托的形式（不推荐直接赋值）
            result.getRepeatableQuestSubTypeFromProfile = (
                repeatableConfig: IRepeatableQuestConfig,
                pmcData: IPmcData,) => {
                return this.getRepeatableQuestSubTypeFromProfile(repeatableConfig, pmcData);
            };
            //result.giveProfileMoney = this.giveProfileMoney
        }, { frequency: "Always" });
        /*
        //修复每日任务免费刷新不生效(暂时性, 310dev已修)
        container.afterResolution("RepeatableQuestController", (_t, result: RepeatableQuestController) => {
            //将原逻辑复制保留
            //result.giveProfileMoneySrc = result.giveProfileMoney;
            //覆写新逻辑,委托的形式（不推荐直接赋值）
            result.changeRepeatableQuest = (
                pmcData: IPmcData,
                changeRequest: IRepeatableQuestChangeRequest,
                sessionID: string,) => {
                return this.changeRepeatableQuest(pmcData, changeRequest, sessionID);
            };
            //result.giveProfileMoney = this.giveProfileMoney
        }, { frequency: "Always" });
        //修复存档间互相购买报价(测试)
        container.afterResolution("TradeController", (_t, result: TradeController) => {
            //将原逻辑复制保留
            //result.giveProfileMoneySrc = result.giveProfileMoney;
            //覆写新逻辑,委托的形式（不推荐直接赋值）
            result.buyPmcItemFromRagfair = (
                sessionId: string,
                pmcData: IPmcData,
                fleaOffer: IRagfairOffer,
                requestOffer: IOfferRequest,
                output: IItemEventRouterResponse,) => {
                return this.buyPmcItemFromRagfair(sessionId, pmcData, fleaOffer, requestOffer, output);
            };
            //result.giveProfileMoney = this.giveProfileMoney
        }, { frequency: "Always" });
        */





        //addTrader.addTraderPreSptload(inFuncContainer,商人名字)
    }
    public postSptLoad(container: DependencyContainer): void {
        //addTrader.addTraderPosrtDBLoad(inFuncContainer,/* SPT原版格式的assor.json */,/* BaseOdj直接接收SPT原版格式的base.json */,/* 商人名字(同上) */,/* questassort直接接收SPT原版格式的questassort,PS:也可以之后用其他办法添加 */)

        //const common = container.resolve<VulcanCommon>("VulcanCommon");
        //common.Debug(common.getzhItemName("5aa7e276e5b5b000171d0647"))
    }
    public postDBLoad(container: DependencyContainer): void {
        const common = container.resolve("VulcanCommon");
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const ClientDB = databaseServer.getTables()
        ClientDB.templates.handbook.Categories.push({
            "Id": "66f1d60097d24f49a043bbd1",
            "ParentId": "5b47574386f77428ca22b33e",
            "Icon": "/files/handbook/icon_gear_cases.png",
            "Color": "",
            "Order": "100"
        })
        ClientDB.locales.global.ch["66f1d60097d24f49a043bbd1"] = "次元博物"
        ClientDB.locales.global.en["66f1d60097d24f49a043bbd1"] = "Dimension Museum"

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
        const preSptModLoader = Mod.container.resolve("PreSptModLoader");
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
        const ModPath = preSptModLoader.getModPath("[火神之心]VulcanCore")
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
                var Result = this.getadvGiftBoxContainer(giftdata, pmcData)
                Array.isArray(Result[0]) ? rewards.push(...Result) : rewards.push(Result)
            }
            //common.Log(JSON.stringify(rewards, null, 4))
        }
        else if (isStaticBox) {
            const BoxData = containerDetailsDb[1]._props.StaticBoxData
            foundInRaid = BoxData.forcefindinraid ? true : foundInRaid
            for (var i = 0; i < BoxData.giftdata.length; i++) {
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
        //inventoryHelper.removeItem(pmcData, body.item, sessionID, output);
        //你妈的，有bug，回来再修
        inventoryHelper.removeItemByCount(
            pmcData,
            body.item,
            1,
            sessionID,
            output,
        );
    }
    public getadvGiftBoxContainer(giftdata, pmcdata) {
        const logger = Mod.container.resolve("WinstonLogger");
        const importerUtil = Mod.container.resolve("ImporterUtil");
        const preSptModLoader = Mod.container.resolve("PreSptModLoader");
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
        const ModPath = preSptModLoader.getModPath("[火神之心]VulcanCore")
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
        var srrealchance = Math.floor((1 / (sr.chancegrowcount + 1 + ((1 - sr.chance) / sr.chancegrowpercount))) * 1000) / 1000
        var upchance = Math.floor(Math.random() * 1000) / 1000
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
        if ((randomchance <= (srrealchance + srdata.addchance)) || (srdata.count == (sr.chancegrowcount + 1 + Math.floor(((1 - sr.chance) / sr.chancegrowpercount))))) {

            common.Warn(`你抽到了金色传说!`)
            if (srdata.count == (sr.chancegrowcount + 1 + ((1 - sr.chance) / sr.chancegrowpercount))) {
                //common.Log("吃满保底啦!")
            }
            else {
                //common.Log("没吃满")
            }
            srdata.addchance = 0
            srdata.count = 0
            rdata.addchance = 0
            rdata.count = 0
            //common.Access(`金色数据: 累加概率: ${srdata.addchance}, 抽取次数: ${srdata.count}, 保底叠加概率: ${srdata.upaddchance}`)
            //common.Access(`紫色数据: 累加概率: ${rdata.addchance}, 抽取次数: ${rdata.count}, 保底叠加概率: ${rdata.upaddchance}`)
            //up命中
            if (upchance <= (sr.upchance + srdata.upaddchance)) {
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
        else if (randomchance <= (r.chance) || (rdata.count == Math.floor((r.chancegrowcount + 1 + ((1 - r.chance) / r.chancegrowpercount))))) {
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
    public sellItem(
        profileWithItemsToSell: IPmcData,
        profileToReceiveMoney: IPmcData,
        sellRequest: IProcessSellTradeRequestData,
        sessionID: string,
        output: IItemEventRouterResponse,) {

        const logger = Mod.container.resolve("WinstonLogger");
        const importerUtil = Mod.container.resolve("ImporterUtil");
        const preSptModLoader = Mod.container.resolve("PreSptModLoader");
        const weightedRandomHelper = Mod.container.resolve("WeightedRandomHelper");
        const itemFilterService = Mod.container.resolve("ItemFilterService");
        const fenceService = Mod.container.resolve("FenceService");
        const randomUtil = Mod.container.resolve("RandomUtil");
        const presetHelper = Mod.container.resolve("PresetHelper");
        const itemHelper = Mod.container.resolve("ItemHelper");
        const localisationService = Mod.container.resolve("LocalisationService");
        const mathUtil = Mod.container.resolve("MathUtil");
        const hashUtil = Mod.container.resolve("HashUtil");
        const jsonUtil = Mod.container.resolve("JsonUtil");
        const vfs = Mod.container.resolve("VFS")
        const databaseServer = Mod.container.resolve("DatabaseServer")
        const ModPath = preSptModLoader.getModPath("[火神之心]VulcanCore")
        const common = Mod.container.resolve("VulcanCommon")
        const repeatableQuestRewardGenerator = Mod.container.resolve("RepeatableQuestRewardGenerator")
        const lootGenerator = Mod.container.resolve("LootGenerator")
        const inventoryHelper = Mod.container.resolve("InventoryHelper")
        const traderHelper = Mod.container.resolve("TraderHelper")
        const paymentHelper = Mod.container.resolve("PaymentHelper")
        const paymentService = Mod.container.resolve("PaymentService")
        const handbookHelper = Mod.container.resolve("HandbookHelper")
        const httpResponse = Mod.container.resolve("HttpResponseUtil")

        //common.Log("start")

        // Find item in inventory and remove it
        for (const itemToBeRemoved of sellRequest.items) {
            // Strip out whitespace
            const itemIdToFind = itemToBeRemoved.id.replace(/\s+/g, "");

            //common.Log("startfor")

            // Find item in player inventory, or show error to player if not found
            const matchingItemInInventory = profileWithItemsToSell.Inventory.items.find((x) => x._id === itemIdToFind);

            if (!matchingItemInInventory) {
                const errorMessage = `Unable to sell item ${itemToBeRemoved.id}, cannot be found in player inventory`;
                logger.error(errorMessage);
                httpResponse.appendErrorToOutput(output, errorMessage);
                return;
            }

            //common.Log(0)

            logger.debug(`Selling: id: ${matchingItemInInventory._id} tpl: ${matchingItemInInventory._tpl}`);

            //common.Log(1)
            // THIS IS THE ONLY CHANGE WE DO IN THIS METHOD!
            if (sellRequest.tid === Traders.FENCE) {
                //common.Log("fence")
                this.addToFence(profileWithItemsToSell.Inventory.items, matchingItemInInventory._id);
                //fenceService.addItemsToFenceAssort(
                //    profileWithItemsToSell.Inventory.items,
                //    matchingItemInInventory,
                //);
            }
            // THIS IS THE ONLY CHANGE WE DO IN THIS METHOD!

            // Also removes children
            //common.Log("remove item")
            inventoryHelper.removeItem(profileWithItemsToSell, itemToBeRemoved.id, sessionID, output);
        }

        // Give player money for sold item(s)
        //common.Log("givemoney")
        //paymentService.giveProfileMoney(profileToReceiveMoney, sellRequest.price, sellRequest, output, sessionID);
        this.giveProfileMoney(profileToReceiveMoney, sellRequest.price, sellRequest, output, sessionID);
    }
    public addToFence(itemCollection: Item[], itemId: string) {
        const logger = Mod.container.resolve("WinstonLogger");
        const importerUtil = Mod.container.resolve("ImporterUtil");
        const preSptModLoader = Mod.container.resolve("PreSptModLoader");
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
        const databaseServer = Mod.container.resolve("DatabaseServer")
        const ModPath = preSptModLoader.getModPath("[火神之心]VulcanCore")
        const common = Mod.container.resolve("VulcanCommon")
        const repeatableQuestRewardGenerator = Mod.container.resolve("RepeatableQuestRewardGenerator")
        const lootGenerator = Mod.container.resolve("LootGenerator")
        const inventoryHelper = Mod.container.resolve("InventoryHelper")
        const traderHelper = Mod.container.resolve("TraderHelper")
        const paymentHelper = Mod.container.resolve("PaymentHelper")
        const paymentService = Mod.container.resolve("PaymentService")
        const handbookHelper = Mod.container.resolve("HandbookHelper")
        const httpResponse = Mod.container.resolve("HttpResponseUtil")
        const fenceService = Mod.container.resolve("FenceService")
        const configServer = Mod.container.resolve("ConfigServer")
        // yes, this is technically a protected class variable, but we can access it here since we don't care.
        const assort = fenceService.fenceAssort;

        // Copy the item and its children
        let items = structuredClone(itemHelper.findAndReturnChildrenAsItems(itemCollection, itemId));
        const root = items[0];

        const traderConfig = configServer.getConfig<ITraderConfig>(ConfigTypes.TRADER);
        const cost = handbookHelper.getTemplatePriceForItems(items) * traderConfig.fence.itemPriceMult;

        // Fix IDs
        items = itemHelper.reparentItemAndChildren(root, items);
        root.parentId = "hideout";

        // Clean up the items
        delete root.location;

        for (const item of items) {
            if (item.parentId == "hideout") {
                continue;
            }

            delete item.upd;
        }

        // Add the item to fence's assortment
        assort.items.push(...items);
        assort.barter_scheme[root._id] = [
            [
                {
                    count: cost,
                    _tpl: Money.ROUBLES
                }
            ]
        ];
        assort.loyal_level_items[root._id] = 1;
    }
    public giveProfileMoney(
        pmcData: IPmcData,
        amountToSend: number,
        request: IProcessSellTradeRequestData,
        output: IItemEventRouterResponse,
        sessionID: string,
    ): void {
        const logger = Mod.container.resolve("WinstonLogger");
        const importerUtil = Mod.container.resolve("ImporterUtil");
        const preSptModLoader = Mod.container.resolve("PreSptModLoader");
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
        const databaseServer = Mod.container.resolve("DatabaseServer")
        const ModPath = preSptModLoader.getModPath("[火神之心]VulcanCore")
        const common = Mod.container.resolve("VulcanCommon")
        const repeatableQuestRewardGenerator = Mod.container.resolve("RepeatableQuestRewardGenerator")
        const lootGenerator = Mod.container.resolve("LootGenerator")
        const inventoryHelper = Mod.container.resolve("InventoryHelper")
        const traderHelper = Mod.container.resolve("TraderHelper")
        const paymentHelper = Mod.container.resolve("PaymentHelper")
        const paymentService = Mod.container.resolve("PaymentService")
        const handbookHelper = Mod.container.resolve("HandbookHelper")

        //common.Log("覆写测试")
        //vfs.writeFile(`${ModPath}export.json`, JSON.stringify(request, null, 4))

        const trader = traderHelper.getTrader(request.tid, sessionID);
        const currency = paymentHelper.getCurrency(trader.currency);
        let calcAmount = handbookHelper.fromRUB(handbookHelper.inRUB(amountToSend, currency), currency);
        const currencyMaxStackSize = databaseServer.getTables().templates.items[currency]._props.StackMaxSize;
        let skipSendingMoneyToStash = false;

        //common.Log("覆写测试")

        if (trader.customcurrency) {
            common.Log("custom")
            const customcurrency = trader.customcurrency
            var customcalcAmount = Math.floor(amountToSend / trader.customcurrencyMulti)
            const customamountToSend = Math.floor(amountToSend / trader.customcurrencyMulti)
            const customcurrencyMaxStackSize = databaseServer.getTables().templates.items[customcurrency]._props.StackMaxSize;
            //common.Log("自定义货币")
            for (const item of pmcData.Inventory.items) {
                // Item is not currency
                if (item._tpl !== customcurrency) {
                    continue;
                }

                // Item is not in the stash
                if (!inventoryHelper.isItemInStash(pmcData, item)) {
                    continue;
                }

                // Found currency item
                if (item.upd.StackObjectsCount < customcurrencyMaxStackSize) {
                    if (item.upd.StackObjectsCount + customcalcAmount > customcurrencyMaxStackSize) {
                        // calculate difference
                        customcalcAmount -= customcurrencyMaxStackSize - item.upd.StackObjectsCount;
                        item.upd.StackObjectsCount = customcurrencyMaxStackSize;
                    }
                    else {
                        skipSendingMoneyToStash = true;
                        item.upd.StackObjectsCount = item.upd.StackObjectsCount + customcalcAmount;
                    }

                    // Inform client of change to items StackObjectsCount
                    output.profileChanges[sessionID].items.change.push(item);

                    if (skipSendingMoneyToStash) {
                        break;
                    }
                }
            }

            // Create single currency item with all currency on it
            const rootCurrencyReward = {
                _id: hashUtil.generate(),
                _tpl: customcurrency,
                upd: { StackObjectsCount: Math.round(customcalcAmount) },
            };

            // Ensure money is properly split to follow its max stack size limit
            const rewards = itemHelper.splitStackIntoSeparateItems(rootCurrencyReward);

            if (!skipSendingMoneyToStash) {
                const addItemToStashRequest: IAddItemsDirectRequest = {
                    itemsWithModsToAdd: rewards,
                    foundInRaid: false,
                    callback: null,
                    useSortingTable: true,
                };
                inventoryHelper.addItemsToStash(sessionID, addItemToStashRequest, pmcData, output);
            }

            // Calcualte new total sale sum with trader item sold to
            const saleSum = pmcData.TradersInfo[request.tid].salesSum + customamountToSend;

            pmcData.TradersInfo[request.tid].salesSum = saleSum;
            traderHelper.lvlUp(request.tid, pmcData);
        }

        else {
            //common.Log("vanilla")
            paymentService.giveProfileMoney(pmcData, amountToSend, request, output, sessionID)
        }


    }
    public addHideoutRecipe(
        pmcData: IPmcData,
        craftUnlockReward: IQuestReward,
        questDetails: IQuest,
        sessionID: string,
        response: IItemEventRouterResponse,
    ): void {
        const logger = Mod.container.resolve("WinstonLogger");
        const importerUtil = Mod.container.resolve("ImporterUtil");
        const preSptModLoader = Mod.container.resolve("PreSptModLoader");
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
        const databaseServer = Mod.container.resolve("DatabaseServer")
        const databaseService = Mod.container.resolve("DatabaseService")
        const ModPath = preSptModLoader.getModPath("[火神之心]VulcanCore")
        const common = Mod.container.resolve("VulcanCommon")
        const repeatableQuestRewardGenerator = Mod.container.resolve("RepeatableQuestRewardGenerator")
        const lootGenerator = Mod.container.resolve("LootGenerator")
        const inventoryHelper = Mod.container.resolve("InventoryHelper")
        const traderHelper = Mod.container.resolve("TraderHelper")
        const paymentHelper = Mod.container.resolve("PaymentHelper")
        const paymentService = Mod.container.resolve("PaymentService")
        const handbookHelper = Mod.container.resolve("HandbookHelper")

        //common.Log("覆写测试")
        //vfs.writeFile(`${ModPath}export.json`, JSON.stringify(request, null, 4))
        // Get hideout crafts and find those that match by areatype/required level/end product tpl - hope for just one match

        const hideoutProductions = databaseService.getHideout().production;
        const matchingProductions = hideoutProductions.filter(
            (prod) =>
                prod.areaType === Number.parseInt(craftUnlockReward.traderId)
                && prod.requirements.some((x) => x.requiredLevel === craftUnlockReward.loyaltyLevel)
                && prod.endProduct === craftUnlockReward.items[0]._tpl
            //&& prod.count === (craftUnlockReward.items[0].upd?.StackObjectsCount ?? 1),
        );

        // More/less than 1 match, above filtering wasn't strict enough
        if (matchingProductions.length !== 1) {
            logger.error(
                localisationService.getText("quest-unable_to_find_matching_hideout_production", {
                    questName: questDetails.QuestName,
                    matchCount: matchingProductions.length,
                }),
            );

            return;
        }

        // Add above match to pmc profile + client response
        const matchingCraftId = matchingProductions[0]._id;
        pmcData.UnlockedInfo.unlockedProductionRecipe.push(matchingCraftId);
        response.profileChanges[sessionID].recipeUnlocked[matchingCraftId] = true;


    }
    protected getRepeatableQuestSubTypeFromProfile(
        repeatableConfig: IRepeatableQuestConfig,
        pmcData: IPmcData,
    ): IPmcDataRepeatableQuest
    {
        const logger = Mod.container.resolve("WinstonLogger");
        const importerUtil = Mod.container.resolve("ImporterUtil");
        const preSptModLoader = Mod.container.resolve("PreSptModLoader");
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
        const databaseServer = Mod.container.resolve("DatabaseServer")
        const databaseService = Mod.container.resolve("DatabaseService")
        const ModPath = preSptModLoader.getModPath("[火神之心]VulcanCore")
        const common = Mod.container.resolve("VulcanCommon")
        const repeatableQuestRewardGenerator = Mod.container.resolve("RepeatableQuestRewardGenerator")
        const repeatableQuestController = Mod.container.resolve("RepeatableQuestController")
        const repeatableQuestGenerator = Mod.container.resolve("RepeatableQuestGenerator")
        const lootGenerator = Mod.container.resolve("LootGenerator")
        const inventoryHelper = Mod.container.resolve("InventoryHelper")
        const traderHelper = Mod.container.resolve("TraderHelper")
        const paymentHelper = Mod.container.resolve("PaymentHelper")
        const questHelper = Mod.container.resolve("QuestHelper")
        const paymentService = Mod.container.resolve("PaymentService")
        const handbookHelper = Mod.container.resolve("HandbookHelper")
        const profileHelper = Mod.container.resolve("ProfileHelper")
        const timeUtil = Mod.container.resolve("TimeUtil");
        const eventOutputHolder = Mod.container.resolve("EventOutputHolder");
        const httpResponse = Mod.container.resolve("HttpResponseUtil");
        const cloner = Mod.container.resolve("PrimaryCloner");
        //
        // Get from profile, add if missing
        let repeatableQuestDetails = pmcData.RepeatableQuests
            .find((repeatable) => repeatable.name === repeatableConfig.name);
        if (!repeatableQuestDetails) // Not in profile, generate
        {
            const hasAccess = profileHelper.hasAccessToRepeatableFreeRefreshSystem(pmcData);
            repeatableQuestDetails = {
                id: repeatableConfig.id,
                name: repeatableConfig.name,
                activeQuests: [],
                inactiveQuests: [],
                endTime: 0,
                changeRequirement: {},
                freeChanges: hasAccess ? repeatableConfig.freeChanges : 0,
                freeChangesAvailable: hasAccess ? repeatableConfig.freeChangesAvailable : 0,
            };

            // Add base object that holds repeatable data to profile
            pmcData.RepeatableQuests.push(repeatableQuestDetails);
        }

        return repeatableQuestDetails;
    }
    public changeRepeatableQuest(
        pmcData: IPmcData,
        changeRequest: IRepeatableQuestChangeRequest,
        sessionID: string,
    ): IItemEventRouterResponse {
        const logger = Mod.container.resolve("WinstonLogger");
        const importerUtil = Mod.container.resolve("ImporterUtil");
        const preSptModLoader = Mod.container.resolve("PreSptModLoader");
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
        const databaseServer = Mod.container.resolve("DatabaseServer")
        const databaseService = Mod.container.resolve("DatabaseService")
        const ModPath = preSptModLoader.getModPath("[火神之心]VulcanCore")
        const common = Mod.container.resolve("VulcanCommon")
        const repeatableQuestRewardGenerator = Mod.container.resolve("RepeatableQuestRewardGenerator")
        const repeatableQuestController = Mod.container.resolve("RepeatableQuestController")
        const repeatableQuestGenerator = Mod.container.resolve("RepeatableQuestGenerator")
        const lootGenerator = Mod.container.resolve("LootGenerator")
        const inventoryHelper = Mod.container.resolve("InventoryHelper")
        const traderHelper = Mod.container.resolve("TraderHelper")
        const paymentHelper = Mod.container.resolve("PaymentHelper")
        const questHelper = Mod.container.resolve("QuestHelper")
        const paymentService = Mod.container.resolve("PaymentService")
        const handbookHelper = Mod.container.resolve("HandbookHelper")
        const profileHelper = Mod.container.resolve("ProfileHelper")
        const timeUtil = Mod.container.resolve("TimeUtil");
        const eventOutputHolder = Mod.container.resolve("EventOutputHolder");
        const httpResponse = Mod.container.resolve("HttpResponseUtil");
        const cloner = Mod.container.resolve("PrimaryCloner");
        //

        const output = eventOutputHolder.getOutput(sessionID);

        const fullProfile = profileHelper.getFullProfile(sessionID);

        // Check for existing quest in (daily/weekly/scav arrays)
        const { quest: questToReplace, repeatableType: repeatablesInProfile }
            = repeatableQuestController.getRepeatableById(changeRequest.qid, pmcData);

        // Subtype name of quest - daily/weekly/scav
        const repeatableTypeLower = repeatablesInProfile.name.toLowerCase();

        // Save for later standing loss calculation
        const replacedQuestTraderId = questToReplace.traderId;

        // Update active quests to exclude the quest we're replacing
        repeatablesInProfile.activeQuests = repeatablesInProfile.activeQuests
            .filter((quest) => quest._id !== changeRequest.qid);

        // Save for later cost calculation
        const previousChangeRequirement = cloner.clone(repeatablesInProfile.changeRequirement[changeRequest.qid]);

        // Delete the replaced quest change requrement as we're going to replace it
        delete repeatablesInProfile.changeRequirement[changeRequest.qid];

        // Get config for this repeatable sub-type (daily/weekly/scav)
        const repeatableConfig = repeatableQuestController.questConfig.repeatableQuests
            .find((config) => config.name === repeatablesInProfile.name,
            );

        // Generate meta-data for what type/levelrange of quests can be generated for player
        const allowedQuestTypes = repeatableQuestController.generateQuestPool(repeatableConfig, pmcData.Info.Level);
        const newRepeatableQuest = repeatableQuestController.attemptToGenerateRepeatableQuest(pmcData, allowedQuestTypes, repeatableConfig);
        if (!newRepeatableQuest) {
            // Unable to find quest being replaced
            const message = `Unable to generate repeatable quest of type: ${repeatableTypeLower} to replace trader: ${replacedQuestTraderId} quest ${changeRequest.qid}`;
            logger.error(message);

            return httpResponse.appendErrorToOutput(output, message);
        }

        // Add newly generated quest to daily/weekly/scav type array
        newRepeatableQuest.side = repeatableConfig.side;
        repeatablesInProfile.activeQuests.push(newRepeatableQuest);

        // Find quest we're replacing in pmc profile quests array and remove it
        questHelper.findAndRemoveQuestFromArrayIfExists(questToReplace._id, pmcData.Quests);

        // Find quest we're replacing in scav profile quests array and remove it
        questHelper.findAndRemoveQuestFromArrayIfExists(
            questToReplace._id,
            fullProfile.characters.scav?.Quests ?? [],
        );

        // Add new quests replacement cost to profile
        repeatablesInProfile.changeRequirement[newRepeatableQuest._id] = {
            changeCost: newRepeatableQuest.changeCost,
            changeStandingCost: randomUtil.getArrayValue([0, 0.01]),
        };

        // Check if we should charge player for replacing quest
        const isFreeToReplace = repeatableQuestController.useFreeRefreshIfAvailable(fullProfile, repeatablesInProfile, repeatableTypeLower);
        if (!isFreeToReplace)
        {
            // Reduce standing with trader for not doing their quest
            const traderOfReplacedQuest = pmcData.TradersInfo[replacedQuestTraderId];
            traderOfReplacedQuest.standing -= previousChangeRequirement.changeStandingCost;
            // not free, Charge player
            for (const cost of previousChangeRequirement.changeCost)
            {
                cost.count = Math.trunc(cost.count * (1-(Math.trunc((profileHelper.getSkillFromProfile(pmcData, SkillTypes.CHARISMA)?.Progress ?? 0)/100)*0.001)) ??1)
                //console.log(cost.count)
                //console.log((profileHelper.getSkillFromProfile(pmcData, SkillTypes.CHARISMA)?.Progress ?? 0)/100)
                //console.log((Math.trunc((profileHelper.getSkillFromProfile(pmcData, SkillTypes.CHARISMA)?.Progress ?? 0)/100)*0.001))
                paymentService.addPaymentToOutput(pmcData, cost.templateId, cost.count, sessionID, output);
                if (output.warnings.length > 0)
                {
                    return output;
                }
            }
        }

        // Clone data before we send it to client
        const repeatableToChangeClone = cloner.clone(repeatablesInProfile);

        // Purge inactive repeatables
        repeatableToChangeClone.inactiveQuests = [];

        if (!repeatableToChangeClone) {
            // Unable to find quest being replaced
            const message = localisationService.getText("quest-unable_to_find_repeatable_to_replace");
            logger.error(message);

            return httpResponse.appendErrorToOutput(output, message);
        }

        // Nullguard
        output.profileChanges[sessionID].repeatableQuests ||= [];

        // Update client output with new repeatable
        output.profileChanges[sessionID].repeatableQuests.push(repeatableToChangeClone);

        return output;
    }
    public buyPmcItemFromRagfair(
        sessionId: string,
        pmcData: IPmcData,
        fleaOffer: IRagfairOffer,
        requestOffer: IOfferRequest,
        output: IItemEventRouterResponse,
    ): void
    {
        console.log("START")
        const tradeHelper = Mod.container.resolve("TradeHelper")
        const profileHelper = Mod.container.resolve("ProfileHelper")
        const saveServer = Mod.container.resolve("SaveServer")
        const ragfairOfferHelper = Mod.container.resolve("RagfairOfferHelper")
        const configServer = Mod.container.resolve("ConfigServer")
        const ragfairServer = Mod.container.resolve("RagfairServer")
        const ragfairConfig = configServer.getConfig<ITraderConfig>(ConfigTypes.RAGFAIR);
        //
        const buyData: IProcessBuyTradeRequestData = {
            Action: "TradingConfirm",
            type: "buy_from_ragfair",
            tid: "ragfair",
            // eslint-disable-next-line @typescript-eslint/naming-convention
            item_id: fleaOffer._id, // Store ragfair offerId in buyRequestData.item_id
            count: requestOffer.count,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            scheme_id: 0,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            scheme_items: requestOffer.items,
        };

        // buyItem() must occur prior to removing the offer stack, otherwise item inside offer doesn't exist for confirmTrading() to use
        tradeHelper.buyItem(
            pmcData,
            buyData,
            sessionId,
            ragfairConfig.dynamic.purchasesAreFoundInRaid,
            output,
        );
        if (output.warnings.length > 0)
        {
            return;
        }
        //resolve when a profile buy another profile's offer
        const OfferID = fleaOffer._id
        const OfferOwnerID = fleaOffer.user?.id
        const OfferBuyCount = requestOffer.count
        //resolve offer
        if(profileHelper.getFullProfile(OfferOwnerID)!=null){
            if(profileHelper.getFullProfile(OfferOwnerID).characters.pmc.RagfairInfo.offers.length>0){
                if(profileHelper.getFullProfile(OfferOwnerID).characters.pmc.RagfairInfo.offers.some(offer=>offer._id == OfferID)){
                    ragfairOfferHelper.completeOffer(OfferOwnerID, fleaOffer, OfferBuyCount)
                    return;
                }
            }
        }
        // Remove/lower stack count of item purchased from flea offer
        ragfairServer.removeOfferStack(fleaOffer._id, requestOffer.count);
    }
}
module.exports = { mod: new Mod() }