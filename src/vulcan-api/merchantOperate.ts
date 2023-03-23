import { DependencyContainer } from "tsyringe";

import { Item, Location } from "@spt-aki/models/eft/common/tables/IItem";
import { IBarterScheme, ITrader, ITraderAssort, ITraderBase } from "@spt-aki/models/eft/common/tables/ITrader";
import { ImporterUtil } from "@spt-aki/utils/ImporterUtil";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ImageRouter } from "@spt-aki/routers/ImageRouter";
import { ITraderConfig, UpdateTime } from "@spt-aki/models/spt/config/ITraderConfig";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";


interface TraderAssort {
    items: Item[];
    barter_scheme: Record<string, IBarterScheme[][]>;
    loyal_level_items: Record<string, number>;
}
export class TraderOperateJsonOdj {
    //直接接收原版格式的json，并指定商人售卖
    addTraderAssort(container: DependencyContainer, jsonAssortOdj: TraderAssort, trader: string) {
        const dbs = container.resolve<DatabaseServer>("DatabaseServer");
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
    addTraderPreAkiload(container: DependencyContainer, modTraderName: string) {
        //载入图片
        const imageRouter: ImageRouter = container.resolve<ImageRouter>("ImageRouter");
        imageRouter.addRoute(`/files/trader/avatar/${modTraderName}`, `picture/traderAvatar/${modTraderName}`)
        //商人刷新时间
        const configServer = container.resolve<ConfigServer>("ConfigServer");
        const traderConfig: ITraderConfig = configServer.getConfig<ITraderConfig>(ConfigTypes.TRADER);
        const traderTime: UpdateTime = { traderId: modTraderName, seconds: 3600 }
        traderConfig.updateTime.push(traderTime);
    }
    //jsonAssortOdj:直接接收SPT原版格式的assor.json,jsonBaseOdj直接接收SPT原版格式的base.json,modTraderName:添加商人的名字|ID,questassort直接接收SPT原版格式的questassort,PS:也可以之后用其他办法添加
    addTraderPosrtDBLoad(container: DependencyContainer, jsonAssortOdj: TraderAssort, jsonBaseOdj: object, modTraderName: string, questassort: object = {started: {},success: {},fail: {}}) 
    {
        const jsonUtil: JsonUtil = container.resolve<JsonUtil>("JsonUtil");
        const dbs = container.resolve<DatabaseServer>("DatabaseServer");
        const db = dbs.getTables();
        this.addTraderAssort(container, jsonAssortOdj, modTraderName)
        db.traders[modTraderName].base = jsonUtil.deserialize(jsonUtil.serialize(jsonBaseOdj)) as ITraderBase
        db.traders[modTraderName].questassort = questassort as Record<string ,Record<string, string>>
    }
}
export class TraderAppMerchandise implements TraderAssort {
    public items: Item[];
    public barter_scheme: Record<string, IBarterScheme[][]>;
    public loyal_level_items: Record<string, number>;
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
        this.barter_scheme[item._id] = barterScheme;
        this.loyal_level_items[item._id] = loyal_level;
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
    appitemMods(modId: string, parentId: string = this.items[0]._id, modslotLocation: string) {
        const modItem: Item = {
            "_id": "_bac_" + modId + "213",
            "_tpl": modId,
            "parentId": parentId,
            "slotId": modslotLocation
        }
        this.items.push(modItem);
    }
}