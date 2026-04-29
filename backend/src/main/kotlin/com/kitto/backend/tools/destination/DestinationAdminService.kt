package com.kitto.backend.tools.destination

import com.fasterxml.jackson.databind.ObjectMapper
import org.apache.commons.csv.CSVFormat
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.time.Instant

private data class HistorySummary(
    val filename: String,
    val total: Int,
    val success: Int,
    val error: Int,
    val status: String,
    val detail: String?,
)

@Service
class DestinationAdminService(
    private val chainRepository: ChainRepository,
    private val storeRepository: StoreRepository,
    private val importHistoryRepository: ImportHistoryRepository,
    private val geocodingService: GeocodingService,
    private val objectMapper: ObjectMapper,
) {
    fun getStores(
        search: String?,
        page: Int,
        size: Int,
    ): StoreListResponse {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        val storePage =
            if (search.isNullOrBlank()) {
                storeRepository.findAll(pageable)
            } else {
                storeRepository.findBySearch("%$search%", pageable)
            }
        return StoreListResponse(
            stores = storePage.content.map { it.toAdminResponse() },
            totalCount = storePage.totalElements,
            page = page,
            size = size,
        )
    }

    fun deleteStore(id: Long) = storeRepository.deleteById(id)

    fun getChains(): List<ChainAdminResponse> =
        chainRepository.findAllByOrderByCategory().map { chain ->
            ChainAdminResponse(
                id = chain.id,
                name = chain.name,
                category = chain.category,
                emoji = chain.emoji,
                storeCount = storeRepository.countByChain(chain),
            )
        }

    fun createChain(req: ChainRequest): ChainAdminResponse {
        val chain = chainRepository.save(Chain(name = req.name, category = req.category, emoji = req.emoji))
        return ChainAdminResponse(chain.id, chain.name, chain.category, chain.emoji, 0)
    }

    fun updateChain(
        id: Long,
        req: ChainRequest,
    ): ChainAdminResponse {
        val chain = chainRepository.findById(id).orElseThrow { NoSuchElementException("Chain $id not found") }
        val updated =
            chainRepository.save(
                chain.copy(name = req.name, category = req.category, emoji = req.emoji, updatedAt = Instant.now()),
            )
        return ChainAdminResponse(
            updated.id,
            updated.name,
            updated.category,
            updated.emoji,
            storeRepository.countByChain(updated),
        )
    }

    fun importCsv(file: MultipartFile): ImportResultResponse {
        val filename = file.originalFilename ?: "upload.csv"
        val content = file.bytes.toString(Charsets.UTF_8)
        val format =
            CSVFormat.DEFAULT.builder()
                .setHeader().setSkipHeaderRecord(true).setTrim(true).build()
        val parser = format.parse(content.reader())

        val required = listOf("chain_name", "store_name", "prefecture", "address")
        val missing = required.filter { it !in parser.headerNames }
        if (missing.isNotEmpty()) {
            val detail = objectMapper.writeValueAsString(mapOf("missing" to missing))
            saveHistory(HistorySummary(filename, 0, 0, 0, "failed", detail))
            return ImportResultResponse(0, 0, 0, "failed", listOf("必須カラムがありません: ${missing.joinToString()}"))
        }

        val errors = mutableListOf<String>()
        val stores = mutableListOf<Store>()
        parser.records.forEach { record ->
            parseRecord(record, errors, stores)
        }

        storeRepository.saveAll(stores)
        val total = stores.size + errors.size
        val status = determineStatus(stores.size, errors.size)
        val detail = if (errors.isNotEmpty()) objectMapper.writeValueAsString(errors) else null
        saveHistory(HistorySummary(filename, total, stores.size, errors.size, status, detail))
        if (stores.isNotEmpty()) geocodingService.geocodeAll()
        return ImportResultResponse(total, stores.size, errors.size, status, errors)
    }

    fun getImportHistories(): List<ImportHistoryResponse> {
        val histories = importHistoryRepository.findAllByOrderByImportedAtDesc()
        return histories.map { it.toResponse() }
    }

    private fun parseRecord(
        record: org.apache.commons.csv.CSVRecord,
        errors: MutableList<String>,
        stores: MutableList<Store>,
    ) {
        val chainName = record.get("chain_name")
        val storeName = record.get("store_name")
        val prefecture = record.get("prefecture")
        val address = record.get("address")
        val rowErrs =
            listOfNotNull(
                if (chainName.isEmpty()) "chain_name が空" else null,
                if (storeName.isEmpty()) "store_name が空" else null,
                if (prefecture.isEmpty()) "prefecture が空" else null,
                if (address.isEmpty()) "address が空" else null,
            )
        if (rowErrs.isNotEmpty()) {
            errors.add("行${record.recordNumber + 1}: ${rowErrs.joinToString()}")
            return
        }
        val chain = chainRepository.findByName(chainName)
        if (chain == null) {
            errors.add("行${record.recordNumber + 1}: チェーン「$chainName」が存在しません")
            return
        }
        stores.add(Store(chain = chain, name = storeName, prefecture = prefecture, address = address))
    }

    private fun determineStatus(
        successCount: Int,
        errorCount: Int,
    ) = when {
        successCount == 0 -> "failed"
        errorCount > 0 -> "partial"
        else -> "success"
    }

    private fun saveHistory(summary: HistorySummary) {
        importHistoryRepository.save(
            ImportHistory(
                filename = summary.filename,
                totalCount = summary.total,
                successCount = summary.success,
                errorCount = summary.error,
                status = summary.status,
                errorDetail = summary.detail,
            ),
        )
    }
}
