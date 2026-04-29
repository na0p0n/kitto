package com.kitto.backend.tools.destination

import org.springframework.stereotype.Service

@Service
class DestinationService(
    private val chainRepository: ChainRepository,
    private val storeRepository: StoreRepository,
) {
    fun getChains(): List<ChainResponse> = chainRepository.findAllByOrderByCategory().map { it.toResponse() }

    fun getRandom(
        chainId: Long?,
        prefectures: List<String>,
    ): StoreResponse? {
        val id =
            if (prefectures.isEmpty()) {
                storeRepository.findRandomId(chainId)
            } else {
                storeRepository.findRandomIdWithPrefs(chainId, prefectures)
            } ?: return null
        return storeRepository.findById(id).orElse(null)?.toResponse()
    }

    fun getCount(
        chainId: Long?,
        prefectures: List<String>,
    ): Long =
        if (prefectures.isEmpty()) {
            storeRepository.countFiltered(chainId)
        } else {
            storeRepository.countFilteredWithPrefs(chainId, prefectures)
        }
}
