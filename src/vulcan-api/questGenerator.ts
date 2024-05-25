import { inject, injectable, container, DependencyContainer, Lifecycle } from "tsyringe";
import { IPreset } from "@spt-aki/models/eft/common/IGlobals";
import { IQuestReward, IQuestRewards } from "@spt-aki/models/eft/common/tables/IQuest";
import { BaseClasses } from "@spt-aki/models/enums/BaseClasses";
import { QuestRewardType } from "@spt-aki/models/enums/QuestRewardType";
import { IBaseQuestConfig, IQuestConfig, IRepeatableQuestConfig } from "@spt-aki/models/spt/config/IQuestConfig";
import { ExhaustableArray } from "@spt-aki/models/spt/server/ExhaustableArray"
import { RepeatableQuestRewardGenerator } from "@spt-aki/generators/RepeatableQuestRewardGenerator";
@injectable()

export class repeatableQuestGenerator extends RepeatableQuestRewardGenerator {
    static container;
    init(container) {
        repeatableQuestGenerator.container = container;
        this.logger = container.resolve("WinstonLogger");
        this.itemFilterService = container.resolve("ItemFilterService");
        this.randomUtil = container.resolve("RandomUtil");
        this.presetHelper = container.resolve("PresetHelper");
        this.itemHelper = container.resolve("ItemHelper");
        this.localisationService = container.resolve("LocalisationService");
        this.mathUtil = container.resolve("MathUtil");
        this.jsonUtil = container.resolve("JsonUtil");
    }
    public generateReward(
        pmcLevel: number,
        difficulty: number,
        traderId: string,
        repeatableConfig: IRepeatableQuestConfig,
        questConfig: IBaseQuestConfig,
    ): IQuestRewards {
        // difficulty could go from 0.2 ... -> for lowest difficulty receive 0.2*nominal reward
        const levelsConfig = repeatableConfig.rewardScaling.levels;
        const roublesConfig = repeatableConfig.rewardScaling.roubles;
        const xpConfig = repeatableConfig.rewardScaling.experience;
        const itemsConfig = repeatableConfig.rewardScaling.items;
        const rewardSpreadConfig = repeatableConfig.rewardScaling.rewardSpread;
        const skillRewardChanceConfig = repeatableConfig.rewardScaling.skillRewardChance;
        const skillPointRewardConfig = repeatableConfig.rewardScaling.skillPointReward;
        const reputationConfig = repeatableConfig.rewardScaling.reputation;
        const repeatableQuestRewardGenerator = repeatableQuestGenerator.container.resolve("RepeatableQuestRewardGenerator");

        const effectiveDifficulty = Number.isNaN(difficulty) ? 1 : difficulty;
        if (Number.isNaN(difficulty)) {
            this.logger.warning(this.localisationService.getText("repeatable-difficulty_was_nan"));
        }

        // rewards are generated based on pmcLevel, difficulty and a random spread
        const rewardXP = Math.floor(
            effectiveDifficulty * this.mathUtil.interp1(pmcLevel, levelsConfig, xpConfig)
            * this.randomUtil.getFloat(1 - rewardSpreadConfig, 1 + rewardSpreadConfig),
        );
        const rewardRoubles = Math.floor(
            effectiveDifficulty * this.mathUtil.interp1(pmcLevel, levelsConfig, roublesConfig)
            * this.randomUtil.getFloat(1 - rewardSpreadConfig, 1 + rewardSpreadConfig),
        );
        const rewardNumItems = this.randomUtil.randInt(
            1,
            Math.round(this.mathUtil.interp1(pmcLevel, levelsConfig, itemsConfig)) + 1,
        );
        const rewardReputation =
            Math.round(
                100 * effectiveDifficulty * this.mathUtil.interp1(pmcLevel, levelsConfig, reputationConfig)
                * this.randomUtil.getFloat(1 - rewardSpreadConfig, 1 + rewardSpreadConfig),
            ) / 100;
        const skillRewardChance = this.mathUtil.interp1(pmcLevel, levelsConfig, skillRewardChanceConfig);
        const skillPointReward = this.mathUtil.interp1(pmcLevel, levelsConfig, skillPointRewardConfig);

        // Possible improvement -> draw trader-specific items e.g. with this.itemHelper.isOfBaseclass(val._id, ItemHelper.BASECLASS.FoodDrink)
        let roublesBudget = rewardRoubles;
        let rewardItemPool = repeatableQuestRewardGenerator.chooseRewardItemsWithinBudget(repeatableConfig, roublesBudget, traderId);
        this.logger.debug(
            `Generating daily quest for ${traderId} with budget ${roublesBudget} for ${rewardNumItems} items`,
        );

        const rewards: IQuestRewards = { Started: [], Success: [], Fail: [] };

        let rewardIndex = 0;
        // Add xp reward
        if (rewardXP > 0) {
            rewards.Success.push({ value: rewardXP, type: QuestRewardType.EXPERIENCE, index: rewardIndex });
            rewardIndex++;
        }

        // Add money reward
        repeatableQuestRewardGenerator.addMoneyReward(traderId, rewards, rewardRoubles, rewardIndex);
        rewardIndex++;

        const traderWhitelistDetails = repeatableConfig.traderWhitelist.find((x) => x.traderId === traderId);
        if (
            traderWhitelistDetails.rewardCanBeWeapon
            && this.randomUtil.getChance100(traderWhitelistDetails.weaponRewardChancePercent)
        ) {
            // Add a random default preset weapon as reward
            const defaultPresetPool = new ExhaustableArray(
                Object.values(this.presetHelper.getDefaultWeaponPresets()),
                this.randomUtil,
                this.jsonUtil,
            );
            let chosenPreset: IPreset;
            while (defaultPresetPool.hasValues()) {
                const randomPreset = defaultPresetPool.getRandomValue();
                const tpls = randomPreset._items.map((item) => item._tpl);
                const presetPrice = this.itemHelper.getItemAndChildrenPrice(tpls);
                if (presetPrice <= roublesBudget) {
                    this.logger.debug(`  Added weapon ${tpls[0]} with price ${presetPrice}`);
                    roublesBudget -= presetPrice;
                    chosenPreset = this.jsonUtil.clone(randomPreset);
                    break;
                }
            }

            if (chosenPreset) {
                // use _encyclopedia as its always the base items _tpl, items[0] isn't guaranteed to be base item
                rewards.Success.push(
                    repeatableQuestRewardGenerator.generateRewardItem(chosenPreset._encyclopedia, 1, rewardIndex, chosenPreset._items),
                );
                rewardIndex++;
            }
        }

        if (rewardItemPool.length > 0) {
            for (let i = 0; i < rewardNumItems; i++) {
                let rewardItemStackCount = 1;
                const itemSelected = rewardItemPool[this.randomUtil.randInt(rewardItemPool.length)];

                if (this.itemHelper.isOfBaseclass(itemSelected._id, BaseClasses.AMMO)) {
                    // Don't reward ammo that stacks to less than what's defined in config
                    if (itemSelected._props.StackMaxSize < repeatableConfig.rewardAmmoStackMinSize) {
                        i--;
                        continue;
                    }

                    // Choose smallest value between budget fitting size and stack max
                    rewardItemStackCount = repeatableQuestRewardGenerator.calculateAmmoStackSizeThatFitsBudget(
                        itemSelected,
                        roublesBudget,
                        rewardNumItems,
                    );
                }

                // 25% chance to double, triple quadruple reward stack (Only occurs when item is stackable and not weapon, armor or ammo)
                if (repeatableQuestRewardGenerator.canIncreaseRewardItemStackSize(itemSelected, 70000)) {
                    rewardItemStackCount = this.getRandomisedRewardItemStackSizeByPrice(itemSelected);
                }

                rewards.Success.push(repeatableQuestRewardGenerator.generateRewardItem(itemSelected._id, rewardItemStackCount, rewardIndex));
                rewardIndex++;

                const itemCost = this.presetHelper.getDefaultPresetOrItemPrice(itemSelected._id);
                roublesBudget -= rewardItemStackCount * itemCost;
                this.logger.debug(`  Added item ${itemSelected._id} with price ${rewardItemStackCount * itemCost}`);

                // If we still have budget narrow down possible items
                if (roublesBudget > 0) {
                    // Filter possible reward items to only items with a price below the remaining budget
                    rewardItemPool = repeatableQuestRewardGenerator.filterRewardPoolWithinBudget(rewardItemPool, roublesBudget, 0);
                    if (rewardItemPool.length === 0) {
                        this.logger.debug(`  Reward pool empty with ${roublesBudget} remaining`);
                        break; // No reward items left, exit
                    }
                }
                else {
                    break;
                }
            }
        }

        // Add rep reward to rewards array
        if (rewardReputation > 0) {
            const reward: IQuestReward = {
                target: traderId,
                value: rewardReputation,
                type: QuestRewardType.TRADER_STANDING,
                index: rewardIndex,
            };
            rewards.Success.push(reward);
            rewardIndex++;

            this.logger.debug(`  Adding ${rewardReputation} trader reputation reward`);
        }

        // Chance of adding skill reward
        if (this.randomUtil.getChance100(skillRewardChance * 100)) {
            const targetSkill = this.randomUtil.getArrayValue(questConfig.possibleSkillRewards);
            const reward: IQuestReward = {
                target: targetSkill,
                value: skillPointReward,
                type: QuestRewardType.SKILL,
                index: rewardIndex,
            };
            rewards.Success.push(reward);

            this.logger.debug(`  Adding ${skillPointReward} skill points to ${targetSkill}`);
        }


        //加载配置里的物品
        //核心部分(强制添加任务奖励)
        //其余部分无任何改动
        //也许可以通过hook完成, 并不需要重写方法
        //hook能在方法体前面执行吗?
        //似乎不行....
        if (questConfig.rewards != null) {
            let rewardsConfig = questConfig.rewards;
            let maxIndex = rewards.Success.length;
            if (rewardsConfig.Success.length > 0) {
                for (var item in rewardsConfig.Success) {
                    var itemTemplate = rewardsConfig.Success[item];
                    rewards.Success.push({
                        target: itemTemplate.target,
                        value: itemTemplate.value,
                        type: itemTemplate.type,
                        index: maxIndex,
                        items: itemTemplate.items,
                    });
                    maxIndex++;
                }
            }
        }
        return rewards;
    }


}