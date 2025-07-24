namespace Public.Contracts;

public record UrlRatings(double average, int count, int five_count, int four_count, int three_count, int two_count,
    int one_count);