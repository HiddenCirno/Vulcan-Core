import { inject, injectable, container, DependencyContainer, Lifecycle } from "tsyringe";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { LogTextColor } from"@spt-aki/models/spt/logging/LogTextColor"
@injectable()
export class VulcanConsole {
    
    constructor(
        @inject("WinstonLogger") protected logger: ILogger
        
    )
    { }
    public Log(string: String){
        this.logger.logWithColor(`[火神之心]: ${string}`, LogTextColor.YELLOW)
    }
    public Access(string: String){
        this.logger.logWithColor(`[火神之心]: ${string}`, LogTextColor.GREEN)
    }
    public Error(string: String){
        this.logger.logWithColor(`[火神之心]: ${string}`, LogTextColor.RED)
    }
    public Warn(string: String){
        this.logger.logWithColor(`[火神之心]: ${string}`, LogTextColor.RED)
    }

}