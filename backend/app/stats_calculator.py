from app.files_manager import data
from typing import Dict


def calculate_mean(column: str) -> float:
    if column in data.columns:
        return data[column].mean()
    raise ValueError(f"Column '{column}' not found in dataset.")


def calculate_sum(column: str) -> float:
    if column in data.columns:
        return data[column].sum()
    raise ValueError(f"Column '{column}' not found in dataset.")


def calculate_quartiles(column: str) -> Dict[str, float]:
    if column in data.columns:
        col = data[column]
        return {
            "Q1": col.quantile(0.25),
            "Q2": col.quantile(0.5),
            "Q3": col.quantile(0.75),
        }
    raise ValueError(f"Column '{column}' not found in dataset.")


def calculate_median(column: str) -> float:
    if column in data.columns:
        return data[column].median()
    raise ValueError(f"Column '{column}' not found in dataset.")


def calculate_mode(column: str) -> float:
    if column in data.columns:
        col = data[column].mode()
        return col.iloc[0] if not col.empty else None
    raise ValueError(f"Column '{column}' not found in dataset.")


def calculate_skewness(column: str) -> float:
    if column in data.columns:
        return data[column].skew()
    raise ValueError(f"Column '{column}' not found in dataset.")


def calculate_kurtosis(column: str) -> float:
    if column in data.columns:
        return data[column].kurt()
    raise ValueError(f"Column '{column}' not found in dataset.")


def calculate_deviation(column: str) -> float:
    if column in data.columns:
        return data[column].std()
    raise ValueError(f"Column '{column}' not found in dataset.")
