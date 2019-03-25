import Schema from "./Schema";

class Challenge {
    public description: string = "";
    public solutionSql: string = "";
    public initialSchema: Schema;

    constructor(description: string, solutionSql: string, initialSchema: Schema) {
        this.description = description;
        this.solutionSql = solutionSql;
        this.initialSchema = initialSchema;
    }
}

export default Challenge;
