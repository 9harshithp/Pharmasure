package com.Blister.config;

import com.google.genai.Client;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GeminiConfig {
    @Value("${gemini.api.key:}")
    private String apiKey;

    @Bean
    public Client genAiClient() {
        if (apiKey != null && !apiKey.trim().isEmpty() && !apiKey.contains("dummy")) {
            try {
                return Client.builder()
                        .apiKey(apiKey.trim())
                        .build();
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }
}
