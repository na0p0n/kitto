package com.kitto.backend.tools.destination

val REGION_MAP =
    mapOf(
        "北海道" to "北海道",
        "青森" to "東北",
        "岩手" to "東北",
        "宮城" to "東北",
        "秋田" to "東北",
        "山形" to "東北",
        "福島" to "東北",
        "茨城" to "関東",
        "栃木" to "関東",
        "群馬" to "関東",
        "埼玉" to "関東",
        "千葉" to "関東",
        "東京" to "関東",
        "神奈川" to "関東",
        "新潟" to "中部",
        "富山" to "中部",
        "石川" to "中部",
        "福井" to "中部",
        "山梨" to "中部",
        "長野" to "中部",
        "岐阜" to "中部",
        "静岡" to "中部",
        "愛知" to "中部",
        "三重" to "近畿",
        "滋賀" to "近畿",
        "京都" to "近畿",
        "大阪" to "近畿",
        "兵庫" to "近畿",
        "奈良" to "近畿",
        "和歌山" to "近畿",
        "鳥取" to "中国",
        "島根" to "中国",
        "岡山" to "中国",
        "広島" to "中国",
        "山口" to "中国",
        "徳島" to "四国",
        "香川" to "四国",
        "愛媛" to "四国",
        "高知" to "四国",
        "福岡" to "九州・沖縄",
        "佐賀" to "九州・沖縄",
        "長崎" to "九州・沖縄",
        "熊本" to "九州・沖縄",
        "大分" to "九州・沖縄",
        "宮崎" to "九州・沖縄",
        "鹿児島" to "九州・沖縄",
        "沖縄" to "九州・沖縄",
    )

data class ChainResponse(
    val id: Long,
    val name: String,
    val category: String,
    val emoji: String?,
)

data class StoreResponse(
    val id: Long,
    val chainId: Long,
    val chainName: String,
    val chainEmoji: String?,
    val name: String,
    val prefecture: String,
    val address: String,
    val lat: Double?,
    val lng: Double?,
    val region: String,
)

data class CountResponse(val count: Long)

data class StoreAdminResponse(
    val id: Long,
    val chainId: Long,
    val chainName: String,
    val name: String,
    val prefecture: String,
    val address: String,
    val lat: Double?,
    val lng: Double?,
    val geocoded: Boolean,
)

data class StoreListResponse(
    val stores: List<StoreAdminResponse>,
    val totalCount: Long,
    val page: Int,
    val size: Int,
)

data class ChainAdminResponse(
    val id: Long,
    val name: String,
    val category: String,
    val emoji: String?,
    val storeCount: Long,
)

data class ChainRequest(
    val name: String,
    val category: String,
    val emoji: String?,
)

data class ImportResultResponse(
    val totalCount: Int,
    val successCount: Int,
    val errorCount: Int,
    val status: String,
    val errors: List<String>,
)

data class ImportHistoryResponse(
    val id: Long,
    val filename: String,
    val totalCount: Int,
    val successCount: Int,
    val errorCount: Int,
    val status: String,
    val errorDetail: String?,
    val importedAt: String,
)

fun Chain.toResponse() = ChainResponse(id, name, category, emoji)

fun Store.toResponse() =
    StoreResponse(
        id = id,
        chainId = chain.id,
        chainName = chain.name,
        chainEmoji = chain.emoji,
        name = name,
        prefecture = prefecture,
        address = address,
        lat = lat,
        lng = lng,
        region = REGION_MAP[prefecture] ?: "",
    )

fun Store.toAdminResponse() =
    StoreAdminResponse(
        id = id,
        chainId = chain.id,
        chainName = chain.name,
        name = name,
        prefecture = prefecture,
        address = address,
        lat = lat,
        lng = lng,
        geocoded = geocoded,
    )

fun ImportHistory.toResponse() =
    ImportHistoryResponse(
        id = id,
        filename = filename,
        totalCount = totalCount,
        successCount = successCount,
        errorCount = errorCount,
        status = status,
        errorDetail = errorDetail,
        importedAt = importedAt.toString(),
    )
