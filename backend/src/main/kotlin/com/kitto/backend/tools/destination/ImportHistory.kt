package com.kitto.backend.tools.destination

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

@Entity
@Table(name = "destination_import_histories")
data class ImportHistory(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @Column(nullable = false)
    val filename: String,
    @Column(nullable = false)
    val totalCount: Int = 0,
    @Column(nullable = false)
    val successCount: Int = 0,
    @Column(nullable = false)
    val errorCount: Int = 0,
    // "success" | "partial" | "failed"
    @Column(nullable = false)
    val status: String,
    @Column(columnDefinition = "TEXT")
    val errorDetail: String? = null,
    @Column(nullable = false)
    val importedAt: Instant = Instant.now(),
)
