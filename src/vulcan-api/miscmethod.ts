import { inject, injectable, container, DependencyContainer, Lifecycle } from "tsyringe";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import https from "https";
@injectable()
export class VulcanMiscMethod {

    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("DatabaseServer") protected databaseServer: DatabaseServer
    ) { }
    public copyObject(item: Object) {
        if (typeof item !== 'object' || item === null) {
            return item;  // 如果不是对象或者是 null，直接返回
        }

        let copy = Array.isArray(item) ? [] : {};

        for (let key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
                copy[key] = this.copyObject(item[key]);  // 递归复制子成员
            }
        }

        return copy;
    }
}