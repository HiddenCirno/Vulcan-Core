import { inject, injectable, container, DependencyContainer, Lifecycle } from "tsyringe";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";=
import { ITemplateItem } from "@spt-aki/models/eft/common/tables/ITemplateItem";
import { ItemLocale, QuestLocale, TraderLocale } from "./localeclass";
import { VFS } from "@spt-aki/utils/VFS"
import { ITraderConfig, UpdateTime } from "@spt-aki/models/spt/config/ITraderConfig";
import { VulcanMiscMethod } from "./miscmethod"
import { ImageRouter } from "@spt-aki/routers/ImageRouter";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { ITrader } from "@spt-aki/models/eft/common/tables/ITrader";
@injectable()
export class VulcanTraderHelper {
    
    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("DatabaseServer") protected databaseServer: DatabaseServer,
        @inject("VFS") protected vfs: VFS,
        @inject("JsonUtil") protected jsonUtil: JsonUtil,
        @inject("VulcanMiscMethod") protected miscMethod: VulcanMiscMethod,
        @inject("ImageRouter") protected imageRouter: ImageRouter,
        @inject("ConfigServer") protected configServer: ConfigServer
    )
    { }
    public createTrader(traderid: string, tradermoney: string, tradericondir: string){
        const db = this.databaseServer.getTables()
        const trader: ITrader = db.traders["5a7c2eca46aef81a7ca2145d"]
        const traderConfig: ITraderConfig = this.configServer.getConfig<ITraderConfig>(ConfigTypes.TRADER);
        const traderTime: UpdateTime = { traderId: traderid, seconds: 3600 }
        traderConfig.updateTime.push(traderTime);
        var newtrader = this.miscMethod.copyObject(trader)
        //this.imageRouter.addRoute(`/files/trader/avatar/${traderid}.png`, `${tradericondir}${traderid}.png`)
        //this.imageRouter.addRoute(newtrader.base.avatar.replace(".png", ""), `${tradericondir}${traderid}.png`);
        this.imageRouter.addRoute(`/files/trader/avatar/${traderid}`, `${tradericondir}${traderid}.png`)
        newtrader.base.avatar = `/files/trader/avatar/${traderid}.png`
        newtrader.base.balance_dol = 7000000
        newtrader.base.balance_eur = 7000000
        newtrader.base.balance_rub = 7000000
        newtrader.base.currency = tradermoney
        newtrader.base._id = traderid
        newtrader.base.items_buy.category = []
        newtrader.base.items_buy.category.push("54009119af1c881c07000029")
        newtrader.questassort.started = {}
        newtrader.questassort.success = {}
        newtrader.assort.items = []
        newtrader.assort.barter_scheme = {}
        newtrader.assort.loyal_level_items = {}
        return newtrader
    }
    public addTrader(trader: ITrader){
        const db = this.databaseServer.getTables()
        db.traders[trader.base._id] = trader
    }

}