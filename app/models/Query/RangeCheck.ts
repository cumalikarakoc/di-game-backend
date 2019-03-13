import TableSeedRequirement from "../TableSeedRequirement";

class RangeCheck {
    public sql: string;
    public description: string;
    public seedRequirements: TableSeedRequirement[];

    constructor(sql: string, description: string, seedRequirements: TableSeedRequirement[] = []) {
        this.sql = sql;
        this.description = description;
        this.seedRequirements = seedRequirements;
    }
}

export default RangeCheck;
