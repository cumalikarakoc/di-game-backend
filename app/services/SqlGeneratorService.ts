import DataType from "../models/DataType";
import TableColumn from "../models/TableColumn";
import TableStructure from "../models/TableStructure";

class SqlGeneratorService {
    public static IDENTITY_COLUMN = "id";
    public static IDENTITY_TYPE = DataType.NUMBER;

    public generateTables(tableStructures: TableStructure[]): string {
        return this.sortToSatisfyDependencies(tableStructures, tableStructures).map((tableStructure) => {
            return `CREATE TABLE ${tableStructure.name}(\n${tableStructure.columns
                .map((column) => {
                    return `${column.name} ${this.getSqlDataType(column.dataType)}${this.buildConstraints(column)},\n`;
                }).join("")});`;
        }).join("\n");
    }

    public sortToSatisfyDependencies(allTableStructures: TableStructure[], tableStructures: TableStructure[], usedTableStructures: TableStructure[] = []) {
        tableStructures.forEach((table) => {
            const relatedTables = table.columns
                .filter((column) => column.referencesColumn !== undefined && usedTableStructures.every((x) => x.name !== column.referencesColumn!.tableName))
                .map((column) => {
                    return allTableStructures.filter((possibleTable) => column.referencesColumn !== undefined && column.referencesColumn.tableName === possibleTable.name)[0];
                });

            if (relatedTables.length > 0) {
                this.sortToSatisfyDependencies(allTableStructures, relatedTables, usedTableStructures);
            }

            if (usedTableStructures.every((x) => x.name !== table.name)) {
                usedTableStructures.push(table);
            }
        });

        return usedTableStructures;
    }

    private getSqlDataType(dataType: DataType): string {
        if (dataType === DataType.WORD) {
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
