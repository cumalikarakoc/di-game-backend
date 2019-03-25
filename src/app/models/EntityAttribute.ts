import DataType from "./DataType";

class EntityAttribute {
    public name: string;
    public type: DataType;

    constructor(name: string, type: DataType) {
        this.name = name;
        this.type = type;
    }
}

export default EntityAttribute;
