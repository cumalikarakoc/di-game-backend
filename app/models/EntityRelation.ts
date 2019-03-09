import DataType from "./DataType";
import EntityRelationCardinality from "./EntityRelationCardinality";

class EntityRelation {
    public name: string;
    public targetEntityName: string;
    public cardinality: EntityRelationCardinality;

    constructor(name: string, target: string, cardinality: EntityRelationCardinality) {
        this.name = name;
        this.targetEntityName = name;
        this.cardinality = cardinality;
    }
}

export default EntityRelation;
