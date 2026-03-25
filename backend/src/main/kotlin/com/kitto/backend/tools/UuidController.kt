package com.kitto.backend.tools

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

data class UuidResponse(val uuid: String)

@RestController
@RequestMapping("/api/tools/uuid")
class UuidController {

    @GetMapping("/generate")
    fun generate(): UuidResponse = UuidResponse(UUID.randomUUID().toString())
}
