import QueryExpression from "./QueryExpression";
import QueryExpressionCollection from "./QueryExpressionCollection";
import WhereExpression from "./WhereExpression";

class QueryStatement {
    public defaultSelectStatementExpressions: QueryExpression[] = [];
    public selectStatementExpressionCollections: QueryExpressionCollection[] = [];
    public whereStatementExpressions: WhereExpression[] = [];
    public from: string = "";

    public addExpressionToSelectStatement(expression: QueryExpression) {
        this.addExpressionsToSelectStatement([expression]);
        return this;
    }

    public addExpressionsToSelectStatement(expressions: QueryExpression[]) {
        this.defaultSelectStatementExpressions = [...this.defaultSelectStatementExpressions, ...expressions];
        return this;
    }

    public addExpressionCollectionToSelectStatement(expressionCollection: QueryExpressionCollection) {
        return this.addExpressionCollectionsToSelectStatement([expressionCollection]);
    }

    public addExpressionCollectionsToSelectStatement(expressionCollections: QueryExpressionCollection[]) {
        this.selectStatementExpressionCollections = [...this.selectStatementExpressionCollections, ...expressionCollections];
        return this;
    }

    public setFrom(from: string) {
        this.from = from;
        return this;
    }

    public addExpressionToWhereStatement(expression: WhereExpression) {
        this.whereStatementExpressions.push(expression);
        return this;
    }
}

export default QueryStatement;
