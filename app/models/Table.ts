class Table {
    public name: string;
    public columns: string[];
    public rows: any[];

    constructor(name: string, columns: string[], rows: any[]) {
        this.name = name;
        this.columns = columns;
        this.rows = rows;
    }
}
export default Table;
