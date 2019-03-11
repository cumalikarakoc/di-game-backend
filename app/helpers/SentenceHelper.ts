class SentenceHelper {
    public static toList(words: string[]) {
        if (words.length === 0) { return ""; }
        if (words.length === 1) { return words[0]; }

        return words.map((word, index) => {
            return index === 0
                ? word
                : `${index === (words.length - 1) ? " and" : ","} ${word}`;
        }).join("");
    }
}

export default SentenceHelper;
