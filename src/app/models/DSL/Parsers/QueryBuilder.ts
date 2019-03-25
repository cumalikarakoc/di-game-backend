import DataType from "../../DataType";
import CompareOperator from "../CompareOperator";
import QueryStatement from "../QueryStatement";
import WhereColumnValuesExpression from "../WhereColumnValuesExpression";
import WhereExpression from "../WhereExpression";
import WhereRelatedExistsExpression from "../WhereRelatedExistsExpression";

class QueryBuilder {
    public build(statement: QueryStatement) {
        const select = statement.selectStatementExpressionCollections.map((collection) => {
            return collection.expressions.map((expression) => `${collection.table}.${expression.expression}`).join(", ");
        }).join(", ");

        const joins = statement.selectStatementExpressionCollections.filter((collection) => collection.table !== statement.from)
            .map((collection) => {
                return `INNER JOIN ${collection.table} ON ${statement.from}.${collection.parentIdColumn}=${collection.table}.${collection.ownIdColumn}`;
            }).join(" ");

        const whereChecks: string = this.getWhereStatementsAsStatement(statement.whereStatementExpressions);

        const whereStatement = whereChecks.length > 0 ? ` WHERE ${whereChecks}` : "";

        return `SELECT ${select} FROM ${statement.from} ${joins}${whereStatement}`;
    }

    private getWhereStatementsAsStatement(whereExpressions: WhereExpression[]): string {
        return whereExpressions.reduce((acc: string, expression, index) => {
            if (expression instanceof WhereRelatedExistsExpression) {
                const nestedWhere = expression.nestedWhere.length > 0 ? " and" + this.getWhereStatementsAsStatement(expression.nestedWhere) : "";
                const space = index === 0 ? " " : "";
                const prefix = acc.length > 0 ? acc + " AND" : acc;

                return `${prefix}${space}EXISTS(SELECT 1 FROM ${expression.table} WHERE ${expression.table}.${expression.ownIdColumn}=${expression.relatedEntity}.${expression.parentIdColumn}${nestedWhere} HAVING COUNT(*) ${this.getCompareOperator(expression.compareOperator)} ${expression.count})`;
            } else if (expression instanceof WhereColumnValuesExpression) {
                const whereColumns = expression.whereColumnCollections.map((collection) => {
                    return collection.columns.map((column) => {
                        return `${collection.table}.${column.column}=${this.wrapWithTokensNeededForDataType(column.value)}`;
                    }).join(" and ");
                }).join(" and ");

                return `${acc} ${whereColumns}`;
            }

            return acc;
        }, "");
    }

    private wrapWithTokensNeededForDataType(value: any) {
        if (typeof value === "string") {
            return `'${value}'`;
        }

        return value;
    }

    private getCompareOperator(operator: CompareOperator) {
        if (operator === CompareOperator.EQUALS) {
            return "=";
        }

        if (operator === CompareOperator.GREATER_OR_EQUAL) {
            return ">=";
        }

        return "<=";
    }
}

export default QueryBuilder;
