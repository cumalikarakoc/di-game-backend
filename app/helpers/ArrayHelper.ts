class ArrayHelper {
    public static shuffle<T>(array: T[]): T[] {
        const copy = [...array];
        copy.sort((_) => 0.5 - Math.random());
        return copy;
    }
}

export default ArrayHelper;
