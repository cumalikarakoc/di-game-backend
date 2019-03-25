import EntityRelation from "./EntityRelation";

class ColumnReference {
    public tableName: string;
    public columnName: string;
    public sourceRelation: EntityRelation;

    constructor(tableName: string, columnName: string, sourceRelation: EntityRelation) {
        this.tableName = tableName;
        this.columnName = columnName;
        this.sourceRelation = sourceRelation;
    }
}

export default ColumnReference;
