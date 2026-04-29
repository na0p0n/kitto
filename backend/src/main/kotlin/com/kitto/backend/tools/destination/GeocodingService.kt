package com.kitto.backend.tools.destination

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClient
import org.springframework.web.client.RestClientException
import java.time.Instant

private const val GSI_API = "https://msearch.gsi.go.jp/address-search/AddressSearch"
private const val COORD_SIZE = 2

@JsonIgnoreProperties(ignoreUnknown = true)
data class GsiFeature(val geometry: GsiGeometry? = null)

@JsonIgnoreProperties(ignoreUnknown = true)
data class GsiGeometry(val coordinates: List<Double>? = null)

@Service
class GeocodingService(
    private val storeRepository: StoreRepository,
) {
    private val log = LoggerFactory.getLogger(GeocodingService::class.java)
    private val restClient = RestClient.create()

    @Async
    fun geocodeAll() {
        storeRepository.findAllByGeocodedFalse().forEach { store ->
            @Suppress("TooGenericExceptionCaught")
            try {
                geocodeAndSave(store)
            } catch (e: RestClientException) {
                log.warn("Geocoding HTTP error for store id=${store.id}: ${e.message}")
            } catch (e: RuntimeException) {
                log.warn("Geocoding failed for store id=${store.id}: ${e.message}")
            }
        }
    }

    private fun geocodeAndSave(store: Store) {
        val coords = geocode(store.address) ?: return
        storeRepository.save(
            store.copy(lat = coords.first, lng = coords.second, geocoded = true, updatedAt = Instant.now()),
        )
    }

    private fun geocode(address: String): Pair<Double, Double>? {
        val features =
            restClient.get()
                .uri("$GSI_API?q={address}", address)
                .retrieve()
                .body(Array<GsiFeature>::class.java)
        val coords = features?.firstOrNull()?.geometry?.coordinates
        return coords?.takeIf { it.size >= COORD_SIZE }?.let { Pair(it[1], it[0]) }
    }
}
