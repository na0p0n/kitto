package com.kitto.backend.tools.destination

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface StoreRepository : JpaRepository<Store, Long> {
    fun countByChain(chain: Chain): Long

    fun findAllByGeocodedFalse(): List<Store>

    @Query(
        value =
            "SELECT id FROM destination_stores WHERE geocoded = 1" +
                " AND (:chainId IS NULL OR chain_id = :chainId) ORDER BY RANDOM() LIMIT 1",
        nativeQuery = true,
    )
    fun findRandomId(
        @Param("chainId") chainId: Long?,
    ): Long?

    @Query(
        value =
            "SELECT id FROM destination_stores WHERE geocoded = 1" +
                " AND (:chainId IS NULL OR chain_id = :chainId)" +
                " AND prefecture IN :prefectures ORDER BY RANDOM() LIMIT 1",
        nativeQuery = true,
    )
    fun findRandomIdWithPrefs(
        @Param("chainId") chainId: Long?,
        @Param("prefectures") prefectures: List<String>,
    ): Long?

    @Query("SELECT COUNT(s) FROM Store s WHERE s.geocoded = true AND (:chainId IS NULL OR s.chain.id = :chainId)")
    fun countFiltered(
        @Param("chainId") chainId: Long?,
    ): Long

    @Query(
        "SELECT COUNT(s) FROM Store s WHERE s.geocoded = true" +
            " AND (:chainId IS NULL OR s.chain.id = :chainId) AND s.prefecture IN :prefectures",
    )
    fun countFilteredWithPrefs(
        @Param("chainId") chainId: Long?,
        @Param("prefectures") prefectures: List<String>,
    ): Long

    @Query(
        "SELECT s FROM Store s WHERE s.name LIKE :search" +
            " OR s.chain.name LIKE :search OR s.prefecture LIKE :search",
    )
    fun findBySearch(
        @Param("search") search: String,
        pageable: Pageable,
    ): Page<Store>
}
