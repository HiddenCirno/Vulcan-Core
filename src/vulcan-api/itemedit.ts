import { inject, injectable, container, DependencyContainer, Lifecycle } from "tsyringe";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { ImporterUtil } from "@spt-aki/utils/ImporterUtil";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { VulcanHandBookHelper } from "./handbook";
import https from "https";
@injectable()
export class VulcanItemEditor {

    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("ImporterUtil") protected importUtil: ImporterUtil,
        @inject("DatabaseServer") protected databaseServer: DatabaseServer,
        @inject("VulcanHandBookHelper") protected handbookHelper: VulcanHandBookHelper
    ) { }
    public copyItem(item: Object) {
        if (typeof item !== 'object' || item === null) {
          return item;  // 如果不是对象或者是 null，直接返回
        }
      
        let copy = Array.isArray(item) ? [] : {};
      
        for (let key in item) {
          if (Object.prototype.hasOwnProperty.call(item, key)) {
            copy[key] = this.copyItem(item[key]);  // 递归复制子成员
          }
        }
      
        return copy;
    }
    public changeID(obj: Object, oldId: string, newId: string) {
        for (let key in obj) {
            if (typeof obj[key] === 'object') {
                if (Array.isArray(obj[key])) {
                    for (let i = 0; i < obj[key].length; i++) {
                        this.changeID(obj[key][i], oldId, newId);
                    }
                } else {
                    this.changeID(obj[key], oldId, newId);
                }
            } else {
                if (obj[key] === oldId) {
                    obj[key] = newId;
                }
            }
        }
        return obj;
    }
    public addItem(item: Object) {
        const db = this.databaseServer.getTables()
        const itemid = item._id
        db.templates.items[itemid] = item

    }
    public getItem(itemid: string) {
        const db = this.databaseServer.getTables()
        return db.templates.items[itemid]

    }
    public testAssort(item: Object, trader: string) {
        const db = this.databaseServer.getTables()
        const itemid = item._id
        db.traders[trader].assort.items.push(
            {
                "_id": itemid,
                "_tpl": itemid,
                "parentId": "hideout",
                "slotId": "hideout",
                "upd": {
                    "StackObjectsCount": 99999,
                    "UnlimitedCount": true
                }
            }
        )
        db.traders[trader].assort.barter_scheme[itemid] = [[{
            count: 1,
            _tpl: '5449016a4bdc2d6f028b456f'
        }]]
        db.traders[trader].assort.loyal_level_items[itemid] = 1
    }

}