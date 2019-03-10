import ColumnReference from "../app/models/ColumnReference";
import DataType from "../app/models/DataType";
import EntityRelation from "../app/models/EntityRelation";
import EntityRelationCardinality from "../app/models/EntityRelationCardinality";
import TableColumn from "../app/models/TableColumn";
import TableStructure from "../app/models/TableStructure";
import SqlGeneratorService from "../app/services/SqlGeneratorService";

test("should generate DDL for 2 tables", () => {
    // Arrange
    const service = new SqlGeneratorService();

    const tableStructures = [
        new TableStructure("a", [new TableColumn("a", DataType.TEXT), new TableColumn("b", DataType.TEXT)]),
        new TableStructure("b", [new TableColumn("a", DataType.TEXT), new TableColumn("b", DataType.TEXT)]),
    ];
    // Act
    const actual = service.generateTables(tableStructures);

    // Assert
    const expected = `CREATE TABLE a(
a VARCHAR(50),
b VARCHAR(50),
);
CREATE TABLE b(
a VARCHAR(50),
b VARCHAR(50),
);`;

    expect(actual).toBe(expected);
});

test("should generate DDL for 2 tables with relation", () => {
    // Arrange
    const service = new SqlGeneratorService();

    const tableStructures = [
        new TableStructure("a", [
            new TableColumn("a", DataType.TEXT, true),
            new TableColumn("b", DataType.TEXT),
        ]),
        new TableStructure("b", [
            new TableColumn("a", DataType.TEXT, true, new ColumnReference("a", "a", new EntityRelation("a", "b", EntityRelationCardinality.MANY, "a_b"))),
            new TableColumn("b", DataType.TEXT),
        ]),
    ];
    // Act
    const actual = service.generateTables(tableStructures);

    // Assert
    const expected = `CREATE TABLE a(
a VARCHAR(50) PRIMARY KEY,
b VARCHAR(50),
);
CREATE TABLE b(
a VARCHAR(50) PRIMARY KEY FOREIGN KEY REFERENCES a(a),
b VARCHAR(50),
);`;

    expect(actual).toBe(expected);
});
