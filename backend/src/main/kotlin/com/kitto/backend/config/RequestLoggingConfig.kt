package com.kitto.backend.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.filter.CommonsRequestLoggingFilter

@Configuration
class RequestLoggingConfig {
    @Bean
    fun requestLoggingFilter(): CommonsRequestLoggingFilter =
        CommonsRequestLoggingFilter().also {
            it.setIncludeQueryString(true)
            it.setIncludePayload(false)
            it.setIncludeHeaders(false)
        }
}
