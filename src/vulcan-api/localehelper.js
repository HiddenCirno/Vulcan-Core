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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VulcanLocaleHelper = void 0;
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const ILogger_1 = require("C:/snapshot/project/obj/models/spt/utils/ILogger");
const DatabaseServer_1 = require("C:/snapshot/project/obj/servers/DatabaseServer");
let VulcanLocaleHelper = class VulcanLocaleHelper {
    constructor(logger, databaseServer, vfs, jsonUtil) {
        this.logger = logger;
        this.databaseServer = databaseServer;
        this.vfs = vfs;
        this.jsonUtil = jsonUtil;
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
};
VulcanLocaleHelper = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("WinstonLogger")),
    __param(1, (0, tsyringe_1.inject)("DatabaseServer")),
    __param(2, (0, tsyringe_1.inject)("VFS")),
    __param(3, (0, tsyringe_1.inject)("JsonUtil")),
    __metadata("design:paramtypes", [typeof (_a = typeof ILogger_1.ILogger !== "undefined" && ILogger_1.ILogger) === "function" ? _a : Object, typeof (_b = typeof DatabaseServer_1.DatabaseServer !== "undefined" && DatabaseServer_1.DatabaseServer) === "function" ? _b : Object, typeof (_c = typeof VFS !== "undefined" && VFS) === "function" ? _c : Object, typeof (_d = typeof JsonUtil !== "undefined" && JsonUtil) === "function" ? _d : Object])
], VulcanLocaleHelper);
exports.VulcanLocaleHelper = VulcanLocaleHelper;
