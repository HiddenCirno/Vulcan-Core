import { DependencyContainer } from "tsyringe";

import { Item, Location } from "@spt-aki/models/eft/common/tables/IItem";
import { IBarterScheme, ITraderAssort } from "@spt-aki/models/eft/common/tables/ITrader";
import { ImporterUtil } from "@spt-aki/utils/ImporterUtil";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { PreAkiModLoader } from "@spt-aki/loaders/PreAkiModLoader";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";

interface TraderAssort {
    items: Item[];
    barter_scheme: IBarterScheme[][];
    loyal_level_items: number;
}
class traderOperate {

}
export class TraderAppMerchandise implements TraderAssort {
    public items: Item[];
    public barter_scheme: IBarterScheme[][];
    public loyal_level_items: number;
    //itemID: 你要卖的东西的ID  ,count:交换品要的个数   ,shoppingGoods:交换品   ,loyal_level:解锁物品的商人等级
    constructor(itemID: string, count: number = 1, shoppingGoods: string = "5449016a4bdc2d6f028b456f", loyal_level: number = 1, parentId: string = "hideout", slotId: string = "hideout", upd: object = { "StackObjectsCount": 20000 }) {
        const item: Item = {
            "_id": "_bac_" + itemID + "213",
            "_tpl": itemID,
            "parentId": parentId,
            "slotId": slotId,
            "upd": upd
        }
        var barterScheme: IBarterScheme[][] = new Array();
        barterScheme.push(new Array());
        barterScheme[0].push({
            "count": count,
            "_tpl": shoppingGoods
        })

        this.items = new Array();
        this.items.push(item)
        this.barter_scheme = barterScheme;
        this.loyal_level_items = loyal_level;
    }
    //trader:商人ID
    appMerchandise(container: DependencyContainer, trader: string,) {
        const dbs = container.resolve<DatabaseServer>("DatabaseServer");
        const db = dbs.getTables();
        for (const item of this.items) {
            db.traders[trader].assort.items.push(item);
        }
        db.traders[trader].assort.barter_scheme[this.items[0]._id] = this.barter_scheme;
        db.traders[trader].assort.loyal_level_items[this.items[0]._id] = this.loyal_level_items;
    }
    //modId:你要加的配件ID  parentId:装到哪里(ps:默认当前实例的)   modslotLocation:装到哪个配件槽
    appitemMods(modId: string,parentId:string = this.items[0]._id ,modslotLocation: string) {
        const modItem: Item = {
            "_id": "_bac_" + modId + "213",
            "_tpl": modId,
            "parentId": parentId,
            "slotId": modslotLocation
        }
        this.items.push(modItem);
    }
}