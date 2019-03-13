import ColumnSeedRequirement from "./ColumnSeedRequirement";
import SeedRequirement from "./SeedRequirement";

class TableSeedRequirement extends SeedRequirement {
    public sourceTable: string;
    public targetTable: string;
    public amountOfRows: number;
    public relatedRequirements: ColumnSeedRequirement[];

    constructor(sourceTable: string, targetTable: string, amountOfRows: number, relatedRequirements: ColumnSeedRequirement[] = []) {
        super();
        this.sourceTable = sourceTable;
        this.targetTable = targetTable;
        this.amountOfRows = amountOfRows;
        this.relatedRequirements = relatedRequirements;
    }
}

export default TableSeedRequirement;
