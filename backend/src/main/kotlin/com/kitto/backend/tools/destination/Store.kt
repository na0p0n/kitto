package com.kitto.backend.tools.destination

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.Instant

@Entity
@Table(name = "destination_stores")
data class Store(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "chain_id", nullable = false)
    val chain: Chain,
    @Column(nullable = false)
    val name: String,
    @Column(nullable = false)
    val prefecture: String,
    @Column(nullable = false)
    val address: String,
    val lat: Double? = null,
    val lng: Double? = null,
    @Column(nullable = false)
    val geocoded: Boolean = false,
    @Column(nullable = false)
    val createdAt: Instant = Instant.now(),
    @Column(nullable = false)
    val updatedAt: Instant = Instant.now(),
)
