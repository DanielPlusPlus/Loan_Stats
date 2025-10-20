from typing import Dict, Union
import pandas as pd

from app.controllers.FilesController import FilesControllerInstance


class StatsCalculatorController:
    def __init__(self):
        self.__data = None

    def __get_data(self) -> pd.DataFrame:
        if self.__data is None:
            self.__data = FilesControllerInstance.get_data()
        return self.__data

    def calculate_mean(self, column: str) -> float:
        data = self.__get_data()
        if column in data.columns:
            return data[column].mean()
        raise ValueError(f"Column '{column}' not found in dataset.")

    def calculate_sum(self, column: str) -> float:
        data = self.__get_data()
        if column in data.columns:
            return data[column].sum()
        raise ValueError(f"Column '{column}' not found in dataset.")

    def calculate_quartiles(self, column: str) -> Dict[str, float]:
        data = self.__get_data()
        if column in data.columns:
            col = data[column]
            return {
                "Q1": col.quantile(0.25),
                "Q2": col.quantile(0.5),
                "Q3": col.quantile(0.75),
            }
        raise ValueError(f"Column '{column}' not found in dataset.")

    def calculate_median(self, column: str) -> float:
        data = self.__get_data()
        if column in data.columns:
            return data[column].median()
        raise ValueError(f"Column '{column}' not found in dataset.")

    def calculate_mode(self, column: str) -> Union[float, None]:
        data = self.__get_data()
        if column in data.columns:
            col = data[column].mode()
            return col.iloc[0] if not col.empty else None
        raise ValueError(f"Column '{column}' not found in dataset.")

    def calculate_skewness(self, column: str) -> float:
        data = self.__get_data()
        if column in data.columns:
            return data[column].skew()
        raise ValueError(f"Column '{column}' not found in dataset.")

    def calculate_kurtosis(self, column: str) -> float:
        data = self.__get_data()
        if column in data.columns:
            return data[column].kurt()
        raise ValueError(f"Column '{column}' not found in dataset.")

    def calculate_deviation(self, column: str) -> float:
        data = self.__get_data()
        if column in data.columns:
            return data[column].std()
        raise ValueError(f"Column '{column}' not found in dataset.")
