export interface BudgetItem {
  id: string;
  name: string;
  amount: number;
  category: string;
  notes?: string;
  createdAt: string;
}

export interface MonthBudget {
  /** format: "YYYY-MM" */
  monthKey: string;
  items: BudgetItem[];
}
