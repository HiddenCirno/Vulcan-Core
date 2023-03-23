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
exports.VulcanItemEditor = void 0;
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const ILogger_1 = require("C:/snapshot/project/obj/models/spt/utils/ILogger");
const ImporterUtil_1 = require("C:/snapshot/project/obj/utils/ImporterUtil");
const DatabaseServer_1 = require("C:/snapshot/project/obj/servers/DatabaseServer");
const handbook_1 = require("./handbook");
let VulcanItemEditor = class VulcanItemEditor {
    constructor(logger, importUtil, databaseServer, handbookHelper) {
        this.logger = logger;
        this.importUtil = importUtil;
        this.databaseServer = databaseServer;
        this.handbookHelper = handbookHelper;
    }
    copyItem(item) {
        if (typeof item !== 'object' || item === null) {
            return item; // 如果不是对象或者是 null，直接返回
        }
        let copy = Array.isArray(item) ? [] : {};
        for (let key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
                copy[key] = this.copyItem(item[key]); // 递归复制子成员
            }
        }
        return copy;
    }
    changeID(obj, oldId, newId) {
        for (let key in obj) {
            if (typeof obj[key] === 'object') {
                if (Array.isArray(obj[key])) {
                    for (let i = 0; i < obj[key].length; i++) {
                        this.changeID(obj[key][i], oldId, newId);
                    }
                }
                else {
                    this.changeID(obj[key], oldId, newId);
                }
            }
            else {
                if (obj[key] === oldId) {
                    obj[key] = newId;
                }
            }
        }
    }
    addItem(item) {
        const db = this.databaseServer.getTables();
        const itemid = item._id;
        db.templates.items[itemid] = item;
    }
    getItem(itemid) {
        const db = this.databaseServer.getTables();
        return db.templates.items[itemid];
    }
    testAssort(item, trader) {
        const db = this.databaseServer.getTables();
        const itemid = item._id;
        db.traders[trader].assort.items.push({
            "_id": itemid,
            "_tpl": itemid,
            "parentId": "hideout",
            "slotId": "hideout",
            "upd": {
                "StackObjectsCount": 99999,
                "UnlimitedCount": true
            }
        });
        db.traders[trader].assort.barter_scheme[itemid] = [[{
                    count: 1,
                    _tpl: '5449016a4bdc2d6f028b456f'
                }]];
        db.traders[trader].assort.loyal_level_items[itemid] = 1;
    }
};
VulcanItemEditor = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("WinstonLogger")),
    __param(1, (0, tsyringe_1.inject)("ImporterUtil")),
    __param(2, (0, tsyringe_1.inject)("DatabaseServer")),
    __param(3, (0, tsyringe_1.inject)("VulcanHandBookHelper")),
    __metadata("design:paramtypes", [typeof (_a = typeof ILogger_1.ILogger !== "undefined" && ILogger_1.ILogger) === "function" ? _a : Object, typeof (_b = typeof ImporterUtil_1.ImporterUtil !== "undefined" && ImporterUtil_1.ImporterUtil) === "function" ? _b : Object, typeof (_c = typeof DatabaseServer_1.DatabaseServer !== "undefined" && DatabaseServer_1.DatabaseServer) === "function" ? _c : Object, typeof (_d = typeof handbook_1.VulcanHandBookHelper !== "undefined" && handbook_1.VulcanHandBookHelper) === "function" ? _d : Object])
], VulcanItemEditor);
exports.VulcanItemEditor = VulcanItemEditor;
