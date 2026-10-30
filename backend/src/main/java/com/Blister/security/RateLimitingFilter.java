package com.Blister.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 2)
public class RateLimitingFilter implements Filter {

    private static class RequestLog {
        final ConcurrentLinkedQueue<Long> timestamps = new ConcurrentLinkedQueue<>();
    }

    private final ConcurrentHashMap<String, RequestLog> rateLimits = new ConcurrentHashMap<>();
    private static final long WINDOW_MS = 60 * 1000L; // 1 minute window

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (!(request instanceof HttpServletRequest httpRequest) || !(response instanceof HttpServletResponse httpResponse)) {
            chain.doFilter(request, response);
            return;
        }

        // Allow OPTIONS preflight without rate limit check
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        String path = httpRequest.getRequestURI();
        int maxAllowed = getMaxAllowedRequests(path);

        if (maxAllowed > 0) {
            String clientIp = getClientIp(httpRequest);
            String key = clientIp + ":" + getEndpointCategory(path);
            long now = System.currentTimeMillis();

            RequestLog log = rateLimits.computeIfAbsent(key, k -> new RequestLog());
            // Purge timestamps older than WINDOW_MS
            while (!log.timestamps.isEmpty() && now - log.timestamps.peek() > WINDOW_MS) {
                log.timestamps.poll();
            }

            if (log.timestamps.size() >= maxAllowed) {
                httpResponse.setStatus(429); // Too Many Requests
                httpResponse.setContentType("application/json");
                httpResponse.setHeader("Retry-After", "60");
                httpResponse.getWriter().write("{\"error\":\"Too many requests. Rate limit exceeded, please try again in a minute.\"}");
                return;
            }

            log.timestamps.offer(now);
        }

        chain.doFilter(request, response);
    }

    private int getMaxAllowedRequests(String path) {
        if (path.startsWith("/login")) {
            return 15; // 15 attempts / min
        }
        if (path.startsWith("/register")) {
            return 10; // 10 attempts / min
        }
        if (path.startsWith("/api/gemini")) {
            return 25; // 25 queries / min
        }
        return -1; // Unmetered
    }

    private String getEndpointCategory(String path) {
        if (path.startsWith("/login")) return "login";
        if (path.startsWith("/register")) return "register";
        if (path.startsWith("/api/gemini")) return "gemini";
        return "other";
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.trim().isEmpty()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
