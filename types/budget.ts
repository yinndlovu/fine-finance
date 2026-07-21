export interface BudgetItem {
  id: string;
  name: string;
  amount: number;
  category: string;
  notes?: string;
  createdAt: string;
  spent: boolean; // true = money has been spent on this item
}

export interface MonthBudget {
  monthKey: string;
  income: number;
  items: BudgetItem[];
}
