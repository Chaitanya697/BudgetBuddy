type Category = {
  id: string;
  label: string;
  type: 'income' | 'expense';
  color?: string;
};

export const CATEGORIES: Category[] = [
  // Income categories
  { id: 'salary', label: 'Salary', type: 'income' },
  { id: 'freelance', label: 'Freelance', type: 'income' },
  { id: 'investments', label: 'Investments', type: 'income' },
  { id: 'other_income', label: 'Other Income', type: 'income' },
  
  // Expense categories
  { id: 'housing', label: 'Housing', type: 'expense', color: '#3b82f6' },
  { id: 'transportation', label: 'Transportation', type: 'expense', color: '#f59e0b' },
  { id: 'food', label: 'Food & Dining', type: 'expense', color: '#10b981' },
  { id: 'utilities', label: 'Utilities', type: 'expense', color: '#8b5cf6' },
  { id: 'entertainment', label: 'Entertainment', type: 'expense', color: '#ef4444' },
  { id: 'healthcare', label: 'Healthcare', type: 'expense', color: '#06b6d4' },
  { id: 'shopping', label: 'Shopping', type: 'expense', color: '#ec4899' },
  { id: 'personal', label: 'Personal', type: 'expense', color: '#a855f7' },
  { id: 'education', label: 'Education', type: 'expense', color: '#14b8a6' },
  { id: 'other_expense', label: 'Other Expense', type: 'expense', color: '#6b7280' },
];

export const getCategoryById = (id: string): Category => {
  const category = CATEGORIES.find(cat => cat.id === id);
  if (!category) {
    return { id: 'unknown', label: 'Unknown', type: 'expense', color: '#6b7280' };
  }
  return category;
};

export const getCategoriesByType = (type: 'income' | 'expense'): Category[] => {
  return CATEGORIES.filter(cat => cat.type === type);
};

export const getCategoryColor = (categoryId: string): string => {
  const category = CATEGORIES.find(cat => cat.id === categoryId);
  return category?.color || '#6b7280';
};
