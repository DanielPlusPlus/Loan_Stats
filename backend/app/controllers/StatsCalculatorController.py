from typing import Dict, Union, List
import pandas as pd
import numpy as np

from app.controllers.FilesController import FilesControllerInstance


class StatsCalculatorController:
    def __init__(self):
        self.__data = None
        self.__numeric_columns: List[str] = [
            'credit_score', 'income', 'loan_amount', 'points', 'years_employed'
        ]

    def __get_data(self, mode: str = 'normal') -> pd.DataFrame:
        if mode == 'prognosis':
            data = FilesControllerInstance.get_prognosis_only_data()
            if data is None:
                raise ValueError("No data loaded")
            return data
        if mode == 'merged':
            data = FilesControllerInstance.get_prognosis_data()
            if data is None:
                raise ValueError("No data loaded")
            return data
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


    def calculate_mean_m(self, column: str, mode: str) -> float:
        data = self.__get_data(mode)
        if column in data.columns:
            return data[column].mean()
        raise ValueError(f"Column '{column}' not found in dataset.")

    def calculate_sum_m(self, column: str, mode: str) -> float:
        data = self.__get_data(mode)
        if column in data.columns:
            return data[column].sum()
        raise ValueError(f"Column '{column}' not found in dataset.")

    def calculate_quartiles_m(self, column: str, mode: str) -> Dict[str, float]:
        data = self.__get_data(mode)
        if column in data.columns:
            col = data[column]
            return {"Q1": col.quantile(0.25), "Q2": col.quantile(0.5), "Q3": col.quantile(0.75)}
        raise ValueError(f"Column '{column}' not found in dataset.")

    def calculate_median_m(self, column: str, mode: str) -> float:
        data = self.__get_data(mode)
        if column in data.columns:
            return data[column].median()
        raise ValueError(f"Column '{column}' not found in dataset.")

    def calculate_mode_m(self, column: str, mode: str) -> Union[float, None]:
        data = self.__get_data(mode)
        if column in data.columns:
            col = data[column].mode()
            return col.iloc[0] if not col.empty else None
        raise ValueError(f"Column '{column}' not found in dataset.")

    def calculate_skewness_m(self, column: str, mode: str) -> float:
        data = self.__get_data(mode)
        if column in data.columns:
            return data[column].skew()
        raise ValueError(f"Column '{column}' not found in dataset.")

    def calculate_kurtosis_m(self, column: str, mode: str) -> float:
        data = self.__get_data(mode)
        if column in data.columns:
            return data[column].kurt()
        raise ValueError(f"Column '{column}' not found in dataset.")

    def calculate_deviation_m(self, column: str, mode: str) -> float:
        data = self.__get_data(mode)
        if column in data.columns:
            return data[column].std()
        raise ValueError(f"Column '{column}' not found in dataset.")

    def get_summary_stats(self, mode: str) -> Dict[str, Dict[str, Union[float, int, None]]]:
        data = self.__get_data(mode)
        cols = [c for c in self.__numeric_columns if c in data.columns]
        res: Dict[str, Dict[str, Union[float, int, None]]] = {
            'mean': {}, 'median': {}, 'mode': {}, 'sum': {},
            'deviation': {}, 'skewness': {}, 'kurtosis': {},
            'Q1': {}, 'Q2': {}, 'Q3': {}
        }
        for c in cols:
            s = data[c]

            q1 = s.quantile(0.25)
            q2 = s.quantile(0.5)
            q3 = s.quantile(0.75)
            m = s.mode()
            mode_val: Union[float, int, None]
            if m.empty:
                mode_val = None
            else:
                mode_val = m.iloc[0]

            res['mean'][c] = s.mean()
            res['median'][c] = s.median()
            res['mode'][c] = mode_val
            res['sum'][c] = s.sum()
            res['deviation'][c] = s.std()
            res['skewness'][c] = s.skew()
            res['kurtosis'][c] = s.kurt()
            res['Q1'][c] = q1
            res['Q2'][c] = q2
            res['Q3'][c] = q3


        def to_py(x):
            if isinstance(x, (np.generic,)):
                return x.item()
            return x

        for k, d in res.items():
            for c in list(d.keys()):
                d[c] = to_py(d[c])

        return res
