class MathHelper {
    public static random(min: number, max: number) {
        return Math.floor(min + Math.random() * (max + 1 - min));
    }
}

export default MathHelper;
