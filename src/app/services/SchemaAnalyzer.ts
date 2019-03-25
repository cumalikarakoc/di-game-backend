import Faker from "../helpers/Faker";
import MathHelper from "../helpers/MathHelper";
import SentenceHelper from "../helpers/SentenceHelper";
import ColumnReference from "../models/ColumnReference";
import ColumnSeedRequirement from "../models/ColumnSeedRequirement";
import Entity from "../models/Entity";
import EntityRelation from "../models/EntityRelation";
import EntityRelationCardinality from "../models/EntityRelationCardinality";
import RangeCheck from "../models/Query/RangeCheck";
import TableSeedRequirement from "../models/TableSeedRequirement";
import TableColumn from "../models/TableColumn";
import TableStructure from "../models/TableStructure";
import TableSubset from "../models/TableSubset";
import SqlGeneratorService from "./SqlGeneratorService";

class SchemaAnalyzer {
    public generateRangeCheck(baseTable: TableStructure, relatedTable: TableStructure, columnThatReferencesBaseTable: TableColumn, isFirstCheck: boolean, additionalWhereSql = "", additionalWhereDescription = "", additionalWhereSeedRequirements: ColumnSeedRequirement[] = []): RangeCheck {
        const evenOrMoreIsRequired = Faker.randomBoolean();
        const range = MathHelper.random(2, 6);
        const rangeCheck = evenOrMoreIsRequired ? `>= ${range}` : `<= ${range}`;

        const whereJoinText = isFirstCheck ? "where" : "and";
        const sqlCheck = `EXISTS (select 1 FROM ${relatedTable.name} WHERE ${relatedTable.name}.${columnThatReferencesBaseTable.name}=${baseTable.name}.${SqlGeneratorService.IDENTITY_COLUMN}${additionalWhereSql !== "" ? ` AND ${additionalWhereSql}` : ""} HAVING COUNT(*) ${rangeCheck})`;
        const checkDescription = `${whereJoinText} the ${baseTable.name} ${columnThatReferencesBaseTable.referencesColumn!.sourceRelation.label} ${range} or ${evenOrMoreIsRequired ? "more" : "less"} ${relatedTable.name}s${additionalWhereSql !== "" ? ` ${additionalWhereDescription}` : ""}`;

        return new RangeCheck(sqlCheck, checkDescription, [new TableSeedRequirement(baseTable.name, relatedTable.name, range, additionalWhereSeedRequirements)]);
    }

    public getRandomColumnsSubsetOfTable(allColumns: TableColumn[]): TableSubset {
        const possibleColumns = allColumns.filter((tableColumn) => tableColumn.referencesColumn === undefined);
        const columnsToSelectFromRelatedTable = possibleColumns
            .slice(0, MathHelper.random(2, possibleColumns.length - 1));

        const columnSelectionAsText = columnsToSelectFromRelatedTable.length === possibleColumns.length
            ? "all fields"
            : "the " + SentenceHelper.toList(columnsToSelectFromRelatedTable.map((relatedColumn) => relatedColumn.name));

        return new TableSubset(columnsToSelectFromRelatedTable, columnSelectionAsText);
    }

    public buildTableStructures(entities: Entity[], tableStructures: TableStructure[] = [], usedRelationNames: string[] = []): TableStructure[] {
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

            return [...tableStructuresPerEntity, [...tableStructures, ...tableStructureForCurrentEntity, ...tableStructuresForRelatedTables]];
        }, []).reduce((acc, tableStructuresForEntity) => [...acc, ...tableStructuresForEntity], []);
    }

    public getPossibleColumnsForEntity(entity: Entity) {
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
}

export default SchemaAnalyzer;
