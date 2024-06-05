import { inject, injectable, container, DependencyContainer, Lifecycle } from "tsyringe";
import crypto from "crypto";
import path from "node:path";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor"
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ITemplateItem } from "@spt-aki/models/eft/common/tables/ITemplateItem";
import { ItemLocale, QuestLocale, TraderLocale } from "./CommonClass";
import { VFS } from "@spt-aki/utils/VFS"
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { ImporterUtil } from "@spt-aki/utils/ImporterUtil"
import { ITrader } from "@spt-aki/models/eft/common/tables/ITrader";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostAkiLoadMod } from "@spt-aki/models/external/IPostAkiLoadMod";
import type { StaticRouterModService } from "@spt-aki/services/mod/staticRouter/StaticRouterModService";
import { ImageRouter } from "@spt-aki/routers/ImageRouter";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { ITraderConfig, UpdateTime } from "@spt-aki/models/spt/config/ITraderConfig";
import { IInventoryConfig } from "@spt-aki/models/spt/config/IInventoryConfig";
import { IAirdropConfig } from "@spt-aki/models/spt/config/IAirdropConfig";
import { IPmcConfig } from "@spt-aki/models/spt/config/IPmcConfig";
import { IScavCaseConfig } from "@spt-aki/models/spt/config/IScavCaseConfig";
import { IInsuranceConfig } from "@spt-aki/models/spt/config/IInsuranceConfig";
import { IModLoader } from "@spt-aki/models/spt/mod/IModLoader";
import { Traders } from "@spt-aki/models/enums/Traders";
import { VulcanMap } from "./Map";
import { Primitive, NestedObject } from "./CommonClass";
import { BundleHashCacheService } from "@spt-aki/services/cache/BundleHashCacheService";
import { BundleLoader, BundleInfo, BundleManifest } from "@spt-aki/loaders/BundleLoader";
import { ProfileHelper } from "@spt-aki/helpers/ProfileHelper";
import { LauncherCallbacks } from "@spt-aki/callbacks/LauncherCallbacks";
import { PreAkiModLoader } from "@spt-aki/loaders/PreAkiModLoader";
import { IRagfairConfig } from "@spt-aki/models/spt/config/IRagfairConfig";
import { HandbookHelper } from "@spt-aki/helpers/HandbookHelper";
import { ItemHelper } from "@spt-aki/helpers/ItemHelper";
import { PresetHelper } from "@spt-aki/helpers/PresetHelper";
import { IPreset } from "@spt-aki/models/eft/common/IGlobals";
import { Item } from "@spt-aki/models/eft/common/tables/IItem";
import { IQuestReward, IQuestRewards } from "@spt-aki/models/eft/common/tables/IQuest";
import { BaseClasses } from "@spt-aki/models/enums/BaseClasses";
import { Money } from "@spt-aki/models/enums/Money";
import { QuestRewardType } from "@spt-aki/models/enums/QuestRewardType";
import { IBaseQuestConfig, IQuestConfig, IRepeatableQuestConfig } from "@spt-aki/models/spt/config/IQuestConfig";
import { ExhaustableArray } from "@spt-aki/models/spt/server/ExhaustableArray"
import { ItemFilterService } from "@spt-aki/services/ItemFilterService";
import { LocalisationService } from "@spt-aki/services/LocalisationService";
import { SeasonalEventService } from "@spt-aki/services/SeasonalEventService";
import { MathUtil } from "@spt-aki/utils/MathUtil";
import { ObjectId } from "@spt-aki/utils/ObjectId";
import { RandomUtil } from "@spt-aki/utils/RandomUtil";
import { RepeatableQuestRewardGenerator } from "@spt-aki/generators/RepeatableQuestRewardGenerator";
@injectable()


