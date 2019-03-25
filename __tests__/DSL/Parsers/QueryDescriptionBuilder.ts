import CompareOperator from "../../../app/models/DSL/CompareOperator";
import QueryDescriptionBuilder from "../../../app/models/DSL/Parsers/QueryDescriptionBuilder";
import QueryExpression from "../../../app/models/DSL/QueryExpression";
import QueryExpressionCollection from "../../../app/models/DSL/QueryExpressionCollection";
import QueryStatement from "../../../app/models/DSL/QueryStatement";
import WhereColumn from "../../../app/models/DSL/WhereColumn";
import WhereColumnCollection from "../../../app/models/DSL/WhereColumnCollection";
import WhereColumnValuesExpression from "../../../app/models/DSL/WhereColumnValuesExpression";
import WhereRelatedExistsExpression from "../../../app/models/DSL/WhereRelatedExistsExpression";

test("should prefix columns with source", () => {
    // Arrange
    const builder = new QueryDescriptionBuilder();
    const queryStatement = new QueryStatement();

    queryStatement.addExpressionCollectionsToSelectStatement([
        new QueryExpressionCollection([
            new QueryExpression("price"),
            new QueryExpression("age"),
        ], "car"),
        new QueryExpressionCollection([
            new QueryExpression("name"),
            new QueryExpression("age"),
        ], "person", "id", "owner_id")])
        .setFrom("car")
        .addExpressionToWhereStatement(new WhereRelatedExistsExpression("car", "person", "owner_id", "id", 3, CompareOperator.GREATER_OR_EQUAL, [
            new WhereColumnValuesExpression([new WhereColumnCollection([new WhereColumn("price", 10), new WhereColumn("age", 59)], "car")]),
        ]));

    // Act
    const actual = builder.build(queryStatement);

    // Assert
    const expected = "select price and age of all cars with the name and age of their related person where the person has 3 or more cars where the car has a price of 10 and age of 59.";

    expect(actual).toBe(expected);
});
