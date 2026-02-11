package com.mcp.calendar.dto.request

import com.fasterxml.jackson.annotation.JsonInclude

@JsonInclude(JsonInclude.Include.NON_NULL)
data class GeminiRequest(
    val contents: List<GeminiContent>,
    val generationConfig: GenerationConfig? = null,
    val safetySettings: List<SafetySetting>? = null,
    val systemInstructions: GeminiContent? = null
){
    companion object {
        fun of(message: String, config: GenerationConfig? = null): GeminiRequest {
            return GeminiRequest(
                contents = listOf(
                    GeminiContent(
                        role = "user",
                        parts = listOf(GeminiPart(text = message))
                    )
                ),
                generationConfig = config
            )
        }

        fun withHistory(
            history: List<GeminiContent>,
            message: String,
            config: GenerationConfig? = null
        ): GeminiRequest {
            val contents = history.toMutableList()
            contents.add(
                GeminiContent(
                    role = "user", 
                    parts = listOf(GeminiPart(text = message))
                )
            )
            return GeminiRequest(contents = contents, generationConfig = config)
        }
    }
}

data class GeminiContent(
    val role: String?,
    val parts: List<GeminiPart>?
)

data class GeminiPart(
    val text: String?
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class GenerationConfig(
    val temperature: Double? = 0.7,
    val topP: Double? = null,
    val topK: Int? = null,
    val maxOutputTokens: Int? = 8192,
    val candidateCount: Int? = 1,
    val stopSequences: List<String>? = null
){
    companion object {
        val DEFAULT = GenerationConfig()
        val CREATIVE = GenerationConfig(temperature = 0.9, topP = 0.95)
        val PRECISE = GenerationConfig(temperature = 0.3, topP = 0.8)
    }
}

data class SafetySetting(
    val category: String,
    val threshold: String
)