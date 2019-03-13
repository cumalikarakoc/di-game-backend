import ArrayHelper from "../helpers/ArrayHelper";
import Faker from "../helpers/Faker";
import MathHelper from "../helpers/MathHelper";
import Challenge from "../models/Challenge";
import ColumnSeedRequirement from "../models/ColumnSeedRequirement";
import EntityRelationCardinality from "../models/EntityRelationCardinality";
import ChallengeType from "../models/enums/ChallengeType";
import Join from "../models/Query/Join";
import JoinType from "../models/Query/JoinType";
import SeedRequirement from "../models/SeedRequirement";
import TableSeedRequirement from "../models/TableSeedRequirement";
import QueryBuilder from "./QueryBuilder";
import SchemaAnalyzer from "./SchemaAnalyzer";
import SchemaSeeder from "./SchemaSeeder";
import SqlGeneratorService from "./SqlGeneratorService";

class ChallengeService {
    private sqlGenerator: SqlGeneratorService;
    private schemaSeeder: SchemaSeeder;
    private schemaAnalyzer: SchemaAnalyzer;

    constructor(sqlGenerator: SqlGeneratorService, schemaSeeder: SchemaSeeder, schemaAnalyzer: SchemaAnalyzer) {
        this.sqlGenerator = sqlGenerator;
        this.schemaSeeder = schemaSeeder;
        this.schemaAnalyzer = schemaAnalyzer;
    }

