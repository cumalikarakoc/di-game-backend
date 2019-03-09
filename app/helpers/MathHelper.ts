class MathHelper {
    public static random(low: number, high: number) {
        return Math.floor(Math.random() * high) + low;
    }
}

export default MathHelper;
