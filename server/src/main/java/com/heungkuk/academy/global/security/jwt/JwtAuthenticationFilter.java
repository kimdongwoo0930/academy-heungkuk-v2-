package com.heungkuk.academy.global.security.jwt;

import java.io.IOException;
import java.util.List;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.RequestAttributeSecurityContextRepository;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private final RequestAttributeSecurityContextRepository contextRepository =
            new RequestAttributeSecurityContextRepository();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // 1. Authorization 헤더에서 토큰 추출 ("Bearer xxx...")
        String token = resolveToken(request);

        // 2. 토큰이 존재하고 유효한 경우에만 인증 처리
        if (token != null && jwtProvider.validateToken(token)) {

            // 3. 토큰에서 userId, role 꺼내기
            String userId = jwtProvider.getUserId(token);
            String role = jwtProvider.getRole(token);

            // 4. Spring Security 인증 객체 생성
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userId, null,
                            List.of(new SimpleGrantedAuthority(role)));

            // 5. SecurityContext에 인증 정보 저장
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            // 6. request 속성에도 저장 → SSE async dispatch 시에도 SecurityContext 유지됨
            contextRepository.saveContext(context, request, response);
        }

        // 7. 다음 필터로 요청 넘기기 (인증 실패해도 넘김 — 접근 제어는 SecurityConfig에서 처리)
        filterChain.doFilter(request, response);
    }

    // Authorization 헤더에서 "Bearer " 제거 후 순수 토큰만 반환
    // 헤더가 없으면 쿼리 파라미터 "token" 체크 (SSE는 EventSource라 헤더 불가)
    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        // SSE 연결 시 쿼리 파라미터로 토큰 전달: ?token=eyJ...
        String queryToken = request.getParameter("token");
        if (StringUtils.hasText(queryToken)) {
            return queryToken;
        }
        return null;
    }
}
