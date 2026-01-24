import { useMemo } from "react";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "../constants/categories";

interface Expense {
    id: string;
    category: string;
    date: string;
    description: string;
    payment: string;
    value: number;
    createdAt: Date;
    updatedAt: Date;
}

export function useExpensesCharts(expenses: Expense[]) {
    /**
     * 1) Pizza — total por categoria
     */
    const byCategory = useMemo(() => {
        const acc: Record<string, number> = {};

        expenses.forEach((expense) => {
            acc[expense.category] =
                (acc[expense.category] || 0) + expense.value;
        });

        return Object.entries(acc).map(([category, value]) => ({
            value,
            text: CATEGORY_LABELS[category] ?? category,
            color: CATEGORY_COLORS[category] ?? "#BDBDBD",
        }));
    }, [expenses]);

    /**
     * 2) Barras — total por dia
     */
    const byCategoryBars = useMemo(() => {
        return Object.entries(
            expenses.reduce((acc, expense) => {
                acc[expense.category] =
                    (acc[expense.category] || 0) + expense.value;
                return acc;
            }, {} as Record<string, number>)
        ).map(([category, value]) => ({
            label: CATEGORY_LABELS[category] ?? category,
            value,
            frontColor: CATEGORY_COLORS[category],
        }));
    }, [expenses]);

    const byMonth = useMemo(() => {
        const acc: Record<string, number> = {};

        expenses.forEach((expense) => {
            const month = expense.date.slice(0, 7); // 2025-12
            acc[month] = (acc[month] || 0) + expense.value;
        });

        return Object.entries(acc).map(([label, value]) => ({
            // label: formatMonth(label), Dez/25
            label, // Dez/25
            value,
        }));
    }, [expenses]);

    return { byCategory, byCategoryBars, byMonth };
}

// return Object.entries(acc)
//   .sort(([, a], [, b]) => b - a)
//   .map(([category, value]) => ({
//     value,
//     text: CATEGORY_LABELS[category] ?? category,
//     color: CATEGORY_COLORS[category] ?? '#BDBDBD',
//   }));
