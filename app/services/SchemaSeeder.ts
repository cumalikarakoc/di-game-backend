import Faker from "../helpers/Faker";
import MathHelper from "../helpers/MathHelper";
import DataType from "../models/DataType";
import Schema from "../models/Schema";
import Table from "../models/Table";
import TableColumn from "../models/TableColumn";
import TableStructure from "../models/TableStructure";

class SchemaSeeder {
    public static getRandomDataForDataType(dataType: DataType) {
        if (dataType === DataType.TEXT) {
            return "aaa";
        }

        if (dataType === DataType.NUMBER) {
            return MathHelper.random(1, 40);
        }

        if (dataType === DataType.DATE) {
            return new Date();
        }

        return Faker.randomBoolean();
    }

    public fillTables(tableStructures: TableStructure[]): Schema {
        const primaryKeyValuesPerTableName: any = {};
        const tables = tableStructures.map((table) => {
            const amountOfRecordsToCreate = MathHelper.random(1, 4);

            return new Table(table.name, table.columns.map((column) => column.name), Array(amountOfRecordsToCreate).fill(1).map((_, rowIndex) => {
                return table.columns.reduce((acc: any, rowColumn: TableColumn) => {
                    let columnValue = SchemaSeeder.getRandomDataForDataType(rowColumn.dataType);

                    if (rowColumn.isPrimaryKey) {
                        if (!primaryKeyValuesPerTableName.hasOwnProperty(table.name)) {
                            primaryKeyValuesPerTableName[table.name] = [];
                        }
                        primaryKeyValuesPerTableName[table.name].push(columnValue);
                    }

                    if (rowColumn.referencesColumn !== undefined) {
                        columnValue = primaryKeyValuesPerTableName[rowColumn.referencesColumn.tableName][rowIndex];
                    }

                    acc[rowColumn.name] = columnValue;
                    return acc;
                }, {});
            }));
        });
        return new Schema(tables);
    }
}

export default SchemaSeeder;
