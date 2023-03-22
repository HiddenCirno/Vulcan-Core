import { inject, injectable, container, DependencyContainer, Lifecycle } from "tsyringe";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
@injectable()
export class VulcanConsole {
    
    constructor(
        @inject("WinstonLogger") protected logger: ILogger
    )
    { }
    public Log(string: String){
        this.logger.logWithColor(`[控制台信息]: ${string}`, "cyan")
    }
    public Access(string: String){
        this.logger.logWithColor(`[控制台信息]: ${string}`, "green")
    }
    public Error(string: String){
        this.logger.logWithColor(`[控制台信息]: ${string}`, "red")
    }

}