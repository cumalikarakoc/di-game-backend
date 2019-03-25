import CompareOperator from "./CompareOperator";
import WhereExpression from "./WhereExpression";
import WhereType from "./WhereType";

class WhereRelatedExistsExpression extends WhereExpression {
    constructor(public table: string, public relatedEntity: string, public ownIdColumn: string, public parentIdColumn: string, public count: number, public compareOperator: CompareOperator, public nestedWhere: WhereExpression[] = []) {
        super();
    }
}

export default WhereRelatedExistsExpression;
