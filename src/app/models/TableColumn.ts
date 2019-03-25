import ColumnReference from "./ColumnReference";
import DataType from "./DataType";

class TableColumn {
    public name: string;
    public dataType: DataType;
    public isPrimaryKey: boolean;
    public referencesColumn: ColumnReference | undefined;

    constructor(name: string, dataType: DataType, isPrimaryKey: boolean = false, reference?: ColumnReference) {
        this.name = name;
        this.dataType = dataType;
        this.isPrimaryKey = isPrimaryKey;
        this.referencesColumn = reference;
    }
}

export default TableColumn;