export class VulcanCommon {

    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("DatabaseServer") protected databaseServer: DatabaseServer,
        @inject("VFS") protected vfs: VFS,
        @inject("JsonUtil") protected jsonUtil: JsonUtil,
        @inject("ImporterUtil") protected importerUtil: ImporterUtil,
        @inject("ImageRouter") protected imageRouter: ImageRouter,
        @inject("ConfigServer") protected configServer: ConfigServer,
        @inject("BundleHashCacheService") protected bundleHashCacheService: BundleHashCacheService,
        @inject("BundleLoader") protected bundleLoader: BundleLoader,
        @inject("VulcanMap") protected map: VulcanMap,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("MathUtil") protected mathUtil: MathUtil,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("PresetHelper") protected presetHelper: PresetHelper,
        @inject("HandbookHelper") protected handbookHelper: HandbookHelper,
        @inject("LocalisationService") protected localisationService: LocalisationService,
        @inject("ObjectId") protected objectId: ObjectId,
        @inject("ItemFilterService") protected itemFilterService: ItemFilterService,
        @inject("SeasonalEventService") protected seasonalEventService: SeasonalEventService,
        @inject("RepeatableQuestRewardGenerator") protected repeatableQuestRewardGenerator: RepeatableQuestRewardGenerator,

    ) { }
    public Log(string: String) {
        this.logger.logWithColor(`[火神之心]: ${string}`, LogTextColor.CYAN)
    }
    public Access(string: String) {
        this.logger.logWithColor(`[火神之心]: ${string}`, LogTextColor.GREEN)
    }
    public Error(string: String) {
        this.logger.logWithColor(`[火神之心]: ${string}`, LogTextColor.RED)
    }
    public Warn(string: String) {
        this.logger.logWithColor(`[火神之心]: ${string}`, LogTextColor.YELLOW)
    }
    public Debug(string: String) {
        this.logger.logWithColor(`[火神之心]: ${string}`, LogTextColor.GRAY)
    }
    public getLocale(key: string, language: string) {
        const db = this.databaseServer.getTables()
        const locale = db.locales.global[language]
        return locale[key]

    }
    public getItemName(item: Object, language: string) {
        const db = this.databaseServer.getTables()
        const locale = db.locales.global[language]
        const itemid = item._id ? item._id : item
        return locale[`${itemid} Name`]
    }
    public getZhItemName(item: Object) {
        const db = this.databaseServer.getTables()
        const locale = db.locales.global["ch"]
        const itemid = item._id ? item._id : item
        return locale[`${itemid} Name`]
    }
    public setTraderLocale(trader: ITrader, traderlocale: TraderLocale, language: string) {
        const db = this.databaseServer.getTables()
        const traderid = trader.base._id
        const locale = db.locales.global[language]
        locale[`${traderid} Nickname`] = traderlocale.NName
        locale[`${traderid} FirstName`] = traderlocale.FName
        locale[`${traderid} FullName`] = traderlocale.LName
        locale[`${traderid} Location`] = traderlocale.Locate
        locale[`${traderid} Description`] = traderlocale.Desc
    }
    public getPrice(item: ITemplateItem) {
        const handbook = this.databaseServer.getTables().templates.handbook
        const price = this.databaseServer.getTables().templates.prices
        const itemid = item._id
        if (handbook.Items.some(item => item.Id == itemid)) {
            return handbook.Items.find(item => item.Id == itemid).Price
        }
        else if (price[itemid] != undefined) {
            return price[itemid]
        }
        else {
            return 0
        }
    }
    public getTag(item: ITemplateItem) {
        const handbook = this.databaseServer.getTables().templates.handbook
        const itemid = item._id
        if (handbook.Items.some(item => item.Id == itemid)) {
            return handbook.Items.find(item => item.Id == itemid).ParentId
        }
        else {
            return null
        }
    }
    public formatTime(milliseconds) {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
        const millisecondsRemaining = ((milliseconds % 1000) / 1000).toFixed(2).substring(2);
        let result = "";
        if (hours > 0) {
            result += `${hours}小时`;
        }
        if (minutes > 0) {
            if (minutes >= 10) {
                result += `${minutes}分`;
            }
            else {
                if (hours > 0) {
                    result += `0${minutes}分`;
                }
                else {
                    result += `${minutes}分`;
                }
            }
        }
        if (seconds > 0) {
            if (seconds >= 10) {
                result += `${seconds}.${millisecondsRemaining}秒`;
            }
            else {
                if (minutes > 0) {
                    result += `0${seconds}.${millisecondsRemaining}秒`;
                }
                else {
                    result += `${seconds}.${millisecondsRemaining}秒`;
                }
            }
        }
        if (!(seconds > 0)) {
            result += `0.${millisecondsRemaining}秒`;
        }
        return result.trim();
    }
    public getItem(itemid) {
        return this.databaseServer.getTables().templates.items[itemid];
    }
    public getQuest(questid) {
        return this.databaseServer.getTables().templates.quests[questid];
    }
    public getItemLocaleData(itemid, lang) {
        //let itemid = this.getID(item)
        let ItemDataCache = {
            Name: "",
            ShortName: "",
            Description: ""
        };
        if (lang == null) {
            ItemDataCache.Name = this.databaseServer.getTables().locales.global["ch"][`${itemid} Name`];
            ItemDataCache.ShortName = this.databaseServer.getTables().locales.global["ch"][`${itemid} ShortName`];
            ItemDataCache.Description = this.databaseServer.getTables().locales.global["ch"][`${itemid} Description`];
        }
        else {
            ItemDataCache.Name = this.databaseServer.getTables().locales.global[lang][`${itemid} Name`];
            ItemDataCache.ShortName = this.databaseServer.getTables().locales.global[lang][`${itemid} ShortName`];
            ItemDataCache.Description = this.databaseServer.getTables().locales.global[lang][`${itemid} Description`];
        }
        return ItemDataCache;
    }
    public getQuestLocaleData(questid, lang) {
        let QuestLocaleCache = {
            Name: "",
            Description: "",
            TraderID: "",
            TraderName: ""
        };
        if (lang == null) {
            QuestLocaleCache.Name = this.databaseServer.getTables().locales.global["ch"][`${questid} name`];
            QuestLocaleCache.TraderID = this.getQuestTraderID(questid);
            QuestLocaleCache.TraderName = this.databaseServer.getTables().locales.global["ch"][`${this.getQuestTraderID(questid)} Nickname`];
            QuestLocaleCache.Description = this.databaseServer.getTables().locales.global["ch"][`${questid} description`];
        }
        else {
            QuestLocaleCache.Name = this.databaseServer.getTables().locales.global[lang][`${questid} name`];
            QuestLocaleCache.TraderID = this.getQuestTraderID(questid);
            QuestLocaleCache.TraderName = this.databaseServer.getTables().locales.global[lang][`${this.getQuestTraderID(questid)} Nickname`];
            QuestLocaleCache.Description = this.databaseServer.getTables().locales.global[lang][`${questid} description`];
        }
        return QuestLocaleCache;
    }
    public getID(obj) {
        return obj._id ? obj._id : obj
    }
    public getQuestTraderID(questid) {
        if (this.databaseServer.getTables().templates.quests[questid] != null)
            return this.databaseServer.getTables().templates.quests[questid].traderId;
        else
            return null;
    }
    public getTraderName(traderid) {
        if (this.databaseServer.getTables().locales.global.ch[`${traderid} Nickname`] != null) {
            return this.databaseServer.getTables().locales.global.ch[`${traderid} Nickname`];
        }
        else
            return "NoName";
    }
    public getItemSize(itemid) {
        return (this.getItem(itemid)._props.Width * this.getItem(itemid)._props.Height);
    }
    public isAmmo(itemid) {
        if (this.getItem(itemid)._parent == "5485a8684bdc2da71d8b4567") {
            return true;
        }
        else
            return false;
    }
    public convertNum(num) {
        if (num < 1000) {
            return num.toString();
        }
        const units = ["K", "M", "G", "T", "P", "E"]; // 可扩展到更大的单位
        let count = num;
        let unitIndex = 0;
        while (count >= 1000 && unitIndex < units.length) {
            count /= 1000;
            unitIndex++;
        }
        return count.toFixed(1) + units[unitIndex - 1];
    }
    public isQuestItem(itemid) {
        if (this.getItem(itemid) != null) {
            return this.getItem(itemid)._props.QuestItem;
        }
    }
    public canSellOnRagfair(itemid) {
        if (this.getItem(itemid) != null) {
            return this.getItem(itemid)._props.CanSellOnRagfair;
        }
    }
    public getQuestFinishData(questid) {
        const FinishArr = this.getQuest(questid).conditions.AvailableForFinish;
        var Cache = {};
        Cache["Handover"] = [];
        Cache["Leave"] = [];
        if (FinishArr.length > 0) {
            for (var i = 0; i < FinishArr.length; i++) {
                if (FinishArr[i].conditionType == "HandoverItem") {
                    Cache["Handover"].push({
                        itemid: FinishArr[i].target?.[0],
                        itemname: this.getItemName(FinishArr[i].target?.[0], "ch"),
                        questitem: this.isQuestItem(FinishArr[i].target?.[0]),
                        onlyfindinraid: FinishArr[i].onlyFoundInRaid,
                        count: FinishArr[i].value
                    });
                }
                if (FinishArr[i].conditionType == "LeaveItemAtLocation") {
                    Cache["Leave"].push({
                        itemid: FinishArr[i].target?.[0],
                        itemname: this.getItemName(FinishArr[i].target?.[0], "ch"),
                        questitem: this.isQuestItem(FinishArr[i].target?.[0]),
                        onlyfindinraid: FinishArr[i].onlyFoundInRaid,
                        count: FinishArr[i].value
                    });
                }
            }
        }
        return Cache;
    }
    public getQuestStartData(questid) {
        const StartArr = this.getQuest(questid).conditions.AvailableForStart;
        var Cache = {};
        Cache["Level"] = 0;
        Cache["QuestList"] = [];
        if (StartArr.length > 0) {
            for (var i = 0; i < StartArr.length; i++) {
                if (StartArr[i].conditionType == "Level") {
                    Cache["Level"] = StartArr[i].value;
                }
                if (StartArr[i].conditionType == "Quest" && StartArr[i].status[0] == 4) {
                    Cache["QuestList"].push({
                        questid: StartArr[i].target,
                        questname: this.getQuestName(String(StartArr[i].target), "ch"),
                        questtraderid: this.getQuestTraderID(String(StartArr[i].target)),
                        questtradername: this.getTraderName(this.getQuestTraderID(String(StartArr[i].target)))
                    });
                }
            }
        }
        return Cache;
    }
    public getQuestName(questid, lang) {
        if (lang == null) {
            return this.databaseServer.getTables().locales.global["ch"][`${questid} name`];
        }
        else {
            return this.databaseServer.getTables().locales.global[lang][`${questid} name`];
        }
    }
    public addStaticLoot(id, target) {
        for (let loot in this.databaseServer.getTables().loot.staticLoot) {
            var LootArr = this.databaseServer.getTables().loot.staticLoot[loot].itemDistribution
            for (var i = 0; i < LootArr.length; i++) {
                if (LootArr[i].tpl == target) {
                    LootArr.push({
                        "tpl": id,
                        "relativeProbability": LootArr[i].relativeProbability / 10
                    })
                    break;
                }
            }
        }
    }
    public addMapLoot(id, target) {
        for (let map in this.databaseServer.getTables().locations) {
            if (this.databaseServer.getTables().locations[map].looseLoot) {
                for (var i = 0; i < this.databaseServer.getTables().locations[map].looseLoot.spawnpoints.length; i++) {
                    for (var j = 0; j < this.databaseServer.getTables().locations[map].looseLoot.spawnpoints[i].template.Items.length; j++) {
                        if (this.databaseServer.getTables().locations[map].looseLoot.spawnpoints[i].template.Items[j]._tpl == target) {
                            var ID = this.generateHash(id)
                            var relative = this.databaseServer.getTables().locations[map].looseLoot.spawnpoints[i].itemDistribution.find(item => item.composedKey.key == this.databaseServer.getTables().locations[map].looseLoot.spawnpoints[i].template.Items[j]._id).relativeProbability
                            //CustomAccess(relative)
                            this.databaseServer.getTables().locations[map].looseLoot.spawnpoints[i].template.Items.push({
                                "_id": ID,
                                "_tpl": id

                            })
                            this.databaseServer.getTables().locations[map].looseLoot.spawnpoints[i].itemDistribution.push({
                                "composedKey": {
                                    "key": ID
                                },
                                "relativeProbability": relative / 10
                            }
                            )
                        }
                    }
                }
            }
        }
    }
    public addLoot(id, local, num) {
        local[id] = num
    }
    public deepCopy(obj) {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }

        var copy = Array.isArray(obj) ? [] : {};

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                copy[key] = this.deepCopy(obj[key]);
            }
        }

        return copy;
    }
    //任务奖励重排序
    public indexArray(arr) {
        var Exp = []
        var Item = []
        var Recipe = []
        var Assort = []
        var Skill = []
        var Llr = []
        var Trader = []
        var Reward = []
        var index = 0
        for (var i = 0; i < arr.length; i++) {
            switch (arr[i].type) {
                case "Experience":
                    Exp.push(this.deepCopy(arr[i]))
                    break;
                case "Item":
                    Item.push(this.deepCopy(arr[i]))
                    break;
                case "ProductionScheme":
                    Recipe.push(this.deepCopy(arr[i]))
                    break;
                case "AssortmentUnlock":
                    Assort.push(this.deepCopy(arr[i]))
                    break;
                case "Skill":
                    Skill.push(this.deepCopy(arr[i]))
                    break;
                case "TraderUnlock":
                    Trader.push(this.deepCopy(arr[i]))
                    break;
                case "TraderStanding":
                    Llr.push(this.deepCopy(arr[i]))
                    break;
            }
        }
        for (var i = 0; i < Exp.length; i++) {
            Exp[i].index = index
            Reward.push(Exp[i])
            Reward[i].index = index
            index++
        }
        for (var i = 0; i < Item.length; i++) {
            Item[i].index = index
            Reward.push(Item[i])
            index++
        }
        for (var i = 0; i < Recipe.length; i++) {
            Recipe[i].index = index
            Reward.push(Recipe[i])
            index++
        }
        for (var i = 0; i < Assort.length; i++) {
            Assort[i].index = index
            Reward.push(Assort[i])
            index++
        }
        for (var i = 0; i < Skill.length; i++) {
            Skill[i].index = index
            Reward.push(Skill[i])
            index++
        }
        for (var i = 0; i < Trader.length; i++) {
            Trader[i].index = index
            Reward.push(Trader[i])
            index++
        }
        for (var i = 0; i < Llr.length; i++) {
            Llr[i].index = index
            Reward.push(Llr[i])
            index++
        }
        return Reward
    }
    public indexQuestReward() {
        for (let q in this.databaseServer.getTables().templates.quests) {
            this.databaseServer.getTables().templates.quests[q].rewards.Success = this.indexArray(this.databaseServer.getTables().templates.quests[q].rewards.Success)
        }
    }
    //装备修复
    public fixEuqipment(id, target) {
        for (let item in this.databaseServer.getTables().templates.items) {
            if (this.databaseServer.getTables().templates.items[item]._props.Slots) {
                for (let slot in this.databaseServer.getTables().templates.items[item]._props.Slots) {
                    for (let filter in this.databaseServer.getTables().templates.items[item]._props.Slots[slot]._props.filters[0].Filter) {
                        if (this.databaseServer.getTables().templates.items[item]._props.Slots[slot]._props.filters[0].Filter[filter] == target) {
                            this.databaseServer.getTables().templates.items[item]._props.Slots[slot]._props.filters[0].Filter.push(id)
                        }
                    }
                }
            }
            if (this.databaseServer.getTables().templates.items[item]._props.Grids) {
                for (var i = 0; i < this.databaseServer.getTables().templates.items[item]._props.Grids.length; i++) {
                    for (var j = 0; j < this.databaseServer.getTables().templates.items[item]._props.Grids[i]._props.filters.length; j++) {
                        for (var k = 0; k < this.databaseServer.getTables().templates.items[item]._props.Grids[i]._props.filters[j].Filter.length; k++) {
                            if (this.databaseServer.getTables().templates.items[item]._props.Grids[i]._props.filters[j].Filter[k] == target) {
                                this.databaseServer.getTables().templates.items[item]._props.Grids[i]._props.filters[j].Filter.push(id)
                            }
                        }
                    }
                }
            }
            if (this.databaseServer.getTables().templates.items[item]._props.Cartridges) {
                for (var i = 0; i < this.databaseServer.getTables().templates.items[item]._props.Cartridges.length; i++) {
                    for (var j = 0; j < this.databaseServer.getTables().templates.items[item]._props.Cartridges[i]._props.filters.length; j++) {
                        for (var k = 0; k < this.databaseServer.getTables().templates.items[item]._props.Cartridges[i]._props.filters[j].Filter.length; k++) {
                            if (this.databaseServer.getTables().templates.items[item]._props.Cartridges[i]._props.filters[j].Filter[k] == target) {
                                this.databaseServer.getTables().templates.items[item]._props.Cartridges[i]._props.filters[j].Filter.push(id)
                            }
                        }
                    }
                }
            }
            if (this.databaseServer.getTables().templates.items[item]._props.Chambers) {
                for (var i = 0; i < this.databaseServer.getTables().templates.items[item]._props.Chambers.length; i++) {
                    for (var j = 0; j < this.databaseServer.getTables().templates.items[item]._props.Chambers[i]._props.filters.length; j++) {
                        for (var k = 0; k < this.databaseServer.getTables().templates.items[item]._props.Chambers[i]._props.filters[j].Filter.length; k++) {
                            if (this.databaseServer.getTables().templates.items[item]._props.Chambers[i]._props.filters[j].Filter[k] == target) {
                                this.databaseServer.getTables().templates.items[item]._props.Chambers[i]._props.filters[j].Filter.push(id)
                            }
                        }
                    }
                }
            }
        }
    }
    //使用跳蚤市场标签处理容器物品
    public addItemWithRagfairTag(Tag, Filter) {
        for (var i = 0; i < this.databaseServer.getTables().templates.handbook.Items.length; i++) {
            var ItemData = this.databaseServer.getTables().templates.handbook.Items[i]
            if (ItemData.ParentId == Tag) {
                Filter.push(ItemData.Id)
            }
        }
    }
    //使用跳蚤市场标签处理容器物品
    public addItemWithRagfairTagBySize(Tag, Filter, Size) {
        for (var i = 0; i < this.databaseServer.getTables().templates.handbook.Items.length; i++) {
            var ItemData = this.databaseServer.getTables().templates.handbook.Items[i]
            if (ItemData.ParentId == Tag) {
                if (this.databaseServer.getTables().templates.items[ItemData.Id]._props.Width * this.databaseServer.getTables().templates.items[ItemData.Id]._props.Height <= Size) {
                    Filter.push(ItemData.Id)
                }
            }
        }
    }
    public generateHash(string) {
        const shasum = crypto.createHash("sha1");
        shasum.update(string);
        return shasum.digest("hex").substring(0, 24);
    }
    public addAssort(trader, id, price, ll) {
        var AssortData1 = this.databaseServer.getTables().traders[trader].assort
        var CacheHashID = this.generateHash(id)
        AssortData1.items.push({
            "_id": CacheHashID,
            "_tpl": id,
            "parentId": "hideout",
            "slotId": "hideout",
            "upd": {
                "StackObjectsCount": 99999,
                "UnlimitedCount": true
            }
        })
        AssortData1.barter_scheme[CacheHashID] = [[{
            count: price,
            _tpl: '5449016a4bdc2d6f028b456f'
        }]]
        AssortData1.loyal_level_items[CacheHashID] = ll
    }
    public createQuest(questid: string, traderid: string, type: string, imagepath: string, location: string, restartable: boolean) {
        const db = this.databaseServer.getTables()
        const quest = db.templates.quests["5967733e86f774602332fc84"]
        var newquest = this.deepCopy(quest)
        newquest.type = type
        newquest.conditions.AvailableForFinish = []
        newquest.conditions.AvailableForStart = []
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
        newquest.image = imagepath
        newquest.traderId = traderid
        newquest.location = location
        newquest.restartable = restartable
        db.templates.quests[questid] = newquest
        //return newquest
    }
    public loadRewardData(RW) {
        for (var r = 0; r < RW.length; r++) {
            const RW2 = RW[r]
            const QuestID = this.getID(RW2.Quest)
            const QuestsData = this.databaseServer.getTables().templates.quests[QuestID]
            const Name = RW2.Name
            switch (RW2.Condition) {
                case "Finish": {
                    const Reward = QuestsData.rewards.Success
                    switch (RW2.Type) {
                        case "Item": {
                            const Item = this.convertAssortArr(RW2.Items)
                            var WeaponReward = this.convertWeaponAssortToReward(Item)
                            Reward.push({
                                "findInRaid": true,
                                "id": `${Name}RW`,
                                "type": "Item",
                                "index": Reward.length,
                                "target": `${WeaponReward[0]._id}`,
                                "items": WeaponReward,
                                "value": RW2.Count.toString()
                            })
                        }
                            break;
                        case "Assort": {
                            const RW2 = RW[r]
                            const Item = this.convertAssortArr(RW2.Items)
                            const ID = Item[0]._id
                            const AssortData = this.databaseServer.getTables().traders[this.getTraderIDFromMap(RW2.Trader)].assort
                            const TraderData = this.databaseServer.getTables().traders[this.getTraderIDFromMap(RW2.Trader)]
                            for (var i = 0; i < Item.length; i++) {
                                AssortData.items.push(Item[i])
                            }
                            AssortData.barter_scheme[ID] = [[]]
                            for (let br in RW2.Barter) {
                                AssortData.barter_scheme[ID][0].push({
                                    "count": RW2.Barter[br],
                                    "_tpl": this.getID(br)
                                })
                            }
                            AssortData.loyal_level_items[ID] = RW2.LLR
                            if (RW2.isLock == true) {
                                TraderData.questassort.success[ID] = QuestID
                                if (RW2.isWeapon == true) {
                                    var WeaponReward = this.convertWeaponAssortToReward(Item)
                                    Reward.push({
                                        "id": `${Name}RW`,
                                        "type": "AssortmentUnlock",
                                        "index": Reward.length,
                                        "target": `${WeaponReward[0]._id}`,
                                        "items": WeaponReward,
                                        "loyaltyLevel": RW2.LLR,
                                        "traderId": this.getTraderIDFromMap(RW2.Trader)
                                    })
                                }
                                else {
                                    Reward.push({
                                        "id": `${Name}RW`,
                                        "type": "AssortmentUnlock",
                                        "index": Reward.length,
                                        "target": `${Name}RW1`,
                                        "items": [
                                            {
                                                "_id": `${Name}RW1`,
                                                "_tpl": Item[0]._tpl
                                            }
                                        ],
                                        "loyaltyLevel": RW2.LLR,
                                        "traderId": this.getTraderIDFromMap(RW2.Trader)
                                    })
                                }

                            }
                        }
                            break;
                        case "Exp": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "type": "Experience",
                                "value": RW2.Count
                            })
                        }
                            break;
                        case "Trust": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "type": "TraderStanding",
                                "target": this.getTraderIDFromMap(RW2.TraderID),
                                "value": RW2.Count
                            })
                        }
                            break;
                        case "Skill": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "type": "Skill",
                                "target": RW2.Skill,
                                "value": RW2.Count
                            })
                        }
                            break;
                    }

                }
                    break;
            }
            QuestsData.rewards.Success = this.indexArray(QuestsData.rewards.Success)
            //CustomLog(`任务奖励处理完成: ${Name}`)
        }
    }
    public convertWeaponAssortToReward(arr) {
        var Array = []
        Array.push({
            "_id": arr[0]._id,
            "_tpl": arr[0]._tpl,
            "upd": {
                "FireMode": {
                    "FireMode": "single"
                },
                "StackObjectsCount": arr[0].upd.StackObjectsCount
            }
        })
        if (arr.length > 1) {
            for (var i = 1; i < arr.length; i++) {
                Array.push({
                    "_id": arr[i]._id,
                    "_tpl": arr[i]._tpl,
                    "parentId": arr[i].parentId,
                    "slotId": arr[i].slotId
                })
            }
        }
        return Array
    }
    public convertAssortArr(arr) {
        var Array = []
        for (var i = 0; i < arr.length; i++) {
            Array.push(arr[i])
        }
        return Array
    }
    public initAssortData(Assort) {
        for (var i = 0; i < Assort.length; i++) {
            const RW2 = Assort[i]
            const ASID = RW2.ID
            const TraderData = this.databaseServer.getTables().traders[RW2.Trader]
            const Item = this.convertAssortArr(RW2.Item)
            //const Item = RW2.Item
            const ID = Item[0]._id
            const AssortData = this.databaseServer.getTables().traders[RW2.Trader].assort
            for (var j = 0; j < Item.length; j++) {
                AssortData.items.push(Item[j])
            }
            AssortData.barter_scheme[ASID] = [[]]
            for (let dt in RW2.DogTag) {
                AssortData.barter_scheme[ASID][0].push({
                    "count": RW2.DogTag[dt].count,
                    "_tpl": this.getID(dt),
                    "level": RW2.DogTag[dt].level,
                    "side": RW2.DogTag[dt].side
                })
            }
            for (let br in RW2.Barter) {
                AssortData.barter_scheme[ASID][0].push({
                    "count": RW2.Barter[br],
                    "_tpl": this.getID(br)
                })
            }
            AssortData.loyal_level_items[ASID] = RW2.TrustLevel
            if (RW2.Locked == true) {
                const QuestID = RW2.Quest
                const QuestsData = this.databaseServer.getTables().templates.quests[QuestID]
                const Reward = QuestsData.rewards.Success
                TraderData.questassort.success[ID] = QuestID
                if (RW2.isWeapon == true) {
                    var WeaponReward = this.convertWeaponAssortToReward(Item)
                    Reward.push({
                        "id": `${ASID}RW`,
                        "type": "AssortmentUnlock",
                        "index": Reward.length,
                        "target": `${WeaponReward[0]._id}`,
                        "items": WeaponReward,
                        "loyaltyLevel": RW2.TrustLevel,
                        "traderId": this.getTraderIDFromMap(RW2.Trader)
                    })
                }
                else {
                    Reward.push({
                        "id": `${ASID}RW`,
                        "type": "AssortmentUnlock",
                        "index": Reward.length,
                        "target": `${ASID}RW1`,
                        "items": [
                            {
                                "_id": `${ASID}RW1`,
                                "_tpl": Item[0]._tpl
                            }
                        ],
                        "loyaltyLevel": RW2.TrustLevel,
                        "traderId": this.getTraderIDFromMap(RW2.Trader)
                    })
                }

            }
        }
    }
    public initTrader(TraderObj, imagePath, InsurantMuti, InsurantChance, FlashTime) {
        const traderConfig = this.configServer.getConfig<ITraderConfig>(ConfigTypes.TRADER);
        const ragfairConfig = this.configServer.getConfig<IRagfairConfig>(ConfigTypes.RAGFAIR);
        const TraderObj2 = this.deepCopy(TraderObj)
        const Assort = TraderObj2.assort
        const Base = TraderObj2.base
        const Log = TraderObj2.Dialogue
        const Qssort = TraderObj2.questassort
        const Suit = TraderObj2.suits
        const trader = Base._id
        this.databaseServer.getTables().traders[trader] = TraderObj2
        var TraderBase = Base
        var TraderID = trader
        this.databaseServer.getTables().locales.global["ch"][TraderID + " FullName"] = TraderBase.surname
        this.databaseServer.getTables().locales.global["ch"][TraderID + " FirstName"] = TraderBase.name
        this.databaseServer.getTables().locales.global["ch"][TraderID + " Nickname"] = TraderBase.nickname
        this.databaseServer.getTables().locales.global["ch"][TraderID + " Location"] = TraderBase.location
        this.databaseServer.getTables().locales.global["ch"][TraderID + " Description"] = TraderBase.description
        Traders[trader] = trader;
        const InsuranceConfig = this.configServer.getConfig<IInsuranceConfig>(ConfigTypes.INSURANCE);
        InsuranceConfig.insuranceMultiplier[TraderID] = InsurantMuti
        InsuranceConfig.returnChancePercent[TraderID] = InsurantChance
        //VFS.writeFile(`${ModPath}db/insurance.json`, JSON.stringify(InsuranceConfig, null, 4))
        const traderRefreshRecord = { _name: TraderBase.name, traderId: trader, seconds: { min: FlashTime, max: FlashTime } }
        traderConfig.updateTime.push(traderRefreshRecord);
        ragfairConfig.traders[TraderID] = true
        this.imageRouter.addRoute(Base.avatar.replace(".jpg", ""), `${imagePath}/${trader}.jpg`);
    }
    public waitForTime(time) {
        var random = Math.ceil(Math.random() * time) * 1000
        var dat = performance.now()
        while (true) {
            if (performance.now() - dat >= random) {
                break;
            }
        }
    }
    public getTraderIDFromMap(trader) {
        return this.map.TraderMap[trader] ? this.map.TraderMap[trader] : trader
    }
    public getItemIDFromMap(item) {
        return this.map.ItemMap[item] ? this.map.ItemMap[item] : item
    }
    public initQuestCond(Conditions) {
        for (let quest in Conditions) {
            var Q = Conditions[quest]
            var Start = Q.Start
            var Finish = Q.Finish
            var Fail = Q.Fail
            const Quest = this.databaseServer.getTables().templates.quests[quest]
            if (Start.Override == true) {
                Quest.conditions.AvailableForStart = []
            }
            if (Finish.Override == true) {
                Quest.conditions.AvailableForFinish = []
            }
            const QStart = Quest.conditions.AvailableForStart
            const QFinish = Quest.conditions.AvailableForFinish
            const QFail = Quest.conditions.Fail
            if (Start.Data.length > 0) {
                for (var i = 0; i < Start.Data.length; i++) {
                    var Data = Start.Data[i]
                    switch (Data.type) {
                        case "Quest": {
                            QStart.push({
                                "availableAfter": 0,
                                "conditionType": "Quest",
                                "dispersion": 0,
                                "dynamicLocale": false,
                                "globalQuestCounterId": "",
                                "id": Data.id,
                                "index": i,
                                "parentId": "",
                                "status": Data.status,
                                "target": Data.questid,
                                "visibilityConditions": []
                            })
                        }
                            break;
                        case "Level": {
                            QStart.push({
                                "compareMethod": ">=",
                                "conditionType": "Level",
                                "dynamicLocale": false,
                                "globalQuestCounterId": "",
                                "id": Data.id,
                                "index": i,
                                "parentId": "",
                                "value": Data.count,
                                "visibilityConditions": []
                            })
                        }
                            break;
                        case "Trust": {
                            QStart.push({
                                "compareMethod": ">=",
                                "conditionType": "TraderLoyalty",
                                "dynamicLocale": false,
                                "globalQuestCounterId": "",
                                "id": Data.id,
                                "index": i,
                                "parentId": "",
                                "target": Data.trader,
                                "value": Data.count,
                                "visibilityConditions": []
                            })
                        }
                            break;
                    }
                }
            }
            if (Finish.Data.length > 0) {
                for (var i = 0; i < Finish.Data.length; i++) {
                    var Data = Finish.Data[i]
                    switch (Data.type) {
                        case "Find": {
                            this.databaseServer.getTables().locales.global.ch[Data.id] = Data.locale
                            this.databaseServer.getTables().locales.global.en[Data.id] = Data.enlocale
                            QFinish.push({
                                "conditionType": "FindItem",
                                "countInRaid": false,
                                "dogtagLevel": 0,
                                "dynamicLocale": false,
                                "globalQuestCounterId": "",
                                "id": Data.id,
                                "index": i,
                                "isEncoded": false,
                                "maxDurability": 100,
                                "minDurability": 0,
                                "onlyFoundInRaid": Data.inraid,
                                "parentId": "",
                                "target": [
                                    Data.itemid
                                ],
                                "value": Data.count,
                                "visibilityConditions": []
                            })
                        }
                            break;
                        case "Hand": {
                            this.databaseServer.getTables().locales.global.ch[Data.id] = Data.locale
                            this.databaseServer.getTables().locales.global.en[Data.id] = Data.enlocale
                            QFinish.push({
                                "conditionType": "HandoverItem",
                                "dogtagLevel": 0,
                                "dynamicLocale": false,
                                "globalQuestCounterId": "",
                                "id": Data.id,
                                "index": i,
                                "isEncoded": false,
                                "maxDurability": 100,
                                "minDurability": 0,
                                "onlyFoundInRaid": Data.inraid,
                                "parentId": "",
                                "target": [
                                    Data.itemid
                                ],
                                "value": Data.count,
                                "visibilityConditions": []
                            })

                        }
                            break;
                        case "HandGroup": {
                            this.databaseServer.getTables().locales.global.ch[Data.id] = Data.locale
                            this.databaseServer.getTables().locales.global.en[Data.id] = Data.enlocale
                            QFinish.push({
                                "conditionType": "HandoverItem",
                                "dogtagLevel": 0,
                                "dynamicLocale": false,
                                "globalQuestCounterId": "",
                                "id": Data.id,
                                "index": i,
                                "isEncoded": false,
                                "maxDurability": 100,
                                "minDurability": 0,
                                "onlyFoundInRaid": Data.inraid,
                                "parentId": "",
                                "target": Data.itemid,
                                "value": Data.count,
                                "visibilityConditions": []
                            })

                        }
                            break;
                        case "Kill": {
                            this.databaseServer.getTables().locales.global.ch[Data.id] = Data.locale
                            this.databaseServer.getTables().locales.global.en[Data.id] = Data.enlocale
                            QFinish.push({
                                "completeInSeconds": 0,
                                "conditionType": "CounterCreator",
                                "counter": {
                                    "conditions": [],
                                    "id": `${Data.id}指示器`
                                },
                                "doNotResetIfCounterCompleted": false,
                                "dynamicLocale": false,
                                "globalQuestCounterId": "",
                                "id": Data.id,
                                "index": i,
                                "oneSessionOnly": Data.oneraid,
                                "parentId": "",
                                "type": "Elimination",
                                "value": Data.count,
                                "visibilityConditions": []
                            })
                            QFinish[QFinish.length - 1].counter.conditions.push({
                                "bodyPart": [],
                                "compareMethod": ">=",
                                "conditionType": "Kills",
                                "daytime": {
                                    "from": Data.daytime[0],
                                    "to": Data.daytime[1]
                                },
                                "distance": {
                                    "compareMethod": Data.distancetype,
                                    "value": Data.distance
                                },
                                "dynamicLocale": false,
                                "enemyEquipmentExclusive": [],
                                "enemyEquipmentInclusive": [],
                                "enemyHealthEffects": [],
                                "id": `${Data.id}指示器条件`,
                                "resetOnSessionEnd": false,
                                "savageRole": Data.role,
                                "target": Data.bot,
                                "value": 1,
                                "weapon": Data.weapon,
                                "weaponCaliber": [],
                                "weaponModsExclusive": [],
                                "weaponModsInclusive": []
                            })
                            if (Data.location.length > 0) {
                                QFinish[QFinish.length - 1].counter.conditions.push({
                                    "conditionType": "Location",
                                    "dynamicLocale": false,
                                    "id": `${Data.id}_地图需求`,
                                    "target": Data.location
                                })
                            }
                            if (Data.zone.length > 0) {
                                QFinish[QFinish.length - 1].counter.conditions.push({
                                    "conditionType": "InZone",
                                    "dynamicLocale": false,
                                    "id": `${Data.id}_地点需求`,
                                    "zoneIds": Data.zone
                                })
                            }
                            if (Data.Equip.length > 0) {
                                for (var j = 0; j < Data.Equip.length; j++) {

                                    QFinish[QFinish.length - 1].counter.conditions.push({
                                        "IncludeNotEquippedItems": false,
                                        "conditionType": "Equipment",
                                        "dynamicLocale": false,
                                        "equipmentExclusive": [],
                                        "equipmentInclusive": [],
                                        "id": `${Data.id}_装备需求${j}`
                                    })
                                    for (var k = 0; k < Data.Equip[j].length; k++) {
                                        QFinish[QFinish.length - 1].counter.conditions[QFinish[QFinish.length - 1].counter.conditions.length - 1].equipmentInclusive.push([
                                            Data.Equip[j][k]
                                        ])
                                    }
                                }

                            }
                            if (Data.Mod.length > 0) {
                                for (var j = 0; j < Data.Mod.length; j++) {
                                    QFinish[QFinish.length - 1].counter.conditions[0].weaponModsInclusive.push([
                                        Data.Mod[j]
                                    ])
                                }
                            }
                        }
                            break;
                        case "Level": {
                            this.databaseServer.getTables().locales.global.ch[Data.id] = Data.locale
                            this.databaseServer.getTables().locales.global.en[Data.id] = Data.enlocale
                            QFinish.push({
                                "conditionType": "Level",
                                "id": Data.id,
                                "index": i,
                                "parentId": "",
                                "dynamicLocale": false,
                                "value": Data.count,
                                "compareMethod": ">=",
                                "visibilityConditions": [],
                                "isEncoded": false,
                                "countInRaid": false,
                                "globalQuestCounterId": "",
                                "target": ""
                            })
                        }
                            break;
                        case "Visit": {
                            this.databaseServer.getTables().locales.global.ch[Data.id] = Data.locale
                            this.databaseServer.getTables().locales.global.en[Data.id] = Data.enlocale
                            QFinish.push({
                                "completeInSeconds": 0,
                                "conditionType": "CounterCreator",
                                "counter": {
                                    "conditions": [
                                        {
                                            "conditionType": "VisitPlace",
                                            "dynamicLocale": false,
                                            "id": `${Data.id}指示器目标`,
                                            "target": Data.zoneid,
                                            "value": 1
                                        }
                                    ],
                                    "id": `${Data.id}指示器`
                                },
                                "doNotResetIfCounterCompleted": false,
                                "dynamicLocale": false,
                                "globalQuestCounterId": "",
                                "id": Data.id,
                                "index": i,
                                "oneSessionOnly": Data.oneraid,
                                "parentId": "",
                                "type": "Exploration",
                                "value": 1,
                                "visibilityConditions": []
                            })
                        }
                            break;
                        case "Leave": {
                            this.databaseServer.getTables().locales.global.ch[Data.id] = Data.locale
                            this.databaseServer.getTables().locales.global.en[Data.id] = Data.enlocale
                            QFinish.push({
                                "conditionType": "LeaveItemAtLocation",
                                "dogtagLevel": 0,
                                "dynamicLocale": false,
                                "globalQuestCounterId": "",
                                "id": Data.id,
                                "index": i,
                                "isEncoded": false,
                                "maxDurability": 100,
                                "minDurability": 0,
                                "onlyFoundInRaid": false,
                                "parentId": "",
                                "plantTime": Data.time,
                                "target": [
                                    Data.itemid
                                ],
                                "value": Data.count,
                                "visibilityConditions": [],
                                "zoneId": Data.zoneid
                            })
                        }
                            break;
                        case "Extract": {
                            this.databaseServer.getTables().locales.global.ch[Data.id] = Data.locale
                            this.databaseServer.getTables().locales.global.en[Data.id] = Data.enlocale
                            QFinish.push({
                                "completeInSeconds": 0,
                                "conditionType": "CounterCreator",
                                "counter": {
                                    "conditions": [
                                        {
                                            "conditionType": "Location",
                                            "dynamicLocale": false,
                                            "id": `${Data.id}指示器_Location`,
                                            "target": Data.location
                                        },
                                        {
                                            "conditionType": "ExitStatus",
                                            "dynamicLocale": false,
                                            "id": `${Data.id}指示器_ExitStatus`,
                                            "status": Data.status
                                        }
                                    ],
                                    "id": `${Data.id}指示器`
                                },
                                "doNotResetIfCounterCompleted": false,
                                "dynamicLocale": false,
                                "globalQuestCounterId": "",
                                "id": Data.id,
                                "index": 0,
                                "oneSessionOnly": Data.oneraid,
                                "parentId": "",
                                "type": "Exploration",
                                "value": Data.count,
                                "visibilityConditions": []
                            })
                            if (Data.chosenextractpoint == true) {
                                QFinish[QFinish.length - 1].counter.conditions.push({
                                    "conditionType": "ExitName",
                                    "dynamicLocale": false,
                                    "exitName": Data.extractpoint,
                                    "id": `${Data.id}指示器_ExitName`
                                })
                            }
                        }
                            break;
                        case "Skill": {
                            this.databaseServer.getTables().locales.global.ch[Data.id] = Data.locale
                            this.databaseServer.getTables().locales.global.en[Data.id] = Data.enlocale
                            QFinish.push({
                                "compareMethod": ">=",
                                "conditionType": "Skill",
                                "dynamicLocale": false,
                                "globalQuestCounterId": "",
                                "id": Data.id,
                                "index": 0,
                                "parentId": "",
                                "target": Data.skill,
                                "value": Data.count,
                                "visibilityConditions": []
                            })
                        }
                    }
                }
            }
            if (Fail.Data.length > 0) {

                for (var i = 0; i < Fail.Data.length; i++) {
                    var Data = Fail.Data[i]
                    switch (Data.type) {
                        case "Kill": {
                            QFail.push({
                                "completeInSeconds": 0,
                                "conditionType": "CounterCreator",
                                "counter": {
                                    "conditions": [],
                                    "id": `${Data.id}指示器`
                                },
                                "doNotResetIfCounterCompleted": false,
                                "dynamicLocale": false,
                                "globalQuestCounterId": "",
                                "id": Data.id,
                                "index": i,
                                "oneSessionOnly": Data.oneraid,
                                "parentId": "",
                                "type": "Elimination",
                                "value": Data.count,
                                "visibilityConditions": []
                            })
                            QFail[QFail.length - 1].counter.conditions.push({
                                "bodyPart": [],
                                "compareMethod": ">=",
                                "conditionType": "Kills",
                                "daytime": {
                                    "from": Data.daytime[0],
                                    "to": Data.daytime[1]
                                },
                                "distance": {
                                    "compareMethod": Data.distancetype,
                                    "value": Data.distance
                                },
                                "dynamicLocale": false,
                                "enemyEquipmentExclusive": [],
                                "enemyEquipmentInclusive": [],
                                "enemyHealthEffects": [],
                                "id": `${Data.id}指示器条件`,
                                "resetOnSessionEnd": false,
                                "savageRole": Data.role,
                                "target": Data.bot,
                                "value": 1,
                                "weapon": Data.weapon,
                                "weaponCaliber": [],
                                "weaponModsExclusive": [],
                                "weaponModsInclusive": []
                            })
                            if (Data.location.length > 0) {
                                QFail[QFail.length - 1].counter.conditions.push({
                                    "conditionType": "Location",
                                    "dynamicLocale": false,
                                    "id": `${Data.id}_地图需求`,
                                    "target": Data.location
                                })
                            }
                            if (Data.zone.length > 0) {
                                QFail[QFail.length - 1].counter.conditions.push({
                                    "conditionType": "InZone",
                                    "dynamicLocale": false,
                                    "id": `${Data.id}_地点需求`,
                                    "zoneIds": Data.zone
                                })
                            }
                            if (Data.Equip.length > 0) {
                                for (var j = 0; j < Data.Equip.length; j++) {

                                    QFail[QFail.length - 1].counter.conditions.push({
                                        "IncludeNotEquippedItems": false,
                                        "conditionType": "Equipment",
                                        "dynamicLocale": false,
                                        "equipmentExclusive": [],
                                        "equipmentInclusive": [],
                                        "id": `${Data.id}_装备需求${j}`
                                    })
                                    for (var k = 0; k < Data.Equip[j].length; k++) {
                                        QFail[QFail.length - 1].counter.conditions[QFail[QFail.length - 1].counter.conditions.length - 1].equipmentInclusive.push([
                                            Data.Equip[j][k]
                                        ])
                                    }
                                }

                            }
                            if (Data.Mod.length > 0) {
                                for (var j = 0; j < Data.Mod.length; j++) {
                                    QFail[QFail.length - 1].counter.conditions[0].weaponModsInclusive.push([
                                        Data.Mod[j]
                                    ])
                                }
                            }
                        }
                            break;
                        case "Level": {
                            QFail.push({
                                "conditionType": "Level",
                                "id": Data.id,
                                "index": i,
                                "parentId": "",
                                "dynamicLocale": false,
                                "value": Data.count,
                                "compareMethod": ">=",
                                "visibilityConditions": [],
                                "isEncoded": false,
                                "countInRaid": false,
                                "globalQuestCounterId": "",
                                "target": ""
                            })
                        }
                            break;
                        case "Visit": {
                            QFail.push({
                                "completeInSeconds": 0,
                                "conditionType": "CounterCreator",
                                "counter": {
                                    "conditions": [
                                        {
                                            "conditionType": "VisitPlace",
                                            "dynamicLocale": false,
                                            "id": `${Data.id}`,
                                            "target": Data.zoneid,
                                            "value": 1
                                        }
                                    ],
                                    "id": `${Data.id}指示器`
                                },
                                "doNotResetIfCounterCompleted": false,
                                "dynamicLocale": false,
                                "globalQuestCounterId": "",
                                "id": Data.id,
                                "index": i,
                                "oneSessionOnly": Data.oneraid,
                                "parentId": "",
                                "type": "Exploration",
                                "value": 1,
                                "visibilityConditions": []
                            })
                        }
                            break;
                        case "Extract": {
                            QFail.push({
                                "completeInSeconds": 0,
                                "conditionType": "CounterCreator",
                                "counter": {
                                    "conditions": [
                                        {
                                            "conditionType": "Location",
                                            "dynamicLocale": false,
                                            "id": `${Data.id}指示器_Location`,
                                            "target": Data.location
                                        },
                                        {
                                            "conditionType": "ExitStatus",
                                            "dynamicLocale": false,
                                            "id": `${Data.id}指示器_ExitStatus`,
                                            "status": Data.status
                                        }
                                    ],
                                    "id": `${Data.id}指示器`
                                },
                                "doNotResetIfCounterCompleted": false,
                                "dynamicLocale": false,
                                "globalQuestCounterId": "",
                                "id": Data.id,
                                "index": 0,
                                "oneSessionOnly": Data.oneraid,
                                "parentId": "",
                                "type": "Exploration",
                                "value": Data.count,
                                "visibilityConditions": []
                            })
                            if (Data.chosenextractpoint == true) {
                                QFail[QFail.length - 1].counter.conditions.push({
                                    "conditionType": "ExitName",
                                    "dynamicLocale": false,
                                    "exitName": Data.extractpoint,
                                    "id": `${Data.id}指示器_ExitName`
                                })
                            }
                        }
                            break;
                        case "Quest": {
                            QFail.push({
                                "availableAfter": 0,
                                "conditionType": "Quest",
                                "dispersion": 0,
                                "dynamicLocale": false,
                                "globalQuestCounterId": "",
                                "id": Data.id,
                                "index": i,
                                "parentId": "",
                                "status": Data.status,
                                "target": Data.questid,
                                "visibilityConditions": []
                            })
                        }
                    }
                }
            }
        }
    }
    /**
     * This method is deprecated.
     * @deprecated Use excludeItemBlackList instead.
     */
    public excludeLoot(Item) {
        const PMCConfig = this.configServer.getConfig<IPmcConfig>(ConfigTypes.PMC)
        for (let item in Item) {
            PMCConfig.vestLoot.blacklist.push(Item[item]._id)
            PMCConfig.pocketLoot.blacklist.push(Item[item]._id)
            PMCConfig.backpackLoot.blacklist.push(Item[item]._id)
        }
    }
    /**
     * This method is deprecated.
     * @deprecated Use excludeItemBlackList instead.
     */
    public excludeAirDrop(Item) {
        const AirDropConfig = this.configServer.getConfig<IAirdropConfig>(ConfigTypes.AIRDROP)
        const FenceConfig = this.configServer.getConfig<ITraderConfig>(ConfigTypes.TRADER)
        for (var i = 0; i < Item.length; i++) {
            for (let type in AirDropConfig.loot) {
                AirDropConfig.loot[type].itemBlacklist.push(Item[i])
            }
            FenceConfig.fence.blacklist.push(Item[i])
        }
    }
    public excludeItem(itemid) {
        const ScavCaseConfig = this.configServer.getConfig<IScavCaseConfig>(ConfigTypes.SCAVCASE)
        const PMCConfig = this.configServer.getConfig<IPmcConfig>(ConfigTypes.PMC)
        const AirDropConfig = this.configServer.getConfig<IAirdropConfig>(ConfigTypes.AIRDROP)
        const FenceConfig = this.configServer.getConfig<ITraderConfig>(ConfigTypes.TRADER)
        ScavCaseConfig.rewardItemBlacklist.push(itemid)
        PMCConfig.vestLoot.blacklist.push(itemid)
        PMCConfig.pocketLoot.blacklist.push(itemid)
        PMCConfig.backpackLoot.blacklist.push(itemid)
        for (let type in AirDropConfig.loot) {
            AirDropConfig.loot[type].itemBlacklist.push(itemid)
        }
        FenceConfig.fence.blacklist.push(itemid)
    }
    public excludeItemBlackList(Item) {
        const ScavCaseConfig = this.configServer.getConfig<IScavCaseConfig>(ConfigTypes.SCAVCASE)
        const PMCConfig = this.configServer.getConfig<IPmcConfig>(ConfigTypes.PMC)
        const AirDropConfig = this.configServer.getConfig<IAirdropConfig>(ConfigTypes.AIRDROP)
        const FenceConfig = this.configServer.getConfig<ITraderConfig>(ConfigTypes.TRADER)
        for (var i = 0; i < Item.length; i++) {
            PMCConfig.vestLoot.blacklist.push(Item[i])
            PMCConfig.pocketLoot.blacklist.push(Item[i])
            PMCConfig.backpackLoot.blacklist.push(Item[i])
            for (let type in AirDropConfig.loot) {
                AirDropConfig.loot[type].itemBlacklist.push(Item[i])
            }
            FenceConfig.fence.blacklist.push(Item[i])
            ScavCaseConfig.rewardItemBlacklist.push(Item[i])
        }
    }
    public deepMerge(target: NestedObject, source: NestedObject): NestedObject {
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                const sourceValue = source[key];
                const targetValue = target[key];
    
                if (Array.isArray(sourceValue)) {
                    // If the value is an array, assign the array
                    target[key] = sourceValue;
                } else if (sourceValue != null && typeof sourceValue === 'object') {
                    // Check if the sourceValue is an empty object
                    if (Object.keys(sourceValue).length === 0) {
                        // If sourceValue is an empty object, directly assign it
                        target[key] = sourceValue;
                    } else {
                        // If the value is a non-empty object, recursively merge
                        if (targetValue != null && typeof targetValue === 'object') {
                            target[key] = this.deepMerge(targetValue as NestedObject, sourceValue as NestedObject);
                        } else {
                            target[key] = this.deepMerge({}, sourceValue as NestedObject);
                        }
                    }
                } else {
                    // Otherwise, directly assign the value
                    target[key] = sourceValue;
                }
            }
        }
        return target;
    }
    private mergeArrays(targetArray: any[], sourceArray: any[]): any[] {
        // If source array is larger, append missing elements to target array
        if (sourceArray.length > targetArray.length) {
            for (let i = targetArray.length; i < sourceArray.length; i++) {
                targetArray.push(sourceArray[i]);
            }
        }
        // Merge each element of the arrays
        for (let i = 0; i < sourceArray.length; i++) {
            if (typeof sourceArray[i] === 'object' && sourceArray[i] !== null) {
                if (typeof targetArray[i] === 'object' && targetArray[i] !== null) {
                    targetArray[i] = this.deepMerge(targetArray[i], sourceArray[i]);
                } else {
                    targetArray[i] = this.deepMerge({}, sourceArray[i]);
                }
            } else {
                targetArray[i] = sourceArray[i];
            }
        }
        return targetArray;
    }
    public isEmptyObject(obj: any): boolean {
        if (obj === null || obj === undefined) {
            return true;
        }
        return Object.keys(obj).length === 0;
    }
    public initItem(ItemObj, mode: number) {
        const ITEM = this.databaseServer.getTables().templates.items
        const Local = this.databaseServer.getTables().locales.global.ch
        //var test = {}
        switch (mode) {
            case 1: {
                for (let i in ItemObj) {
                    var target = this.deepCopy(this.getItem(ItemObj[i].targetid))
                    ITEM[ItemObj[i]._id] = this.deepMerge(target, ItemObj[i])
                    this.databaseServer.getTables().templates.handbook.Items.push({
                        "Id": ItemObj[i]._id,
                        "ParentId": ItemObj[i]._props.RagfairType,
                        "Price": ItemObj[i]._props.DefaultPrice
                    })
                    if (ItemObj[i]._props.CanFindInRaid == true) {
                        if (ItemObj[i]._props.CustomLoot == true) {
                            this.addWorldGenerate(ItemObj[i]._id, ItemObj[i]._props.CustomLootTarget)
                        }
                        else {
                            this.addWorldGenerate(ItemObj[i]._id, ItemObj[i].targetid)
                        }
                    }
                    else {
                        this.excludeItem(ItemObj[i]._id)
                        //this.excludeLoot(ItemObj[i]._id)
                    }
                    if (ItemObj[i]._props.isMoney == true) {
                        inventoryConfig.customMoneyTpls.push(ItemObj[i]._id)
                    }
                    if (ItemObj[i]._props.isGiftBox == true) {
                        inventoryConfig.randomLootContainers[ItemObj[i]._id] = {
                            rewardCount: ItemObj[i]._props.BoxData.Count,
                            foundInRaid: true,
                            rewardTplPool: ItemObj[i]._props.BoxData.Rewards
                        }
                    }
                    if (ItemObj[i]._props.isQuestItem == true) {
                        for (var m = 0; m < ItemObj[i]._props.QuestItemData.location.length; m++) {
                            this.databaseServer.getTables().locations[ItemObj[i]._props.QuestItemData.location[m]].looseLoot.spawnpointsForced.push(ItemObj[i]._props.QuestItemData)
                        }
                    }
                    Local[`${ItemObj[i]._id} Name`] = ItemObj[i]._props.Name
                    Local[`${ItemObj[i]._id} ShortName`] = ItemObj[i]._props.ShortName
                    Local[`${ItemObj[i]._id} Description`] = ItemObj[i]._props.Description
                    if (ItemObj[i]._props.StimulatorBuffs && ItemObj[i]._props.BuffValue) {
                        this.databaseServer.getTables().globals.config.Health.Effects.Stimulator.Buffs[ItemObj[i]._props.StimulatorBuffs] = ItemObj[i]._props.BuffValue
                    }
                    this.fixEuqipment(ItemObj[i]._id, ItemObj[i].targetid)
                }
            }
                break;
            case 2: {
                //MG-Mod
                for (let i in ItemObj) {
                    var target = this.deepCopy(this.getItem(ItemObj[i].items.cloneId))
                    target._id = ItemObj[i].items.newId
                    ITEM[ItemObj[i].items.newId] = this.deepMerge(target, ItemObj[i].items)
                    this.databaseServer.getTables().templates.handbook.Items.push({
                        "Id": ItemObj[i].items.newId,
                        "ParentId": this.getTag(this.getItem(ItemObj[i].items.cloneId)),
                        "Price": ItemObj[i].price
                    })
                    Local[`${ItemObj[i].items.newId} Name`] = ItemObj[i].description.name
                    Local[`${ItemObj[i].items.newId} ShortName`] = ItemObj[i].description.shortName
                    Local[`${ItemObj[i].items.newId} Description`] = ItemObj[i].description.description
                    if (!this.isEmptyObject(ItemObj[i].Buffs)) {
                        for (let buff in ItemObj[i].Buffs) {
                            this.databaseServer.getTables().globals.config.Health.Effects.Stimulator.Buffs[buff] = ItemObj[i].Buffs[buff]
                        }
                    }
                    this.fixEuqipment(ItemObj[i].items.newId, ItemObj[i].items.cloneId)
                }
            }
                break;
            case 3: {
                //super-Mod
                //真的有人会用吗...
                for (let i in ItemObj) {
                    var target = this.deepCopy(this.getItem(ItemObj[i].tpl))
                    ITEM[ItemObj[i].items._id] = this.deepMerge(target, ItemObj[i].items)
                    this.databaseServer.getTables().templates.handbook.Items.push({
                        "Id": ItemObj[i].items._id,
                        "ParentId": this.getTag(this.getItem(ItemObj[i].tpl)),
                        "Price": ItemObj[i].handbook.Price
                    })
                    Local[`${ItemObj[i].items._id} Name`] = ItemObj[i].items._props.Name
                    Local[`${ItemObj[i].items._id} ShortName`] = ItemObj[i].items._props.ShortName
                    Local[`${ItemObj[i].items._id} Description`] = ItemObj[i].items._props.Description
                    if (ItemObj[i].items._props.StimulatorBuffs && !this.isEmptyObject(ItemObj[i].Buffs)) {
                        for (let buff in ItemObj[i].Buffs) {
                            this.databaseServer.getTables().globals.config.Health.Effects.Stimulator.Buffs[buff] = ItemObj[i].Buffs[buff]
                        }
                    }
                    this.fixEuqipment(ItemObj[i].items._id, ItemObj[i].tpl)
                }
            }
                break;
            default: {
                this.Warn("警告：加载参数缺失或不合法，跳过加载程序……")
            }
        }

    }
    public addCustomBundles(modpath: string): void {
        const bundleManifestArr =
            this.jsonUtil.deserialize<BundleManifest>(this.vfs.readFile(`${modpath}bundles.json`)).manifest;

        for (const bundleManifest of bundleManifestArr) {
            const absoluteModPath = path.join(process.cwd(), modpath).slice(0, -1).replace(/\\/g, "/");
            const bundleLocalPath = `${modpath}bundles/${bundleManifest.key}`.replace(/\\/g, "/");

            if (!this.bundleHashCacheService.calculateAndMatchHash(bundleLocalPath)) {
                this.bundleHashCacheService.calculateAndStoreHash(bundleLocalPath);
            }

            const bundleHash = this.bundleHashCacheService.getStoredValue(bundleLocalPath);

            this.bundleLoader.addBundle(bundleManifest.key, new BundleInfo(absoluteModPath, bundleManifest, bundleHash));
        }
    }
    public addWorldGenerate(id, target) {
        this.addStaticLoot(id, target)
        this.addMapLoot(id, target)
    }
    public loadQuestLocale(files, lang) {
        const Locale = lang != null ? this.databaseServer.getTables().locales.global[lang] : this.databaseServer.getTables().locales.global.ch
        for (let quest in files) {
            Locale[`${quest} name`] = files[quest].name
            Locale[`${quest} description`] = files[quest].description
            Locale[`${quest} failMessageText`] = files[quest].failMessageText
            Locale[`${quest} startedMessageText`] = files[quest].startedMessageText
            Locale[`${quest} successMessageText`] = files[quest].successMessageText
            for (let cd in files[quest].conditions) {
                Locale[cd] = files[quest].conditions[cd]
            }
        }
    }
    public loadQuestLocaleRITC(info, files, lang) {
        const Locale = lang != null ? this.databaseServer.getTables().locales.global[lang] : this.databaseServer.getTables().locales.global.ch
        for (let quest in files) {
            Locale[`${quest} name`] = files[quest].name
            Locale[`${quest} description`] = `${files[quest].description}<color=#FF0066><b>\n此任务由RITC创建。\n扩展包：${info.Name}</b></color>`
            Locale[`${quest} failMessageText`] = files[quest].failMessageText
            Locale[`${quest} startedMessageText`] = files[quest].startedMessageText
            Locale[`${quest} successMessageText`] = files[quest].successMessageText
            for (let cd in files[quest].conditions) {
                Locale[cd] = files[quest].conditions[cd]
            }
        }
    }
    public initTraderRITC(info, TraderObj, imagePath, InsurantMuti, InsurantChance, FlashTime) {
        const traderConfig = this.configServer.getConfig<ITraderConfig>(ConfigTypes.TRADER);
        const ragfairConfig = this.configServer.getConfig<IRagfairConfig>(ConfigTypes.RAGFAIR);
        const TraderObj2 = this.deepCopy(TraderObj)
        const Assort = TraderObj2.assort
        const Base = TraderObj2.base
        const Log = TraderObj2.Dialogue
        const Qssort = TraderObj2.questassort
        const Suit = TraderObj2.suits
        const trader = Base._id
        this.databaseServer.getTables().traders[trader] = TraderObj2
        var TraderBase = Base
        var TraderID = trader
        this.databaseServer.getTables().locales.global["ch"][TraderID + " FullName"] = TraderBase.surname
        this.databaseServer.getTables().locales.global["ch"][TraderID + " FirstName"] = TraderBase.name
        this.databaseServer.getTables().locales.global["ch"][TraderID + " Nickname"] = TraderBase.nickname
        this.databaseServer.getTables().locales.global["ch"][TraderID + " Location"] = TraderBase.location
        this.databaseServer.getTables().locales.global["ch"][TraderID + " Description"] = `${TraderBase.description}<color=#1049f8><b>\n此商人由RITC创建。\n扩展包：${info.Name}</b></color>`
        Traders[trader] = trader;
        const InsuranceConfig = this.configServer.getConfig<IInsuranceConfig>(ConfigTypes.INSURANCE);
        InsuranceConfig.insuranceMultiplier[TraderID] = InsurantMuti
        InsuranceConfig.returnChancePercent[TraderID] = InsurantChance
        //VFS.writeFile(`${ModPath}db/insurance.json`, JSON.stringify(InsuranceConfig, null, 4))
        const traderRefreshRecord = { _name: TraderBase.name, traderId: trader, seconds: { min: FlashTime, max: FlashTime } }
        traderConfig.updateTime.push(traderRefreshRecord);
        ragfairConfig.traders[TraderID] = true
        this.imageRouter.addRoute(Base.avatar.replace(".jpg", ""), `${imagePath}/${trader}.jpg`);
    }
    public initItemRITC(ItemObj, mode: number) {
        const ITEM = this.databaseServer.getTables().templates.items
        const Local = this.databaseServer.getTables().locales.global.ch
        const inventoryConfig = this.configServer.getConfig<IInventoryConfig>(ConfigTypes.INVENTORY);
        //var test = {}
        switch (mode) {
            case 1: {
                for (let i in ItemObj) {
                    var target = this.deepCopy(this.getItem(ItemObj[i].targetid))
                    ITEM[ItemObj[i]._id] = this.deepMerge(target, ItemObj[i])
                    this.databaseServer.getTables().templates.handbook.Items.push({
                        "Id": ItemObj[i]._id,
                        "ParentId": ItemObj[i]._props.RagfairType,
                        "Price": ItemObj[i]._props.DefaultPrice
                    })
                    if (ItemObj[i]._props.CanFindInRaid == true) {
                        if (ItemObj[i]._props.CustomLoot == true) {
                            this.addWorldGenerate(ItemObj[i]._id, ItemObj[i]._props.CustomLootTarget)
                        }
                        else {
                            this.addWorldGenerate(ItemObj[i]._id, ItemObj[i].targetid)
                        }
                    }
                    else {
                        this.excludeItem(ItemObj[i]._id)
                        //this.excludeLoot(ItemObj[i]._id)
                    }
                    if (ItemObj[i]._props.isMoney == true) {
                        inventoryConfig.customMoneyTpls.push(ItemObj[i]._id)
                    }
                    if (ItemObj[i]._props.isGiftBox == true) {
                        inventoryConfig.randomLootContainers[ItemObj[i]._id] = {
                            rewardCount: ItemObj[i]._props.BoxData.Count,
                            foundInRaid: true,
                            rewardTplPool: ItemObj[i]._props.BoxData.Rewards
                        }
                    }
                    if (ItemObj[i]._props.isQuestItem == true) {
                        for (var m = 0; m < ItemObj[i]._props.QuestItemData.location.length; m++) {
                            this.databaseServer.getTables().locations[ItemObj[i]._props.QuestItemData.location[m]].looseLoot.spawnpointsForced.push(ItemObj[i]._props.QuestItemData)
                        }
                    }
                    Local[`${ItemObj[i]._id} Name`] = ItemObj[i]._props.Name
                    Local[`${ItemObj[i]._id} ShortName`] = ItemObj[i]._props.ShortName
                    Local[`${ItemObj[i]._id} Description`] = ItemObj[i]._props.Description + "<color=#196884><b>\n此物品由RITC创建。\n编译标准：RITC</b></color>"
                    if (ItemObj[i]._props.StimulatorBuffs && ItemObj[i]._props.BuffValue) {
                        this.databaseServer.getTables().globals.config.Health.Effects.Stimulator.Buffs[ItemObj[i]._props.StimulatorBuffs] = ItemObj[i]._props.BuffValue
                    }
                    this.fixEuqipment(ItemObj[i]._id, ItemObj[i].targetid)
                }
            }
                break;
            case 2: {
                //MG-Mod
                for (let i in ItemObj) {
                    var target = this.deepCopy(this.getItem(ItemObj[i].items.cloneId))
                    target._id = ItemObj[i].items.newId
                    ITEM[ItemObj[i].items.newId] = this.deepMerge(target, ItemObj[i].items)
                    this.databaseServer.getTables().templates.handbook.Items.push({
                        "Id": ItemObj[i].items.newId,
                        "ParentId": this.getTag(this.getItem(ItemObj[i].items.cloneId)),
                        "Price": ItemObj[i].price
                    })
                    Local[`${ItemObj[i].items.newId} Name`] = ItemObj[i].description.name
                    Local[`${ItemObj[i].items.newId} ShortName`] = ItemObj[i].description.shortName
                    Local[`${ItemObj[i].items.newId} Description`] = ItemObj[i].description.description + "<color=#1FDC56><b>\n此物品由RITC创建。\n编译标准：MG-Mod</b></color>"
                    if (!this.isEmptyObject(ItemObj[i].Buffs)) {
                        for (let buff in ItemObj[i].Buffs) {
                            this.databaseServer.getTables().globals.config.Health.Effects.Stimulator.Buffs[buff] = ItemObj[i].Buffs[buff]
                        }
                    }
                    this.excludeItem(ItemObj[i].items.newId)
                    this.fixEuqipment(ItemObj[i].items.newId, ItemObj[i].items.cloneId)
                }
            }
                break;
            case 3: {
                //super-Mod
                //真的有人会用吗...
                for (let i in ItemObj) {
                    var target = this.deepCopy(this.getItem(ItemObj[i].tpl))
                    ITEM[ItemObj[i].items._id] = this.deepMerge(target, ItemObj[i].items)
                    this.databaseServer.getTables().templates.handbook.Items.push({
                        "Id": ItemObj[i].items._id,
                        "ParentId": this.getTag(this.getItem(ItemObj[i].tpl)),
                        "Price": ItemObj[i].handbook.Price
                    })
                    Local[`${ItemObj[i].items._id} Name`] = ItemObj[i].items._props.Name
                    Local[`${ItemObj[i].items._id} ShortName`] = ItemObj[i].items._props.ShortName
                    Local[`${ItemObj[i].items._id} Description`] = ItemObj[i].items._props.Description + "<color=#A025D3><b>\n此物品由RITC创建。\n编译标准：superMod</b></color>"
                    if (ItemObj[i].items._props.StimulatorBuffs && !this.isEmptyObject(ItemObj[i].Buffs)) {
                        for (let buff in ItemObj[i].Buffs) {
                            this.databaseServer.getTables().globals.config.Health.Effects.Stimulator.Buffs[buff] = ItemObj[i].Buffs[buff]
                        }
                    }
                    this.excludeItem(ItemObj[i].items._id)
                    this.fixEuqipment(ItemObj[i].items._id, ItemObj[i].tpl)
                }
            }
                break;
            default: {
                this.Warn("警告：加载参数缺失或不合法，跳过加载程序……")
            }
        }

    }
    public initQuest(quest) {
        for (let q in quest) {
            const Q = quest[q]
            this.createQuest(Q.ID, Q.TraderID, Q.Type, Q.imagepath, Q.Location, Q.Restartable)
        }
    }
    public initQuestReward(RW) {
        for (var r = 0; r < RW.length; r++) {
            const RW2 = RW[r]
            const QuestID = this.getID(RW2.Quest)
            const QuestsData = this.databaseServer.getTables().templates.quests[QuestID]
            const Name = RW2.Name
            switch (RW2.Condition) {
                case "Finish": {
                    const Reward = QuestsData.rewards.Success
                    switch (RW2.Type) {
                        case "Item": {
                            const Item = this.convertAssortArr(RW2.Items)
                            var WeaponReward = this.convertWeaponAssortToReward(Item)
                            Reward.push({
                                "findInRaid": true,
                                "id": `${Name}RW`,
                                "type": "Item",
                                "index": Reward.length,
                                "target": `${WeaponReward[0]._id}`,
                                "items": WeaponReward,
                                "value": RW2.Count.toString()
                            })
                        }
                            break;
                        case "Assort": {
                            const RW2 = RW[r]
                            const Item = this.convertAssortArr(RW2.Items)
                            const ID = Item[0]._id
                            const AssortData = this.databaseServer.getTables().traders[this.getTraderIDFromMap(RW2.Trader)].assort
                            const TraderData = this.databaseServer.getTables().traders[this.getTraderIDFromMap(RW2.Trader)]
                            for (var i = 0; i < Item.length; i++) {
                                AssortData.items.push(Item[i])
                            }
                            AssortData.barter_scheme[ID] = [[]]
                            for (let br in RW2.Barter) {
                                AssortData.barter_scheme[ID][0].push({
                                    "count": RW2.Barter[br],
                                    "_tpl": this.getID(br)
                                })
                            }
                            AssortData.loyal_level_items[ID] = RW2.LLR
                            if (RW2.isLock == true) {
                                TraderData.questassort.success[ID] = QuestID
                                if (RW2.isWeapon == true) {
                                    var WeaponReward = this.convertWeaponAssortToReward(Item)
                                    Reward.push({
                                        "id": `${Name}RW`,
                                        "type": "AssortmentUnlock",
                                        "index": Reward.length,
                                        "target": `${WeaponReward[0]._id}`,
                                        "items": WeaponReward,
                                        "loyaltyLevel": RW2.LLR,
                                        "traderId": this.getTraderIDFromMap(RW2.Trader)
                                    })
                                }
                                else {
                                    Reward.push({
                                        "id": `${Name}RW`,
                                        "type": "AssortmentUnlock",
                                        "index": Reward.length,
                                        "target": `${Name}RW1`,
                                        "items": [
                                            {
                                                "_id": `${Name}RW1`,
                                                "_tpl": Item[0]._tpl
                                            }
                                        ],
                                        "loyaltyLevel": RW2.LLR,
                                        "traderId": this.getTraderIDFromMap(RW2.Trader)
                                    })
                                }

                            }
                        }
                            break;
                        case "Exp": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "type": "Experience",
                                "value": RW2.Count
                            })
                        }
                            break;
                        case "Trust": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "type": "TraderStanding",
                                "target": this.getTraderIDFromMap(RW2.TraderID),
                                "value": RW2.Count
                            })
                        }
                            break;
                        case "Skill": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "type": "Skill",
                                "target": RW2.Skill,
                                "value": RW2.Count
                            })
                        }
                            break;
                        case "Trader": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "target": RW2.Trader,
                                "type": "TraderUnlock"
                            })
                        }
                            break;
                    }
                }
                    break;
                case "Start": {
                    const Reward = QuestsData.rewards.Started
                    switch (RW2.Type) {
                        case "Item": {
                            const Item = this.convertAssortArr(RW2.Items)
                            var WeaponReward = this.convertWeaponAssortToReward(Item)
                            Reward.push({
                                "findInRaid": true,
                                "id": `${Name}RW`,
                                "type": "Item",
                                "index": Reward.length,
                                "target": `${WeaponReward[0]._id}`,
                                "items": WeaponReward,
                                "value": RW2.Count.toString()
                            })
                        }
                            break;
                        case "Assort": {
                            const RW2 = RW[r]
                            const Item = this.convertAssortArr(RW2.Items)
                            const ID = Item[0]._id
                            const AssortData = this.databaseServer.getTables().traders[this.getTraderIDFromMap(RW2.Trader)].assort
                            const TraderData = this.databaseServer.getTables().traders[this.getTraderIDFromMap(RW2.Trader)]
                            for (var i = 0; i < Item.length; i++) {
                                AssortData.items.push(Item[i])
                            }
                            AssortData.barter_scheme[ID] = [[]]
                            for (let br in RW2.Barter) {
                                AssortData.barter_scheme[ID][0].push({
                                    "count": RW2.Barter[br],
                                    "_tpl": this.getID(br)
                                })
                            }
                            AssortData.loyal_level_items[ID] = RW2.LLR
                            if (RW2.isLock == true) {
                                TraderData.questassort.success[ID] = QuestID
                                if (RW2.isWeapon == true) {
                                    var WeaponReward = this.convertWeaponAssortToReward(Item)
                                    Reward.push({
                                        "id": `${Name}RW`,
                                        "type": "AssortmentUnlock",
                                        "index": Reward.length,
                                        "target": `${WeaponReward[0]._id}`,
                                        "items": WeaponReward,
                                        "loyaltyLevel": RW2.LLR,
                                        "traderId": this.getTraderIDFromMap(RW2.Trader)
                                    })
                                }
                                else {
                                    Reward.push({
                                        "id": `${Name}RW`,
                                        "type": "AssortmentUnlock",
                                        "index": Reward.length,
                                        "target": `${Name}RW1`,
                                        "items": [
                                            {
                                                "_id": `${Name}RW1`,
                                                "_tpl": Item[0]._tpl
                                            }
                                        ],
                                        "loyaltyLevel": RW2.LLR,
                                        "traderId": this.getTraderIDFromMap(RW2.Trader)
                                    })
                                }

                            }
                        }
                            break;
                        case "Exp": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "type": "Experience",
                                "value": RW2.Count
                            })
                        }
                            break;
                        case "Trust": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "type": "TraderStanding",
                                "target": this.getTraderIDFromMap(RW2.TraderID),
                                "value": RW2.Count
                            })
                        }
                            break;
                        case "Skill": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "type": "Skill",
                                "target": RW2.Skill,
                                "value": RW2.Count
                            })
                        }
                            break;
                        case "Trader": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "target": RW2.Trader,
                                "type": "TraderUnlock"
                            })
                        }
                            break;
                    }
                }
                    break;
                case "Failed": {
                    const Reward = QuestsData.rewards.Fail
                    switch (RW2.Type) {
                        case "Item": {
                            const Item = this.convertAssortArr(RW2.Items)
                            var WeaponReward = this.convertWeaponAssortToReward(Item)
                            Reward.push({
                                "findInRaid": true,
                                "id": `${Name}RW`,
                                "type": "Item",
                                "index": Reward.length,
                                "target": `${WeaponReward[0]._id}`,
                                "items": WeaponReward,
                                "value": RW2.Count.toString()
                            })
                        }
                            break;
                        case "Assort": {
                            const RW2 = RW[r]
                            const Item = this.convertAssortArr(RW2.Items)
                            const ID = Item[0]._id
                            const AssortData = this.databaseServer.getTables().traders[this.getTraderIDFromMap(RW2.Trader)].assort
                            const TraderData = this.databaseServer.getTables().traders[this.getTraderIDFromMap(RW2.Trader)]
                            for (var i = 0; i < Item.length; i++) {
                                AssortData.items.push(Item[i])
                            }
                            AssortData.barter_scheme[ID] = [[]]
                            for (let br in RW2.Barter) {
                                AssortData.barter_scheme[ID][0].push({
                                    "count": RW2.Barter[br],
                                    "_tpl": this.getID(br)
                                })
                            }
                            AssortData.loyal_level_items[ID] = RW2.LLR
                            if (RW2.isLock == true) {
                                TraderData.questassort.success[ID] = QuestID
                                if (RW2.isWeapon == true) {
                                    var WeaponReward = this.convertWeaponAssortToReward(Item)
                                    Reward.push({
                                        "id": `${Name}RW`,
                                        "type": "AssortmentUnlock",
                                        "index": Reward.length,
                                        "target": `${WeaponReward[0]._id}`,
                                        "items": WeaponReward,
                                        "loyaltyLevel": RW2.LLR,
                                        "traderId": this.getTraderIDFromMap(RW2.Trader)
                                    })
                                }
                                else {
                                    Reward.push({
                                        "id": `${Name}RW`,
                                        "type": "AssortmentUnlock",
                                        "index": Reward.length,
                                        "target": `${Name}RW1`,
                                        "items": [
                                            {
                                                "_id": `${Name}RW1`,
                                                "_tpl": Item[0]._tpl
                                            }
                                        ],
                                        "loyaltyLevel": RW2.LLR,
                                        "traderId": this.getTraderIDFromMap(RW2.Trader)
                                    })
                                }

                            }
                        }
                            break;
                        case "Exp": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "type": "Experience",
                                "value": RW2.Count
                            })
                        }
                            break;
                        case "Trust": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "type": "TraderStanding",
                                "target": this.getTraderIDFromMap(RW2.TraderID),
                                "value": RW2.Count
                            })
                        }
                            break;
                        case "Skill": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "type": "Skill",
                                "target": RW2.Skill,
                                "value": RW2.Count
                            })
                        }
                            break;
                        case "Trader": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "target": RW2.Trader,
                                "type": "TraderUnlock"
                            })
                        }
                            break;
                    }
                }
                    break;


            }
            QuestsData.rewards.Success = this.indexArray(QuestsData.rewards.Success)
            QuestsData.rewards.Started = this.indexArray(QuestsData.rewards.Started)
            QuestsData.rewards.Fail = this.indexArray(QuestsData.rewards.Fail)
        }
    }
    public initRecipe(Recipe) {
        for (let i in Recipe) {
            var R = Recipe[i]
            const ClientDB = this.databaseServer.getTables()
            ClientDB.hideout.production.push({
                _id: R.ID,
                areaType: R.Area,
                requirements: [],
                productionTime: R.Time,
                needFuelForAllProductionTime: R.NeedFuel,
                locked: R.Locked,
                endProduct: R.Output,
                continuous: false,
                count: R.OutputCount,
                productionLimitCount: 0,
                isEncoded: false

            })
            ClientDB.hideout.production[ClientDB.hideout.production.length - 1].requirements.push({
                areaType: R.Area,
                requiredLevel: R.AreaLevel,
                type: "Area"
            })

            if (R.Locked == true) {

                ClientDB.hideout.production[ClientDB.hideout.production.length - 1].requirements.push({
                    questId: R.Quest,
                    type: "QuestComplete"
                })
                const Reward = ClientDB.templates.quests[R.Quest].rewards.Success
                Reward.push({
                    id: R.ID,
                    index: 0,
                    items: [
                        {
                            _id: R.ID + R.Output,
                            _tpl: R.Output,
                            upd: {
                                SpawnedInSession: true,
                                StackObjectsCount: 1
                            }
                        }
                    ],
                    loyaltyLevel: R.AreaLevel,
                    target: R.ID + R.Output,
                    traderId: R.Area,
                    type: "ProductionScheme"
                })
            }
            for (let j in R.Require.Tool) {
                ClientDB.hideout.production[ClientDB.hideout.production.length - 1].requirements.push({
                    templateId: j,
                    "type": "Tool"
                })
            }
            for (let j in R.Require.Item) {
                ClientDB.hideout.production[ClientDB.hideout.production.length - 1].requirements.push({
                    templateId: j,
                    "count": R.Require.Item[j],
                    "isFunctional": false,
                    "isEncoded": false,
                    "type": "Item"
                })
            }
        }
    }
    public initTradersRITC(info, traders, path) {
        var TraderData = this.deepCopy(this.databaseServer.getTables().traders["58330581ace78e27b8b10cee"])
        for (let td in traders.trader) {
            TraderData.suits = []
            TraderData.assort.items = []
            TraderData.assort.barter_scheme = {}
            TraderData.assort.loyal_level_items = {}
            TraderData.questassort.started = {}
            TraderData.questassort.success = {}
            TraderData.questassort.fail = {}
            TraderData.base = this.deepMerge(TraderData.base, traders.trader[td])
            TraderData.base.avatar = `/files/trader/avatar/${traders.trader[td]._id}.jpg`
            TraderData.dialogue = traders.trader[td].insuranceLog
            this.initTraderRITC(info, TraderData, `${path}res/avatar/`, traders.trader[td].insuranceMulti, traders.trader[td].insuranceChance, traders.trader[td].refreshTime)
        }
    }
    public initScavCase(scavcase) {
        for (let sc in scavcase) {
            var ScavCase = scavcase[sc]
            this.databaseServer.getTables().hideout.scavcase.push({
                "_id": ScavCase.id,
                "ProductionTime": ScavCase.time,
                "Requirements": [],
                "EndProducts": {
                    "Common": {
                        "min": ScavCase.rewards.common[0],
                        "max": ScavCase.rewards.common[1]
                    },
                    "Rare": {
                        "min": ScavCase.rewards.rare[0],
                        "max": ScavCase.rewards.rare[1]
                    },
                    "Superrare": {
                        "min": ScavCase.rewards.superrare[0],
                        "max": ScavCase.rewards.superrare[1]
                    }
                }
            })
            for (let i in scavcase[sc].requires) {
                this.databaseServer.getTables().hideout.scavcase[this.databaseServer.getTables().hideout.scavcase.length - 1].Requirements.push({
                    "templateId": i,
                    "count": scavcase[sc].requires[i],
                    "isFunctional": false,
                    "isEncoded": false,
                    "type": "Item"
                })
            }
        }
    }
    public initDailyQuest(daily) {
        const questConfig = this.configServer.getConfig<IQuestConfig>(ConfigTypes.QUEST);
        for (let i in daily) {
            questConfig.repeatableQuests.push(daily[i])
        }
    }
    public initLocale(files, lang) {
        const Locale = lang != null ? this.databaseServer.getTables().locales.global[lang] : this.databaseServer.getTables().locales.global.ch
        for (let quest in files) {
            Locale[quest] = files[quest]
        }
    }
    public initLocaleRITC(info, files, lang) {
        const Locale = lang != null ? this.databaseServer.getTables().locales.global[lang] : this.databaseServer.getTables().locales.global.ch
        for (let quest in files) {
            Locale[quest] = `${files[quest]}<color=#FF0066><b>\n此任务由RITC创建。\n扩展包：${info.Name}</b></color>`
        }
    }
    public initQuestRewardDaily(RW, Target) {
        Target.Success = []
        Target.Started = []
        Target.Fail = []
        for (var r = 0; r < RW.length; r++) {
            const RW2 = RW[r]
            const Name = performance.now() + RW2.Name
            switch (RW2.Condition) {
                case "Finish": {
                    const Reward = Target.Success
                    switch (RW2.Type) {
                        case "Item": {
                            const Item = this.convertAssortArr(RW2.Items)
                            var WeaponReward = this.convertWeaponAssortToReward(Item)
                            Reward.push({
                                "findInRaid": true,
                                "id": `${Name}RW`,
                                "type": "Item",
                                "index": Reward.length,
                                "target": `${WeaponReward[0]._id}`,
                                "items": WeaponReward,
                                "value": RW2.Count.toString()
                            })
                        }
                            break;
                        case "Assort": {
                            const RW2 = RW[r]
                            const Item = this.convertAssortArr(RW2.Items)
                            const ID = Item[0]._id
                            const AssortData = this.databaseServer.getTables().traders[this.getTraderIDFromMap(RW2.Trader)].assort
                            const TraderData = this.databaseServer.getTables().traders[this.getTraderIDFromMap(RW2.Trader)]
                            for (var i = 0; i < Item.length; i++) {
                                AssortData.items.push(Item[i])
                            }
                            AssortData.barter_scheme[ID] = [[]]
                            for (let br in RW2.Barter) {
                                AssortData.barter_scheme[ID][0].push({
                                    "count": RW2.Barter[br],
                                    "_tpl": this.getID(br)
                                })
                            }
                            AssortData.loyal_level_items[ID] = RW2.LLR
                            if (RW2.isLock == true) {
                                if (RW2.isWeapon == true) {
                                    var WeaponReward = this.convertWeaponAssortToReward(Item)
                                    Reward.push({
                                        "id": `${Name}RW`,
                                        "type": "AssortmentUnlock",
                                        "index": Reward.length,
                                        "target": `${WeaponReward[0]._id}`,
                                        "items": WeaponReward,
                                        "loyaltyLevel": RW2.LLR,
                                        "traderId": this.getTraderIDFromMap(RW2.Trader)
                                    })
                                }
                                else {
                                    Reward.push({
                                        "id": `${Name}RW`,
                                        "type": "AssortmentUnlock",
                                        "index": Reward.length,
                                        "target": `${Name}RW1`,
                                        "items": [
                                            {
                                                "_id": `${Name}RW1`,
                                                "_tpl": Item[0]._tpl
                                            }
                                        ],
                                        "loyaltyLevel": RW2.LLR,
                                        "traderId": this.getTraderIDFromMap(RW2.Trader)
                                    })
                                }

                            }
                        }
                            break;
                        case "Exp": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "type": "Experience",
                                "value": RW2.Count
                            })
                        }
                            break;
                        case "Trust": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "type": "TraderStanding",
                                "target": this.getTraderIDFromMap(RW2.TraderID),
                                "value": RW2.Count
                            })
                        }
                            break;
                        case "Skill": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "type": "Skill",
                                "target": RW2.Skill,
                                "value": RW2.Count
                            })
                        }
                            break;
                        case "Trader": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "target": RW2.Trader,
                                "type": "TraderUnlock"
                            })
                        }
                            break;
                    }
                }
                    break;
                case "Start": {
                    const Reward = Target.Started
                    switch (RW2.Type) {
                        case "Item": {
                            const Item = this.convertAssortArr(RW2.Items)
                            var WeaponReward = this.convertWeaponAssortToReward(Item)
                            Reward.push({
                                "findInRaid": true,
                                "id": `${Name}RW`,
                                "type": "Item",
                                "index": Reward.length,
                                "target": `${WeaponReward[0]._id}`,
                                "items": WeaponReward,
                                "value": RW2.Count.toString()
                            })
                        }
                            break;
                        case "Assort": {
                            const RW2 = RW[r]
                            const Item = this.convertAssortArr(RW2.Items)
                            const ID = Item[0]._id
                            const AssortData = this.databaseServer.getTables().traders[this.getTraderIDFromMap(RW2.Trader)].assort
                            const TraderData = this.databaseServer.getTables().traders[this.getTraderIDFromMap(RW2.Trader)]
                            for (var i = 0; i < Item.length; i++) {
                                AssortData.items.push(Item[i])
                            }
                            AssortData.barter_scheme[ID] = [[]]
                            for (let br in RW2.Barter) {
                                AssortData.barter_scheme[ID][0].push({
                                    "count": RW2.Barter[br],
                                    "_tpl": this.getID(br)
                                })
                            }
                            AssortData.loyal_level_items[ID] = RW2.LLR
                            if (RW2.isLock == true) {
                                if (RW2.isWeapon == true) {
                                    var WeaponReward = this.convertWeaponAssortToReward(Item)
                                    Reward.push({
                                        "id": `${Name}RW`,
                                        "type": "AssortmentUnlock",
                                        "index": Reward.length,
                                        "target": `${WeaponReward[0]._id}`,
                                        "items": WeaponReward,
                                        "loyaltyLevel": RW2.LLR,
                                        "traderId": this.getTraderIDFromMap(RW2.Trader)
                                    })
                                }
                                else {
                                    Reward.push({
                                        "id": `${Name}RW`,
                                        "type": "AssortmentUnlock",
                                        "index": Reward.length,
                                        "target": `${Name}RW1`,
                                        "items": [
                                            {
                                                "_id": `${Name}RW1`,
                                                "_tpl": Item[0]._tpl
                                            }
                                        ],
                                        "loyaltyLevel": RW2.LLR,
                                        "traderId": this.getTraderIDFromMap(RW2.Trader)
                                    })
                                }

                            }
                        }
                            break;
                        case "Exp": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "type": "Experience",
                                "value": RW2.Count
                            })
                        }
                            break;
                        case "Trust": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "type": "TraderStanding",
                                "target": this.getTraderIDFromMap(RW2.TraderID),
                                "value": RW2.Count
                            })
                        }
                            break;
                        case "Skill": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "type": "Skill",
                                "target": RW2.Skill,
                                "value": RW2.Count
                            })
                        }
                            break;
                        case "Trader": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "target": RW2.Trader,
                                "type": "TraderUnlock"
                            })
                        }
                            break;
                    }
                }
                    break;
                case "Failed": {
                    const Reward = Target.Fail
                    switch (RW2.Type) {
                        case "Item": {
                            const Item = this.convertAssortArr(RW2.Items)
                            var WeaponReward = this.convertWeaponAssortToReward(Item)
                            Reward.push({
                                "findInRaid": true,
                                "id": `${Name}RW`,
                                "type": "Item",
                                "index": Reward.length,
                                "target": `${WeaponReward[0]._id}`,
                                "items": WeaponReward,
                                "value": RW2.Count.toString()
                            })
                        }
                            break;
                        case "Assort": {
                            const RW2 = RW[r]
                            const Item = this.convertAssortArr(RW2.Items)
                            const ID = Item[0]._id
                            const AssortData = this.databaseServer.getTables().traders[this.getTraderIDFromMap(RW2.Trader)].assort
                            const TraderData = this.databaseServer.getTables().traders[this.getTraderIDFromMap(RW2.Trader)]
                            for (var i = 0; i < Item.length; i++) {
                                AssortData.items.push(Item[i])
                            }
                            AssortData.barter_scheme[ID] = [[]]
                            for (let br in RW2.Barter) {
                                AssortData.barter_scheme[ID][0].push({
                                    "count": RW2.Barter[br],
                                    "_tpl": this.getID(br)
                                })
                            }
                            AssortData.loyal_level_items[ID] = RW2.LLR
                            if (RW2.isLock == true) {
                                if (RW2.isWeapon == true) {
                                    var WeaponReward = this.convertWeaponAssortToReward(Item)
                                    Reward.push({
                                        "id": `${Name}RW`,
                                        "type": "AssortmentUnlock",
                                        "index": Reward.length,
                                        "target": `${WeaponReward[0]._id}`,
                                        "items": WeaponReward,
                                        "loyaltyLevel": RW2.LLR,
                                        "traderId": this.getTraderIDFromMap(RW2.Trader)
                                    })
                                }
                                else {
                                    Reward.push({
                                        "id": `${Name}RW`,
                                        "type": "AssortmentUnlock",
                                        "index": Reward.length,
                                        "target": `${Name}RW1`,
                                        "items": [
                                            {
                                                "_id": `${Name}RW1`,
                                                "_tpl": Item[0]._tpl
                                            }
                                        ],
                                        "loyaltyLevel": RW2.LLR,
                                        "traderId": this.getTraderIDFromMap(RW2.Trader)
                                    })
                                }

                            }
                        }
                            break;
                        case "Exp": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "type": "Experience",
                                "value": RW2.Count
                            })
                        }
                            break;
                        case "Trust": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "type": "TraderStanding",
                                "target": this.getTraderIDFromMap(RW2.TraderID),
                                "value": RW2.Count
                            })
                        }
                            break;
                        case "Skill": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "type": "Skill",
                                "target": RW2.Skill,
                                "value": RW2.Count
                            })
                        }
                            break;
                        case "Trader": {
                            Reward.push({
                                "id": `${Name}RW`,
                                "index": Reward.length,
                                "target": RW2.Trader,
                                "type": "TraderUnlock"
                            })
                        }
                            break;
                    }
                }
                    break;


            }
            Target.Success = this.indexArray(Target.Success)
            Target.Started = this.indexArray(Target.Started)
            Target.Fail = this.indexArray(Target.Fail)
        }
    }
    public initQuestCondDaily(Conditions, Target) {
        var Q = Conditions
        var Start = Q.Start
        var Finish = Q.Finish
        var Fail = Q.Fail
        const Quest = Target
        if (Start.Override == true) {
            Quest.conditions.AvailableForStart = []
        }
        if (Finish.Override == true) {
            Quest.conditions.AvailableForFinish = []
        }
        const QStart = Quest.conditions.AvailableForStart
        const QFinish = Quest.conditions.AvailableForFinish
        const QFail = Quest.conditions.Fail
        const dailylocalecache = {

        }
        if (Start.Data.length > 0) {
            for (var i = 0; i < Start.Data.length; i++) {
                var Data = Start.Data[i]
                switch (Data.type) {
                    case "Quest": {
                        QStart.push({
                            "availableAfter": 0,
                            "conditionType": "Quest",
                            "dispersion": 0,
                            "dynamicLocale": false,
                            "globalQuestCounterId": "",
                            "id": Data.id,
                            "index": i,
                            "parentId": "",
                            "status": Data.status,
                            "target": Data.questid,
                            "visibilityConditions": []
                        })
                    }
                        break;
                    case "Level": {
                        QStart.push({
                            "compareMethod": ">=",
                            "conditionType": "Level",
                            "dynamicLocale": false,
                            "globalQuestCounterId": "",
                            "id": Data.id,
                            "index": i,
                            "parentId": "",
                            "value": Data.count,
                            "visibilityConditions": []
                        })
                    }
                        break;
                    case "Trust": {
                        QStart.push({
                            "compareMethod": ">=",
                            "conditionType": "TraderLoyalty",
                            "dynamicLocale": false,
                            "globalQuestCounterId": "",
                            "id": Data.id,
                            "index": i,
                            "parentId": "",
                            "target": Data.trader,
                            "value": Data.count,
                            "visibilityConditions": []
                        })
                    }
                        break;
                }
            }
        }
        if (Finish.Data.length > 0) {
            for (var i = 0; i < Finish.Data.length; i++) {
                var Data = Finish.Data[i]
                var localekey = Data.locale
                this.databaseServer.getTables().locales.global.ch[localekey] = Data.locale
                this.databaseServer.getTables().locales.global.en[localekey] = Data.enlocale
                switch (Data.type) {
                    case "Find": {
                        QFinish.push({
                            "conditionType": "FindItem",
                            "countInRaid": false,
                            "dogtagLevel": 0,
                            "dynamicLocale": false,
                            "globalQuestCounterId": "",
                            "id": localekey,
                            "index": i,
                            "isEncoded": false,
                            "maxDurability": 100,
                            "minDurability": 0,
                            "onlyFoundInRaid": Data.inraid,
                            "parentId": "",
                            "target": [
                                Data.itemid
                            ],
                            "value": Data.count,
                            "visibilityConditions": []
                        })
                    }
                        break;
                    case "Hand": {
                        QFinish.push({
                            "conditionType": "HandoverItem",
                            "dogtagLevel": 0,
                            "dynamicLocale": false,
                            "globalQuestCounterId": "",
                            "id": localekey,
                            "index": i,
                            "isEncoded": false,
                            "maxDurability": 100,
                            "minDurability": 0,
                            "onlyFoundInRaid": Data.inraid,
                            "parentId": "",
                            "target": [
                                Data.itemid
                            ],
                            "value": Data.count,
                            "visibilityConditions": []
                        })
                    }
                        break;
                    case "HandGroup": {
                        QFinish.push({
                            "conditionType": "HandoverItem",
                            "dogtagLevel": 0,
                            "dynamicLocale": false,
                            "globalQuestCounterId": "",
                            "id": localekey,
                            "index": i,
                            "isEncoded": false,
                            "maxDurability": 100,
                            "minDurability": 0,
                            "onlyFoundInRaid": Data.inraid,
                            "parentId": "",
                            "target": Data.itemid,
                            "value": Data.count,
                            "visibilityConditions": []
                        })
                    }
                        break;
                    case "Kill": {
                        QFinish.push({
                            "completeInSeconds": 0,
                            "conditionType": "CounterCreator",
                            "counter": {
                                "conditions": [],
                                "id": `${localekey}指示器`
                            },
                            "doNotResetIfCounterCompleted": false,
                            "dynamicLocale": false,
                            "globalQuestCounterId": "",
                            "id": localekey,
                            "index": i,
                            "oneSessionOnly": Data.oneraid,
                            "parentId": "",
                            "type": "Elimination",
                            "value": Data.count,
                            "visibilityConditions": []
                        })
                        QFinish[QFinish.length - 1].counter.conditions.push({
                            "bodyPart": [],
                            "compareMethod": ">=",
                            "conditionType": "Kills",
                            "daytime": {
                                "from": Data.daytime[0],
                                "to": Data.daytime[1]
                            },
                            "distance": {
                                "compareMethod": Data.distancetype,
                                "value": Data.distance
                            },
                            "dynamicLocale": false,
                            "enemyEquipmentExclusive": [],
                            "enemyEquipmentInclusive": [],
                            "enemyHealthEffects": [],
                            "id": `${localekey}指示器条件`,
                            "resetOnSessionEnd": false,
                            "savageRole": Data.role,
                            "target": Data.bot,
                            "value": 1,
                            "weapon": Data.weapon,
                            "weaponCaliber": [],
                            "weaponModsExclusive": [],
                            "weaponModsInclusive": []
                        })
                        if (Data.location.length > 0) {
                            QFinish[QFinish.length - 1].counter.conditions.push({
                                "conditionType": "Location",
                                "dynamicLocale": false,
                                "id": `${localekey}_地图需求`,
                                "target": Data.location
                            })
                        }
                        if (Data.zone.length > 0) {
                            QFinish[QFinish.length - 1].counter.conditions.push({
                                "conditionType": "InZone",
                                "dynamicLocale": false,
                                "id": `${localekey}_地点需求`,
                                "zoneIds": Data.zone
                            })
                        }
                        if (Data.Equip.length > 0) {
                            for (var j = 0; j < Data.Equip.length; j++) {

                                QFinish[QFinish.length - 1].counter.conditions.push({
                                    "IncludeNotEquippedItems": false,
                                    "conditionType": "Equipment",
                                    "dynamicLocale": false,
                                    "equipmentExclusive": [],
                                    "equipmentInclusive": [],
                                    "id": `${localekey}_装备需求${j}`
                                })
                                for (var k = 0; k < Data.Equip[j].length; k++) {
                                    QFinish[QFinish.length - 1].counter.conditions[QFinish[QFinish.length - 1].counter.conditions.length - 1].equipmentInclusive.push([
                                        Data.Equip[j][k]
                                    ])
                                }
                            }

                        }
                        if (Data.Mod.length > 0) {
                            for (var j = 0; j < Data.Mod.length; j++) {
                                QFinish[QFinish.length - 1].counter.conditions[0].weaponModsInclusive.push([
                                    Data.Mod[j]
                                ])
                            }
                        }
                    }
                        break;
                    case "Level": {
                        QFinish.push({
                            "conditionType": "Level",
                            "id": localekey,
                            "index": i,
                            "parentId": "",
                            "dynamicLocale": false,
                            "value": Data.count,
                            "compareMethod": ">=",
                            "visibilityConditions": [],
                            "isEncoded": false,
                            "countInRaid": false,
                            "globalQuestCounterId": "",
                            "target": ""
                        })
                    }
                        break;
                    case "Visit": {
                        QFinish.push({
                            "completeInSeconds": 0,
                            "conditionType": "CounterCreator",
                            "counter": {
                                "conditions": [
                                    {
                                        "conditionType": "VisitPlace",
                                        "dynamicLocale": false,
                                        "id": `${localekey}指示器目标`,
                                        "target": Data.zoneid,
                                        "value": 1
                                    }
                                ],
                                "id": `${localekey}指示器`
                            },
                            "doNotResetIfCounterCompleted": false,
                            "dynamicLocale": false,
                            "globalQuestCounterId": "",
                            "id": localekey,
                            "index": i,
                            "oneSessionOnly": Data.oneraid,
                            "parentId": "",
                            "type": "Exploration",
                            "value": 1,
                            "visibilityConditions": []
                        })
                    }
                        break;
                    case "Leave": {
                        QFinish.push({
                            "conditionType": "LeaveItemAtLocation",
                            "dogtagLevel": 0,
                            "dynamicLocale": false,
                            "globalQuestCounterId": "",
                            "id": localekey,
                            "index": i,
                            "isEncoded": false,
                            "maxDurability": 100,
                            "minDurability": 0,
                            "onlyFoundInRaid": false,
                            "parentId": "",
                            "plantTime": Data.time,
                            "target": [
                                Data.itemid
                            ],
                            "value": Data.count,
                            "visibilityConditions": [],
                            "zoneId": Data.zoneid
                        })
                    }
                        break;
                    case "Extract": {
                        QFinish.push({
                            "completeInSeconds": 0,
                            "conditionType": "CounterCreator",
                            "counter": {
                                "conditions": [
                                    {
                                        "conditionType": "Location",
                                        "dynamicLocale": false,
                                        "id": `${localekey}指示器_Location`,
                                        "target": Data.location
                                    },
                                    {
                                        "conditionType": "ExitStatus",
                                        "dynamicLocale": false,
                                        "id": `${localekey}指示器_ExitStatus`,
                                        "status": Data.status
                                    }
                                ],
                                "id": `${localekey}指示器`
                            },
                            "doNotResetIfCounterCompleted": false,
                            "dynamicLocale": false,
                            "globalQuestCounterId": "",
                            "id": localekey,
                            "index": 0,
                            "oneSessionOnly": Data.oneraid,
                            "parentId": "",
                            "type": "Exploration",
                            "value": Data.count,
                            "visibilityConditions": []
                        })
                        if (Data.chosenextractpoint == true) {
                            QFinish[QFinish.length - 1].counter.conditions.push({
                                "conditionType": "ExitName",
                                "dynamicLocale": false,
                                "exitName": Data.extractpoint,
                                "id": `${localekey}指示器_ExitName`
                            })
                        }
                    }
                        break;
                    case "Skill": {
                        QFinish.push({
                            "compareMethod": ">=",
                            "conditionType": "Skill",
                            "dynamicLocale": false,
                            "globalQuestCounterId": "",
                            "id": localekey,
                            "index": 0,
                            "parentId": "",
                            "target": Data.skill,
                            "value": Data.count,
                            "visibilityConditions": []
                        })
                    }
                }
            }
        }
        if (Fail.Data.length > 0) {

            for (var i = 0; i < Fail.Data.length; i++) {
                var Data = Fail.Data[i]
                switch (Data.type) {
                    case "Kill": {
                        QFail.push({
                            "completeInSeconds": 0,
                            "conditionType": "CounterCreator",
                            "counter": {
                                "conditions": [],
                                "id": `${Data.id}指示器`
                            },
                            "doNotResetIfCounterCompleted": false,
                            "dynamicLocale": false,
                            "globalQuestCounterId": "",
                            "id": Data.id,
                            "index": i,
                            "oneSessionOnly": Data.oneraid,
                            "parentId": "",
                            "type": "Elimination",
                            "value": Data.count,
                            "visibilityConditions": []
                        })
                        QFail[QFail.length - 1].counter.conditions.push({
                            "bodyPart": [],
                            "compareMethod": ">=",
                            "conditionType": "Kills",
                            "daytime": {
                                "from": Data.daytime[0],
                                "to": Data.daytime[1]
                            },
                            "distance": {
                                "compareMethod": Data.distancetype,
                                "value": Data.distance
                            },
                            "dynamicLocale": false,
                            "enemyEquipmentExclusive": [],
                            "enemyEquipmentInclusive": [],
                            "enemyHealthEffects": [],
                            "id": `${Data.id}指示器条件`,
                            "resetOnSessionEnd": false,
                            "savageRole": Data.role,
                            "target": Data.bot,
                            "value": 1,
                            "weapon": Data.weapon,
                            "weaponCaliber": [],
                            "weaponModsExclusive": [],
                            "weaponModsInclusive": []
                        })
                        if (Data.location.length > 0) {
                            QFail[QFail.length - 1].counter.conditions.push({
                                "conditionType": "Location",
                                "dynamicLocale": false,
                                "id": `${Data.id}_地图需求`,
                                "target": Data.location
                            })
                        }
                        if (Data.zone.length > 0) {
                            QFail[QFail.length - 1].counter.conditions.push({
                                "conditionType": "InZone",
                                "dynamicLocale": false,
                                "id": `${Data.id}_地点需求`,
                                "zoneIds": Data.zone
                            })
                        }
                        if (Data.Equip.length > 0) {
                            for (var j = 0; j < Data.Equip.length; j++) {

                                QFail[QFail.length - 1].counter.conditions.push({
                                    "IncludeNotEquippedItems": false,
                                    "conditionType": "Equipment",
                                    "dynamicLocale": false,
                                    "equipmentExclusive": [],
                                    "equipmentInclusive": [],
                                    "id": `${Data.id}_装备需求${j}`
                                })
                                for (var k = 0; k < Data.Equip[j].length; k++) {
                                    QFail[QFail.length - 1].counter.conditions[QFail[QFail.length - 1].counter.conditions.length - 1].equipmentInclusive.push([
                                        Data.Equip[j][k]
                                    ])
                                }
                            }

                        }
                        if (Data.Mod.length > 0) {
                            for (var j = 0; j < Data.Mod.length; j++) {
                                QFail[QFail.length - 1].counter.conditions[0].weaponModsInclusive.push([
                                    Data.Mod[j]
                                ])
                            }
                        }
                    }
                        break;
                    case "Level": {
                        QFail.push({
                            "conditionType": "Level",
                            "id": Data.id,
                            "index": i,
                            "parentId": "",
                            "dynamicLocale": false,
                            "value": Data.count,
                            "compareMethod": ">=",
                            "visibilityConditions": [],
                            "isEncoded": false,
                            "countInRaid": false,
                            "globalQuestCounterId": "",
                            "target": ""
                        })
                    }
                        break;
                    case "Visit": {
                        QFail.push({
                            "completeInSeconds": 0,
                            "conditionType": "CounterCreator",
                            "counter": {
                                "conditions": [
                                    {
                                        "conditionType": "VisitPlace",
                                        "dynamicLocale": false,
                                        "id": `${Data.id}`,
                                        "target": Data.zoneid,
                                        "value": 1
                                    }
                                ],
                                "id": `${Data.id}指示器`
                            },
                            "doNotResetIfCounterCompleted": false,
                            "dynamicLocale": false,
                            "globalQuestCounterId": "",
                            "id": Data.id,
                            "index": i,
                            "oneSessionOnly": Data.oneraid,
                            "parentId": "",
                            "type": "Exploration",
                            "value": 1,
                            "visibilityConditions": []
                        })
                    }
                        break;
                    case "Extract": {
                        QFail.push({
                            "completeInSeconds": 0,
                            "conditionType": "CounterCreator",
                            "counter": {
                                "conditions": [
                                    {
                                        "conditionType": "Location",
                                        "dynamicLocale": false,
                                        "id": `${Data.id}指示器_Location`,
                                        "target": Data.location
                                    },
                                    {
                                        "conditionType": "ExitStatus",
                                        "dynamicLocale": false,
                                        "id": `${Data.id}指示器_ExitStatus`,
                                        "status": Data.status
                                    }
                                ],
                                "id": `${Data.id}指示器`
                            },
                            "doNotResetIfCounterCompleted": false,
                            "dynamicLocale": false,
                            "globalQuestCounterId": "",
                            "id": Data.id,
                            "index": 0,
                            "oneSessionOnly": Data.oneraid,
                            "parentId": "",
                            "type": "Exploration",
                            "value": Data.count,
                            "visibilityConditions": []
                        })
                        if (Data.chosenextractpoint == true) {
                            QFail[QFail.length - 1].counter.conditions.push({
                                "conditionType": "ExitName",
                                "dynamicLocale": false,
                                "exitName": Data.extractpoint,
                                "id": `${Data.id}指示器_ExitName`
                            })
                        }
                    }
                        break;
                    case "Quest": {
                        QFail.push({
                            "availableAfter": 0,
                            "conditionType": "Quest",
                            "dispersion": 0,
                            "dynamicLocale": false,
                            "globalQuestCounterId": "",
                            "id": Data.id,
                            "index": i,
                            "parentId": "",
                            "status": Data.status,
                            "target": Data.questid,
                            "visibilityConditions": []
                        })
                    }
                }
            }
        }
    }
    public convertCustomPreset(PresetArr, count) {
        const result = []
        var hashparm = `${count}_${performance.now()}`
        result.push({
            "_id": this.generateHash(`${PresetArr[0]._id}_${hashparm}`),
            "_tpl": PresetArr[0]._tpl,
            "upd": {
                "FireMode": {
                    "FireMode": "single"
                },
                "Repairable": {
                    "Durability": 100,
                    "MaxDurability": 100
                }
            }
        })
        for (var i = 1; i < PresetArr.length; i++) {
            result.push({
                "_id": this.generateHash(`${PresetArr[i]._id}_${hashparm}`),
                "_tpl": PresetArr[i]._tpl,
                "parentId": this.generateHash(`${PresetArr[i].parentId}_${hashparm}`),
                "slotId": PresetArr[i].slotId
            })
        }
        return result
    }
    public convertItemList(item, count) {
        return [
            {
                "_id": this.generateHash(`${item.name}_${count}_${performance.now()}`),
                "_tpl": item.itemid,
                "upd": {
                    "StackObjectsCount": item.stackcount
                }
            }
        ]
    }
    public convertVanillaPreset(itemid, count) {
        const result = []
        var hashparm = `${count}_${performance.now()}`
        var VanillaPreset = this.databaseServer.getTables().globals.ItemPresets
        var PresetArr = []
        for (let p in VanillaPreset) {
            if (VanillaPreset[p]._encyclopedia == itemid) {
                PresetArr = this.deepCopy(VanillaPreset[p]._items)
            }
        }
        if (PresetArr.length > 0) {
            result.push({
                "_id": this.generateHash(`${PresetArr[0]._id}_${hashparm}`),
                "_tpl": PresetArr[0]._tpl,
                "upd": {
                    "FireMode": {
                        "FireMode": "single"
                    },
                    "Repairable": {
                        "Durability": 100,
                        "MaxDurability": 100
                    }
                }
            })
            for (var i = 1; i < PresetArr.length; i++) {
                result.push({
                    "_id": this.generateHash(`${PresetArr[i]._id}_${hashparm}`),
                    "_tpl": PresetArr[i]._tpl,
                    "parentId": this.generateHash(`${PresetArr[i].parentId}_${hashparm}`),
                    "slotId": PresetArr[i].slotId
                })
            }
        }
        else {
            result.push({
                "_id": this.generateHash(`${itemid}_${count}_${performance.now()}`),
                "_tpl": itemid
            })
            this.Warn(`警告: 未发现有效预设, 生成失败。\n物品: ${itemid} ${this.getItemLocaleData(itemid, "ch")?.Name}`)
        }
        return result
    }
    public convertAmmoBox(itemid, count) {
        //妈的为什么弹药盒没有预设啊, 好几把烦....
        //搞完这个是不是就没了
        //信号棒有必要么
        //我觉得没有
        //作为头奖太超模了, 而且没做完任务有信号棒好像也不能进新区
        //而且不能重编码
        const result = []
        const Item = this.getItem(itemid)
        if (Item) {
            const fatherid = this.generateHash(`${itemid}_${count}_${performance.now()}`)
            result.push({
                "_id": fatherid,
                "_tpl": itemid
            })
            result.push({
                "_id": this.generateHash(`${Item._props.StackSlots[0]._props.filters[0].Filter[0]}_${count}_${performance.now()}`),
                "_tpl": Item._props.StackSlots[0]._props.filters[0].Filter[0],
                //敲里吗, 我ID写错了
                "parentId": fatherid,
                "slotId": "cartridges",
                "upd": {
                    "StackObjectsCount": Item._props.StackSlots[0]._max_count
                }
                //敲里吗有堆叠, 草

            })
            return result
        }
        else {
            this.Warn(`警告: 物品解析失败。物品ID: ${itemid}`)
            return
        }
    }
    public getGiftItemByType(itemdata, count) {
        if(Array.isArray(itemdata)){
            //this.Log("数组")
            //this.Log(JSON.stringify(itemdata, null, 4))
            var array = []
            for(var i = 0; i < itemdata.length; i++){
                switch (itemdata[i].type) {
                    case "CustomPreset": {
                        //this.Log("武器")
                        //this.Log(itemdata[i].item)
                        array.push(this.convertCustomPreset(itemdata[i].item, count))
                    }
                    break;
                    case "VanillaPreset": {
                        //this.Log("原版武器")
                        //this.Log(itemdata[i].item)
                        array.push(this.convertVanillaPreset(itemdata[i].item, count))
                    }
                    break;
                    case "Item": {
                        //this.Log("物品")
                        //this.Log(itemdata[i].itemid)
                        array.push(this.convertItemList(itemdata[i], count))
                    }
                    break;
                    case "AmmoBox": {
                        //this.Log("弹药盒")
                        //this.Log(itemdata[i].itemid)
                        array.push(this.convertAmmoBox(itemdata[i].itemid, count))
                    }
                    break;
                }
            }
            return array
        }
        else{
            switch (itemdata.type) {
                case "CustomPreset": {
                    return this.convertCustomPreset(itemdata.item, count)
                }
                case "VanillaPreset": {
                    return this.convertVanillaPreset(itemdata.item, count)
                }
                case "Item": {
                    return this.convertItemList(itemdata, count)
                }
                case "AmmoBox": {
                    return this.convertAmmoBox(itemdata.itemid, count)
                }
                default: {
                    this.Warn(`警告: 无法解析物品类型 物品ID: ${itemdata.itemid}`)
                }
            }
        }
        
    }
    public drawFromArray(array) {
        if (array.length === 0) {
            throw new Error('数组为空');
        }
        const randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    }
    public initGiftData(giftdata) {
        if (!this.databaseServer.getTables().globals.GiftData) {
            this.databaseServer.getTables().globals.GiftData = {}
        }
        for (let i in giftdata) {
            this.databaseServer.getTables().globals.GiftData[i] = giftdata[i]
        }
    }
    public getGiftData(datastring) {
        return this.databaseServer.getTables().globals.GiftData[datastring]
    }


}