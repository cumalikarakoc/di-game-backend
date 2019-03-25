import WhereColumnCollection from "./WhereColumnCollection";
import WhereExpression from "./WhereExpression";

class WhereColumnValuesExpression extends WhereExpression {
    constructor(public whereColumnCollections: WhereColumnCollection[]) {
        super();
    }
}

export default WhereColumnValuesExpression;
