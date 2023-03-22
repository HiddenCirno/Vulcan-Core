"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const console_1 = require("./vulcan-api/console");
const itemedit_1 = require("./vulcan-api/itemedit");
const handbook_1 = require("./vulcan-api/handbook");
const localehelper_1 = require("./vulcan-api/localehelper");
const merchantOperate_1 = require("./vulcan-api/merchantOperate");
//
class Mod {
    preAkiLoad(inFuncContainer) {
        tsyringe_1.container.register("VulcanConsole", console_1.VulcanConsole, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        tsyringe_1.container.register("VulcanItemEditor", itemedit_1.VulcanItemEditor, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        tsyringe_1.container.register("VulcanHandBookHelper", handbook_1.VulcanHandBookHelper, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        tsyringe_1.container.register("VulcanLocaleHelper", localehelper_1.VulcanLocaleHelper, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        tsyringe_1.container.register("TraderAppMerchandise", merchantOperate_1.TraderAppMerchandise, { lifecycle: tsyringe_1.Lifecycle.Singleton });
    }
    postAkiLoad(inFuncContainer) {
    }
    postDBLoad(inFuncContainer) {
    }
}
module.exports = { mod: new Mod() };
