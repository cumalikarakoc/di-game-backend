import ArrayHelper from "../helpers/ArrayHelper";
import Faker from "../helpers/Faker";
import MathHelper from "../helpers/MathHelper";
import Challenge from "../models/Challenge";
import ColumnSeedRequirement from "../models/ColumnSeedRequirement";
import CompareOperator from "../models/DSL/CompareOperator";
import QueryBuilder from "../models/DSL/Parsers/QueryBuilder";
import QueryDescriptionBuilder from "../models/DSL/Parsers/QueryDescriptionBuilder";
import QueryExpression from "../models/DSL/QueryExpression";
import QueryExpressionCollection from "../models/DSL/QueryExpressionCollection";
import QueryStatement from "../models/DSL/QueryStatement";
import WhereColumn from "../models/DSL/WhereColumn";
import WhereColumnCollection from "../models/DSL/WhereColumnCollection";
import WhereColumnValuesExpression from "../models/DSL/WhereColumnValuesExpression";
import WhereExpression from "../models/DSL/WhereExpression";
import WhereRelatedExistsExpression from "../models/DSL/WhereRelatedExistsExpression";
import WhereType from "../models/DSL/WhereType";
import ChallengeType from "../models/enums/ChallengeType";
import TableSeedRequirement from "../models/TableSeedRequirement";
import SchemaAnalyzer from "./SchemaAnalyzer";
import SchemaSeeder from "./SchemaSeeder";
import SqlGeneratorService from "./SqlGeneratorService";

class ChallengeService {
    private sqlGenerator: SqlGeneratorService;
    private schemaSeeder: SchemaSeeder;
    private schemaAnalyzer: SchemaAnalyzer;

