package com.kitto.backend.tools.kotlinquiz

data class QuizOption(
    val id: String,
    val text: String,
)

data class QuizQuestion(
    val id: Int,
    val title: String,
    val description: String,
    val buggyCode: String,
    val options: List<QuizOption>,
    val correctOptionId: String,
    val hint: String,
    val explanation: String,
    val difficulty: String,
    val category: String,
)

data class QuizQuestionSummary(
    val id: Int,
    val title: String,
    val difficulty: String,
    val category: String,
)

data class QuizQuestionDetail(
    val id: Int,
    val title: String,
    val description: String,
    val buggyCode: String,
    val options: List<QuizOption>,
    val hint: String,
    val difficulty: String,
    val category: String,
    val totalQuestions: Int,
)

data class AnswerRequest(
    val optionId: String,
)

data class AnswerResponse(
    val correct: Boolean,
    val correctOptionId: String,
    val explanation: String,
)
