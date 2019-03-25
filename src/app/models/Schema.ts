import Table from "./Table";

class Schema {
    public tables: Table[];

    constructor(tables: Table[]) {
        this.tables = tables;
    }
}

export default Schema;
