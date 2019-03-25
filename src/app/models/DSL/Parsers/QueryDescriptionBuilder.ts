import SentenceHelper from "../../../helpers/SentenceHelper";
import CompareOperator from "../CompareOperator";
import QueryStatement from "../QueryStatement";
import WhereColumnValuesExpression from "../WhereColumnValuesExpression";
import WhereExpression from "../WhereExpression";
import WhereRelatedExistsExpression from "../WhereRelatedExistsExpression";

class QueryDescriptionBuilder {
    public build(statement: QueryStatement) {
        const select = statement.selectStatementExpressionCollections.reduce((acc, collection, index) => {
            const columnsToSelect = SentenceHelper.toList(collection.expressions.map((expression) => expression.expression));

            if (index === 0) {
                return acc + columnsToSelect + " of all " + collection.table + "s";
            }

            return acc + " with the " + columnsToSelect + " of their related " + collection.table;
        }, "");

        const where = this.getWhereStatementsAsDescription(statement.whereStatementExpressions);

        return `select ${select}${where.length > 0 ? where : ""}.`;
    }

    private getWhereStatementsAsDescription(whereExpressions: WhereExpression[]): string {
        return whereExpressions.reduce((acc: string, expression, index) => {
            if (expression instanceof WhereRelatedExistsExpression) {
                const prefix = index === 0 ? " " : "";

                const nestedWhere = expression.nestedWhere.length > 0 ? " " + this.getWhereStatementsAsDescription(expression.nestedWhere) : "";
                return `${acc}${prefix}where the ${expression.relatedEntity} has ${expression.count}${this.getCompareOperatorDescription(expression.compareOperator)} ${expression.table}s${nestedWhere}`;
            } else if (expression instanceof WhereColumnValuesExpression) {
                const whereColumns = expression.whereColumnCollections.map((collection, index) => {
                    const prefix = index === 0 ? " " : "";

                    return `${prefix}where the ${collection.table} has a ` + collection.columns.map((column) => {
                        return column.column + " of " + column.value;
                    }).join(" and ");
                }).join(" and ");

                return `${acc}${whereColumns}`;
            }

            return acc;
        }, "");
    }

    private getCompareOperatorDescription(operator: CompareOperator) {
        if (operator === CompareOperator.EQUALS) {
            return "";
        }

        if (operator === CompareOperator.GREATER_OR_EQUAL) {
            return " or more";
        }

        return " or less";
    }
}

export default QueryDescriptionBuilder;
