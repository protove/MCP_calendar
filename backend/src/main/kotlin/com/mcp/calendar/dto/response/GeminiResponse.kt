package com.mcp.calendar.dto.response

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.mcp.calendar.dto.request.FunctionCall
import com.mcp.calendar.dto.request.GeminiContent
import com.mcp.calendar.dto.request.GeminiPart

@JsonIgnoreProperties(ignoreUnknown = true)
data class GeminiResponse(
    val candidates: List<Candidate>? = null,
    val usageMetadata: UsageMetadata? = null,
    val promptFeedback: PromptFeedback? = null
){
    fun getText(): String? {
        return candidates?.firstOrNull()
            ?.content
            ?.parts
            ?.firstOrNull()
            ?.text
    }

    fun isSuccessful(): Boolean {
        return candidates?.isNotEmpty() == true && candidates.first().finishReason in listOf("STOP", "MAX_TOKENS", null)
    }

    fun isBlocked(): Boolean {
        return promptFeedback?.blockReason != null || candidates?.firstOrNull()?.finishReason == "SAFETY"
    }

    fun getBlockReason(): String? {
        return promptFeedback?.blockReason
            ?: if(candidates?.firstOrNull()?.finishReason == "SAFETY") "SAFETY" else null
    }

    fun hasFunctionCall(): Boolean {
        return candidates?.firstOrNull()
            ?.content?.parts
            ?.any { it.functionCall != null } == true
    }

    fun getFunctionCall(): FunctionCall? {
        return candidates?.firstOrNull()
            ?.content?.parts
            ?.firstOrNull { it.functionCall != null }
            ?.functionCall
    }
}

@JsonIgnoreProperties(ignoreUnknown = true)
data class Candidate(
    val content: GeminiContent? = null,
    val finishReason: String? = null,
    val index: Int? = null,
    val safetyRatings: List<SafetyRating>? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class UsageMetadata(
    val promptTokenCount: Int? = null,
    val candidatesTokenCount: Int? = null,
    val totalTokenCount: Int? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class PromptFeedback(
    val blockReason: String? = null,
    val safetyRatings: List<SafetyRating>? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class SafetyRating(
    val category: String? = null,
    val probability: String? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class GeminiStreamChunk(
    val candidates: List<Candidate>? = null,
    val usageMetadata: UsageMetadata? = null
){
    fun getText(): String? {
        return candidates?.firstOrNull()
            ?.content
            ?.parts
            ?.firstOrNull()
            ?.text
    }

    fun isFinished(): Boolean {
        return candidates?.firstOrNull()?.finishReason != null
    }
}

