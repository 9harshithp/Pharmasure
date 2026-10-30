package com.Blister.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${cors.allowed.origins:}")
    private String additionalOrigins;

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilterRegistrationBean() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);

        // Allow Vercel (all preview deployments & production), Render, and local development
        List<String> originPatterns = new ArrayList<>(Arrays.asList(
                "https://*.vercel.app",
                "https://*.onrender.com",
                "http://localhost:*",
                "http://127.0.0.1:*"
        ));

        // Append any environment-configured origins
        if (additionalOrigins != null && !additionalOrigins.trim().isEmpty()) {
            Arrays.stream(additionalOrigins.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .forEach(originPatterns::add);
        }

        config.setAllowedOriginPatterns(originPatterns);
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));
        config.setAllowedHeaders(Arrays.asList("*")); // Allow all request headers (Authorization, Content-Type, etc.)
        config.setExposedHeaders(Arrays.asList("Authorization", "Content-Disposition"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        // Highest precedence ensures CORS headers are attached before any security filter evaluates the request
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }
}
