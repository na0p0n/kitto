package com.kitto.backend.tools.kotlinquiz

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.springframework.core.io.ClassPathResource
import org.springframework.stereotype.Service

@Service
class KotlinQuizService(
    private val objectMapper: ObjectMapper,
) {
    private val questions: List<QuizQuestion> by lazy {
        val resource = ClassPathResource("kotlin-quiz-questions.json")
        objectMapper.readValue<List<QuizQuestion>>(resource.inputStream)
    }

    fun getAllSummaries(): List<QuizQuestionSummary> = questions.map { QuizQuestionSummary(it.id, it.title, it.difficulty, it.category) }

    fun getDetail(id: Int): QuizQuestionDetail? {
        val question = questions.find { it.id == id } ?: return null
        return QuizQuestionDetail(
            id = question.id,
            title = question.title,
            description = question.description,
            buggyCode = question.buggyCode,
            options = question.options,
            hint = question.hint,
            difficulty = question.difficulty,
            category = question.category,
            totalQuestions = questions.size,
        )
    }

    fun checkAnswer(
        id: Int,
        optionId: String,
    ): AnswerResponse? {
        val question = questions.find { it.id == id } ?: return null
        return AnswerResponse(
            correct = question.correctOptionId == optionId,
            correctOptionId = question.correctOptionId,
            explanation = question.explanation,
        )
    }
}
