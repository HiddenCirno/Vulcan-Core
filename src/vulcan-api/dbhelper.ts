import { inject, injectable, container, DependencyContainer, Lifecycle } from "tsyringe";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ITemplateItem } from "@spt-aki/models/eft/common/tables/ITemplateItem";
import { ItemLocale, QuestLocale, TraderLocale } from "./localeclass";
import { VFS } from "@spt-aki/utils/VFS"
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { ImporterUtil } from "@spt-aki/utils/ImporterUtil"
import { ITrader } from "@spt-aki/models/eft/common/tables/ITrader";
import { VulcanConsole } from "./console";
@injectable()
export class VulcanDatabaseHelper {
    
    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("DatabaseServer") protected databaseServer: DatabaseServer,
        @inject("VFS") protected vfs: VFS, 
        @inject("JsonUtil") protected jsonUtil: JsonUtil,
        @inject("ImporterUtil") protected importerUtil: ImporterUtil,
        @inject("VulcanConsole") protected cs: VulcanConsole
    )
    { }
    public loadItem(itemJson: Object){
        const db = this.databaseServer.getTables()
        const locale = db.locales.global["ch"]
        const elocale = db.locales.global["en"]
        for(let i in itemJson){
            const ItemData = itemJson[i]
            db.templates.items[i] = itemJson[i]
            locale[ItemData._id + " Name"] = ItemData._props.Name
            locale[ItemData._id + " ShortName"] = ItemData._props.ShortName
            locale[ItemData._id + " Description"] = ItemData._props.Description
            if(ItemData._props.EName){
                elocale[ItemData._id + " Name"] = ItemData._props.EName
                elocale[ItemData._id + " ShortName"] = ItemData._props.EShortName
                elocale[ItemData._id + " Description"] = ItemData._props.EDescription
            }
            else{
                elocale[ItemData._id + " Name"] = ItemData._props.Name
                elocale[ItemData._id + " ShortName"] = ItemData._props.ShortName
                elocale[ItemData._id + " Description"] = ItemData._props.Description
            }
            db.templates.handbook.Items.push({
                "Id": ItemData._id,
                "ParentId": ItemData._props.RagfairType,
                "Price": ItemData._props.DefaultPrice
            })
            this.cs.Log(`物品数据加载成功: ${ItemData._props.Name}`)
        }
    }


    public setItemLocale(item:ITemplateItem, itemlocale: ItemLocale, language: string){
        const db = this.databaseServer.getTables()
        const locale = db.locales.global[language]
        const itemid = item._id
        locale[`${itemid} Name`] = itemlocale.Name
        locale[`${itemid} ShortName`] = itemlocale.Short
        locale[`${itemid} Description`] = itemlocale.Desc
    }
    public setQuestLocale(quest: Object, questlocale: QuestLocale, language: string){
        const db = this.databaseServer.getTables()
        const locale = db.locales.global[language]
        const questid = quest._id
        locale[`${questid} name`] = questlocale.Name
        locale[`${questid} description`] = questlocale.Desc
        locale[`${questid} failMessageText`] = questlocale.Fail
        locale[`${questid} successMessageText`] = questlocale.Success
    }
    public getLocaleFromFile(localeid: string, filedir: string){
        const file = this.vfs.readFile(filedir)
        const filejson = this.jsonUtil.deserialize(file)
        var locale = filejson[localeid]
        return locale
    }
    public setKeyLocale(key: string, text: string, language: string){
        const db = this.databaseServer.getTables()
        const locale = db.locales.global[language]
        locale[key] = text
    }
    public getLocaleText(key: string, language: string){
        const db = this.databaseServer.getTables()
        const locale = db.locales.global[language]
        return locale[key]
        
    }
    public getItemName(item: Object, language: string){
        const db = this.databaseServer.getTables()
        const locale = db.locales.global[language]
        const itemid = item._id
        return locale[`${itemid} Name`]
    }
    public getzhItemName(item: Object){
        const db = this.databaseServer.getTables()
        const locale = db.locales.global["ch"]
        const itemid = item._id
        return locale[`${itemid} Name`]
    }
    public setTraderLocale(trader: ITrader, traderlocale: TraderLocale, language: string){
        const db = this.databaseServer.getTables()
        const traderid = trader.base._id
        const locale = db.locales.global[language]
        locale[`${traderid} Nickname`] = traderlocale.NName
        locale[`${traderid} FirstName`] = traderlocale.FName
        locale[`${traderid} FullName`] = traderlocale.LName
        locale[`${traderid} Location`] = traderlocale.Locate
        locale[`${traderid} Description`] = traderlocale.Desc
    }

}