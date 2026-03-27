package com.kitto.backend.tools

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

data class Tool(
    val id: String,
    val name: String,
    val description: String,
    val icon: String,
    val category: String,
    val badge: String? = null,
    val soon: Boolean = false,
)

@RestController
@RequestMapping("/api/tools")
class ToolsController {
    @GetMapping
    fun listTools(): List<Tool> =
        listOf(
            Tool(
                id = "warikan",
                name = "割り勘計算",
                description = "不均等割り勘にも対応。幹事の強い味方。",
                icon = "🧮",
                category = "計算",
                badge = "pop",
            ),
            Tool(
                id = "countdown",
                name = "カウントダウン",
                description = "〇〇まで何日？シェア用画像も作れる。",
                icon = "📅",
                category = "生活",
                badge = "new",
            ),
            Tool(
                id = "calorie",
                name = "カロリー計算",
                description = "インストール不要。秒で計算できます。",
                icon = "⚖️",
                category = "生活",
            ),
            Tool(
                id = "coming-soon",
                name = "次のツール",
                description = "準備中です。お楽しみに。",
                icon = "🎲",
                category = "おもしろ",
                badge = "soon",
                soon = true,
            ),
        )
}
