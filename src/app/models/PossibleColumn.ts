import TableColumn from "./TableColumn";

class PossibleColumn {
    public column: TableColumn;
    public isMandatory: boolean;

    constructor(column: TableColumn, isMandatory: boolean) {
        this.column = column;
        this.isMandatory = isMandatory;
    }
}

export default PossibleColumn;
