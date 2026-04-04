package com.fashionstore.utils;

import java.text.Normalizer;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

public class SlugUtil {
    private static final Map<Character, Character> VIETNAMESE_MAP = new HashMap<>();

    static {
        String chars = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ";
        String replacements = "aaaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiioooooooooooooooooouuuuuuuuuuuyyyyyd";
        for (int i = 0; i < chars.length(); i++) {
            VIETNAMESE_MAP.put(chars.charAt(i), replacements.charAt(i));
        }
    }

    public static String generateSlug(String str) {
        if (str == null || str.isEmpty()) return "";

        StringBuilder sb = new StringBuilder();
        String lowerStr = str.toLowerCase();
        for (int i = 0; i < lowerStr.length(); i++) {
            char c = lowerStr.charAt(i);
            sb.append(VIETNAMESE_MAP.getOrDefault(c, c));
        }

        String slug = sb.toString();
        // Remove non-alphanumeric except space and hyphen
        slug = slug.replaceAll("[^a-z0-9\\s-]", "");
        // Trim and replace spaces with hyphen
        slug = slug.trim().replaceAll("\\s+", "-");
        // Replace multiple hyphens with single hyphen
        slug = slug.replaceAll("-+", "-");

        return slug;
    }
}
