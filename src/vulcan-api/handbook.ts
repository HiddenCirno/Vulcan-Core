import { inject, injectable, container, DependencyContainer, Lifecycle } from "tsyringe";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import https from "https";
@injectable()
export class VulcanHandBookHelper {

    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("DatabaseServer") protected databaseServer: DatabaseServer
    ) { }
    public getPrice(item: Object) {
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
    public getTag(item: Object) {
        const handbook = this.databaseServer.getTables().templates.handbook
        const itemid = item._id
        if(handbook.Items.some(item=>item.Id==itemid)){
            return handbook.Items.find(item=>item.Id==itemid).ParentId
        }
        else{
            return null
        }
    }
    public setHandbook(item: Object, price: number, tag: string) {
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
    public editPrice(item: Object, price: number){
        const handbook = this.databaseServer.getTables().templates.handbook
        const itemid = item._id
        handbook.Items.find(item=>item.Id==itemid).Price = price
    }
    public editTag(item: Object, tag: string){
        const handbook = this.databaseServer.getTables().templates.handbook
        const itemid = item._id
        handbook.Items.find(item=>item.Id==itemid).ParentId = tag
    }
    public editHandbook(item: Object, price: number, tag: string) {
        const handbook = this.databaseServer.getTables().templates.handbook
        const itemid = item._id
        handbook.Items.find(item=>item.Id==itemid).Price = price
        handbook.Items.find(item=>item.Id==itemid).ParentId = tag
    }

}