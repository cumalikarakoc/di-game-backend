import JoinType from "./JoinType";

class Join {
    public type: JoinType;
    public table: string;
    public condition: string;

    constructor(type: JoinType, table: string, condition: string) {
        this.type = type;
        this.table = table;
        this.condition = condition;
    }
}

export default Join;
