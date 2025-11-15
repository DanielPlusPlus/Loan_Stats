import io
import base64
import matplotlib
import matplotlib.pyplot as plt
from matplotlib import font_manager
import seaborn as sns
import pandas as pd
import numpy as np
import requests
from pathlib import Path
from flask import Response
from app.controllers.FilesController import FilesControllerInstance
from app.controllers.LanguagesController import LanguagesControllerInstance

matplotlib.use("Agg")


class ChartsController:
    __font_cache_dir = Path("/tmp/matplotlib_fonts")
    __downloaded_fonts = {}

    def __init__(self):
        self.__data = None

    def __get_data(self) -> pd.DataFrame:
        if self.__data is None:
            self.__data = FilesControllerInstance.get_data()
        return self.__data

    def __download_font(self, font_url: str, font_name: str) -> str:
        if font_name in self.__downloaded_fonts:
            print(f"Font {font_name} already cached")
            return self.__downloaded_fonts[font_name]

        self.__font_cache_dir.mkdir(parents=True, exist_ok=True)
        url_no_query = font_url.split("?")[0]
        ext = Path(url_no_query).suffix or ".ttf"
        font_path = self.__font_cache_dir / f"{font_name}{ext}"

        if not font_path.exists():
            try:
                print(f"Downloading font {font_name} from {font_url}")
                response = requests.get(
                    font_url,
                    timeout=15,
                    headers={
                        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
                        "Accept": "*/*",
                    },
                )
                response.raise_for_status()
                font_path.write_bytes(response.content)
                print(f"Font {font_name} downloaded successfully to {font_path}")
            except Exception as e:
                print(f"Failed to download font {font_name}: {e}")
                return None

        if font_path.exists():
            try:
                font_manager.fontManager.addfont(str(font_path))
                self.__downloaded_fonts[font_name] = str(font_path)
                print(f"Font {font_name} registered with matplotlib at {font_path}")
                return str(font_path)
            except Exception as e:
                print(f"Failed to register font {font_name}: {e}")
                return None

        return None

    def __set_font_for_language(self, language: str):
        sources = {
            "zh": [
                ("https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/OTF/SimplifiedChinese/NotoSansSC-Regular.otf", "NotoSansSC"),
                ("https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf", "NotoSansCJKsc"),
                ("https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF/SimplifiedChinese/NotoSansSC-Regular.otf", "NotoSansSC"),
                ("https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf", "NotoSansCJKsc"),
                ("https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/SimplifiedChinese/NotoSansSC-Regular.otf", "NotoSansSC"),
                ("https://fonts.gstatic.com/s/notosanssc/v36/k3kXo84MPvpLmixcA63oeALhL4iJ-Q7m8w.ttf", "NotoSansSC"),
            ],
            "ko": [
                ("https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/OTF/Korean/NotoSansKR-Regular.otf", "NotoSansKR"),
                ("https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/OTF/Korean/NotoSansCJKkr-Regular.otf", "NotoSansCJKkr"),
                ("https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF/Korean/NotoSansKR-Regular.otf", "NotoSansKR"),
                ("https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF/Korean/NotoSansCJKkr-Regular.otf", "NotoSansCJKkr"),
                ("https://fonts.gstatic.com/s/notosanskr/v36/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoyeLTq8H4hfeE.ttf", "NotoSansKR"),
            ],
        }

        default_font = 'DejaVu Sans'

        chosen_path = None
        chosen_key = None

        if language in sources:
            for url, key in sources[language]:
                path = self.__download_font(url, key)
                if path:
                    chosen_path = path
                    chosen_key = key
                    break

        if chosen_path:
            try:
                family_name = font_manager.FontProperties(fname=str(chosen_path)).get_name()
                print(f"Detected family '{family_name}' for key '{chosen_key}' (language={language})")
                plt.rcParams['font.family'] = 'sans-serif'
                plt.rcParams['font.sans-serif'] = [family_name, 'DejaVu Sans', 'Arial']
            except Exception as e:
                print(f"Failed to resolve family name for {chosen_path}: {e}")
                plt.rcParams['font.family'] = default_font
        else:
            print(f"Font download failed, using {default_font}")
            plt.rcParams['font.family'] = default_font

        plt.rcParams['axes.unicode_minus'] = False

    def __apply_theme(self, language: str, style: str = "whitegrid"):
        try:
            sns.set_theme(style=style)
        except Exception:
            sns.set_theme()
        self.__set_font_for_language(language)

    def __fig_to_bytes(self, plt_obj) -> bytes:
        buf = io.BytesIO()
        plt_obj.savefig(buf, format="png", bbox_inches="tight")
        buf.seek(0)
        img_bytes = buf.getvalue()
        buf.close()
        return img_bytes

    def plot_income_histogram(self, language: str):
        data = self.__get_data()
        self.__apply_theme(language, style="whitegrid")
        plt.figure(figsize=(8, 5))
        sns.kdeplot(data=data[data["loan_approved"] == True]["income"], label=LanguagesControllerInstance.get_translation(language, "chart_legend_loan_approved", "Loan Approved"))
        sns.kdeplot(data=data[data["loan_approved"] == False]["income"], label=LanguagesControllerInstance.get_translation(language, "chart_legend_loan_rejected", "Loan Rejected"))
        plt.title(LanguagesControllerInstance.get_translation(language, "chart_title_income_distribution", "Income Distribution by Loan Approval Decision"))
        plt.xlabel(LanguagesControllerInstance.get_translation(language, "chart_label_income", "Income"))
        plt.ylabel(LanguagesControllerInstance.get_translation(language, "chart_label_density", "Density"))
        plt.legend()
        img_bytes = self.__fig_to_bytes(plt)
        plt.close()
        return Response(img_bytes, mimetype='image/png')

    def plot_credit_vs_loan(self, language: str):
        data = self.__get_data()
        self.__apply_theme(language, style="whitegrid")
        plt.figure(figsize=(8, 5))
        sns.scatterplot(
            data=data,
            x="credit_score",
            y="loan_amount",
            hue="loan_approved",
            size="income",
            sizes=(20, 200),
            alpha=0.7,
        )
        plt.title(LanguagesControllerInstance.get_translation(language, "chart_title_credit_vs_loan", "Loan Amount vs Credit Score (point size = income)"))
        plt.xlabel(LanguagesControllerInstance.get_translation(language, "chart_label_credit_score", "Credit Score"))
        plt.ylabel(LanguagesControllerInstance.get_translation(language, "chart_label_loan_amount", "Loan Amount"))
        img_bytes = self.__fig_to_bytes(plt)
        plt.close()
        return Response(img_bytes, mimetype='image/png')

    def plot_employment_boxplot(self, language: str):
        data = self.__get_data()
        self.__apply_theme(language, style="whitegrid")
        plt.figure(figsize=(7, 5))
        sns.boxplot(data=data, x="loan_approved", y="years_employed", palette="Set2")
        sns.stripplot(data=data, x="loan_approved", y="years_employed", color="black", alpha=0.5)
        plt.title(LanguagesControllerInstance.get_translation(language, "chart_title_employment_duration", "Employment Duration vs Loan Approval Decision"))
        plt.xlabel(LanguagesControllerInstance.get_translation(language, "chart_label_loan_approved", "Loan Approved"))
        plt.ylabel(LanguagesControllerInstance.get_translation(language, "chart_label_years_employed", "Years Employed"))
        img_bytes = self.__fig_to_bytes(plt)
        plt.close()
        return Response(img_bytes, mimetype='image/png')

    def plot_correlation_heatmap(self, language: str):
        data = self.__get_data()
        self.__apply_theme(language, style="whitegrid")
        plt.figure(figsize=(8, 6))
        corr = data.corr(numeric_only=True)
        sns.heatmap(corr, annot=True, cmap="coolwarm", fmt=".2f")
        plt.title(LanguagesControllerInstance.get_translation(language, "chart_title_correlation_matrix", "Correlation Matrix Between Variables"))
        img_bytes = self.__fig_to_bytes(plt)
        plt.close()
        return Response(img_bytes, mimetype='image/png')

    def plot_income_vs_score(self, language: str):
        data = self.__get_data()
        self.__apply_theme(language, style="whitegrid")
        plt.figure(figsize=(8, 5))
        sns.scatterplot(data=data, x="credit_score", y="income", hue="loan_approved", alpha=0.7)
        plt.title(LanguagesControllerInstance.get_translation(language, "chart_title_income_vs_score", "Income vs Credit Score (by Loan Approval Decision)"))
        plt.xlabel(LanguagesControllerInstance.get_translation(language, "chart_label_credit_score", "Credit Score"))
        plt.ylabel(LanguagesControllerInstance.get_translation(language, "chart_label_income", "Income"))
        img_bytes = self.__fig_to_bytes(plt)
        plt.close()
        return Response(img_bytes, mimetype='image/png')

    def plot_income_vs_years(self, language: str):
        data = self.__get_data()
        self.__apply_theme(language, style="whitegrid")
        plt.figure(figsize=(8, 5))
        sns.scatterplot(
            data=data,
            x="years_employed",
            y="income",
            hue="loan_approved",
            style="loan_approved",
            alpha=0.7
        )
        plt.title(LanguagesControllerInstance.get_translation(language, "chart_title_income_vs_years", "Income vs Employment Duration (by Loan Approval Decision)"))
        plt.xlabel(LanguagesControllerInstance.get_translation(language, "chart_label_years_employed", "Years Employed"))
        plt.ylabel(LanguagesControllerInstance.get_translation(language, "chart_label_income", "Income"))
        img_bytes = self.__fig_to_bytes(plt)
        plt.close()
        return Response(img_bytes, mimetype='image/png')

    def plot_credit_violin(self, language: str):
        data = self.__get_data()
        data["income_group"] = pd.qcut(data["income"], 3, labels=["low", "medium", "high"])
        self.__apply_theme(language, style="whitegrid")
        plt.figure(figsize=(8, 5))
        sns.violinplot(data=data, x="loan_approved", y="credit_score", hue="income_group", split=True)
        plt.title(LanguagesControllerInstance.get_translation(language, "chart_title_credit_violin", "Credit Score Distribution by Income and Loan Approval Decision"))
        plt.xlabel(LanguagesControllerInstance.get_translation(language, "chart_label_loan_approved_question", "Was the loan approved?"))
        plt.ylabel(LanguagesControllerInstance.get_translation(language, "chart_label_credit_score", "Credit Score"))
        plt.legend(title=LanguagesControllerInstance.get_translation(language, "chart_legend_income_group", "Income Group"))
        img_bytes = self.__fig_to_bytes(plt)
        plt.close()
        return Response(img_bytes, mimetype='image/png')

    def plot_avg_income_by_city(self, language: str):
        data = self.__get_data()
        self.__apply_theme(language, style="whitegrid")
        avg_income = data.groupby(["city", "loan_approved"])["income"].mean().unstack()
        plt.figure(figsize=(12, 6))
        avg_income.plot(kind="bar")
        plt.title(LanguagesControllerInstance.get_translation(language, "chart_title_avg_income_by_city", "Average Income by City and Loan Approval Decision"))
        plt.ylabel(LanguagesControllerInstance.get_translation(language, "chart_label_avg_income", "Average Income"))
        plt.xticks(rotation=45, ha="right")
        img_bytes = self.__fig_to_bytes(plt)
        plt.close()
        return Response(img_bytes, mimetype='image/png')

    def plot_pairplot_main(self, language: str):
        data = self.__get_data()
        self.__apply_theme(language, style="ticks")
        pairplot = sns.pairplot(data, vars=["income", "credit_score", "loan_amount"], hue="loan_approved", corner=True)
        pairplot.fig.suptitle(LanguagesControllerInstance.get_translation(language, "chart_title_pairplot_main", "Relationships Between Key Variables"), y=1.02)
        buf = io.BytesIO()
        pairplot.savefig(buf, format="png", bbox_inches="tight")
        buf.seek(0)
        img_bytes = buf.getvalue()
        buf.close()
        plt.close("all")
        return Response(img_bytes, mimetype='image/png')

    def plot_loan_amount_box(self, language: str):
        data = self.__get_data()
        self.__apply_theme(language, style="whitegrid")
        plt.figure(figsize=(8, 5))
        sns.boxplot(data=data, x="loan_approved", y="loan_amount", palette="Set3")
        sns.stripplot(data=data, x="loan_approved", y="loan_amount", color="black", alpha=0.5)
        plt.title(LanguagesControllerInstance.get_translation(language, "chart_title_loan_amount_box", "Loan Amount vs Loan Approval Decision"))
        plt.xlabel(LanguagesControllerInstance.get_translation(language, "chart_label_loan_approved", "Loan Approved"))
        plt.ylabel(LanguagesControllerInstance.get_translation(language, "chart_label_loan_amount", "Loan Amount"))
        img_bytes = self.__fig_to_bytes(plt)
        plt.close()
        return Response(img_bytes, mimetype='image/png')

    def plot_credit_score_histogram(self, language: str):
        data = self.__get_data()
        self.__apply_theme(language, style="whitegrid")
        plt.figure(figsize=(8, 5))
        sns.kdeplot(data=data[data["loan_approved"] == True]["credit_score"], label=LanguagesControllerInstance.get_translation(language, "chart_legend_loan_approved", "Loan Approved"))
        sns.kdeplot(data=data[data["loan_approved"] == False]["credit_score"], label=LanguagesControllerInstance.get_translation(language, "chart_legend_loan_rejected", "Loan Rejected"))
        plt.title(LanguagesControllerInstance.get_translation(language, "chart_title_credit_score_distribution", "Credit Score Distribution by Loan Approval Decision"))
        plt.xlabel(LanguagesControllerInstance.get_translation(language, "chart_label_credit_score", "Credit Score"))
        plt.ylabel(LanguagesControllerInstance.get_translation(language, "chart_label_density", "Density"))
        plt.legend()
        img_bytes = self.__fig_to_bytes(plt)
        plt.close()
        return Response(img_bytes, mimetype='image/png')

    def plot_income_hist_and_density(self, language: str):
        self.__set_font_for_language(language)
        data = self.__get_data()
        plt.figure(figsize=(8, 5))
        sns.histplot(data["income"], kde=True, bins=20, color="skyblue")
        plt.title(LanguagesControllerInstance.get_translation(language, "chart_title_income_hist_density", "Income Histogram and Density Distribution"))
        plt.xlabel(LanguagesControllerInstance.get_translation(language, "chart_label_income", "Income"))
        plt.ylabel(LanguagesControllerInstance.get_translation(language, "chart_label_number_of_clients", "Number of Clients"))
        return Response(self.__fig_to_bytes(plt), mimetype='image/png')

    def plot_income_box(self, language: str):
        self.__set_font_for_language(language)
        data = self.__get_data()
        plt.figure(figsize=(6, 4))
        sns.boxplot(y=data["income"], color="lightgreen")
        plt.title(LanguagesControllerInstance.get_translation(language, "chart_title_income_box", "Income Box Plot"))
        plt.ylabel(LanguagesControllerInstance.get_translation(language, "chart_label_income", "Income"))
        return Response(self.__fig_to_bytes(plt), mimetype='image/png')

    def plot_income_ecdf(self, language: str):
        self.__set_font_for_language(language)
        data = self.__get_data()
        plt.figure(figsize=(8, 5))
        sorted_income = np.sort(data["income"])
        ecdf = np.arange(1, len(sorted_income) + 1) / len(sorted_income)
        plt.step(sorted_income, ecdf, where="post")
        plt.title(LanguagesControllerInstance.get_translation(language, "chart_title_income_ecdf", "Empirical Cumulative Distribution Function of Income"))
        plt.xlabel(LanguagesControllerInstance.get_translation(language, "chart_label_income", "Income"))
        plt.ylabel(LanguagesControllerInstance.get_translation(language, "chart_label_ecdf", "P(X ≤ x)"))
        return Response(self.__fig_to_bytes(plt), mimetype='image/png')

    def plot_income_frequency(self, language: str):
        self.__set_font_for_language(language)
        data = self.__get_data()
        bins = pd.cut(data["income"], bins=10)
        counts = bins.value_counts().sort_index()
        plt.figure(figsize=(10, 5))
        counts.plot(kind="bar", color="coral")
        plt.title(LanguagesControllerInstance.get_translation(language, "chart_title_income_frequency", "Client Frequency in Income Ranges"))
        plt.xlabel(LanguagesControllerInstance.get_translation(language, "chart_label_income_range", "Income Range"))
        plt.ylabel(LanguagesControllerInstance.get_translation(language, "chart_label_number_of_clients", "Number of Clients"))
        return Response(self.__fig_to_bytes(plt), mimetype='image/png')

    def plot_income_relative_frequency(self, language: str):
        self.__set_font_for_language(language)
        data = self.__get_data()
        bins = pd.cut(data["income"], bins=10)
        rel_freq = bins.value_counts(normalize=True).sort_index()
        plt.figure(figsize=(10, 5))
        rel_freq.plot(kind="bar", color="purple")
        plt.title(LanguagesControllerInstance.get_translation(language, "chart_title_income_relative_frequency", "Relative Frequency of Incomes"))
        plt.xlabel(LanguagesControllerInstance.get_translation(language, "chart_label_income_range", "Income Range"))
        plt.ylabel(LanguagesControllerInstance.get_translation(language, "chart_label_proportion", "Proportion (%)"))
        return Response(self.__fig_to_bytes(plt), mimetype='image/png')

    def plot_loan_pie(self, language: str):
        self.__set_font_for_language(language)
        data = self.__get_data()
        counts = data["loan_approved"].value_counts()
        plt.figure(figsize=(6, 6))
        plt.pie(counts, labels=[LanguagesControllerInstance.get_translation(language, "chart_label_rejected", "Rejected"), LanguagesControllerInstance.get_translation(language, "chart_label_approved", "Approved")], autopct="%1.1f%%", colors=["#ff9999", "#99ff99"])
        plt.title(LanguagesControllerInstance.get_translation(language, "chart_title_loan_pie", "Share of Approved and Rejected Loans"))
        return Response(self.__fig_to_bytes(plt), mimetype='image/png')

    def plot_loan_group_means(self, language: str):
        data = self.__get_data()
        self.__apply_theme(language, style="whitegrid")

        cols = ["income", "credit_score", "loan_amount", "years_employed", "points"]

        group_means = data.groupby("loan_approved")[cols].mean().T
        group_means.columns = [
            LanguagesControllerInstance.get_translation(language, "chart_legend_rejected", "Rejected"),
            LanguagesControllerInstance.get_translation(language, "chart_legend_approved", "Approved")
        ]

        normalized_means = group_means.copy()

        for col in group_means.index:
            min_val = data[col].min()
            max_val = data[col].max()

            if (max_val - min_val) != 0:
                normalized_means.loc[col, LanguagesControllerInstance.get_translation(language, "chart_legend_rejected", "Rejected")] = (normalized_means.loc[col, LanguagesControllerInstance.get_translation(language, "chart_legend_rejected", "Rejected")] - min_val) / (
                        max_val - min_val)
                normalized_means.loc[col, LanguagesControllerInstance.get_translation(language, "chart_legend_approved", "Approved")] = (normalized_means.loc[col, LanguagesControllerInstance.get_translation(language, "chart_legend_approved", "Approved")] - min_val) / (
                        max_val - min_val)
            else:
                normalized_means.loc[col, LanguagesControllerInstance.get_translation(language, "chart_legend_rejected", "Rejected")] = 1 if normalized_means.loc[col, LanguagesControllerInstance.get_translation(language, "chart_legend_rejected", "Rejected")] > 0 else 0
                normalized_means.loc[col, LanguagesControllerInstance.get_translation(language, "chart_legend_approved", "Approved")] = 1 if normalized_means.loc[col, LanguagesControllerInstance.get_translation(language, "chart_legend_approved", "Approved")] > 0 else 0

        plt.figure(figsize=(8, 5))

        normalized_means.plot(kind="bar", ax=plt.gca(), color=["#ff9999", "#99ff99"])

        plt.title(LanguagesControllerInstance.get_translation(language, "chart_title_loan_group_means", "Comparison of Normalized Mean Client Features by Loan Decision"))
        plt.xlabel(LanguagesControllerInstance.get_translation(language, "chart_label_client_feature", "Client Feature"))
        plt.ylabel(LanguagesControllerInstance.get_translation(language, "chart_label_normalized_mean_value", "Normalized Mean Value (0 to 1)"))
        plt.xticks(rotation=45, ha="right")
        plt.legend(title=LanguagesControllerInstance.get_translation(language, "chart_legend_decision", "Decision"))

        plt.ylim(0, normalized_means.values.max() * 1.1)

        img_bytes = self.__fig_to_bytes(plt)
        plt.close()
        return Response(img_bytes, mimetype='image/png')

    def plot_income_radar(self, language: str):
        self.__set_font_for_language(language)
        data = self.__get_data()

        cols = ["income", "loan_amount", "credit_score", "years_employed"]

        normalized_data = data.copy()

        for col in cols:
            min_val = normalized_data[col].min()
            max_val = normalized_data[col].max()

            if (max_val - min_val) != 0:
                normalized_data[col] = (normalized_data[col] - min_val) / (max_val - min_val)
            else:
                normalized_data[col] = 1 if max_val > 0 else 0

        means = normalized_data[cols].mean()
        categories = list(means.index)
        values = means.values

        values = np.concatenate((values, [values[0]]))
        angles = np.linspace(0, 2 * np.pi, len(categories) + 1)

        plt.figure(figsize=(6, 6))
        ax = plt.subplot(111, polar=True)
        ax.plot(angles, values, "o-", linewidth=2)
        ax.fill(angles, values, alpha=0.25)

        ax.set_xticks(angles[:-1])
        labels = ax.set_xticklabels(categories, fontsize=10, fontweight='bold', ha='center', va='center')

        for label in labels:
            label.set_y(label.get_position()[1] + 0.05)

        ax.set_yticks([0.2, 0.4, 0.6, 0.8, 1.0])
        ax.set_ylim(0, 1)

        plt.subplots_adjust(top=0.85, bottom=0.15, left=0.15, right=0.85)

        plt.title(LanguagesControllerInstance.get_translation(language, "chart_title_income_radar", "Radar Chart of Average Normalized Values"))

        return Response(self.__fig_to_bytes(plt), mimetype='image/png')

    def plot_age_pyramid(self, language: str):
        self.__set_font_for_language(language)
        data = self.__get_data()
        bins = range(0, int(data["years_employed"].max()) + 5, 5)
        male = data[data["loan_approved"] == True]["years_employed"].value_counts(bins=bins).sort_index()
        female = -data[data["loan_approved"] == False]["years_employed"].value_counts(bins=bins).sort_index()
        plt.figure(figsize=(8, 6))
        plt.barh(male.index.astype(str), male.values, color="#99ff99", label=LanguagesControllerInstance.get_translation(language, "chart_legend_approved", "Approved"))
        plt.barh(female.index.astype(str), female.values, color="#ff9999", label=LanguagesControllerInstance.get_translation(language, "chart_legend_rejected", "Rejected"))
        plt.title(LanguagesControllerInstance.get_translation(language, "chart_title_age_pyramid", "Age Pyramid (Years of Employment ~ Age)"))
        plt.xlabel(LanguagesControllerInstance.get_translation(language, "chart_label_number_of_clients", "Number of Clients"))
        plt.ylabel(LanguagesControllerInstance.get_translation(language, "chart_label_age_range", "Age Range"))
        plt.legend()
        return Response(self.__fig_to_bytes(plt), mimetype='image/png')

    def plot_income_line(self, language: str):
        self.__set_font_for_language(language)
        data = self.__get_data().sort_values("income")
        plt.figure(figsize=(8, 5))
        plt.plot(data["income"].values, marker="o")
        plt.title(LanguagesControllerInstance.get_translation(language, "chart_title_income_line", "Line Plot of Income Values"))
        plt.xlabel(LanguagesControllerInstance.get_translation(language, "chart_label_client_sorted", "Client (sorted)"))
        plt.ylabel(LanguagesControllerInstance.get_translation(language, "chart_label_income", "Income"))
        return Response(self.__fig_to_bytes(plt), mimetype='image/png')

    '''
    def plot_combined_distribution(self, column: str) -> str:
        data = self.__get_data()
        if column not in data.columns or not pd.api.types.is_numeric_dtype(data[column]):
            print(f"Warning: Column '{column}' is either not numeric or does not exist. Using 'income' instead.")
            column = "income"

        sns.set(style="whitegrid")
        fig, axes = plt.subplots(
            2, 1, figsize=(8, 7),
            gridspec_kw={"height_ratios": [3, 1], "hspace": 0.3}
        )

        ax_main = axes[0]

        sns.kdeplot(data=data[column], ax=ax_main, label="Density (KDE)", color="blue", linewidth=2)

        ax_ecdf = ax_main.twinx()
        sns.ecdfplot(data=data[column], ax=ax_ecdf, label="ECDF", color="red", linewidth=2)

        ax_main.set_title(f"Density Distribution, ECDF, and Boxplot for: {column.capitalize()}")
        ax_main.set_xlabel(column.capitalize())
        ax_main.set_ylabel("Density")
        ax_ecdf.set_ylabel("Empirical CDF (P(X ≤ x))")

        lines, labels = ax_main.get_legend_handles_labels()
        lines2, labels2 = ax_ecdf.get_legend_handles_labels()
        ax_main.legend(lines + lines2, labels + labels2, loc="lower right")

        ax_box = axes[1]
        sns.boxplot(x=data[column], ax=ax_box, color="lightcoral", flier_kws={"marker": "o", "markersize": 5})
        ax_box.set_xlabel(column.capitalize())
        ax_box.set_yticks([])

        img = self.__fig_to_base64(plt)
        plt.close(fig)
        return img
    '''

    def plot_kurtosis_comparison(self, language: str):
        data = self.__get_data()
        self.__apply_theme(language, style="whitegrid")

        num_cols = data.select_dtypes(include=[np.number]).columns.tolist()

        selected_cols = ["income", "loan_amount", "credit_score", "years_employed"]

        transformed_series = {}
        kurtosis_values = {}

        for col in selected_cols:
            if col in num_cols:
                series = data[col].dropna()
                if col in ["income", "loan_amount"]:
                    series = np.log1p(series)
                transformed_series[col] = series
                kurtosis_values[col] = series.kurtosis()

        if not transformed_series:
            raise ValueError("No suitable numeric columns for kurtosis comparison.")

        plt.figure(figsize=(10, 6))

        for col, series in transformed_series.items():
            label_base = {
                "income": LanguagesControllerInstance.get_translation(language, "chart_label_income", "Income"),
                "loan_amount": LanguagesControllerInstance.get_translation(language, "chart_label_loan_amount", "Loan Amount"),
                "credit_score": LanguagesControllerInstance.get_translation(language, "chart_label_credit_score", "Credit Score"),
                "years_employed": LanguagesControllerInstance.get_translation(language, "chart_label_years_employed", "Years Employed"),
            }.get(col, col.replace("_", " ").title())
            sns.kdeplot(series, label=f"{label_base} (κ={kurtosis_values[col]:.2f})")

        plt.title(LanguagesControllerInstance.get_translation(language, "chart_title_kurtosis_comparison", "Kurtosis Comparison of Selected Variables"))
        plt.xlabel(LanguagesControllerInstance.get_translation(language, "chart_label_value_density", "Value / Density"))
        plt.ylabel(LanguagesControllerInstance.get_translation(language, "chart_label_density", "Density"))
        plt.legend()

        img_bytes = self.__fig_to_bytes(plt)
        plt.close()
        return Response(img_bytes, mimetype='image/png')
