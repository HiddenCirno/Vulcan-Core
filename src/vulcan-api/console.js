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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VulcanConsole = void 0;
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const ILogger_1 = require("C:/snapshot/project/obj/models/spt/utils/ILogger");
const LogTextColor_1 = require("C:/snapshot/project/obj/models/spt/logging/LogTextColor");
let VulcanConsole = class VulcanConsole {
    constructor(logger) {
        this.logger = logger;
    }
    Log(string) {
        this.logger.logWithColor(`[控制台信息]: ${string}`, LogTextColor_1.LogTextColor.CYAN);
    }
    Access(string) {
        this.logger.logWithColor(`[控制台信息]: ${string}`, LogTextColor_1.LogTextColor.GREEN);
    }
    Error(string) {
        this.logger.logWithColor(`[控制台信息]: ${string}`, LogTextColor_1.LogTextColor.RED);
    }
};
VulcanConsole = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("WinstonLogger")),
    __metadata("design:paramtypes", [typeof (_a = typeof ILogger_1.ILogger !== "undefined" && ILogger_1.ILogger) === "function" ? _a : Object])
], VulcanConsole);
exports.VulcanConsole = VulcanConsole;
