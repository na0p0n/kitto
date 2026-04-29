package com.kitto.backend.tools.destination

import org.springframework.data.jpa.repository.JpaRepository

interface ChainRepository : JpaRepository<Chain, Long> {
    fun findByName(name: String): Chain?

    fun findAllByOrderByCategory(): List<Chain>
}
