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
exports.VulcanQuestHelper = void 0;
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const ILogger_1 = require("C:/snapshot/project/obj/models/spt/utils/ILogger");
const DatabaseServer_1 = require("C:/snapshot/project/obj/servers/DatabaseServer");
const itemedit_1 = require("./itemedit");
const localehelper_1 = require("./localehelper");
let VulcanQuestHelper = class VulcanQuestHelper {
    constructor(logger, databaseServer, itemEditor, localehelper) {
        this.logger = logger;
        this.databaseServer = databaseServer;
        this.itemEditor = itemEditor;
        this.localehelper = localehelper;
    }
    //创建空白任务(使用copyItem方法拷贝信息并清空信息)
    //参数说明 questid: 创建的新任务的任务id; traderid: 任务所属的商人id; type: 任务显示的类型
    //返回一个任务对象
    createQuest(questid, traderid, type) {
        const db = this.databaseServer.getTables();
        const quest = db.templates.quests["5967733e86f774602332fc84"];
        var newquest = this.itemEditor.copyItem(quest);
        newquest.type = type;
        newquest.conditions.AvailableForFinish = [];
        newquest.rewards.Success = [];
        newquest.acceptPlayerMessage = `${questid} acceptPlayerMessage`;
        newquest.changeQuestMessageText = `${questid} changeQuestMessageText`;
        newquest.completePlayerMessage = `${questid} completePlayerMessage`;
        newquest.description = `${questid} description`;
        newquest.failMessageText = `${questid} failMessageText`;
        newquest.name = `${questid} name`;
        newquest.note = `${questid} note`;
        newquest.startedMessageText = `${questid} startedMessageText`;
        newquest.successMessageText = `${questid} successMessageText`;
        newquest.templateId = questid;
        newquest._id = questid;
        newquest.traderId = traderid;
        return newquest;
    }
    //将任务对象写入服务端数据库
    //参数说明 quest: 任务对象, 
    addQuest(quest) {
        const db = this.databaseServer.getTables();
        const questid = quest._id;
        db.templates.quests[questid] = quest;
    }
    //为任务创建完成需求
    createRequire(quest, requirement) {
        if (Array.isArray(requirement)) {
            for (var i = 0; i < requirement.length; i++) {
                quest.conditions.AvailableForFinish.push(requirement[i]);
            }
        }
        else {
            quest.conditions.AvailableForFinish.push(requirement);
        }
    }
    createHandover(requireid, itemid, count, isfoundinraid, autolocale) {
        const db = this.databaseServer.getTables();
        const locale = db.locales.global["ch"];
        if (autolocale == true) {
            if (isfoundinraid == true) {
                locale[requireid] = `上交在战局中找到的${this.localehelper.getzhItemName(this.itemEditor.getItem(itemid))}`;
            }
            else {
                locale[requireid] = `交付${this.localehelper.getzhItemName(this.itemEditor.getItem(itemid))}`;
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
        };
    }
    createFind(requireid, itemid, count, autolocale, autohandover) {
        const db = this.databaseServer.getTables();
        const locale = db.locales.global["ch"];
        if (autohandover == true) {
            if (autolocale == true) {
                locale[requireid] = `在战局中找到${this.localehelper.getzhItemName(this.itemEditor.getItem(itemid))}`;
                locale[`${requireid}handover`] = `上交在战局中找到的${this.localehelper.getzhItemName(this.itemEditor.getItem(itemid))}`;
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
            ];
        }
        else {
            if (autolocale == true) {
                locale[requireid] = `在战局中找到${this.localehelper.getzhItemName(this.itemEditor.getItem(itemid))}`;
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
            };
        }
    }
};
VulcanQuestHelper = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("WinstonLogger")),
    __param(1, (0, tsyringe_1.inject)("DatabaseServer")),
    __param(2, (0, tsyringe_1.inject)("VulcanItemEditor")),
    __param(3, (0, tsyringe_1.inject)("VulcanLocaleHelper")),
    __metadata("design:paramtypes", [typeof (_a = typeof ILogger_1.ILogger !== "undefined" && ILogger_1.ILogger) === "function" ? _a : Object, typeof (_b = typeof DatabaseServer_1.DatabaseServer !== "undefined" && DatabaseServer_1.DatabaseServer) === "function" ? _b : Object, typeof (_c = typeof itemedit_1.VulcanItemEditor !== "undefined" && itemedit_1.VulcanItemEditor) === "function" ? _c : Object, typeof (_d = typeof localehelper_1.VulcanLocaleHelper !== "undefined" && localehelper_1.VulcanLocaleHelper) === "function" ? _d : Object])
], VulcanQuestHelper);
exports.VulcanQuestHelper = VulcanQuestHelper;
