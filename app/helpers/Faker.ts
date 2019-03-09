import DataType from "../models/DataType";
import Entity from "../models/Entity";
import EntityRelationCardinality from "../models/EntityRelationCardinality";
import TableColumn from "../models/TableColumn";
import MathHelper from "./MathHelper";

class Faker {
    public static ENTITIES: Entity[] = [
        {
            attributes: [
                {
                    name: "name",
                    type: DataType.TEXT,
                },
                {
                    name: "age",
                    type: DataType.NUMBER,
                },
            ],
            name: "person",
            relations: [
                {
                    cardinality: EntityRelationCardinality.MANY,
                    name: "car_person",
                    targetEntityName: "car",
                },
            ],
        },
        {
            attributes: [
                {
                    name: "brand",
                    type: DataType.TEXT,
                },
                {
                    name: "hasHook",
                    type: DataType.BOOLEAN,
                },
                {
                    name: "age",
                    type: DataType.NUMBER,
                },
            ],
            name: "car",
            relations: [
                {
                    cardinality: EntityRelationCardinality.ONE,
                    name: "car_person",
                    targetEntityName: "person",
                },
                {
                    cardinality: EntityRelationCardinality.MANY,
                    name: "car_door",
                    targetEntityName: "door",
                },
            ],
        },
        {
            attributes: [
                {
                    name: "position",
                    type: DataType.TEXT,
                },
            ],
            name: "door",
            relations: [
                {
                    cardinality: EntityRelationCardinality.ONE,
                    name: "car_door",
                    targetEntityName: "car",
                },
            ],
        },
    ];

    public static randomBoolean() {
        return MathHelper.random(0, 1) === 1;
    }
}

export default Faker;
