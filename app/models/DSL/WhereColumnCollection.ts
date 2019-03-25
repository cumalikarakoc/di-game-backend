import CompareOperator from "./CompareOperator";
import WhereColumn from "./WhereColumn";
import WhereExpression from "./WhereExpression";

class WhereColumnCollection {
    constructor(public columns: WhereColumn[], public table: string) {

    }
}

export default WhereColumnCollection;
