import DataType from "../models/DataType";
import Entity from "../models/Entity";
import EntityRelationCardinality from "../models/EntityRelationCardinality";
import MathHelper from "./MathHelper";

class Faker {
    public static ENTITIES: Entity[] = [
        {
            attributes: [
                {
                    name: "brand",
                    type: DataType.WORD,
                },
                {
                    name: "has_hook",
                    type: DataType.BOOLEAN,
                },
                {
                    name: "age",
                    type: DataType.NUMBER,
                },
                {
                    name: "price",
                    type: DataType.PRICE,
                },
            ],
            name: "car",
            relations: [
                {
                    cardinality: EntityRelationCardinality.ONE,
                    label: "owns",
                    name: "car_person",
                    targetEntityName: "person",
                },
                {
                    cardinality: EntityRelationCardinality.MANY,
                    label: "has",
                    name: "car_door",
                    targetEntityName: "door",
                },
                {
                    cardinality: EntityRelationCardinality.MANY,
                    label: "has",
                    name: "car_wheel",
                    targetEntityName: "wheel",
                },
            ],
        },
        {
            attributes: [
                {
                    name: "height",
                    type: DataType.NUMBER,
                },
                {
                    name: "has_owner",
                    type: DataType.BOOLEAN,
                },
                {
                    name: "age",
                    type: DataType.NUMBER,
                },
            ],
            name: "house",
            relations: [
                {
                    cardinality: EntityRelationCardinality.MANY,
                    label: "who is owned by",
                    name: "house_person",
                    targetEntityName: "person",
                },
            ],
        },
        {
            attributes: [
                {
                    name: "name",
                    type: DataType.NUMBER,
                },
                {
                    name: "street",
                    type: DataType.ADDRESS,
                },
            ],
            name: "school",
            relations: [
                {
                    cardinality: EntityRelationCardinality.MANY,
                    label: "trains",
                    name: "school_person",
                    targetEntityName: "person",
                },
                {
                    cardinality: EntityRelationCardinality.MANY,
                    label: "employs",
                    name: "school_teacher",
                    targetEntityName: "teacher",
                },
            ],
        },
        {
            attributes: [
                {
                    name: "first_name",
                    type: DataType.FIRST_NAME,
                },
                {
                    name: "last_name",
                    type: DataType.LAST_NAME,
                },
                {
                    name: "age",
                    type: DataType.NUMBER,
                },
            ],
            name: "teacher",
            relations: [
                {
                    cardinality: EntityRelationCardinality.MANY,
                    label: "teaches on",
                    name: "school_teacher",
                    targetEntityName: "school",
                },
            ],
        },
        {
            attributes: [
                {
                    name: "name",
                    type: DataType.WORD,
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
                    label: "drives",
                    name: "car_person",
                    targetEntityName: "car",
                },
                {
                    cardinality: EntityRelationCardinality.ONE,
                    label: "owns",
                    name: "house_person",
                    targetEntityName: "house",
                },
                {
                    cardinality: EntityRelationCardinality.ONE,
                    label: "trains",
                    name: "school_person",
                    targetEntityName: "school",
                },
                {
                    cardinality: EntityRelationCardinality.MANY,
                    label: "owns",
                    name: "book_person",
                    targetEntityName: "book",
                },
            ],
        },
        {
            attributes: [
                {
                    name: "position",
                    type: DataType.WORD,
                },
            ],
            name: "door",
            relations: [
                {
                    cardinality: EntityRelationCardinality.ONE,
                    label: "has",
                    name: "car_door",
                    targetEntityName: "car",
                },
            ],
        },
        {
            attributes: [
                {
                    name: "title",
                    type: DataType.SENTENCE,
                },
                {
                    name: "is_best_seller",
                    type: DataType.BOOLEAN,
                },
                {
                    name: "publish_date",
                    type: DataType.DATE,
                },
            ],
            name: "book",
            relations: [
                {
                    cardinality: EntityRelationCardinality.ONE,
                    label: "has",
                    name: "book_person",
                    targetEntityName: "person",
                },
            ],
        },
        {
            attributes: [
                {
                    name: "pressure",
                    type: DataType.NUMBER,
                },
            ],
            name: "wheel",
            relations: [
                {
                    cardinality: EntityRelationCardinality.ONE,
                    label: "has",
                    name: "car_wheel",
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
