import Faker from "../helpers/Faker";
import MathHelper from "../helpers/MathHelper";
import Challenge from "../models/Challenge";
import ColumnReference from "../models/ColumnReference";
import DataType from "../models/DataType";
import Entity from "../models/Entity";
import EntityRelation from "../models/EntityRelation";
import EntityRelationCardinality from "../models/EntityRelationCardinality";
import ChallengeType from "../models/enums/ChallengeType";
import Join from "../models/Query/Join";
import JoinType from "../models/Query/JoinType";
import RangeCheck from "../models/Query/RangeCheck";
import Schema from "../models/Schema";
import Table from "../models/Table";
import TableColumn from "../models/TableColumn";
import TableStructure from "../models/TableStructure";
import TableSubset from "../models/TableSubset";
import QueryBuilder from "./QueryBuilder";
import SqlGeneratorService from "./SqlGeneratorService";

class ChallengeService {
    private sqlGenerator: SqlGeneratorService;

    constructor(sqlGenerator: SqlGeneratorService) {
        this.sqlGenerator = sqlGenerator;
    }

    public generateRandomChallenge(): Challenge {
        const amountOfTablesForJoin = 2;
        const entities = [...Faker.ENTITIES.slice(0, amountOfTablesForJoin)];

        const tableStructures = this.buildTableStructures(entities);
        const initialSetupSql = this.sqlGenerator.generateTables(tableStructures);

        const solutionQueryBuilder = new QueryBuilder();
        let challengeDescription = "";
        const baseTable = tableStructures.filter((x) => x.name === "person")[0];

        const columnsWithRelation = baseTable.columns.filter((column) => column.referencesColumn !== undefined);
        columnsWithRelation.sort((_) => 0.5 - Math.random());

        let amountOfRelationsLeftToBeCreated = MathHelper.random(1, columnsWithRelation.length - 1);
        let amountOfConditionsLeftToBeCreated = MathHelper.random(1, 3);

        const relatedTables = tableStructures.filter((possibleStructure) => possibleStructure.columns.some((column) => column.referencesColumn !== undefined && column.referencesColumn.tableName === baseTable.name));

        const tableSubset = this.getRandomColumnsSubsetOfTable(baseTable.columns);

        solutionQueryBuilder.setFrom(baseTable.name)
            .addSelects(tableSubset.columns.map((columnToSelect) => `${baseTable.name}.${columnToSelect.name}`));

        challengeDescription += `Select ${tableSubset.description} from ${baseTable.name}`;

        columnsWithRelation.forEach((column) => {
            if (amountOfRelationsLeftToBeCreated <= 0) {
                return;
            }
            const relatedTable = tableStructures.filter((possibleTable) => column.referencesColumn !== undefined && possibleTable.name === column.referencesColumn.tableName)[0];

            const relatedTableSubset = this.getRandomColumnsSubsetOfTable(relatedTable.columns);

            challengeDescription += ` with ${relatedTableSubset.description} of their related ${relatedTable.name + (column.referencesColumn.sourceRelation.cardinality === EntityRelationCardinality.ONE ? "" : "s")}`;

            solutionQueryBuilder
                .addSelects(relatedTableSubset.columns.map((columnToSelect) => `${baseTable.name}.${columnToSelect.name}`))
                .addJoin(new Join(JoinType.INNER, relatedTable.name, `${baseTable.name}.${column.name}=${column.referencesColumn.tableName}.${column.referencesColumn.columnName}`));

            amountOfRelationsLeftToBeCreated--;
        });

        relatedTables.forEach((relatedTable) => {
            if (amountOfConditionsLeftToBeCreated <= 0) {
                return;
            }

            const challengeType = this.getRandomChallengeType();
            const columnThatReferencesBaseTable = relatedTable.columns.filter((column) => column.referencesColumn !== undefined && column.referencesColumn.tableName === baseTable.name)[0];

            const includeWhereCondition = true;
            let whereConditionSql = "";
            let whereDescription = "";

            if (includeWhereCondition) {
                const shouldUseRelationOfRelatedTable = true;
                const relatedTablesForRelatedTable = tableStructures.filter((possibleStructure) => possibleStructure.name !== baseTable.name && !possibleStructure.isPivotTable && possibleStructure.columns.some((column) => column.referencesColumn !== undefined && column.referencesColumn.tableName === relatedTable.name));
                relatedTablesForRelatedTable.sort((_) => 0.5 - Math.random());

                const relatedTableForRelatedTable = relatedTablesForRelatedTable[0];
                const columnThatReferenceRelatedTable = relatedTableForRelatedTable.columns.filter((column) => column.referencesColumn !== undefined && column.referencesColumn.tableName === relatedTable.name)[0];

                if (shouldUseRelationOfRelatedTable) {
                    const rangeCheck = this.generateRangeCheck(relatedTable, relatedTableForRelatedTable, columnThatReferenceRelatedTable);
                    whereConditionSql = rangeCheck.sql;
                    whereDescription = `${rangeCheck.description}`;
                } else {
                    const possibleColumnsForWhereCondition = relatedTable.columns.filter((column) => !column.isPrimaryKey && column.referencesColumn === undefined);
                    const columnsForWhereCondition = possibleColumnsForWhereCondition.slice(0, MathHelper.random(1, possibleColumnsForWhereCondition.length - 1));

                    const valuesForColumnByColumnName = columnsForWhereCondition.reduce((acc: any, column) => {
                        acc[column.name] = this.getRandomDataForDataType(column.dataType);
                        return acc;
                    }, {});

                    // TODO: FIX SEED REQUIREMENT
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
                const rangeCheck = this.generateRangeCheck(baseTable, relatedTable, columnThatReferencesBaseTable, whereConditionSql, whereDescription);
                solutionQueryBuilder.addWhere(rangeCheck.sql);
                challengeDescription += ` ${rangeCheck.description}`;
                amountOfConditionsLeftToBeCreated--;
            }
        });

        return new Challenge(challengeDescription, initialSetupSql, solutionQueryBuilder.build(), new Schema([
            new Table(
                "",
                [],
                [],
            ),
        ]));
    }

    private getRandomDataForDataType(dataType: DataType) {
        if (dataType === DataType.TEXT) {
            return "aaa";
        }

        if (dataType === DataType.NUMBER) {
            return MathHelper.random(1, 40);
        }

        return Faker.randomBoolean();
    }

    private generateRangeCheck(baseTable: TableStructure, relatedTable: TableStructure, columnThatReferencesBaseTable: TableColumn, additionalWhereSql = "", additionalWhereDescription = ""): RangeCheck {
        const evenOrMoreIsRequired = Faker.randomBoolean();
        const range = MathHelper.random(2, 6);
        const rangeCheck = evenOrMoreIsRequired ? `>= ${range}` : `<= ${range}`;

        const sqlCheck = `EXISTS (select 1 FROM ${relatedTable.name} WHERE ${relatedTable.name}.${columnThatReferencesBaseTable.name}=${baseTable.name}.${SqlGeneratorService.IDENTITY_COLUMN}${additionalWhereSql !== "" ? ` AND ${additionalWhereSql}` : ""} HAVING COUNT(*) ${rangeCheck})`;
        const checkDescription = `${columnThatReferencesBaseTable.referencesColumn.sourceRelation.label} ${range} or ${evenOrMoreIsRequired ? "more" : "less"} ${relatedTable.name}s${additionalWhereSql !== "" ? ` ${additionalWhereDescription}` : ""}`;

        return new RangeCheck(sqlCheck, checkDescription);
    }

    private getRandomColumnsSubsetOfTable(allColumns: TableColumn[]): TableSubset {
        const possibleColumns = allColumns.filter((tableColumn) => tableColumn.referencesColumn === undefined);
        const columnsToSelectFromRelatedTable = possibleColumns
            .slice(0, MathHelper.random(1, possibleColumns.length - 1));

        const columnSelectionAsText = columnsToSelectFromRelatedTable.length === possibleColumns.length
            ? "all"
            : columnsToSelectFromRelatedTable.map((relatedColumn) => relatedColumn.name).join(", ");

        return new TableSubset(columnsToSelectFromRelatedTable, columnSelectionAsText);
    }

    private buildTableStructures(entities: Entity[], tableStructures: TableStructure[] = [], usedRelationNames: string[] = []): TableStructure[] {
        return entities.reduce((tableStructuresPerEntity: TableStructure[][], entity: Entity) => {
            const possibleColumns = this.getPossibleColumnsForEntity(entity);

            const tableStructuresForRelatedTables: TableStructure[] = entity.relations
                .filter((relation) => usedRelationNames.indexOf(relation.name) === -1)
                .reduce((acc: TableStructure[], relation: EntityRelation) => {
                    const relatedEntity = Faker.ENTITIES.filter((possibleEntity) => possibleEntity.name === relation.targetEntityName)[0];
                    const inverseRelation = relatedEntity.relations.filter((invertedRelation) => invertedRelation.targetEntityName === entity.name)[0];

                    usedRelationNames.push(relation.name);

                    if (relation.cardinality === EntityRelationCardinality.MANY && inverseRelation.cardinality === EntityRelationCardinality.MANY) {
                        const firstManyColumnReference = new ColumnReference(entity.name, SqlGeneratorService.IDENTITY_COLUMN, relation);
                        const secondManyColumnReference = new ColumnReference(relatedEntity.name, SqlGeneratorService.IDENTITY_COLUMN, inverseRelation);

                        return [
                            ...acc,
                            new TableStructure(relatedEntity.name, this.getPossibleColumnsForEntity(relatedEntity)),
                            new TableStructure(relation.name, [
                                new TableColumn(entity.name + "_" + SqlGeneratorService.IDENTITY_COLUMN, SqlGeneratorService.IDENTITY_TYPE, false, firstManyColumnReference),
                                new TableColumn(relatedEntity.name + "_" + SqlGeneratorService.IDENTITY_COLUMN, SqlGeneratorService.IDENTITY_TYPE, false, secondManyColumnReference),
                            ], true),
                        ];
                    }

                    return [...this.buildTableStructures([relatedEntity], tableStructures, usedRelationNames), ...acc];
                }, []);

            const entityHasBeenCreatedBefore = tableStructuresPerEntity.some((tableStructuresForEntity) => tableStructuresForEntity.some((structure) => structure.name === entity.name));
            const entityHasBeenCreatedInThisIteration = tableStructures.some((structure) => structure.name === entity.name);
            const tableStructureForCurrentEntity = entityHasBeenCreatedBefore || entityHasBeenCreatedInThisIteration ? [] : [new TableStructure(entity.name, possibleColumns)];

            return [...tableStructuresPerEntity, [...tableStructuresForRelatedTables, ...tableStructures, ...tableStructureForCurrentEntity]];
        }, []).reduce((acc, tableStructuresForEntity) => [...acc, ...tableStructuresForEntity], []);
    }

    private getPossibleColumnsForEntity(entity: Entity) {
        return [
            new TableColumn(SqlGeneratorService.IDENTITY_COLUMN, SqlGeneratorService.IDENTITY_TYPE, true),
            ...entity.attributes.slice(0, MathHelper.random(1, 5))
                .map((attribute) => new TableColumn(attribute.name, attribute.type), false),
            ...entity.relations.filter((relation) => {
                const relatedEntity = Faker.ENTITIES.filter((possibleEntity) => possibleEntity.name === relation.targetEntityName)[0];
                const inverseRelation = relatedEntity.relations.filter((invertedRelation) => invertedRelation.targetEntityName === entity.name)[0];

                return !(relation.cardinality === EntityRelationCardinality.MANY && inverseRelation.cardinality === EntityRelationCardinality.MANY) && relation.cardinality !== EntityRelationCardinality.MANY;
            }).map((relation) => {
                const reference = new ColumnReference(relation.targetEntityName, SqlGeneratorService.IDENTITY_COLUMN, relation);
                const columnName = `${relation.targetEntityName}_${SqlGeneratorService.IDENTITY_COLUMN}`;

                return new TableColumn(columnName, SqlGeneratorService.IDENTITY_TYPE, false, reference);
            }),
        ];
    }

    private getRandomChallengeType() {
        const randomNumber = MathHelper.random(1, 10);

        if (randomNumber < 11) {
            return ChallengeType.MINIMUM_RELATED;
        }

        return ChallengeType.RELATED_COUNT;
    }
}

export default ChallengeService;
