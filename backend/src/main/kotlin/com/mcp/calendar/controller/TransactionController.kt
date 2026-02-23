package com.mcp.calendar.controller

import com.mcp.calendar.dto.request.CreateTransactionRequest
import com.mcp.calendar.dto.request.UpdateTransactionRequest
import com.mcp.calendar.dto.response.ApiResponse
import com.mcp.calendar.dto.response.TransactionResponse
import com.mcp.calendar.dto.response.TransactionSummaryResponse
import com.mcp.calendar.security.UserPrincipal
import com.mcp.calendar.service.TransactionService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/transactions")
class TransactionController(
    private val transactionService: TransactionService
){

    //POST /api/transactions - 거래 생성
    @PostMapping
    fun createTransaction(
        @AuthenticationPrincipal principal: UserPrincipal,
        @Valid @RequestBody request: CreateTransactionRequest
    ): ResponseEntity<ApiResponse<TransactionResponse>> {
        val createdTransaction = transactionService.createTransaction(principal.id, request)
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success(createdTransaction))
    }

    //GET /api/transactions/{id} - 거래 단건 조회
    @GetMapping("/{id}")
    fun getTransaction(
        @PathVariable id: Long
    ): ResponseEntity<ApiResponse<TransactionResponse>> {
        val transaction = transactionService.getTransaction(id)
        return ResponseEntity.ok(ApiResponse.success(transaction))
    }

    //GET /api/transactions - 전체 거래 조회
    @GetMapping
    fun getAllTransactions(
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<List<TransactionResponse>>> {
        val transactions = transactionService.getAllTransactions(principal.id)
        return ResponseEntity.ok(ApiResponse.success(transactions))
    }

    //GET /api/transactions/monthly?year=2026&month=1 - 월별 거래 조회
    @GetMapping("/monthly")
    fun getMonthlyTransactions(
        @AuthenticationPrincipal principal: UserPrincipal,
        @RequestParam year: Int,
        @RequestParam month: Int
    ): ResponseEntity<ApiResponse<List<TransactionResponse>>> {
        val transactions = transactionService.getMonthlyTransactions(principal.id, year, month)
        return ResponseEntity.ok(ApiResponse.success(transactions))
    }

    //GET /api/transactions/summary?year=2026&month=1 - 월별 거래 요약 조회
    @GetMapping("/summary")
    fun getMonthlySummary(
        @AuthenticationPrincipal principal: UserPrincipal,
        @RequestParam year: Int,
        @RequestParam month: Int
    ): ResponseEntity<ApiResponse<TransactionSummaryResponse>> {
        val summary = transactionService.getMonthlySummary(principal.id, year, month)
        return ResponseEntity.ok(ApiResponse.success(summary))
    }

    //PUT /api/transactions/{id} - 거래 수정
    @PutMapping("/{id}")
    fun updateTransaction(
        @PathVariable id: Long,
        @AuthenticationPrincipal principal: UserPrincipal,
        @Valid @RequestBody request: UpdateTransactionRequest
    ): ResponseEntity<ApiResponse<TransactionResponse>> {
        val updatedTransaction = transactionService.updateTransaction(id, principal.id, request)
        return ResponseEntity.ok(ApiResponse.success(updatedTransaction))
    }

    //Delete /api/transactions/{id} - 거래 삭제
    @DeleteMapping("/{id}")
    fun deleteTransaction(
        @PathVariable id: Long,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<Unit>> {
        transactionService.deleteTransaction(id, principal.id)
        return ResponseEntity.ok(ApiResponse.successNoContent())
    }
}