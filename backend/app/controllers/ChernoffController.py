import io
import base64
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.patches import Patch

from app.controllers.FilesController import FilesControllerInstance
from app.controllers.LanguagesController import LanguagesControllerInstance
from ChernoffFace import chernoff_face


class ChernoffController:
    def __init__(self):
        self.__data = None

    def __get_data(self) -> pd.DataFrame:
        if self.__data is None:
            self.__data = FilesControllerInstance.get_data()
        return self.__data

    def __fig_to_base64(self, fig) -> str:
        buf = io.BytesIO()
        fig.savefig(buf, format="png", bbox_inches="tight")
        buf.seek(0)
        encoded = base64.b64encode(buf.read()).decode("utf-8")
        buf.close()
        plt.close(fig)
        return encoded

    def generate_chernoff_faces(self, language: str = "en") -> str:
        data = self.__get_data()

        cols = ["income", "credit_score", "loan_amount", "years_employed", "points"]
        df = data[cols].copy()
        df = (df - df.min()) / (df.max() - df.min())
        df_sample = df.iloc[:30].reset_index(drop=True)

        self.__set_font_for_language(language)

        fig = chernoff_face(
            data=df_sample.values,
            titles=[str(i + 1) for i in range(len(df_sample))],
            n_columns=5,
            figsize=(14, 9),
            dpi=150,
            long_face=False
        )

        plt.subplots_adjust(left=0.05, right=0.85, wspace=0.5, hspace=0.8)

        self.__add_chernoff_legend(fig, language)

        return self.__fig_to_base64(fig)

    def __set_font_for_language(self, language: str):
        if language == "zh":
            plt.rcParams['font.family'] = 'SimSun'
        elif language == "ko":
            plt.rcParams['font.family'] = 'Malgun Gothic'
        else:
            plt.rcParams['font.family'] = 'DejaVu Sans'

        plt.rcParams['axes.unicode_minus'] = False

    def __add_chernoff_legend(self, fig, language):
        translations = LanguagesControllerInstance.load_translations(language, "chernoff_legend")
        if not translations:
            raise ValueError(f"Translations for '{language}' could not be loaded.")
        legend_elements = [Patch(color='white', label=text) for text in translations]

        fig.legend(
            handles=legend_elements,
            loc='center right',
            bbox_to_anchor=(1.15, 0.5),
            frameon=False,
            fontsize=9,
            alignment="left",
            handletextpad=0.4,
            labelspacing=0.6,
        )
