package com.kitto.backend.tools.destination

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/destinations")
class DestinationController(private val service: DestinationService) {
    @GetMapping("/chains")
    fun getChains(): List<ChainResponse> = service.getChains()

    @GetMapping("/random")
    fun getRandom(
        @RequestParam(required = false) chainId: Long?,
        @RequestParam(required = false, defaultValue = "") prefectures: String,
    ): ResponseEntity<StoreResponse> {
        val prefList = prefectures.split(",").map { it.trim() }.filter { it.isNotEmpty() }
        val result = service.getRandom(chainId, prefList) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(result)
    }

    @GetMapping("/count")
    fun getCount(
        @RequestParam(required = false) chainId: Long?,
        @RequestParam(required = false, defaultValue = "") prefectures: String,
    ): CountResponse {
        val prefList = prefectures.split(",").map { it.trim() }.filter { it.isNotEmpty() }
        return CountResponse(service.getCount(chainId, prefList))
    }
}
