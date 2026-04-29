package com.kitto.backend.tools.destination

import org.springframework.data.jpa.repository.JpaRepository

interface ImportHistoryRepository : JpaRepository<ImportHistory, Long> {
    fun findAllByOrderByImportedAtDesc(): List<ImportHistory>
}
