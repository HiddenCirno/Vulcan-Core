"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VulcanDatabaseHelper = void 0;
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const ILogger_1 = require("C:/snapshot/project/obj/models/spt/utils/ILogger");
const DatabaseServer_1 = require("C:/snapshot/project/obj/servers/DatabaseServer");
const VFS_1 = require("C:/snapshot/project/obj/utils/VFS");
const JsonUtil_1 = require("C:/snapshot/project/obj/utils/JsonUtil");
const ImporterUtil_1 = require("C:/snapshot/project/obj/utils/ImporterUtil");
const console_1 = require("./console");
let VulcanDatabaseHelper = class VulcanDatabaseHelper {
    logger;
    databaseServer;
    vfs;
    jsonUtil;
    importerUtil;
    cs;
    constructor(logger, databaseServer, vfs, jsonUtil, importerUtil, cs) {
        this.logger = logger;
        this.databaseServer = databaseServer;
        this.vfs = vfs;
        this.jsonUtil = jsonUtil;
        this.importerUtil = importerUtil;
        this.cs = cs;
    }
    loadItem(itemJson) {
        const db = this.databaseServer.getTables();
        const locale = db.locales.global["ch"];
        const elocale = db.locales.global["en"];
        for (let i in itemJson) {
            const ItemData = itemJson[i];
            db.templates.items[i] = itemJson[i];
            locale[ItemData._id + " Name"] = ItemData._props.Name;
            locale[ItemData._id + " ShortName"] = ItemData._props.ShortName;
            locale[ItemData._id + " Description"] = ItemData._props.Description;
            if (ItemData._props.EName) {
                elocale[ItemData._id + " Name"] = ItemData._props.EName;
                elocale[ItemData._id + " ShortName"] = ItemData._props.EShortName;
                elocale[ItemData._id + " Description"] = ItemData._props.EDescription;
            }
            else {
                elocale[ItemData._id + " Name"] = ItemData._props.Name;
                elocale[ItemData._id + " ShortName"] = ItemData._props.ShortName;
                elocale[ItemData._id + " Description"] = ItemData._props.Description;
            }
            db.templates.handbook.Items.push({
                "Id": ItemData._id,
                "ParentId": ItemData._props.RagfairType,
                "Price": ItemData._props.DefaultPrice
            });
            this.cs.Log(`物品数据加载成功: ${ItemData._props.Name}`);
        }
    }
    setItemLocale(item, itemlocale, language) {
        const db = this.databaseServer.getTables();
        const locale = db.locales.global[language];
        const itemid = item._id;
        locale[`${itemid} Name`] = itemlocale.Name;
        locale[`${itemid} ShortName`] = itemlocale.Short;
        locale[`${itemid} Description`] = itemlocale.Desc;
    }
    setQuestLocale(quest, questlocale, language) {
        const db = this.databaseServer.getTables();
        const locale = db.locales.global[language];
        const questid = quest._id;
        locale[`${questid} name`] = questlocale.Name;
        locale[`${questid} description`] = questlocale.Desc;
        locale[`${questid} failMessageText`] = questlocale.Fail;
        locale[`${questid} successMessageText`] = questlocale.Success;
    }
    getLocaleFromFile(localeid, filedir) {
        const file = this.vfs.readFile(filedir);
        const filejson = this.jsonUtil.deserialize(file);
        var locale = filejson[localeid];
        return locale;
    }
    setKeyLocale(key, text, language) {
        const db = this.databaseServer.getTables();
        const locale = db.locales.global[language];
        locale[key] = text;
    }
    getLocaleText(key, language) {
        const db = this.databaseServer.getTables();
        const locale = db.locales.global[language];
        return locale[key];
    }
    getItemName(item, language) {
        const db = this.databaseServer.getTables();
        const locale = db.locales.global[language];
        const itemid = item._id;
        return locale[`${itemid} Name`];
    }
    getzhItemName(item) {
        const db = this.databaseServer.getTables();
        const locale = db.locales.global["ch"];
        const itemid = item._id;
        return locale[`${itemid} Name`];
    }
    setTraderLocale(trader, traderlocale, language) {
        const db = this.databaseServer.getTables();
        const traderid = trader.base._id;
        const locale = db.locales.global[language];
        locale[`${traderid} Nickname`] = traderlocale.NName;
        locale[`${traderid} FirstName`] = traderlocale.FName;
        locale[`${traderid} FullName`] = traderlocale.LName;
        locale[`${traderid} Location`] = traderlocale.Locate;
        locale[`${traderid} Description`] = traderlocale.Desc;
    }
};
exports.VulcanDatabaseHelper = VulcanDatabaseHelper;
exports.VulcanDatabaseHelper = VulcanDatabaseHelper = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("WinstonLogger")),
    __param(1, (0, tsyringe_1.inject)("DatabaseServer")),
    __param(2, (0, tsyringe_1.inject)("VFS")),
    __param(3, (0, tsyringe_1.inject)("JsonUtil")),
    __param(4, (0, tsyringe_1.inject)("ImporterUtil")),
    __param(5, (0, tsyringe_1.inject)("VulcanConsole")),
    __metadata("design:paramtypes", [typeof (_a = typeof ILogger_1.ILogger !== "undefined" && ILogger_1.ILogger) === "function" ? _a : Object, typeof (_b = typeof DatabaseServer_1.DatabaseServer !== "undefined" && DatabaseServer_1.DatabaseServer) === "function" ? _b : Object, typeof (_c = typeof VFS_1.VFS !== "undefined" && VFS_1.VFS) === "function" ? _c : Object, typeof (_d = typeof JsonUtil_1.JsonUtil !== "undefined" && JsonUtil_1.JsonUtil) === "function" ? _d : Object, typeof (_e = typeof ImporterUtil_1.ImporterUtil !== "undefined" && ImporterUtil_1.ImporterUtil) === "function" ? _e : Object, typeof (_f = typeof console_1.VulcanConsole !== "undefined" && console_1.VulcanConsole) === "function" ? _f : Object])
], VulcanDatabaseHelper);
//# sourceMappingURL=dbhelper.js.map