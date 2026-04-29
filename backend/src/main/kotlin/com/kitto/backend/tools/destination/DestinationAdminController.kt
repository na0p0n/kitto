package com.kitto.backend.tools.destination

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

private const val DEFAULT_PAGE = 0
private const val DEFAULT_SIZE = 50

@RestController
@RequestMapping("/api/admin/destinations")
class DestinationAdminController(private val service: DestinationAdminService) {
    @GetMapping("/stores")
    fun getStores(
        @RequestParam(required = false, defaultValue = "") search: String,
        @RequestParam(required = false, defaultValue = "$DEFAULT_PAGE") page: Int,
        @RequestParam(required = false, defaultValue = "$DEFAULT_SIZE") size: Int,
    ): StoreListResponse = service.getStores(search.takeIf { it.isNotBlank() }, page, size)

    @DeleteMapping("/stores/{id}")
    fun deleteStore(
        @PathVariable id: Long,
    ): ResponseEntity<Unit> {
        service.deleteStore(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/chains")
    fun getChains(): List<ChainAdminResponse> = service.getChains()

    @PostMapping("/chains")
    fun createChain(
        @RequestBody req: ChainRequest,
    ): ChainAdminResponse = service.createChain(req)

    @PutMapping("/chains/{id}")
    fun updateChain(
        @PathVariable id: Long,
        @RequestBody req: ChainRequest,
    ): ChainAdminResponse = service.updateChain(id, req)

    @PostMapping("/import")
    fun importCsv(
        @RequestParam("file") file: MultipartFile,
    ): ImportResultResponse = service.importCsv(file)

    @GetMapping("/import/histories")
    fun getHistories(): List<ImportHistoryResponse> = service.getImportHistories()
}
