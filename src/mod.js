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
//const addTrader = new TraderOperateJsonOdj
//
class Mod {
    preAkiLoad(inFuncContainer) {
        tsyringe_1.container.register("VulcanConsole", console_1.VulcanConsole, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        tsyringe_1.container.register("VulcanItemEditor", itemedit_1.VulcanItemEditor, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        tsyringe_1.container.register("VulcanHandBookHelper", handbook_1.VulcanHandBookHelper, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        tsyringe_1.container.register("VulcanLocaleHelper", localehelper_1.VulcanLocaleHelper, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        tsyringe_1.container.register("TraderAppMerchandise", merchantOperate_1.TraderAppMerchandise, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        tsyringe_1.container.register("VulcanQuestHelper", questhelper_1.VulcanQuestHelper, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        tsyringe_1.container.register("VulcanMiscMethod", miscmethod_1.VulcanMiscMethod, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        tsyringe_1.container.register("VulcanTraderHelper", traderhelper_1.VulcanTraderHelper, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        //addTrader.addTraderPreAkiload(inFuncContainer,商人名字)
    }
    postAkiLoad(inFuncContainer) {
        //addTrader.addTraderPosrtDBLoad(inFuncContainer,/* SPT原版格式的assor.json */,/* BaseOdj直接接收SPT原版格式的base.json */,/* 商人名字(同上) */,/* questassort直接接收SPT原版格式的questassort,PS:也可以之后用其他办法添加 */)
    }
    postDBLoad(inFuncContainer) {
    }
}
module.exports = { mod: new Mod() };
