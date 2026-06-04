package com.kitto.backend.tools.kotlinquiz

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/tools/kotlin-quiz")
class KotlinQuizController(
    private val service: KotlinQuizService,
) {
    @GetMapping("/questions")
    fun getAll(): List<QuizQuestionSummary> = service.getAllSummaries()

    @GetMapping("/questions/{id}")
    fun getOne(
        @PathVariable id: Int,
    ): ResponseEntity<QuizQuestionDetail> =
        service.getDetail(id)
            ?.let { ResponseEntity.ok(it) }
            ?: ResponseEntity.notFound().build()

    @PostMapping("/questions/{id}/answer")
    fun checkAnswer(
        @PathVariable id: Int,
        @RequestBody request: AnswerRequest,
    ): ResponseEntity<AnswerResponse> =
        service.checkAnswer(id, request.optionId)
            ?.let { ResponseEntity.ok(it) }
            ?: ResponseEntity.notFound().build()
}
