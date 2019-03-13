import Schema from "./Schema";

class Challenge {
  public description: string = "";
  public solutionSql: string = "";
  public initialSetupSql: string = "";
  public initialSchema: Schema;

  constructor(description: string, initialSetupSql: string, solutionSql: string, initialSchema: Schema) {
    this.description = description;
    this.initialSetupSql = initialSetupSql;
    this.solutionSql = solutionSql;
    this.initialSchema = initialSchema;
  }
}

export default Challenge;
