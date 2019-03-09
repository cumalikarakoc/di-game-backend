import TableColumn from "./TableColumn";

class TableStructure {
    public name: string;
    public columns: TableColumn[];

    constructor(name: string, columns: TableColumn[]) {
        this.name = name;
        this.columns = columns;
    }
}

export default TableStructure;
