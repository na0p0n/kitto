package com.kitto.backend.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

// 本番は nginx が同一オリジンでルーティングするため CORS 不要。
// ローカル開発（Next.js dev server → backend 直接アクセス）用に残す。
@Configuration
class CorsConfig(
    @Value("\${kitto.cors.allowed-origins:http://localhost:3000}") private val allowedOrigins: String
) : WebMvcConfigurer {

    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/api/**")
            .allowedOrigins(*allowedOrigins.split(",").toTypedArray())
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
    }
}
