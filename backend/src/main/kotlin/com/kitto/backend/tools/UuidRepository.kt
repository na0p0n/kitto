package com.kitto.backend.tools

import org.springframework.data.jpa.repository.JpaRepository

interface UuidRepository : JpaRepository<UuidRecord, Long> {
    fun findTop100ByOrderByCreatedAtDesc(): List<UuidRecord>
    fun countByUuid(uuid: String): Long
}
