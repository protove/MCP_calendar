"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ArrowUpCircle, ArrowDownCircle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock data
const INITIAL_TRANSACTIONS = [
    { id: 1, type: "expense", category: "Food", amount: 15000, date: "2024-11-25", description: "Lunch" },
    { id: 2, type: "expense", category: "Transport", amount: 5000, date: "2024-11-25", description: "Subway" },
    { id: 3, type: "income", category: "Salary", amount: 3000000, date: "2024-11-20", description: "November Salary" },
    { id: 4, type: "expense", category: "Shopping", amount: 50000, date: "2024-11-22", description: "Clothes" },
];

const COLORS = ["#313647", "#435663", "#A3B087", "#FFF8D4"];

export function LedgerView() {
    const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);

    const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpense = transactions
        .filter((t) => t.type === "expense")
        .reduce((acc, curr) => acc + curr.amount, 0);

    const balance = totalIncome - totalExpense;

    const expenseData = transactions
        .filter((t) => t.type === "expense")
        .reduce((acc: any[], curr) => {
            const existing = acc.find((item) => item.name === curr.category);
            if (existing) {
                existing.value += curr.amount;
            } else {
                acc.push({ name: curr.category, value: curr.amount });
            }
            return acc;
        }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-custom-dark">Household Ledger</h2>
                <Button
                    className="bg-custom-dark text-white hover:bg-custom-slate focus:outline-none focus:ring-2 focus:ring-custom-slate focus:ring-offset-2"
                    onClick={() => alert("Add Transaction Clicked")}
                >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Add Transaction
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-custom-green/20 p-3">
                            <ArrowUpCircle className="h-6 w-6 text-custom-green" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Income</p>
                            <h3 className="text-2xl font-bold text-custom-dark">
                                ₩{totalIncome.toLocaleString()}
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-red-100 p-3">
                            <ArrowDownCircle className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Expense</p>
                            <h3 className="text-2xl font-bold text-custom-dark">
                                ₩{totalExpense.toLocaleString()}
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-custom-slate/20 p-3">
                            <DollarSign className="h-6 w-6 text-custom-slate" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Balance</p>
                            <h3 className="text-2xl font-bold text-custom-dark">
                                ₩{balance.toLocaleString()}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Chart */}
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-custom-dark">Expense Breakdown</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={expenseData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {expenseData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `₩${value.toLocaleString()}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-custom-dark">Recent Transactions</h3>
                    <div className="space-y-4">
                        {transactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                            >
                                <div>
                                    <p className="font-medium text-custom-dark">{transaction.description}</p>
                                    <p className="text-sm text-gray-500">
                                        {transaction.category} • {transaction.date}
                                    </p>
                                </div>
                                <span
                                    className={cn(
                                        "font-semibold",
                                        transaction.type === "income" ? "text-custom-green" : "text-red-500"
                                    )}
                                >
                                    {transaction.type === "income" ? "+" : "-"}₩
                                    {transaction.amount.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
