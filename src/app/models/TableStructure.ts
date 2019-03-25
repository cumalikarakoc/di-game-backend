import TableColumn from "./TableColumn";

class TableStructure {
    public name: string;
    public columns: TableColumn[];
    public isPivotTable: boolean;

    constructor(name: string, columns: TableColumn[], isPivotTable: boolean = false) {
        this.name = name;
        this.columns = columns;
        this.isPivotTable = isPivotTable;
    }
}

export default TableStructure;
