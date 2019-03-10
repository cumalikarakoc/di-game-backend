class RangeCheck {
    public sql: string;
    public description: string;

    constructor(sql: string, description: string) {
        this.sql = sql;
        this.description = description;
    }
}

export default RangeCheck;