    constructor(sqlGenerator: SqlGeneratorService, private queryBuilder: QueryBuilder, private queryDescriptionBuilder: QueryDescriptionBuilder, schemaSeeder: SchemaSeeder, schemaAnalyzer: SchemaAnalyzer) {
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

        const solutionQueryStatement = new QueryStatement();
        const baseTable = tableStructures[0];

        const columnsWithRelation = ArrayHelper.shuffle(baseTable.columns.filter((column) => column.referencesColumn !== undefined));

        let amountOfRelationsLeftToBeCreated = MathHelper.random(1, columnsWithRelation.length - 1);
        let amountOfConditionsLeftToBeCreated = MathHelper.random(1, 3);

        const relatedTables = tableStructures.filter((possibleStructure) => possibleStructure.columns.some((column) => column.referencesColumn !== undefined && column.referencesColumn.tableName === baseTable.name));

        const tableSubset = this.schemaAnalyzer.getRandomColumnsSubsetOfTable(baseTable.columns);

        solutionQueryStatement.setFrom(baseTable.name)
            .addExpressionCollectionToSelectStatement(new QueryExpressionCollection(tableSubset.columns.map((columnToSelect) => new QueryExpression(columnToSelect.name)), baseTable.name));

        columnsWithRelation.forEach((column) => {
            if (amountOfRelationsLeftToBeCreated <= 0) {
                return;
            }
            const relatedTable = tableStructures.filter((possibleTable) => column.referencesColumn !== undefined && possibleTable.name === column.referencesColumn.tableName)[0];
            const relatedTableSubset = this.schemaAnalyzer.getRandomColumnsSubsetOfTable(relatedTable.columns);
            const referenceColumn = column.referencesColumn!;

            solutionQueryStatement.addExpressionCollectionToSelectStatement(new QueryExpressionCollection(relatedTableSubset.columns.map((columnToSelect) => new QueryExpression(columnToSelect.name)), relatedTable.name, referenceColumn.columnName, column.name));

            amountOfRelationsLeftToBeCreated--;
        });

        console.log(solutionQueryStatement);

        let amountOfNonNestedRangeChecksCreated = 0;

        relatedTables.forEach((relatedTable) => {
            if (amountOfConditionsLeftToBeCreated <= 0) {
                return;
            }

            const challengeType = this.getRandomChallengeType();
            const columnThatReferencesBaseTable = relatedTable.columns.filter((column) => column.referencesColumn !== undefined && column.referencesColumn.tableName === baseTable.name)[0];
            const includeWhereCondition = Faker.randomBoolean();
            const whereConditionSql = "";
            const whereDescription = "";

            const whereSeedRequirements: ColumnSeedRequirement[] = [];

            let whereExpression;

            if (includeWhereCondition) {
                //     const shouldUseRelationOfRelatedTable = Faker.randomBoolean();
                //     const relatedTablesForRelatedTable = ArrayHelper.shuffle(tableStructures.filter((possibleStructure) => possibleStructure.name !== baseTable.name && !possibleStructure.isPivotTable && possibleStructure.columns.some((column) => column.referencesColumn !== undefined && column.referencesColumn.tableName === relatedTable.name)));
                //
                //     if (shouldUseRelationOfRelatedTable && relatedTablesForRelatedTable.length > 0) {
                //         const relatedTableForRelatedTable = relatedTablesForRelatedTable[0];
                //         const columnThatReferenceRelatedTable = relatedTableForRelatedTable.columns.filter((column) => column.referencesColumn !== undefined && column.referencesColumn.tableName === relatedTable.name)[0];
                //
                //         const rangeCheck = this.schemaAnalyzer.generateRangeCheck(relatedTable, relatedTableForRelatedTable, columnThatReferenceRelatedTable, false);
                //         whereSeedRequirements = [...whereSeedRequirements, ...rangeCheck.seedRequirements];
                //         whereConditionSql = rangeCheck.sql;
                //         whereDescription = `${rangeCheck.description}`;
                //     } else {
                const possibleColumnsForWhereCondition = relatedTable.columns.filter((column) => !column.isPrimaryKey && column.referencesColumn === undefined);
                const columnsForWhereCondition = possibleColumnsForWhereCondition.slice(0, MathHelper.random(1, possibleColumnsForWhereCondition.length - 1)).map(column => {
                    return new WhereColumn(column.name, SchemaSeeder.getRandomDataForDataType(column.dataType));
                });
                whereExpression = new WhereColumnValuesExpression([new WhereColumnCollection(columnsForWhereCondition, relatedTable.name)]);
            }
            // solutionQueryBuilder.addSelect(`(select count(*) FROM ${relatedTable.name} WHERE ${relatedTable.name}.${columnThatReferencesBaseTable.name}=${baseTable.name}.${SqlGeneratorService.IDENTITY_COLUMN} AND ${whereConditionSql}) as ${relatedTable.name}_count`);

            // if (challengeType === ChallengeType.RELATED_COUNT) {
            //     amountOfConditionsLeftToBeCreated--;
            // } else if (challengeType === ChallengeType.MINIMUM_RELATED) {
            const rangeCheck = this.schemaAnalyzer.generateRangeCheck(baseTable, relatedTable, columnThatReferencesBaseTable, amountOfNonNestedRangeChecksCreated === 0, whereConditionSql, whereDescription, whereSeedRequirements);

            const amountOfRelatedEntities = MathHelper.random(2, 6);

            const nestedWhere = whereExpression !== undefined ? [whereExpression] : [];
            solutionQueryStatement.addExpressionToWhereStatement(new WhereRelatedExistsExpression(relatedTable.name, baseTable.name, columnThatReferencesBaseTable.name, SqlGeneratorService.IDENTITY_COLUMN, amountOfRelatedEntities, this.getRandomOperator(), nestedWhere));

            // WHERE exists (SELECT * FROM test where

            console.log(rangeCheck);
            seedRequirements = [...seedRequirements, ...rangeCheck.seedRequirements];
            amountOfNonNestedRangeChecksCreated++;
            // solutionQueryBuilder.addWhere(rangeCheck.sql);
            amountOfConditionsLeftToBeCreated--;
            // }
        });

        return new Challenge(this.queryDescriptionBuilder.build(solutionQueryStatement), initialSetupSql, this.queryBuilder.build(solutionQueryStatement), this.schemaSeeder.fillTables(this.sqlGenerator.sortToSatisfyDependencies(tableStructures, tableStructures), seedRequirements));
    }


    private getRandomOperator(): CompareOperator {
        const randomIndex = MathHelper.random(0, 2);

        return [CompareOperator.EQUALS, CompareOperator.GREATER_OR_EQUAL, CompareOperator.SMALLER_OR_EQUAL][randomIndex];
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