    public generateRandomChallenge(): Challenge {
        let seedRequirements: TableSeedRequirement[] = [];
        const amountOfTablesForJoin = 2;
        const entities = [...Faker.ENTITIES.slice(0, amountOfTablesForJoin)];

        const tableStructures = ArrayHelper.shuffle(this.schemaAnalyzer.buildTableStructures(entities));
        const initialSetupSql = this.sqlGenerator.generateTables(tableStructures);

        const solutionQueryBuilder = new QueryBuilder();
        let challengeDescription = "";
        const baseTable = tableStructures[0];

        const columnsWithRelation = ArrayHelper.shuffle(baseTable.columns.filter((column) => column.referencesColumn !== undefined));

        let amountOfRelationsLeftToBeCreated = MathHelper.random(1, columnsWithRelation.length - 1);
        let amountOfConditionsLeftToBeCreated = MathHelper.random(1, 3);

        const relatedTables = tableStructures.filter((possibleStructure) => possibleStructure.columns.some((column) => column.referencesColumn !== undefined && column.referencesColumn.tableName === baseTable.name));

        const tableSubset = this.schemaAnalyzer.getRandomColumnsSubsetOfTable(baseTable.columns);

        solutionQueryBuilder.setFrom(baseTable.name)
            .addSelects(tableSubset.columns.map((columnToSelect) => `${baseTable.name}.${columnToSelect.name}`));

        challengeDescription += `select ${tableSubset.description} from each ${baseTable.name}`;

        columnsWithRelation.forEach((column) => {
            if (amountOfRelationsLeftToBeCreated <= 0) {
                return;
            }
            const relatedTable = tableStructures.filter((possibleTable) => column.referencesColumn !== undefined && possibleTable.name === column.referencesColumn.tableName)[0];
            const relatedTableSubset = this.schemaAnalyzer.getRandomColumnsSubsetOfTable(relatedTable.columns);
            const referenceColumn = column.referencesColumn!;

            challengeDescription += ` with ${relatedTableSubset.description} of their related ${relatedTable.name + (referenceColumn.sourceRelation.cardinality === EntityRelationCardinality.ONE ? "" : "s")}`;

            solutionQueryBuilder
                .addSelects(relatedTableSubset.columns.map((columnToSelect) => `${relatedTable.name}.${columnToSelect.name}`))
                .addJoin(new Join(JoinType.INNER, relatedTable.name, `${baseTable.name}.${column.name}=${referenceColumn.tableName}.${referenceColumn.columnName}`));

            amountOfRelationsLeftToBeCreated--;
        });

        let amountOfNonNestedRangeChecksCreated = 0;

        relatedTables.forEach((relatedTable) => {
            if (amountOfConditionsLeftToBeCreated <= 0) {
                return;
            }

            const challengeType = this.getRandomChallengeType();
            const columnThatReferencesBaseTable = relatedTable.columns.filter((column) => column.referencesColumn !== undefined && column.referencesColumn.tableName === baseTable.name)[0];
            const includeWhereCondition = Faker.randomBoolean();
            let whereConditionSql = "";
            let whereDescription = "";

            let whereSeedRequirements: SeedRequirement[] = [];

            if (includeWhereCondition) {
                const shouldUseRelationOfRelatedTable = Faker.randomBoolean();
                const relatedTablesForRelatedTable = ArrayHelper.shuffle(tableStructures.filter((possibleStructure) => possibleStructure.name !== baseTable.name && !possibleStructure.isPivotTable && possibleStructure.columns.some((column) => column.referencesColumn !== undefined && column.referencesColumn.tableName === relatedTable.name)));

                if (shouldUseRelationOfRelatedTable && relatedTablesForRelatedTable.length > 0) {
                    const relatedTableForRelatedTable = relatedTablesForRelatedTable[0];
                    const columnThatReferenceRelatedTable = relatedTableForRelatedTable.columns.filter((column) => column.referencesColumn !== undefined && column.referencesColumn.tableName === relatedTable.name)[0];

                    const rangeCheck = this.schemaAnalyzer.generateRangeCheck(relatedTable, relatedTableForRelatedTable, columnThatReferenceRelatedTable, false);
                    whereSeedRequirements = [...whereSeedRequirements, ...rangeCheck.seedRequirements];
                    whereConditionSql = rangeCheck.sql;
                    whereDescription = `${rangeCheck.description}`;
                } else {
                    const possibleColumnsForWhereCondition = relatedTable.columns.filter((column) => !column.isPrimaryKey && column.referencesColumn === undefined);
                    const columnsForWhereCondition = possibleColumnsForWhereCondition.slice(0, MathHelper.random(1, possibleColumnsForWhereCondition.length - 1));

                    const valuesForColumnByColumnName = columnsForWhereCondition.reduce((acc: any, column) => {
                        acc[column.name] = SchemaSeeder.getRandomDataForDataType(column.dataType);
                        return acc;
                    }, {});

                    whereSeedRequirements = [...whereSeedRequirements, ...columnsForWhereCondition.map((column) => {
                        return new ColumnSeedRequirement(relatedTable.name, column.name, valuesForColumnByColumnName[column.name]);
                    })];

                    whereConditionSql = `${columnsForWhereCondition.map((column) => {
                        return `${column.name}=${valuesForColumnByColumnName[column.name]}`;
                    }).join(" AND ")}`;

                    whereDescription = `where ${columnsForWhereCondition.map((column) => {
                        return `the ${column.name} is ${valuesForColumnByColumnName[column.name]}`;
                    }).join(" and ")}`;
                }

                amountOfConditionsLeftToBeCreated--;
            }

            if (challengeType === ChallengeType.RELATED_COUNT) {
                solutionQueryBuilder.addSelect(`(select count(*) FROM ${relatedTable.name} WHERE ${relatedTable.name}.${columnThatReferencesBaseTable.name}=${baseTable.name}.${SqlGeneratorService.IDENTITY_COLUMN} AND ${whereConditionSql}) as ${relatedTable.name}_count`);
                challengeDescription += `with the amount of ${relatedTable.name}s${includeWhereCondition ? " where " + whereDescription : ""} they own`;
                amountOfConditionsLeftToBeCreated--;
            } else if (challengeType === ChallengeType.MINIMUM_RELATED) {
                const rangeCheck = this.schemaAnalyzer.generateRangeCheck(baseTable, relatedTable, columnThatReferencesBaseTable, amountOfNonNestedRangeChecksCreated === 0, whereConditionSql, whereDescription, whereSeedRequirements);
                seedRequirements = [...seedRequirements, ...rangeCheck.seedRequirements];
                amountOfNonNestedRangeChecksCreated++;
                solutionQueryBuilder.addWhere(rangeCheck.sql);
                challengeDescription += ` ${rangeCheck.description}`;
                amountOfConditionsLeftToBeCreated--;
            }
        });

        challengeDescription += ".";

        return new Challenge(challengeDescription, initialSetupSql, solutionQueryBuilder.build(), this.schemaSeeder.fillTables(this.sqlGenerator.sortToSatisfyDependencies(tableStructures, tableStructures), seedRequirements));
    }

    private getRandomChallengeType() {
        const randomNumber = MathHelper.random(1, 10);

        if (randomNumber < 5) {
            return ChallengeType.MINIMUM_RELATED;
        }

        return ChallengeType.RELATED_COUNT;
    }
}

export default ChallengeService;
