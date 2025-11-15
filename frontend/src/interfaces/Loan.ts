export interface Loan {
  city: string;
  credit_score: number;
  income: number;
  loan_amount: number;
  loan_approved: boolean;
  name: string;
  points: number;
  years_employed: number;
  dataset?: string;
  dataset_code?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  result: T;
  error?: string;
}

export interface PaginatedData {
  data: Loan[];
  has_next: boolean;
  has_prev: boolean;
  total: number;
  per_page: number;
  page: number;
}

export type LoansResponse = ApiResponse<Loan[]>;
