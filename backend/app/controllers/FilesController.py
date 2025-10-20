import os
import sys
import pandas as pd
from pandas import DataFrame

from app import app


class FilesController:
    def __init__(self):
        self.__data_path = os.path.join(app.root_path, "models", "loan_approval.csv")
        self.__data = None
        self.__load_data()

    def __load_data(self) -> None:
        if os.path.exists(self.__data_path):
            try:
                self.__data = pd.read_csv(self.__data_path, sep=';')
            except Exception as ex:
                print(f"[FilesController] Error: {ex}", file=sys.stderr)
        else:
            print(f"[FilesController] Invalid data path: {self.__data_path}", file=sys.stderr)

    def get_data(self) -> DataFrame | None:
        return self.__data


FilesControllerInstance = FilesController()
