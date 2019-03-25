import CompareOperator from "./CompareOperator";
import WhereExpression from "./WhereExpression";

class WhereColumn {
    constructor(public column: string, public value: string | number | boolean | Date) {

    }
}

export default WhereColumn;
