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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VulcanHandBookHelper = void 0;
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const ILogger_1 = require("C:/snapshot/project/obj/models/spt/utils/ILogger");
const DatabaseServer_1 = require("C:/snapshot/project/obj/servers/DatabaseServer");
let VulcanHandBookHelper = class VulcanHandBookHelper {
    constructor(logger, databaseServer) {
        this.logger = logger;
        this.databaseServer = databaseServer;
    }
    getPrice(item) {
        const handbook = this.databaseServer.getTables().templates.handbook;
        const price = this.databaseServer.getTables().templates.prices;
        const itemid = item._id;
        if (handbook.Items.some(item => item.Id == itemid)) {
            return handbook.Items.find(item => item.Id == itemid).Price;
        }
        else if (price[itemid] != undefined) {
            return price[itemid];
        }
        else {
            return 0;
        }
    }
    getTag(item) {
        const handbook = this.databaseServer.getTables().templates.handbook;
        const itemid = item._id;
        if (handbook.Items.some(item => item.Id == itemid)) {
            return handbook.Items.find(item => item.Id == itemid).ParentId;
        }
        else {
            return null;
        }
    }
    setHandbook(item, price, tag) {
        const handbook = this.databaseServer.getTables().templates.handbook.Items;
        const itemid = item._id;
        handbook.push({
            "Id": itemid,
            "ParentId": tag,
            "Price": price
        });
    }
    editPrice(item, price) {
        const handbook = this.databaseServer.getTables().templates.handbook;
        const itemid = item._id;
        handbook.Items.find(item => item.Id == itemid).Price = price;
    }
    editTag(item, tag) {
        const handbook = this.databaseServer.getTables().templates.handbook;
        const itemid = item._id;
        handbook.Items.find(item => item.Id == itemid).ParentId = tag;
    }
    editHandbook(item, price, tag) {
        const handbook = this.databaseServer.getTables().templates.handbook;
        const itemid = item._id;
        handbook.Items.find(item => item.Id == itemid).Price = price;
        handbook.Items.find(item => item.Id == itemid).ParentId = tag;
    }
};
VulcanHandBookHelper = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("WinstonLogger")),
    __param(1, (0, tsyringe_1.inject)("DatabaseServer")),
    __metadata("design:paramtypes", [typeof (_a = typeof ILogger_1.ILogger !== "undefined" && ILogger_1.ILogger) === "function" ? _a : Object, typeof (_b = typeof DatabaseServer_1.DatabaseServer !== "undefined" && DatabaseServer_1.DatabaseServer) === "function" ? _b : Object])
], VulcanHandBookHelper);
exports.VulcanHandBookHelper = VulcanHandBookHelper;
