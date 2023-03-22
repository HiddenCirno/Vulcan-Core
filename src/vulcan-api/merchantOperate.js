"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraderAppMerchandise = void 0;
class traderOperate {
}
class TraderAppMerchandise {
    constructor(itemID, count, shoppingGoods, loyal_level, parentId = "hideout", slotId = "hideout", upd = { "StackObjectsCount": 20000 }) {
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
    appMerchandise(container, trader) {
        const dbs = container.resolve("DatabaseServer");
        const db = dbs.getTables();
        for (const item of this.items) {
            db.traders[trader].assort.items.push(item);
        }
        db.traders[trader].assort.barter_scheme[this.items[0]._id] = this.barter_scheme;
        db.traders[trader].assort.loyal_level_items[this.items[0]._id] = this.loyal_level_items;
    }
    appitemMods(modId, modslotLocation) {
        const modItem = {
            "_id": "_bac_" + modId + "213",
            "_tpl": modId,
            "parentId": this.items[0]._id,
            "slotId": modslotLocation
        };
        this.items.push(modItem);
    }
}
exports.TraderAppMerchandise = TraderAppMerchandise;
