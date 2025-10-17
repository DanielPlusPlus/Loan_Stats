import os
import sys
import pandas
from pandas import DataFrame

from . import app


def load_data() -> DataFrame | None:
    data_dir = os.path.join(app.root_path, "static", "models", "loan_approval.csv")

    if os.path.exists(data_dir):
        try:
            return pandas.read_csv(data_dir, sep=';')
        except Exception as ex:
            print(f"Error: {ex}", file=sys.stderr)
            return None
    else:
        print("Error: invalid data path", file=sys.stderr)
        return None


data = load_data()
