import ArrayHelper from "../helpers/ArrayHelper";
import Faker from "../helpers/Faker";
import MathHelper from "../helpers/MathHelper";
import Challenge from "../models/Challenge";
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
import EntityRelationCardinality from "../models/EntityRelationCardinality";
import ChallengeType from "../models/enums/ChallengeType";
import TableStructure from "../models/TableStructure";
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
        const amountOfTablesForJoin = 2;
        const entities = [...Faker.ENTITIES.slice(0, amountOfTablesForJoin)];

        const tableStructures = ArrayHelper.shuffle(this.schemaAnalyzer.buildTableStructures(entities));
        const initialSetupSql = this.sqlGenerator.generateTables(tableStructures);

        const solutionQueryStatement = new QueryStatement();
        const baseTable = tableStructures[0];

        const columnsWithRelation = ArrayHelper.shuffle(baseTable.columns.filter((column) => column.referencesColumn !== undefined));

        let amountOfRelationsLeftToBeCreated = MathHelper.random(1, columnsWithRelation.length - 1);

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

        relatedTables.forEach((relatedTable) => {
            const randomWhere = this.createRandomWhere(tableStructures, baseTable, relatedTable);
            if (randomWhere !== null) {
                solutionQueryStatement.addExpressionToWhereStatement(randomWhere);
            }
        });

        return new Challenge(this.queryDescriptionBuilder.build(solutionQueryStatement), initialSetupSql, this.queryBuilder.build(solutionQueryStatement), this.schemaSeeder.fillTables(this.sqlGenerator.sortToSatisfyDependencies(tableStructures, tableStructures), []));
    }

    private createRandomWhere(tableStructures: TableStructure[], baseTable: TableStructure, relatedTable: TableStructure, forceColumnWhere: boolean = false): WhereExpression | null {
        const shouldUseRelatedExist = Faker.randomBoolean();
        const isManyToOne = baseTable.columns.some((column) => column.referencesColumn !== undefined && column.referencesColumn.tableName === relatedTable.name && column.referencesColumn.sourceRelation.cardinality === EntityRelationCardinality.ONE);

        if (!isManyToOne && forceColumnWhere) {
            return null;
        }

        if (isManyToOne && (forceColumnWhere || !shouldUseRelatedExist)) {
            const possibleColumnsForWhereCondition = relatedTable.columns.filter((column) => !column.isPrimaryKey && column.referencesColumn === undefined);
            const columnsForWhereCondition = possibleColumnsForWhereCondition.slice(0, MathHelper.random(1, possibleColumnsForWhereCondition.length - 1)).map((column) => {
                return new WhereColumn(column.name, SchemaSeeder.getRandomDataForDataType(column.dataType));
            });
            return new WhereColumnValuesExpression([new WhereColumnCollection(columnsForWhereCondition, relatedTable.name)]);
        }

        const columnThatReferencesBaseTable = relatedTable.columns.filter((column) => column.referencesColumn !== undefined && column.referencesColumn.tableName === baseTable.name)[0];
        const amountOfRelatedEntities = MathHelper.random(2, 6);
        const shouldAddNestedWhere = Faker.randomBoolean();

        const nestedWhere: WhereExpression[] = [];

        if (shouldAddNestedWhere) {
            const relatedTablesForRelatedTable = ArrayHelper.shuffle(tableStructures.filter((possibleStructure) => possibleStructure.name !== baseTable.name && !possibleStructure.isPivotTable && possibleStructure.columns.some((column) => column.referencesColumn !== undefined && column.referencesColumn.tableName === relatedTable.name)));
            const couldCreateNestedRelatedTable = Faker.randomBoolean();

            if (couldCreateNestedRelatedTable && relatedTablesForRelatedTable.length > 0) {
                const relatedTableForRelatedTable = relatedTablesForRelatedTable[0];
                const randomWhere = this.createRandomWhere(tableStructures, relatedTable, relatedTableForRelatedTable);

                if (randomWhere !== null) {
                    nestedWhere.push(randomWhere);
                }
            } else {
                const randomWhere = this.createRandomWhere(tableStructures, baseTable, relatedTable, true);
                if (randomWhere !== null) {
                    nestedWhere.push(randomWhere);
                }
            }
        }

        return new WhereRelatedExistsExpression(relatedTable.name, baseTable.name, columnThatReferencesBaseTable.name, SqlGeneratorService.IDENTITY_COLUMN, amountOfRelatedEntities, this.getRandomOperator(), nestedWhere);
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
