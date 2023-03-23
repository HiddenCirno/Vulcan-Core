import { inject, injectable, container, DependencyContainer, Lifecycle } from "tsyringe";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";=
import { ITemplateItem } from "@spt-aki/models/eft/common/tables/ITemplateItem";
import { ItemLocale, QuestLocale } from "./localeclass";
import { VFS } from "@spt-aki/utils/VFS"
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
@injectable()
export class VulcanLocaleHelper {
    
    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("DatabaseServer") protected databaseServer: DatabaseServer,
        @inject("VFS") protected vfs: VFS,
        @inject("JsonUtil") protected jsonUtil: JsonUtil
    )
    { }
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

}