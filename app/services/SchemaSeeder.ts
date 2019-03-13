import faker from "faker";
import Faker from "../helpers/Faker";
import MathHelper from "../helpers/MathHelper";
import DataType from "../models/DataType";
import Schema from "../models/Schema";
import SeedRequirement from "../models/SeedRequirement";
import Table from "../models/Table";
import TableColumn from "../models/TableColumn";
import TableSeedRequirement from "../models/TableSeedRequirement";
import TableStructure from "../models/TableStructure";

class SchemaSeeder {
    public static getRandomDataForDataType(dataType: DataType) {
        switch (dataType) {
            case DataType.WORD: return faker.lorem.word();
            case DataType.SENTENCE: return faker.lorem.sentence();
            case DataType.ADDRESS: return faker.address.streetAddress(true);
            case DataType.FIRST_NAME: return faker.name.firstName();
            case DataType.LAST_NAME: return faker.name.lastName();
            case DataType.NUMBER: return faker.random.number({min: 1, max: 300});
            case DataType.AGE: return faker.random.number({min: 1, max: 100});
            case DataType.PRICE: return faker.random.number({min: 15, max: 45000});
            case DataType.BOOLEAN: return faker.random.boolean();
            case DataType.DATE: return faker.date;
            default: return Faker.randomBoolean();
        }
    }

    public fillTables(tableStructures: TableStructure[], seedRequirements: SeedRequirement[]): Schema {
        console.log(seedRequirements);
        const primaryKeyValuesPerTableName: any = {};
        const tables = tableStructures.map((table) => {
            const seedRequirementsForCurrentTable = seedRequirements.filter((seedRequirement) => {
                return seedRequirement instanceof TableSeedRequirement && seedRequirement.targetTable === table.name;
            });

            const hasSeedRequirementsForCurrentTable = seedRequirementsForCurrentTable.length > 0;

            const amountOfRecordsToCreateWithSameRelation = hasSeedRequirementsForCurrentTable
                ? (seedRequirementsForCurrentTable[0] as TableSeedRequirement).amountOfRows
                : 0;

            const amountOfRecordsToCreate = MathHelper.random(Math.max(amountOfRecordsToCreateWithSameRelation, 1), amountOfRecordsToCreateWithSameRelation + 4);

            let idIndex = 0;
            let amountOfRecordsCreatedWithSameRelation = 0;

            return new Table(table.name, table.columns.map((column) => column.name), Array(amountOfRecordsToCreate).fill(1).map(() => {
                return table.columns.reduce((acc: any, rowColumn: TableColumn) => {
                    const columnRequirements = hasSeedRequirementsForCurrentTable ? (seedRequirements[0] as TableSeedRequirement).relatedRequirements : [];
                    const requirementForCurrentColumn = columnRequirements.filter((columnRequirement) => columnRequirement.column === rowColumn.name);

                    const isCreatingForRelation = amountOfRecordsCreatedWithSameRelation < amountOfRecordsToCreateWithSameRelation;

                    let columnValue = isCreatingForRelation && requirementForCurrentColumn.length > 0
                        ? columnRequirements[0].value
                        : SchemaSeeder.getRandomDataForDataType(rowColumn.dataType);

                    if (rowColumn.isPrimaryKey) {
                        if (!primaryKeyValuesPerTableName.hasOwnProperty(table.name)) {
                            primaryKeyValuesPerTableName[table.name] = [];
                        }
                        primaryKeyValuesPerTableName[table.name].push(columnValue);
                    }

                    if (rowColumn.referencesColumn !== undefined) {
                        const indexOfIdToReference = isCreatingForRelation
                            ? idIndex
                            : ++idIndex;

                        columnValue = primaryKeyValuesPerTableName[rowColumn.referencesColumn.tableName][indexOfIdToReference];
                        amountOfRecordsCreatedWithSameRelation++;
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
