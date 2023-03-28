import { inject, injectable, container, DependencyContainer, Lifecycle } from "tsyringe";
import crypto from "crypto";
import { PostDBModLoader } from "@spt-aki/loaders/PostDBModLoader";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { DialogueHelper } from "@spt-aki/helpers/DialogueHelper";
import { IPostAkiLoadMod } from "@spt-aki/models/external/IPostAkiLoadMod";
import type { StaticRouterModService } from "@spt-aki/services/mod/staticRouter/StaticRouterModService";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { ImageRouter } from "@spt-aki/routers/ImageRouter";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { ITraderConfig, UpdateTime } from "@spt-aki/models/spt/config/ITraderConfig";
import { IModLoader } from "@spt-aki/models/spt/mod/IModLoader";
import { PreAkiModLoader } from "@spt-aki/loaders/PreAkiModLoader";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { Traders } from "@spt-aki/models/enums/Traders";
import { QuestStatus } from "@spt-aki/models/enums/QuestStatus";
import { MessageType } from "@spt-aki/models/enums/MessageType";
import { HashUtil } from "@spt-aki/utils/HashUtil";
import { VFS } from "@spt-aki/utils/VFS"
import { NotificationSendHelper } from "@spt-aki/helpers/NotificationSendHelper";
import { NotifierHelper } from "@spt-aki/helpers/NotifierHelper";
import { QuestHelper } from "@spt-aki/helpers/QuestHelper";
import { ImporterUtil } from "@spt-aki/utils/ImporterUtil"
import { BundleLoader } from "@spt-aki/loaders/BundleLoader";
import { VulcanConsole } from "./vulcan-api/console";
import { VulcanItemEditor } from "./vulcan-api/itemedit";
import { VulcanHandBookHelper } from "./vulcan-api/handbook";
import { VulcanLocaleHelper } from "./vulcan-api/localehelper";
import { VulcanMiscMethod } from "./vulcan-api/miscmethod";
//import { TraderAppMerchandise, TraderOperateJsonOdj } from "./vulcan-api/merchantOperate";
import { TraderAppMerchandise } from "./vulcan-api/merchantOperate";
import { VulcanQuestHelper } from "./vulcan-api/questhelper";
import { VulcanTraderHelper } from "./vulcan-api/traderhelper";
//const addTrader = new TraderOperateJsonOdj
//
class Mod implements IPreAkiLoadMod {
  
    public preAkiLoad(inFuncContainer: DependencyContainer): void {
		container.register<VulcanConsole>("VulcanConsole", VulcanConsole, { lifecycle: Lifecycle.Singleton });
		container.register<VulcanItemEditor>("VulcanItemEditor", VulcanItemEditor, { lifecycle: Lifecycle.Singleton });
		container.register<VulcanHandBookHelper>("VulcanHandBookHelper", VulcanHandBookHelper, { lifecycle: Lifecycle.Singleton });
		container.register<VulcanLocaleHelper>("VulcanLocaleHelper", VulcanLocaleHelper, { lifecycle: Lifecycle.Singleton });
		container.register<TraderAppMerchandise>("TraderAppMerchandise", TraderAppMerchandise, { lifecycle: Lifecycle.Singleton });
		container.register<VulcanQuestHelper>("VulcanQuestHelper", VulcanQuestHelper, { lifecycle: Lifecycle.Singleton });
		container.register<VulcanMiscMethod>("VulcanMiscMethod", VulcanMiscMethod, { lifecycle: Lifecycle.Singleton });
		container.register<VulcanTraderHelper>("VulcanTraderHelper", VulcanTraderHelper, { lifecycle: Lifecycle.Singleton });


    
    //addTrader.addTraderPreAkiload(inFuncContainer,商人名字)
    }
    public postAkiLoad(inFuncContainer: DependencyContainer): void {
      //addTrader.addTraderPosrtDBLoad(inFuncContainer,/* SPT原版格式的assor.json */,/* BaseOdj直接接收SPT原版格式的base.json */,/* 商人名字(同上) */,/* questassort直接接收SPT原版格式的questassort,PS:也可以之后用其他办法添加 */)
    }
    public postDBLoad(inFuncContainer: DependencyContainer): void {
    }
}
module.exports = { mod: new Mod() }