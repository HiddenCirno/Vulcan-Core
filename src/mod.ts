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
import { TraderAppMerchandise } from "./vulcan-api/merchantOperate";
//
class Mod implements IPreAkiLoadMod {
    public preAkiLoad(inFuncContainer: DependencyContainer): void {
		container.register<VulcanConsole>("VulcanConsole", VulcanConsole, { lifecycle: Lifecycle.Singleton });
		container.register<VulcanItemEditor>("VulcanItemEditor", VulcanItemEditor, { lifecycle: Lifecycle.Singleton });
		container.register<VulcanHandBookHelper>("VulcanHandBookHelper", VulcanHandBookHelper, { lifecycle: Lifecycle.Singleton });
    }
    public postAkiLoad(inFuncContainer: DependencyContainer): void {
    }
    public postDBLoad(inFuncContainer: DependencyContainer): void {
    }
}
module.exports = { mod: new Mod() }