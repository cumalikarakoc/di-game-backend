import DataType from "../models/DataType";
import TableColumn from "../models/TableColumn";
import TableStructure from "../models/TableStructure";

class SqlGeneratorService {
    public static IDENTITY_COLUMN = "id";
    public static IDENTITY_TYPE = DataType.NUMBER;

    public generateTables(tableStructures: TableStructure[]): string {
        const pivotTables = tableStructures.filter((structure) => structure.name.includes("_"));
        const nonPivotTables = tableStructures.filter((structure) => !structure.name.includes("_"));

        console.log(pivotTables)
        console.log(nonPivotTables)

        return [...nonPivotTables, ...pivotTables].map((tableStructure) => {
            return `CREATE TABLE ${tableStructure.name}(\n${tableStructure.columns
                .map((column) => {
                    return `${column.name} ${this.getSqlDataType(column.dataType)}${this.buildConstraints(column)},\n`;
            }).join("")});`;
        }).join("\n");
    }

    private getSqlDataType(dataType: DataType): string {
        if (dataType === DataType.TEXT) {
            return "VARCHAR(50)";
        }

        if (dataType === DataType.NUMBER) {
            return "INT";
        }

        return "INT";
    }

    private buildConstraints(column: TableColumn) {
        let constraintDDL = "";

        if (column.isPrimaryKey) {
            constraintDDL += "PRIMARY KEY";
        }

        if (column.referencesColumn !== undefined) {
            const reference = `${column.referencesColumn.tableName}(${column.referencesColumn.columnName})`;
            const prefix = constraintDDL.length > 0 ? " " : "";

            constraintDDL += `${prefix}FOREIGN KEY REFERENCES ${reference}`;
        }

        return constraintDDL.length > 0 ? ` ${constraintDDL}` : "";
    }
}

export default SqlGeneratorService;
