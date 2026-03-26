package com.kitto.backend.tools

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Instant
import java.util.UUID

data class UuidResponse(val uuid: String, val collision: Boolean)

data class UuidHistoryItem(val uuid: String, val createdAt: Instant)

data class UuidHistoryResponse(
    val total: Long,
    val collisions: Long,
    val history: List<UuidHistoryItem>,
)

@RestController
@RequestMapping("/api/tools/uuid")
class UuidController(private val repository: UuidRepository) {

    @GetMapping("/generate")
    fun generate(): UuidResponse {
        val uuid = UUID.randomUUID().toString()
        val collision = repository.countByUuid(uuid) > 0
        if (!collision) {
            repository.save(UuidRecord(uuid = uuid))
        }
        return UuidResponse(uuid = uuid, collision = collision)
    }

    @GetMapping("/history")
    fun history(): UuidHistoryResponse {
        val total = repository.count()
        val history = repository
            .findTop100ByOrderByCreatedAtDesc()
            .map { UuidHistoryItem(uuid = it.uuid, createdAt = it.createdAt) }
        return UuidHistoryResponse(
            total = total,
            collisions = 0,
            history = history,
        )
    }
}
