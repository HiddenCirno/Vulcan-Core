import { inject, injectable, container, DependencyContainer, Lifecycle } from "tsyringe";
import https from "https";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ITemplateItem } from "@spt-aki/models/eft/common/tables/ITemplateItem";

@injectable()
export class VulcanHandBookHelper {

    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("DatabaseServer") protected databaseServer: DatabaseServer
    ) { }
    public getPrice(item: ITemplateItem) {
        const handbook = this.databaseServer.getTables().templates.handbook
        const price = this.databaseServer.getTables().templates.prices
        const itemid = item._id
        if(handbook.Items.some(item=>item.Id==itemid)){
            return handbook.Items.find(item=>item.Id==itemid).Price
        }
        else if(price[itemid]!=undefined){
            return price[itemid]
        }
        else{
            return 0
        }
    }
    public getTag(item: ITemplateItem) {
        const handbook = this.databaseServer.getTables().templates.handbook
        const itemid = item._id
        if(handbook.Items.some(item=>item.Id==itemid)){
            return handbook.Items.find(item=>item.Id==itemid).ParentId
        }
        else{
            return null
        }
    }
    public setHandbook(item: ITemplateItem, price: number, tag: string) {
        const handbook = this.databaseServer.getTables().templates.handbook.Items
        const itemid = item._id
        handbook.push(
            {
                "Id": itemid,
                "ParentId": tag,
                "Price": price
            }
        )
    }
    public editPrice(item: ITemplateItem, price: number){
        const handbook = this.databaseServer.getTables().templates.handbook
        const itemid = item._id
        handbook.Items.find(item=>item.Id==itemid).Price = price
    }
    public editTag(item: ITemplateItem, tag: string){
        const handbook = this.databaseServer.getTables().templates.handbook
        const itemid = item._id
        handbook.Items.find(item=>item.Id==itemid).ParentId = tag
    }
    public editHandbook(item: ITemplateItem, price: number, tag: string) {
        const handbook = this.databaseServer.getTables().templates.handbook
        const itemid = item._id
        handbook.Items.find(item=>item.Id==itemid).Price = price
        handbook.Items.find(item=>item.Id==itemid).ParentId = tag
    }
    public getHandbook(item: ITemplateItem) {
        const handbook = this.databaseServer.getTables().templates.handbook
        const itemid = item._id
        return handbook.Items.find(item=>item.Id==itemid)
    }

}