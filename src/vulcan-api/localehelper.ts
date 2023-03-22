import { inject, injectable, container, DependencyContainer, Lifecycle } from "tsyringe";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ItemLocale } from "./localeclass";
@injectable()
export class VulcanLocaleHelper {
    
    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("DatabaseServer") protected databaseServer: DatabaseServer
    )
    { }
    public setItemLocale(item: Object, itemlocale: ItemLocale, language: string){
        const db = this.databaseServer.getTables()
        const locale = db.locales.global[language]
        const itemid = item._id
        locale[`${itemid} Name`] = itemlocale.Name
        locale[`${itemid} ShortName`] = itemlocale.Short
        locale[`${itemid} Description`] = itemlocale.Desc
    }

}