"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const console_1 = require("./vulcan-api/console");
const itemedit_1 = require("./vulcan-api/itemedit");
const handbook_1 = require("./vulcan-api/handbook");
const localehelper_1 = require("./vulcan-api/localehelper");
const miscmethod_1 = require("./vulcan-api/miscmethod");
//import { TraderAppMerchandise, TraderOperateJsonOdj } from "./vulcan-api/merchantOperate";
const merchantOperate_1 = require("./vulcan-api/merchantOperate");
const questhelper_1 = require("./vulcan-api/questhelper");
const traderhelper_1 = require("./vulcan-api/traderhelper");
const dbhelper_1 = require("./vulcan-api/dbhelper");
const Common_1 = require("./vulcan-api/Common");
const Map_1 = require("./vulcan-api/Map");
const BaseClasses_1 = require("C:/snapshot/project/obj/models/enums/BaseClasses");
const QuestRewardType_1 = require("C:/snapshot/project/obj/models/enums/QuestRewardType");
const ExhaustableArray_1 = require("C:/snapshot/project/obj/models/spt/server/ExhaustableArray");
//const addTrader = new TraderOperateJsonOdj
//
class Mod {
    static container;
    preAkiLoad(container) {
        Mod.container = container;
        container.register("VulcanConsole", console_1.VulcanConsole, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        container.register("VulcanItemEditor", itemedit_1.VulcanItemEditor, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        container.register("VulcanHandBookHelper", handbook_1.VulcanHandBookHelper, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        container.register("VulcanLocaleHelper", localehelper_1.VulcanLocaleHelper, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        container.register("TraderAppMerchandise", merchantOperate_1.TraderAppMerchandise, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        container.register("VulcanQuestHelper", questhelper_1.VulcanQuestHelper, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        container.register("VulcanMiscMethod", miscmethod_1.VulcanMiscMethod, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        container.register("VulcanTraderHelper", traderhelper_1.VulcanTraderHelper, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        container.register("VulcanDatabaseHelper", dbhelper_1.VulcanDatabaseHelper, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        container.register("VulcanCommon", Common_1.VulcanCommon, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        container.register("VulcanMap", Map_1.VulcanMap, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        //const repeatableQRG = Mod.container.resolve<repeatableQuestGenerator>("repeatableQuestGeneragor")
        // Wait until LauncherController gets resolved by the server and run code afterwards to replace 
        // the login() function with the one below called 'replacementFunction()
        container.afterResolution("RepeatableQuestRewardGenerator", (_t, result) => {
            // We want to replace the original method logic with something different
            result.generateReward = (pmcLevel, difficulty, traderId, repeatableConfig, questConfig) => {
                return this.generateReward(pmcLevel, difficulty, traderId, repeatableConfig, questConfig);
            };
            //result.generateRewardCustom = this.generateRewardCustom
            // The modifier Always makes sure this replacement method is ALWAYS replaced
        }, { frequency: "Always" });
        container.afterResolution("RepeatableQuestGenerator", (_t, result) => {
            // We want to replace the original method logic with something different
            result.generateRepeatableQuest = (pmcLevel, pmcTraderInfo, questTypePool, repeatableConfig) => {
                return this.generateRepeatableQuest(pmcLevel, pmcTraderInfo, questTypePool, repeatableConfig);
            };
            // The modifier Always makes sure this replacement method is ALWAYS replaced
        }, { frequency: "Always" });
        container.afterResolution("InventoryController", (_t, result) => {
            // We want to replace the original method logic with something different
            result.openRandomLootContainer = (pmcData, body, sessionID, output) => {
                return this.openRandomLootContainer(pmcData, body, sessionID, output);
            };
            // The modifier Always makes sure this replacement method is ALWAYS replaced
        }, { frequency: "Always" });
        //addTrader.addTraderPreAkiload(inFuncContainer,商人名字)
    }
    postAkiLoad(container) {
        //addTrader.addTraderPosrtDBLoad(inFuncContainer,/* SPT原版格式的assor.json */,/* BaseOdj直接接收SPT原版格式的base.json */,/* 商人名字(同上) */,/* questassort直接接收SPT原版格式的questassort,PS:也可以之后用其他办法添加 */)
        //const common = container.resolve<VulcanCommon>("VulcanCommon");
        //common.Debug(common.getzhItemName("5aa7e276e5b5b000171d0647"))
    }
    postDBLoad(inFuncContainer) {
    }
    generateReward(pmcLevel, difficulty, traderId, repeatableConfig, questConfig) {
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
        const common = Mod.container.resolve("VulcanCommon");
        const repeatableQuestRewardGenerator = Mod.container.resolve("RepeatableQuestRewardGenerator");
        const rewards = { Started: [], Success: [], Fail: [] };
        //加载配置里的物品
        //核心部分(强制添加任务奖励)
        //其余部分无任何改动
        //也许可以通过hook完成, 并不需要重写方法
        //hook能在方法体前面执行吗?
        //似乎不行....
        //确实不行。
        if (questConfig.rewards && questConfig.rewards.length > 0) {
            common.Log("自定义奖励加载成功");
            common.initQuestRewardDaily(questConfig.rewards, rewards);
        }
        else {
            const levelsConfig = repeatableConfig.rewardScaling.levels;
            const roublesConfig = repeatableConfig.rewardScaling.roubles;
            const xpConfig = repeatableConfig.rewardScaling.experience;
            const itemsConfig = repeatableConfig.rewardScaling.items;
            const rewardSpreadConfig = repeatableConfig.rewardScaling.rewardSpread;
            const skillRewardChanceConfig = repeatableConfig.rewardScaling.skillRewardChance;
            const skillPointRewardConfig = repeatableConfig.rewardScaling.skillPointReward;
            const reputationConfig = repeatableConfig.rewardScaling.reputation;
            const effectiveDifficulty = Number.isNaN(difficulty) ? 1 : difficulty;
            if (Number.isNaN(difficulty)) {
                logger.warning(localisationService.getText("repeatable-difficulty_was_nan"));
            }
            // rewards are generated based on pmcLevel, difficulty and a random spread
            const rewardXP = Math.floor(effectiveDifficulty * mathUtil.interp1(pmcLevel, levelsConfig, xpConfig)
                * randomUtil.getFloat(1 - rewardSpreadConfig, 1 + rewardSpreadConfig));
            const rewardRoubles = Math.floor(effectiveDifficulty * mathUtil.interp1(pmcLevel, levelsConfig, roublesConfig)
                * randomUtil.getFloat(1 - rewardSpreadConfig, 1 + rewardSpreadConfig));
            const rewardNumItems = randomUtil.randInt(1, Math.round(mathUtil.interp1(pmcLevel, levelsConfig, itemsConfig)) + 1);
            const rewardReputation = Math.round(100 * effectiveDifficulty * mathUtil.interp1(pmcLevel, levelsConfig, reputationConfig)
                * randomUtil.getFloat(1 - rewardSpreadConfig, 1 + rewardSpreadConfig)) / 100;
            const skillRewardChance = mathUtil.interp1(pmcLevel, levelsConfig, skillRewardChanceConfig);
            const skillPointReward = mathUtil.interp1(pmcLevel, levelsConfig, skillPointRewardConfig);
            // Possible improvement -> draw trader-specific items e.g. with const itemHelper.isOfBaseclass(val._id, ItemHelper.BASECLASS.FoodDrink)
            let roublesBudget = rewardRoubles;
            let rewardItemPool = repeatableQuestRewardGenerator.chooseRewardItemsWithinBudget(repeatableConfig, roublesBudget, traderId);
            logger.debug(`Generating daily quest for ${traderId} with budget ${roublesBudget} for ${rewardNumItems} items`);
            let rewardIndex = 0;
            // Add xp reward
            if (rewardXP > 0) {
                rewards.Success.push({ value: rewardXP, type: QuestRewardType_1.QuestRewardType.EXPERIENCE, index: rewardIndex });
                rewardIndex++;
            }
            // Add money reward
            repeatableQuestRewardGenerator.addMoneyReward(traderId, rewards, rewardRoubles, rewardIndex);
            rewardIndex++;
            const traderWhitelistDetails = repeatableConfig.traderWhitelist.find((x) => x.traderId === traderId);
            if (traderWhitelistDetails.rewardCanBeWeapon
                && randomUtil.getChance100(traderWhitelistDetails.weaponRewardChancePercent)) {
                // Add a random default preset weapon as reward
                const defaultPresetPool = new ExhaustableArray_1.ExhaustableArray(Object.values(presetHelper.getDefaultWeaponPresets()), randomUtil, jsonUtil);
                let chosenPreset;
                while (defaultPresetPool.hasValues()) {
                    const randomPreset = defaultPresetPool.getRandomValue();
                    const tpls = randomPreset._items.map((item) => item._tpl);
                    const presetPrice = itemHelper.getItemAndChildrenPrice(tpls);
                    if (presetPrice <= roublesBudget) {
                        logger.debug(`  Added weapon ${tpls[0]} with price ${presetPrice}`);
                        roublesBudget -= presetPrice;
                        chosenPreset = jsonUtil.clone(randomPreset);
                        break;
                    }
                }
                if (chosenPreset) {
                    // use _encyclopedia as its always the base items _tpl, items[0] isn't guaranteed to be base item
                    rewards.Success.push(repeatableQuestRewardGenerator.generateRewardItem(chosenPreset._encyclopedia, 1, rewardIndex, chosenPreset._items));
                    rewardIndex++;
                }
            }
            if (rewardItemPool.length > 0) {
                for (let i = 0; i < rewardNumItems; i++) {
                    let rewardItemStackCount = 1;
                    const itemSelected = rewardItemPool[randomUtil.randInt(rewardItemPool.length)];
                    if (itemHelper.isOfBaseclass(itemSelected._id, BaseClasses_1.BaseClasses.AMMO)) {
                        // Don't reward ammo that stacks to less than what's defined in config
                        if (itemSelected._props.StackMaxSize < repeatableConfig.rewardAmmoStackMinSize) {
                            i--;
                            continue;
                        }
                        // Choose smallest value between budget fitting size and stack max
                        rewardItemStackCount = repeatableQuestRewardGenerator.calculateAmmoStackSizeThatFitsBudget(itemSelected, roublesBudget, rewardNumItems);
                    }
                    // 25% chance to double, triple quadruple reward stack (Only occurs when item is stackable and not weapon, armor or ammo)
                    if (repeatableQuestRewardGenerator.canIncreaseRewardItemStackSize(itemSelected, 70000)) {
                        rewardItemStackCount = repeatableQuestRewardGenerator.getRandomisedRewardItemStackSizeByPrice(itemSelected);
                    }
                    rewards.Success.push(repeatableQuestRewardGenerator.generateRewardItem(itemSelected._id, rewardItemStackCount, rewardIndex));
                    rewardIndex++;
                    const itemCost = presetHelper.getDefaultPresetOrItemPrice(itemSelected._id);
                    roublesBudget -= rewardItemStackCount * itemCost;
                    logger.debug(`  Added item ${itemSelected._id} with price ${rewardItemStackCount * itemCost}`);
                    // If we still have budget narrow down possible items
                    if (roublesBudget > 0) {
                        // Filter possible reward items to only items with a price below the remaining budget
                        rewardItemPool = repeatableQuestRewardGenerator.filterRewardPoolWithinBudget(rewardItemPool, roublesBudget, 0);
                        if (rewardItemPool.length === 0) {
                            logger.debug(`  Reward pool empty with ${roublesBudget} remaining`);
                            break; // No reward items left, exit
                        }
                    }
                    else {
                        break;
                    }
                }
            }
            // Add rep reward to rewards array
            if (rewardReputation > 0) {
                const reward = {
                    target: traderId,
                    value: rewardReputation,
                    type: QuestRewardType_1.QuestRewardType.TRADER_STANDING,
                    index: rewardIndex,
                };
                rewards.Success.push(reward);
                rewardIndex++;
                logger.debug(`  Adding ${rewardReputation} trader reputation reward`);
            }
            // Chance of adding skill reward
            if (randomUtil.getChance100(skillRewardChance * 100)) {
                const targetSkill = randomUtil.getArrayValue(questConfig.possibleSkillRewards);
                const reward = {
                    target: targetSkill,
                    value: skillPointReward,
                    type: QuestRewardType_1.QuestRewardType.SKILL,
                    index: rewardIndex,
                };
                rewards.Success.push(reward);
                logger.debug(`  Adding ${skillPointReward} skill points to ${targetSkill}`);
            }
        }
        return rewards;
        //common.Log("方法重写成功")
        //common.Log(JSON.stringify(questConfig, null, 4))
    }
    generateRepeatableQuest(pmcLevel, pmcTraderInfo, questTypePool, repeatableConfig) {
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
        const common = Mod.container.resolve("VulcanCommon");
        const repeatableQuestRewardGenerator = Mod.container.resolve("RepeatableQuestRewardGenerator");
        const repeatableQuestGenerator = Mod.container.resolve("RepeatableQuestGenerator");
        const questType = randomUtil.drawRandomFromList(questTypePool.types)[0];
        if (questType == "RITCCustom") {
            let traders = repeatableConfig.traderid;
            common.Log("自定义每日任务生成成功");
            return this.generateCustomPickupQuest(pmcLevel, traders, questTypePool, repeatableConfig);
        }
        else {
            // get traders from whitelist and filter by quest type availability
            let traders = repeatableConfig.traderWhitelist.filter((x) => x.questTypes.includes(questType)).map((x) => x.traderId);
            // filter out locked traders
            traders = traders.filter((x) => pmcTraderInfo[x].unlocked);
            const traderId = randomUtil.drawRandomFromList(traders)[0];
            switch (questType) {
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
    generateCustomPickupQuest(pmcLevel, traderId, questTypePool, repeatableConfig) {
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
        const common = Mod.container.resolve("VulcanCommon");
        const repeatableQuestRewardGenerator = Mod.container.resolve("RepeatableQuestRewardGenerator");
        const repeatableQuestGenerator = Mod.container.resolve("RepeatableQuestGenerator");
        const quest = this.generateRepeatableTemplate("Completion", traderId, repeatableConfig.side, repeatableConfig);
        //common.Log(JSON.stringify(quest, null, 4))
        quest.conditions.AvailableForFinish = [];
        quest.conditions.AvailableForStart = [];
        quest.conditions.Fail = [];
        common.initQuestCondDaily(pickupConfig.conds, quest);
        //common.Log(JSON.stringify(quest, null, 4))
        // Add rewards
        quest.rewards = this.generateReward(pmcLevel, 1, traderId, repeatableConfig, pickupConfig);
        return quest;
    }
    generateRepeatableTemplate(type, traderId, side, repeatableConfig) {
        const jsonUtil = Mod.container.resolve("JsonUtil");
        const databaseServer = Mod.container.resolve("DatabaseServer");
        const common = Mod.container.resolve("VulcanCommon");
        const questClone = jsonUtil.clone(databaseServer.getTables().templates.repeatableQuests.templates[type]);
        questClone._id = common.generateHash(`${repeatableConfig.questConfig.RITCCustom.name}_${performance.now()}`);
        questClone.traderId = traderId;
        /*  in locale, these id correspond to the text of quests
            template ids -pmc  : Elimination = 616052ea3054fc0e2c24ce6e / Completion = 61604635c725987e815b1a46 / Exploration = 616041eb031af660100c9967
            template ids -scav : Elimination = 62825ef60e88d037dc1eb428 / Completion = 628f588ebb558574b2260fe5 / Exploration = 62825ef60e88d037dc1eb42c
        */
        // Get template id from config based on side and type of quest
        questClone.templateId = `${repeatableConfig.questConfig.RITCCustom.name}`;
        questClone.name = repeatableConfig.questConfig.RITCCustom.name;
        questClone.note = questClone.note.replace("{traderId}", traderId).replace("{templateId}", questClone.templateId);
        questClone.description = questClone.description.replace("{traderId}", traderId).replace("{templateId}", questClone.templateId);
        questClone.successMessageText = questClone.successMessageText.replace("{traderId}", traderId).replace("{templateId}", questClone.templateId);
        questClone.failMessageText = questClone.failMessageText.replace("{traderId}", traderId).replace("{templateId}", questClone.templateId);
        questClone.startedMessageText = questClone.startedMessageText.replace("{traderId}", traderId).replace("{templateId}", questClone.templateId);
        questClone.changeQuestMessageText = questClone.changeQuestMessageText.replace("{traderId}", traderId).replace("{templateId}", questClone.templateId);
        questClone.acceptPlayerMessage = questClone.acceptPlayerMessage.replace("{traderId}", traderId).replace("{templateId}", questClone.templateId);
        questClone.declinePlayerMessage = questClone.declinePlayerMessage.replace("{traderId}", traderId).replace("{templateId}", questClone.templateId);
        questClone.completePlayerMessage = questClone.completePlayerMessage.replace("{traderId}", traderId).replace("{templateId}", questClone.templateId);
        return questClone;
    }
    openRandomLootContainer(pmcData, body, sessionID, output) {
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
        const vfs = Mod.container.resolve("VFS");
        const ModPath = preAkiModLoader.getModPath("[火神之心]VulcanCore");
        const common = Mod.container.resolve("VulcanCommon");
        const repeatableQuestRewardGenerator = Mod.container.resolve("RepeatableQuestRewardGenerator");
        const lootGenerator = Mod.container.resolve("LootGenerator");
        const inventoryHelper = Mod.container.resolve("InventoryHelper");
        /** Container player opened in their inventory */
        const openedItem = pmcData.Inventory.items.find((item) => item._id === body.item);
        const containerDetailsDb = itemHelper.getItem(openedItem._tpl);
        const isSealedWeaponBox = containerDetailsDb[1]._name.includes("event_container_airdrop");
        const isadvBox = containerDetailsDb[1]._props.isadvGiftBox;
        const isStaticBox = containerDetailsDb[1]._props.isStaticBox;
        let foundInRaid = openedItem.upd?.SpawnedInSession;
        const rewards = [];
        //common.Log(JSON.stringify(containerDetailsDb[1], null, 4))
        if (isadvBox) {
            //只是测试, 抽卡算法还没做
            const BoxData = containerDetailsDb[1]._props.advBoxData;
            const giftdata = common.getGiftData(BoxData.giftdata);
            var count = BoxData.count;
            foundInRaid = BoxData.forcefindinraid ? true : foundInRaid;
            //测试抽卡算法
            //感觉要出事
            //好像没问题嘿
            //需要把卡池独立出来, 然后用字符串查询引导
            //先压测一波
            for (var i = 0; i < count; i++) {
                rewards.push(this.getadvGiftBoxContainer(giftdata, pmcData));
            }
            //common.Log(JSON.stringify(rewards, null, 4))
        }
        else if (isStaticBox) {
            const BoxData = containerDetailsDb[1]._props.StaticBoxData;
            foundInRaid = BoxData.forcefindinraid ? true : foundInRaid;
            rewards.push(common.getGiftItemByType(BoxData.giftdata));
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
        var exportarr = [];
        var test = {
            pmcData: pmcData,
            body: body,
            openedItem: openedItem,
            containerDetailsDb: containerDetailsDb,
            isSealedWeaponBox: isSealedWeaponBox,
            rewards: rewards
        };
        //vfs.writeFile(`${ModPath}export.json`, JSON.stringify(test, null, 4))
        const addItemsRequest = {
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
    getadvGiftBoxContainer(giftdata, pmcdata) {
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
        const vfs = Mod.container.resolve("VFS");
        const ModPath = preAkiModLoader.getModPath("[火神之心]VulcanCore");
        const common = Mod.container.resolve("VulcanCommon");
        const repeatableQuestRewardGenerator = Mod.container.resolve("RepeatableQuestRewardGenerator");
        const lootGenerator = Mod.container.resolve("LootGenerator");
        const inventoryHelper = Mod.container.resolve("InventoryHelper");
        //卡池关键字初始化
        if (!pmcdata.GiftData) {
            pmcdata.GiftData = {};
        }
        //定义常量, 方便调用
        const basedata = giftdata.basereward;
        const itempool = giftdata.itempool;
        const sr = basedata.superrare;
        const srpool = itempool.superrare;
        const r = basedata.rare;
        const rpool = itempool.rare;
        const normal = basedata.normal;
        const normalpool = itempool.normal;
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
            };
        }
        const srdata = pmcdata.GiftData[giftdata.name].superrare;
        const rdata = pmcdata.GiftData[giftdata.name].rare;
        //计算本次抽卡概率与up概率
        var randomchance = Math.floor(Math.random() * 1000) / 1000;
        var srrealchance = Math.floor((1 / (sr.chancegrowcount + 1 + ((1 - sr.chance) / sr.chancegrowpercount))) * 1000) / 1000;
        var upchance = Math.floor(Math.random() * 100) / 100;
        if (sr.havebasereward) {
            //保底计算
            srdata.count++;
            if (srdata.count > sr.chancegrowcount) {
                srdata.addchance += sr.chancegrowpercount;
            }
        }
        if (r.havebasereward) {
            //保底计算
            rdata.count++;
            if (rdata.count > r.chancegrowcount) {
                rdata.addchance += r.chancegrowpercount;
            }
        }
        //金
        //common.Access(`金色数据: 累加概率: ${srdata.addchance}, 抽取次数: ${srdata.count}, 保底叠加概率: ${srdata.upaddchance}`)
        //common.Access(`紫色数据: 累加概率: ${rdata.addchance}, 抽取次数: ${rdata.count}, 保底叠加概率: ${rdata.upaddchance}`)
        //common.Log(`金色概率: ${randomchance} / ${srrealchance + srdata.addchance}`)
        if ((randomchance <= (srrealchance + srdata.addchance)) || (srdata.count == (sr.chancegrowcount + 1 + ((1 - sr.chance) / sr.chancegrowpercount)))) {
            if (srdata.count == (sr.chancegrowcount + 1 + ((1 - sr.chance) / sr.chancegrowpercount))) {
                //common.Log("吃满保底啦!")
            }
            else {
                //common.Log("没吃满")
            }
            srdata.addchance = 0;
            srdata.count = 0;
            rdata.addchance = 0;
            rdata.count = 0;
            common.Warn(`你抽到了金色传说!`);
            //common.Access(`金色数据: 累加概率: ${srdata.addchance}, 抽取次数: ${srdata.count}, 保底叠加概率: ${srdata.upaddchance}`)
            //common.Access(`紫色数据: 累加概率: ${rdata.addchance}, 抽取次数: ${rdata.count}, 保底叠加概率: ${rdata.upaddchance}`)
            //up命中
            if (upchance <= (sr.upchance + srdata.upaddchance)) {
                //common.Log(`保底没歪`)
                srdata.upaddchance = 0;
                return common.getGiftItemByType(common.drawFromArray(srpool.chanceup), srdata.count);
            }
            else {
                //common.Log(`哎呀, 保底歪了!`)
                srdata.upaddchance += sr.upaddchance;
                return common.getGiftItemByType(common.drawFromArray(srpool.normal), srdata.count);
            }
        }
        //紫
        else if (randomchance <= (r.chance) || (rdata.count == (r.chancegrowcount + 1 + ((1 - r.chance) / r.chancegrowpercount)))) {
            rdata.addchance = 0;
            rdata.count = 0;
            //common.Warn(`你抽到了紫色史诗! 保底已复位`)
            //common.Access(`金色数据: 累加概率: ${srdata.addchance}, 抽取次数: ${srdata.count}, 保底叠加概率: ${srdata.upaddchance}`)
            //common.Access(`紫色数据: 累加概率: ${rdata.addchance}, 抽取次数: ${rdata.count}, 保底叠加概率: ${rdata.upaddchance}`)
            //up命中
            if (upchance <= (r.upchance + rdata.upaddchance)) {
                //common.Log(`保底没歪`)
                rdata.upaddchance = 0;
                return common.getGiftItemByType(common.drawFromArray(rpool.chanceup), rdata.count);
            }
            else {
                //common.Log(`哎呀, 保底歪了!`)
                rdata.upaddchance += r.upaddchance;
                return common.getGiftItemByType(common.drawFromArray(rpool.normal), rdata.count);
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
                return common.getGiftItemByType(common.drawFromArray(normalpool.chanceup), 0);
            }
            else {
                return common.getGiftItemByType(common.drawFromArray(normalpool.normal), 0);
            }
        }
    }
}
module.exports = { mod: new Mod() };
//# sourceMappingURL=mod.js.map