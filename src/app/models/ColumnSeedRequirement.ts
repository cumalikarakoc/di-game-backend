import SeedRequirement from "./SeedRequirement";

class ColumnSeedRequirement extends SeedRequirement {
    public table: string;
    public column: string;
    public value: any;

    constructor(table: string, column: string, value: any) {
        super();
        this.table = table;
        this.column = column;
        this.value = value;
    }
}

export default ColumnSeedRequirement;
