import QueryExpression from "./QueryExpression";

class QueryExpressionCollection {
    public expressions: QueryExpression[];
    public table: string;
    public ownIdColumn: string|undefined;
    public parentIdColumn: string|undefined;

    constructor(expressions: QueryExpression[], table: string, ownIdColumn?: string, parentIdColumn?: string) {
        this.expressions = expressions;
        this.table = table;
        this.ownIdColumn = ownIdColumn;
        this.parentIdColumn = parentIdColumn;
    }
}

export default QueryExpressionCollection;
