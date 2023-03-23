"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraderAppMerchandise = void 0;
class traderOperate {
}
class TraderAppMerchandise {
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
        this.barter_scheme = barterScheme;
        this.loyal_level_items = loyal_level;
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
