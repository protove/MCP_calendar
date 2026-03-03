package com.mcp.calendar.dto.request

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonProperty

@JsonInclude(JsonInclude.Include.NON_NULL)
data class GeminiRequest(
    val contents: List<GeminiContent>,
    val generationConfig: GenerationConfig? = null,
    val safetySettings: List<SafetySetting>? = null,
    @JsonProperty("system_instruction")
    val systemInstruction: GeminiContent? = null,
    val tools: List<GeminiTool>? = null,
    val toolConfig: GeminiToolConfig? = null
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

        fun withTools(
            contents: List<GeminiContent>,
            tools: List<GeminiTool>,
            systemInstruction: GeminiContent? = null,
            config: GenerationConfig? = null
        ): GeminiRequest {
            return GeminiRequest(
                contents = contents,
                tools = tools,
                toolConfig = GeminiToolConfig(),
                systemInstruction = systemInstruction,
                generationConfig = config
            )
        }
    }
}

@JsonInclude(JsonInclude.Include.NON_NULL)
data class GeminiContent(
    val role: String?,
    val parts: List<GeminiPart>?
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class GeminiPart(
    val text: String? = null,
    val functionCall: FunctionCall? = null,
    val functionResponse: FunctionResponse? = null
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class FunctionCall(
    val name: String,
    val args: Map<String, Any?> = emptyMap()
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class FunctionResponse(
    val name: String,
    val response: Map<String, Any?>
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class GeminiTool(
    val functionDeclarations: List<GeminiFunctionDeclaration>
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class GeminiFunctionDeclaration(
    val name: String,
    val description: String,
    val parameters: Map<String, Any?>
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class GeminiToolConfig(
    val functionCallingConfig: FunctionCallingConfig = FunctionCallingConfig()
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class FunctionCallingConfig(
    val mode: String = "AUTO"
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