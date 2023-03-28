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
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VulcanTraderHelper = void 0;
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const ILogger_1 = require("C:/snapshot/project/obj/models/spt/utils/ILogger");
const DatabaseServer_1 = require("C:/snapshot/project/obj/servers/DatabaseServer");
const VFS_1 = require("C:/snapshot/project/obj/utils/VFS");
const miscmethod_1 = require("./miscmethod");
const ImageRouter_1 = require("C:/snapshot/project/obj/routers/ImageRouter");
const JsonUtil_1 = require("C:/snapshot/project/obj/utils/JsonUtil");
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
const ConfigServer_1 = require("C:/snapshot/project/obj/servers/ConfigServer");
let VulcanTraderHelper = class VulcanTraderHelper {
    constructor(logger, databaseServer, vfs, jsonUtil, miscMethod, imageRouter, configServer) {
        this.logger = logger;
        this.databaseServer = databaseServer;
        this.vfs = vfs;
        this.jsonUtil = jsonUtil;
        this.miscMethod = miscMethod;
        this.imageRouter = imageRouter;
        this.configServer = configServer;
    }
    createTrader(traderid, tradermoney, tradericondir) {
        const db = this.databaseServer.getTables();
        const trader = db.traders["5a7c2eca46aef81a7ca2145d"];
        const traderConfig = this.configServer.getConfig(ConfigTypes_1.ConfigTypes.TRADER);
        const traderTime = { traderId: traderid, seconds: 3600 };
        traderConfig.updateTime.push(traderTime);
        var newtrader = this.miscMethod.copyObject(trader);
        //this.imageRouter.addRoute(`/files/trader/avatar/${traderid}.png`, `${tradericondir}${traderid}.png`)
        //this.imageRouter.addRoute(newtrader.base.avatar.replace(".png", ""), `${tradericondir}${traderid}.png`);
        this.imageRouter.addRoute(`/files/trader/avatar/${traderid}`, `${tradericondir}${traderid}.png`);
        newtrader.base.avatar = `/files/trader/avatar/${traderid}.png`;
        newtrader.base.balance_dol = 7000000;
        newtrader.base.balance_eur = 7000000;
        newtrader.base.balance_rub = 7000000;
        newtrader.base.currency = tradermoney;
        newtrader.base._id = traderid;
        newtrader.base.items_buy.category = [];
        newtrader.base.items_buy.category.push("54009119af1c881c07000029");
        newtrader.questassort.started = {};
        newtrader.questassort.success = {};
        newtrader.assort.items = [];
        newtrader.assort.barter_scheme = {};
        newtrader.assort.loyal_level_items = {};
        return newtrader;
    }
    addTrader(trader) {
        const db = this.databaseServer.getTables();
        db.traders[trader.base._id] = trader;
    }
};
VulcanTraderHelper = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("WinstonLogger")),
    __param(1, (0, tsyringe_1.inject)("DatabaseServer")),
    __param(2, (0, tsyringe_1.inject)("VFS")),
    __param(3, (0, tsyringe_1.inject)("JsonUtil")),
    __param(4, (0, tsyringe_1.inject)("VulcanMiscMethod")),
    __param(5, (0, tsyringe_1.inject)("ImageRouter")),
    __param(6, (0, tsyringe_1.inject)("ConfigServer")),
    __metadata("design:paramtypes", [typeof (_a = typeof ILogger_1.ILogger !== "undefined" && ILogger_1.ILogger) === "function" ? _a : Object, typeof (_b = typeof DatabaseServer_1.DatabaseServer !== "undefined" && DatabaseServer_1.DatabaseServer) === "function" ? _b : Object, typeof (_c = typeof VFS_1.VFS !== "undefined" && VFS_1.VFS) === "function" ? _c : Object, typeof (_d = typeof JsonUtil_1.JsonUtil !== "undefined" && JsonUtil_1.JsonUtil) === "function" ? _d : Object, typeof (_e = typeof miscmethod_1.VulcanMiscMethod !== "undefined" && miscmethod_1.VulcanMiscMethod) === "function" ? _e : Object, typeof (_f = typeof ImageRouter_1.ImageRouter !== "undefined" && ImageRouter_1.ImageRouter) === "function" ? _f : Object, typeof (_g = typeof ConfigServer_1.ConfigServer !== "undefined" && ConfigServer_1.ConfigServer) === "function" ? _g : Object])
], VulcanTraderHelper);
exports.VulcanTraderHelper = VulcanTraderHelper;
