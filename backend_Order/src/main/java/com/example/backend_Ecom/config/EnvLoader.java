package com.example.backend_Ecom.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

public class EnvLoader {
    private static final Map<String, String> CACHE = new HashMap<>();
    private static boolean loaded = false;

    public static String get(String key) {
        String value = System.getenv(key);
        if (value != null && !value.isEmpty()) {
            return value;
        }

        synchronized (EnvLoader.class) {
            if (!loaded) {
                loadEnvFiles();
                loaded = true;
            }
        }

        return CACHE.get(key);
    }

    private static void loadEnvFiles() {
        loadFile(".env.local");
        loadFile(".env");
    }

    private static void loadFile(String filename) {
        try {
            Files.lines(Paths.get(filename), StandardCharsets.UTF_8)
                    .filter(line -> !line.trim().isEmpty() && !line.startsWith("#") && line.contains("="))
                    .forEach(line -> {
                        String[] parts = line.split("=", 2);
                        String key = parts[0].trim();
                        String val = parts[1].trim();
                        if (val.startsWith("\"") && val.endsWith("\"")) {
                            val = val.substring(1, val.length() - 1);
                        }
                        CACHE.putIfAbsent(key, val);
                    });
        } catch (IOException ignored) {
        }
    }
}
