import EntityRelationCardinality from "./EntityRelationCardinality";

class EntityRelation {
    public name: string;
    public targetEntityName: string;
    public cardinality: EntityRelationCardinality;
    public label: string;

    constructor(name: string, target: string, cardinality: EntityRelationCardinality, label: string) {
        this.name = name;
        this.targetEntityName = name;
        this.cardinality = cardinality;
        this.label = label;
    }
}

export default EntityRelation;
