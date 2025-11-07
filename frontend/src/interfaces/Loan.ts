export interface Loan {
  city: string;
  credit_score: number;
  income: number;
  loan_amount: number;
  loan_approved: boolean;
  name: string;
  points: number;
  years_employed: number;
}

export interface ApiResponse<T> {
  success: boolean;
  result: T;
  error?: string;
}

export type LoansResponse = ApiResponse<Loan[]>;
