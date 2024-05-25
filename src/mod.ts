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
        container.afterResolution("RepeatableQuestRewardGenerator", (_t, result: RepeatableQuestRewardGenerator) => {
            // We want to replace the original method logic with something different
            //result.generateReward = (pmcLevel: number,
            //    difficulty: number,
            //    traderId: string,
            //    repeatableConfig: IRepeatableQuestConfig,
            //    questConfig: IBaseQuestConfig,) => {
            //    return this.generateReward(pmcLevel, difficulty, traderId, repeatableConfig, questConfig)
            //}
            // The modifier Always makes sure this replacement method is ALWAYS replaced
        }, { frequency: "Always" });
        container.afterResolution("RepeatableQuestGenerator", (_t, result: RepeatableQuestGenerator) => {
            // We want to replace the original method logic with something different
            result.generateRepeatableQuest = (
                pmcLevel: number,
                pmcTraderInfo: Record<string, TraderInfo>,
                questTypePool: IQuestTypePool,
                repeatableConfig: IRepeatableQuestConfig,) => {
                return this.generateRepeatableQuest(pmcLevel, pmcTraderInfo, questTypePool, repeatableConfig)
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
    public generateReward(
        pmcLevel: number,
        difficulty: number,
        traderId: string,
        repeatableConfig: IRepeatableQuestConfig,
        questConfig: IBaseQuestConfig,
    ): IQuestRewards {
        // difficulty could go from 0.2 ... -> for lowest difficulty receive 0.2*nominal reward
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
        const common = Mod.container.resolve("VulcanCommon")
        const repeatableQuestRewardGenerator = Mod.container.resolve("RepeatableQuestRewardGenerator")



        const rewards: IQuestRewards = { Started: [], Success: [], Fail: [] };


        //加载配置里的物品
        //核心部分(强制添加任务奖励)
        //其余部分无任何改动
        //也许可以通过hook完成, 并不需要重写方法
        //hook能在方法体前面执行吗?
        //似乎不行....
        //确实不行。
        if (questConfig.rewards && questConfig.rewards.length > 0) {
            common.initQuestRewardDaily(questConfig.rewards, rewards)
            //common.Log("自定义奖励加载成功")
        }
        else {
            return repeatableQuestRewardGenerator.generateReward( pmcLevel, difficulty, traderId, repeatableConfig, questConfig);
        }
        //common.Log("方法重写成功")
        //common.Log(JSON.stringify(questConfig, null, 4))
    }
    public generateRepeatableQuest(
        pmcLevel: number,
        pmcTraderInfo: Record<string, TraderInfo>,
        questTypePool: IQuestTypePool,
        repeatableConfig: IRepeatableQuestConfig,
    ): IRepeatableQuest {
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
        const common = Mod.container.resolve("VulcanCommon")
        const repeatableQuestRewardGenerator = Mod.container.resolve("RepeatableQuestRewardGenerator")
        const repeatableQuestGenerator = Mod.container.resolve("RepeatableQuestGenerator")

        const questType = randomUtil.drawRandomFromList<string>(questTypePool.types)[0];

        if (questType == "RITCCustom") {
            let traders = repeatableConfig.traderid;
            common.Log("自定义每日任务读取测试")
            return this.generateCustomPickupQuest(pmcLevel, traders, questTypePool, repeatableConfig);
        }
        else {
            // get traders from whitelist and filter by quest type availability
            let traders = repeatableConfig.traderWhitelist.filter((x) => x.questTypes.includes(questType)).map((x) =>
                x.traderId
            );
            // filter out locked traders
            traders = traders.filter((x) => pmcTraderInfo[x].unlocked);
            const traderId = randomUtil.drawRandomFromList(traders)[0];
            var Quest;

             switch (questType)
        {
            case "Elimination":
                return repeatableQuestGenerator.generateEliminationQuest(pmcLevel, traderId, questTypePool, repeatableConfig);
            case "Completion":
                return repeatableQuestGenerator.generateCompletionQuest(pmcLevel, traderId, repeatableConfig);
            case "Exploration":
                return repeatableQuestGenerator.generateExplorationQuest(pmcLevel, traderId, questTypePool, repeatableConfig);
            case "Pickup":
                return repeatableQuestGenerator.generatePickupQuest(pmcLevel, traderId, questTypePool, repeatableConfig);
            default:
                throw new Error(`Unknown mission type ${questType}. Should never be here!`);
        }
        }

    }
    public generateCustomPickupQuest(
        pmcLevel: number,
        traderId: string,
        questTypePool: IQuestTypePool,
        repeatableConfig: IRepeatableQuestConfig,
    ): IRepeatableQuest {
        const pickupConfig = repeatableConfig.questConfig.RITCCustom;

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
        const common = Mod.container.resolve("VulcanCommon")
        const repeatableQuestRewardGenerator = Mod.container.resolve("RepeatableQuestRewardGenerator")
        const repeatableQuestGenerator = Mod.container.resolve("RepeatableQuestGenerator")

        const quest = this.generateRepeatableTemplate("Completion", traderId, repeatableConfig.side, repeatableConfig);

        common.Log(JSON.stringify(quest, null, 4))
        quest.conditions.AvailableForFinish = []
        quest.conditions.AvailableForStart = []
        quest.conditions.Fail = []
        common.initQuestCondDaily(pickupConfig.conds, quest)
        common.Log(JSON.stringify(quest, null, 4))
        // Add rewards
        quest.rewards = this.generateReward(
            pmcLevel,
            1,
            traderId,
            repeatableConfig,
            pickupConfig,
        );

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
    ): void
    {
        /** Container player opened in their inventory */
        const openedItem = pmcData.Inventory.items.find((item) => item._id === body.item);
        const containerDetailsDb = this.itemHelper.getItem(openedItem._tpl);
        const isSealedWeaponBox = containerDetailsDb[1]._name.includes("event_container_airdrop");

        let foundInRaid = openedItem.upd?.SpawnedInSession;
        const rewards: Item[][] = [];
        if (isSealedWeaponBox)
        {
            const containerSettings = this.inventoryHelper.getInventoryConfig().sealedAirdropContainer;
            rewards.push(...this.lootGenerator.getSealedWeaponCaseLoot(containerSettings));

            if (containerSettings.foundInRaid)
            {
                foundInRaid = containerSettings.foundInRaid;
            }
        }
        else
        {
            const rewardContainerDetails = this.inventoryHelper.getRandomLootContainerRewardDetails(openedItem._tpl);
            rewards.push(...this.lootGenerator.getRandomLootContainerLoot(rewardContainerDetails));

            if (rewardContainerDetails.foundInRaid)
            {
                foundInRaid = rewardContainerDetails.foundInRaid;
            }
        }

        const addItemsRequest: IAddItemsDirectRequest = {
            itemsWithModsToAdd: rewards,
            foundInRaid: foundInRaid,
            callback: null,
            useSortingTable: true,
        };
        this.inventoryHelper.addItemsToStash(sessionID, addItemsRequest, pmcData, output);
        if (output.warnings.length > 0)
        {
            return;
        }

        // Find and delete opened container item from player inventory
        this.inventoryHelper.removeItem(pmcData, body.item, sessionID, output);
    }
}
module.exports = { mod: new Mod() }