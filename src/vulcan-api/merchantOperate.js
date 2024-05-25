"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraderAppMerchandise = exports.traderOperateJsonOdj = void 0;
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
class traderOperateJsonOdj {
    //直接接收原版格式的json，并指定商人售卖
    addTraderAssort(container, jsonAssortOdj, trader) {
        const dbs = container.resolve("DatabaseServer");
        const db = dbs.getTables();
        for (const item of jsonAssortOdj.items) {
            db.traders[trader].assort.items.push(item);
        }
        for (const barterScheme in jsonAssortOdj.barter_scheme) {
            db.traders[trader].assort.barter_scheme[barterScheme] = jsonAssortOdj.barter_scheme[barterScheme];
        }
        for (const loyalLevelItems in jsonAssortOdj.loyal_level_items) {
            db.traders[trader].assort.loyal_level_items[loyalLevelItems] = jsonAssortOdj.loyal_level_items;
        }
    }
    //载入图片，加入商人刷新时间
    addTraderPreAkiload(container, modTraderName) {
        //载入图片
        const imageRouter = container.resolve("ImageRouter");
        imageRouter.addRoute(`/files/trader/avatar/${modTraderName}`, `picture/traderAvatar/${modTraderName}`);
        //商人刷新时间
        const configServer = container.resolve("ConfigServer");
        const traderConfig = configServer.getConfig(ConfigTypes_1.ConfigTypes.TRADER);
        const traderTime = { traderId: modTraderName, seconds: 3600 };
        traderConfig.updateTime.push(traderTime);
    }
    //jsonAssortOdj:直接接收SPT原版格式的assor.json,jsonBaseOdj直接接收SPT原版格式的base.json,modTraderName:添加商人的名字|ID,questassort直接接收SPT原版格式的questassort,PS:也可以之后用其他办法添加
    addTraderPosrtDBLoad(container, jsonAssortOdj, jsonBaseOdj, modTraderName, questassort = { started: {}, success: {}, fail: {} }) {
        const jsonUtil = container.resolve("JsonUtil");
        const dbs = container.resolve("DatabaseServer");
        const db = dbs.getTables();
        this.addTraderAssort(container, jsonAssortOdj, modTraderName);
        db.traders[modTraderName].base = jsonUtil.deserialize(jsonUtil.serialize(jsonBaseOdj));
        db.traders[modTraderName].questassort = questassort;
        db.traders[modTraderName].questassort = questassort;
    }
}
exports.traderOperateJsonOdj = traderOperateJsonOdj;
class TraderAppMerchandise {
    items;
    barter_scheme;
    loyal_level_items;
    //itemID: 你要卖的东西的ID  ,count:交换品要的个数   ,shoppingGoods:交换品   ,loyal_level:解锁物品的商人等级
    constructor(itemID, count = 1, shoppingGoods = "5449016a4bdc2d6f028b456f", loyal_level = 1, parentId = "hideout", slotId = "hideout", upd = { "StackObjectsCount": 20000 }) {
        const item = {
            "_id": "_bac_" + itemID + "213",
            "_tpl": itemID,
            "parentId": parentId,
            "slotId": slotId,
            "upd": upd
        };
        var barterScheme = new Array();
        barterScheme.push(new Array());
        barterScheme[0].push({
            "count": count,
            "_tpl": shoppingGoods
        });
        this.items = new Array();
        this.items.push(item);
        this.barter_scheme[item._id] = barterScheme;
        this.loyal_level_items[item._id] = loyal_level;
    }
    //trader:商人ID
    appMerchandise(container, trader) {
        const dbs = container.resolve("DatabaseServer");
        const db = dbs.getTables();
        for (const item of this.items) {
            db.traders[trader].assort.items.push(item);
        }
        db.traders[trader].assort.barter_scheme[this.items[0]._id] = this.barter_scheme;
        db.traders[trader].assort.loyal_level_items[this.items[0]._id] = this.loyal_level_items;
    }
    //modId:你要加的配件ID  parentId:装到哪里(ps:默认当前实例的)   modslotLocation:装到哪个配件槽
    appitemMods(modId, parentId = this.items[0]._id, modslotLocation) {
        const modItem = {
            "_id": "_bac_" + modId + "213",
            "_tpl": modId,
            "parentId": parentId,
            "slotId": modslotLocation
        };
        this.items.push(modItem);
    }
}
exports.TraderAppMerchandise = TraderAppMerchandise;
//# sourceMappingURL=merchantOperate.js.map