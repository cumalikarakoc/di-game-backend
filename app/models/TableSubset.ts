import TableColumn from "./TableColumn";

class TableSubset {
    public columns: TableColumn[];
    public description: string;

    constructor(columns: TableColumn[], description: string) {
        this.columns = columns;
        this.description = description;
    }
}

export default TableSubset;
