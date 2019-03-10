import Join from "../models/Query/Join";
import JoinType from "../models/Query/JoinType";

class QueryBuilder {
    private selects: string[] = [];
    private wheres: string[] = [];
    private from: string = "";
    private joins: Join[] = [];

    public addSelect(select: string) {
        this.selects.push(select);
        return this;
    }

    public addSelects(selects: string[]) {
        this.selects = [...this.selects, ...selects];
        return this;
    }

    public setFrom(from: string) {
        this.from = from;
        return this;
    }

    public addJoin(join: Join) {
        this.joins.push(join);
        return this;
    }

    public addWhere(where: string) {
        this.wheres.push(where);
        return this;
    }

    public build() {
        return `SELECT ${this.selects.join(",")} FROM ${this.from} ${this.joins.map((join) => {
            const joinType = join.type === JoinType.INNER ? "INNER JOIN " : "LEFT JOIN";
            return `${joinType} ${join.table} ON ${join.condition}`;
        }).join(" ")} WHERE ${this.wheres.join(" AND")}`;
    }
}

export default QueryBuilder;
