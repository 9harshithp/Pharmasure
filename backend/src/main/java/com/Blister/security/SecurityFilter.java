package com.Blister.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 2)
public class SecurityFilter implements Filter {

    private final JwtUtil jwtUtil;

    public SecurityFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (!(request instanceof HttpServletRequest httpRequest) || !(response instanceof HttpServletResponse httpResponse)) {
            chain.doFilter(request, response);
            return;
        }

        // Allow CORS preflight requests without authentication
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        String path = httpRequest.getRequestURI();

        // 1. Whitelisted Public Endpoints
        if (isPublicEndpoint(path)) {
            chain.doFilter(request, response);
            return;
        }

        // 2. Extract Authorization Header
        String authHeader = httpRequest.getHeader("Authorization");
        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7).trim();
        }

        // 3. Validate Token
        Map<String, Object> claims = (token != null) ? jwtUtil.validateAndGetClaims(token) : null;
        if (claims == null) {
            sendError(httpResponse, HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized: Authentication token is missing, invalid, or expired.");
            return;
        }

        String role = String.valueOf(claims.get("role"));
        String uid = String.valueOf(claims.get("uid"));
        String email = String.valueOf(claims.get("sub"));

        // Attach verified user claims to request attributes for controllers
        httpRequest.setAttribute("auth_role", role);
        httpRequest.setAttribute("auth_uid", uid);
        httpRequest.setAttribute("auth_email", email);

        // 4. Role-Based Access Control (Admin Routes Protection)
        if (path.startsWith("/inventory")) {
            // Only PHARMASURE role (Pharmacist / Admin) can access inventory management
            if (!"PHARMASURE".equalsIgnoreCase(role)) {
                sendError(httpResponse, HttpServletResponse.SC_FORBIDDEN, "Forbidden: Admin access required for inventory management.");
                return;
            }
        }

        // 5. Patient Access Control (IDOR Prevention for Patient Routes)
        // If role is "patient", ensure they only query their own patient records
        if ("patient".equalsIgnoreCase(role)) {
            if (path.startsWith("/getById/")) {
                String targetId = path.substring("/getById/".length()).split("/")[0];
                if (!targetId.equals(uid)) {
                    sendError(httpResponse, HttpServletResponse.SC_FORBIDDEN, "Forbidden: You cannot access other patients' records.");
                    return;
                }
            } else if (path.startsWith("/medications/get/patient/")) {
                String targetId = path.substring("/medications/get/patient/".length()).split("/")[0];
                if (!targetId.equals(uid)) {
                    sendError(httpResponse, HttpServletResponse.SC_FORBIDDEN, "Forbidden: You cannot access other patients' medications.");
                    return;
                }
            } else if (path.startsWith("/patients/update/")) {
                String targetId = path.substring("/patients/update/".length()).split("/")[0];
                if (!targetId.equals(uid)) {
                    sendError(httpResponse, HttpServletResponse.SC_FORBIDDEN, "Forbidden: You cannot modify other patients' profiles.");
                    return;
                }
            }
        }

        chain.doFilter(request, response);
    }

    private boolean isPublicEndpoint(String path) {
        return path.equals("/") ||
               path.startsWith("/login") ||
               path.startsWith("/register") ||
               path.startsWith("/error") ||
               path.startsWith("/favicon.ico");
    }

    private void sendError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"error\":\"" + message.replace("\"", "\\\"") + "\"}");
    }
}
