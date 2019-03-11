import SentenceHelper from "../../app/helpers/SentenceHelper";

test("should use and to merge last words", () => {
    // Arrange
    const words = ["hello", "there", "world"];
    // Act
    const actual = SentenceHelper.toList(words);

    // Assert
    const expected = "hello, there and world";

    expect(actual).toBe(expected);
});
