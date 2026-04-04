package com.fashionstore.utils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Random;

public class OrderUtil {
    private static final String CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final Random RANDOM = new Random();

    public static String generateOrderNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        StringBuilder randomPart = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            randomPart.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
        }
        return "ORD-" + datePart + "-" + randomPart;
    }
}
