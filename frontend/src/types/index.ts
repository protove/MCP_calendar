export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Event {
  id: string;
  userId: string;
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  description?: string;
  date: string;
  isRecurring: boolean;
  recurringDay?: number;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}