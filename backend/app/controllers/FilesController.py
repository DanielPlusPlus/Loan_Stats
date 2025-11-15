import os
import sys
import pandas as pd
import numpy as np
from pandas import DataFrame
from typing import Union

from app import app


class FilesController:
    def __init__(self):
        self.__data_path = os.path.join(app.root_path, "models", "part_of_loan_approval.csv")
        self.__data = None
        self.__prognosis_cache = None
        self.__prognosis_only_cache = None
        self.__prognosis_file_path = os.path.join(app.root_path, "models", "prognosis_loan_approval.csv")
        self.__load_data()

    def __load_data(self) -> None:
        if os.path.exists(self.__data_path):
            try:
                self.__data = pd.read_csv(self.__data_path, sep=';')
            except Exception as ex:
                print(f"[FilesController] Error: {ex}", file=sys.stderr)
        else:
            print(f"[FilesController] Invalid data path: {self.__data_path}", file=sys.stderr)

    def get_data(self) -> Union[DataFrame, None]:
        return self.__data

    def get_prognosis_data(self) -> Union[DataFrame, None]:
        """
        Returns the original dataset with additional synthetic rows appended.
        Prognosis rows come from a pre-generated CSV for consistency across tabs.
        If missing, they are generated deterministically and saved.
        Includes a 'dataset' column: 'normal' for original rows, 'prognosis' for appended rows.
        """
        if self.__data is None:
            return None
        if self.__prognosis_cache is not None:
            return self.__prognosis_cache

        df = self.__data.copy()
        if df.empty:
            self.__prognosis_cache = df
            return df


        prognosis_df = self.__load_or_generate_prognosis(df)


        for col in df.columns:
            if col in prognosis_df.columns and df[col].dtype == bool and prognosis_df[col].dtype != bool:
                prognosis_df[col] = prognosis_df[col].astype(str).str.lower().isin(['true','1','yes','tak','ja','是','예'])

        df_out = df.copy()
        df_out['dataset'] = 'normal'
        prognosis_df = prognosis_df.copy()
        prognosis_df['dataset'] = 'prognosis'


        for col in df_out.columns:
            if col not in prognosis_df.columns:
                prognosis_df[col] = np.nan
        prognosis_df = prognosis_df[df_out.columns]

        self.__prognosis_cache = pd.concat([df_out, prognosis_df], ignore_index=True)
        return self.__prognosis_cache

    def get_prognosis_process_details(self) -> dict:
        if self.__data is None:
            raise ValueError("No data loaded")
        df = self.__data
        head = df.head(3)
        numeric_cols = head.select_dtypes(include=['number']).columns.tolist()
        cat_cols = [c for c in df.columns if c not in numeric_cols]

        details = {
            "source_rows": 3,
            "total_count": int(len(df)),
            "numeric": {},
            "categorical": {},
        }

        for col in numeric_cols:
            vals = head[col].dropna().astype(float)
            mu = float(vals.mean()) if not vals.empty else 0.0
            sigma = float(vals.std()) if len(vals) > 1 else 0.0
            if sigma == 0.0:
                sigma = abs(mu) * 0.05 + 1e-6
            details["numeric"][col] = {
                "samples": [float(x) for x in vals.tolist()],
                "mu": mu,
                "sigma": sigma,
                "distribution": "normal"
            }

        for col in cat_cols:
            values_head = head[col].dropna().tolist()
            full_vals = df[col].dropna()
            vc = full_vals.value_counts(normalize=True)
            details["categorical"][col] = {
                "samples": values_head,
                "choices": vc.index.tolist(),
                "probabilities": [float(p) for p in vc.values.tolist()],
                "distribution": "empirical"
            }

        return details

    def get_prognosis_only_data(self) -> Union[DataFrame, None]:
        """
        Returns ONLY synthetic prognosis rows generated from the first 3 rows
        of the original dataset. Includes a 'dataset' column set to 'prognosis'.
        """
        if self.__data is None:
            return None
        if self.__prognosis_only_cache is not None:
            return self.__prognosis_only_cache
        df = self.__data
        if df.empty:
            self.__prognosis_only_cache = df
            return df

        prognosis_df = self.__load_or_generate_prognosis(df)

        for col in df.columns:
            if col in prognosis_df.columns and df[col].dtype == bool and prognosis_df[col].dtype != bool:
                prognosis_df[col] = prognosis_df[col].astype(str).str.lower().isin(['true','1','yes','tak','ja','是','예'])


        for col in df.columns:
            if col not in prognosis_df.columns:
                prognosis_df[col] = np.nan
        prognosis_df = prognosis_df[df.columns]
        prognosis_df['dataset'] = 'prognosis'
        self.__prognosis_only_cache = prognosis_df
        return prognosis_df

    def __load_or_generate_prognosis(self, base_df: DataFrame) -> DataFrame:

        if os.path.exists(self.__prognosis_file_path):
            try:
                p = pd.read_csv(self.__prognosis_file_path, sep=';')

                if 'years_employed' in p.columns:
                    try:
                        p['years_employed'] = np.maximum(0, np.rint(pd.to_numeric(p['years_employed'], errors='coerce')).astype('Int64')).astype(int)
                    except Exception:
                        p['years_employed'] = np.maximum(0, np.rint(p['years_employed']).astype(int))
                return p
            except Exception as ex:
                print(f"[FilesController] Failed to load prognosis file: {ex}", file=sys.stderr)


        try:
            from app.utils.generate_prognosis import generate_prognosis_csv
            base_csv = self.__data_path
            out_csv = self.__prognosis_file_path
            p = generate_prognosis_csv(base_csv, out_csv, seed=42, size_ratio=0.25)
            return p
        except Exception as ex:
            print(f"[FilesController] Failed to generate prognosis file: {ex}", file=sys.stderr)

            return base_df.head(0).copy()


FilesControllerInstance = FilesController()
