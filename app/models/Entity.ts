import EntityAttribute from "./EntityAttribute";
import EntityRelation from "./EntityRelation";

class Entity {
    public name: string;
    public attributes: EntityAttribute[];
    public relations: EntityRelation[];

    constructor(name: string, attributes: EntityAttribute[], relations: EntityRelation[]) {
        this.name = name;
        this.attributes = attributes;
        this.relations = relations;
    }
}

export default Entity;
