import Faker from "../helpers/Faker";
import MathHelper from "../helpers/MathHelper";
import Challenge from "../models/Challenge";
import ColumnReference from "../models/ColumnReference";
import Entity from "../models/Entity";
import EntityRelation from "../models/EntityRelation";
import EntityRelationCardinality from "../models/EntityRelationCardinality";
import ChallengeType from "../models/enums/ChallengeType";
import Schema from "../models/Schema";
import Table from "../models/Table";
import TableColumn from "../models/TableColumn";
import TableStructure from "../models/TableStructure";
import SqlGeneratorService from "./SqlGeneratorService";

class ChallengeService {
    private sqlGenerator: SqlGeneratorService;

    constructor(sqlGenerator: SqlGeneratorService) {
        this.sqlGenerator = sqlGenerator;
    }

    public generateRandomChallenge(): Challenge {
        const amountOfTablesForJoin = 2;
        const entities = [...Faker.ENTITIES.slice(0, amountOfTablesForJoin)];

        const initialSetupSql = this.sqlGenerator.generateTables(this.buildTableStructures(entities));
        const solutionSql = `SELECT *
                             from hier`;

        return new Challenge("hello world", initialSetupSql, solutionSql, new Schema([
            new Table(
                "",
                [],
                [],
            ),
        ]));
        //
        // const challengeType = this.getRandomChallengeType();

        //
        // const tablesUsed = 0;
        //
        // const tablesToGenerate = entities.map((entity, tableIndex) => {
        //     const possibleColumns = this.getPossibleColumnsForEntity(entity);
        //
        //     const columnsToSelect = possibleColumns.slice(0, MathHelper.random(1, possibleColumns.length));
        //
        //     const columnSelection = columnsToSelect.length === possibleColumns.length
        //         ? "all"
        //         : columnsToSelect.map((column) => column.name).join(", ");
        //
        //     const challengeDescription = `Get ${columnSelection} from table ${entity.name}`;
        //
        //     columnsToSelect.filter((column) => column.referencesColumn !== undefined).map((column) => {
        //         const relatedEntity = Faker.ENTITIES.filter((possibleEntity) => possibleEntity.name === column.referencesColumn.tableName)[0];
        //         const columnsForRelatedEntity = this.getPossibleColumnsForEntity(relatedEntity);
        //
        //     });
        //
        //     return new TableStructure(entity.name, possibleColumns);
        // });
        //
        // const initialSetupSql = this.sqlGenerator.generateTables([]);
        //
        // const solutionSql = `SELECT ${columnsToSelect.map((column) => column.name).join(",")} FROM ${tableName}`;
        //
        // return new Challenge(challengeDescription, initialSetupSql, solutionSql, new Schema([
        //     new Table(
        //         tableName,
        //         columnsToSelect.map((column) => column.name),
        //         [],
        //     ),
        // ]));
    }

    private buildTableStructures(entities: Entity[], tableStructures: TableStructure[] = [], usedRelationNames: string[] = []): TableStructure[] {
        return entities.reduce((tableStructuresPerEntity: TableStructure[][], entity: Entity) => {
            const possibleColumns = this.getPossibleColumnsForEntity(entity);

            const tableStructuresForRelatedTables: TableStructure[] = entity.relations
                .filter((relation) => usedRelationNames.indexOf(relation.name) === -1)
                .reduce((acc: TableStructure[], relation: EntityRelation) => {
                    const relatedEntity = Faker.ENTITIES.filter((possibleEntity) => possibleEntity.name === relation.targetEntityName)[0];
                    const inverseRelation = relatedEntity.relations.filter((invertedRelation) => invertedRelation.targetEntityName === entity.name)[0];

                    usedRelationNames.push(relation.name)

                    if (relation.cardinality === EntityRelationCardinality.MANY && inverseRelation.cardinality === EntityRelationCardinality.MANY) {
                        return [...acc, new TableStructure(relation.name, [
                            new TableColumn(entity.name + "_" + SqlGeneratorService.IDENTITY_COLUMN, SqlGeneratorService.IDENTITY_TYPE),
                            new TableColumn(relatedEntity.name + "_" + SqlGeneratorService.IDENTITY_COLUMN, SqlGeneratorService.IDENTITY_TYPE),
                        ])];
                    }

                    return [...acc, ...this.buildTableStructures([relatedEntity], tableStructures, usedRelationNames)];
                }, []);

            const entityHasBeenCreatedBefore = tableStructuresPerEntity.some((tableStructuresForEntity) => tableStructuresForEntity.some((structure) => structure.name === entity.name));
            const entityHasBeenCreatedInThisIteration = tableStructures.some((structure) => structure.name === entity.name);
            const tableStructureForCurrentEntity = entityHasBeenCreatedBefore || entityHasBeenCreatedInThisIteration ? [] : [new TableStructure(entity.name, possibleColumns)];

            return [...tableStructuresPerEntity, [...tableStructureForCurrentEntity, ...tableStructures, ...tableStructuresForRelatedTables]];
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
            } ).map((relation) => {
                const reference = new ColumnReference(relation.targetEntityName, SqlGeneratorService.IDENTITY_COLUMN, relation);
                const columnName = `${relation.targetEntityName}_${SqlGeneratorService.IDENTITY_COLUMN}`;

                return new TableColumn(columnName, SqlGeneratorService.IDENTITY_TYPE, false, reference);
            }),
        ];
    }

    private getRandomChallengeType() {
        const randomNumber = MathHelper.random(1, 10);

        if (randomNumber > 11) {
            return ChallengeType.COMBINE;
        }

        return ChallengeType.SINGLE;
    }
}

export default ChallengeService;
