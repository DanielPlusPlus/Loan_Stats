import io
import base64
import matplotlib
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
from app.controllers.FilesController import FilesControllerInstance

matplotlib.use("Agg")


class ChartsController:
    def __init__(self):
        self.__data = None

    def __get_data(self) -> pd.DataFrame:
        if self.__data is None:
            self.__data = FilesControllerInstance.get_data()
        return self.__data

    def __fig_to_base64(self, plt_obj) -> str:
        buf = io.BytesIO()
        plt_obj.savefig(buf, format="png", bbox_inches="tight")
        buf.seek(0)
        encoded = base64.b64encode(buf.read()).decode("utf-8")
        buf.close()
        return encoded

    def plot_income_histogram(self) -> str:
        data = self.__get_data()
        sns.set(style="whitegrid")
        plt.figure(figsize=(8, 5))
        sns.kdeplot(data=data[data["loan_approved"] == True]["income"], label="Loan Approved")
        sns.kdeplot(data=data[data["loan_approved"] == False]["income"], label="Loan Rejected")
        plt.title("Income Distribution by Loan Approval Decision")
        plt.xlabel("Income")
        plt.ylabel("Density")
        plt.legend()
        img = self.__fig_to_base64(plt)
        plt.close()
        return img

    def plot_credit_vs_loan(self) -> str:
        data = self.__get_data()
        sns.set(style="whitegrid")
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
        plt.title("Loan Amount vs Credit Score (point size = income)")
        plt.xlabel("Credit Score")
        plt.ylabel("Loan Amount")
        img = self.__fig_to_base64(plt)
        plt.close()
        return img

    def plot_employment_boxplot(self) -> str:
        data = self.__get_data()
        sns.set(style="whitegrid")
        plt.figure(figsize=(7, 5))
        sns.boxplot(data=data, x="loan_approved", y="years_employed", palette="Set2")
        sns.stripplot(data=data, x="loan_approved", y="years_employed", color="black", alpha=0.5)
        plt.title("Employment Duration vs Loan Approval Decision")
        plt.xlabel("Loan Approved")
        plt.ylabel("Years Employed")
        img = self.__fig_to_base64(plt)
        plt.close()
        return img

    def plot_correlation_heatmap(self) -> str:
        data = self.__get_data()
        sns.set(style="whitegrid")
        plt.figure(figsize=(8, 6))
        corr = data.corr(numeric_only=True)
        sns.heatmap(corr, annot=True, cmap="coolwarm", fmt=".2f")
        plt.title("Correlation Matrix Between Variables")
        img = self.__fig_to_base64(plt)
        plt.close()
        return img

    def plot_income_vs_score(self) -> str:
        data = self.__get_data()
        sns.set(style="whitegrid")
        plt.figure(figsize=(8, 5))
        sns.scatterplot(data=data, x="credit_score", y="income", hue="loan_approved", alpha=0.7)
        plt.title("Income vs Credit Score (by Loan Approval Decision)")
        plt.xlabel("Credit Score")
        plt.ylabel("Income")
        img = self.__fig_to_base64(plt)
        plt.close()
        return img

    def plot_income_vs_years(self) -> str:
        data = self.__get_data()
        sns.set(style="whitegrid")
        plt.figure(figsize=(8, 5))
        sns.scatterplot(
            data=data,
            x="years_employed",
            y="income",
            hue="loan_approved",
            style="loan_approved",
            alpha=0.7
        )
        plt.title("Income vs Employment Duration (by Loan Approval Decision)")
        plt.xlabel("Years Employed")
        plt.ylabel("Income")
        img = self.__fig_to_base64(plt)
        plt.close()
        return img

    def plot_credit_violin(self) -> str:
        data = self.__get_data()
        data["income_group"] = pd.qcut(data["income"], 3, labels=["low", "medium", "high"])
        sns.set(style="whitegrid")
        plt.figure(figsize=(8, 5))
        sns.violinplot(data=data, x="loan_approved", y="credit_score", hue="income_group", split=True)
        plt.title("Credit Score Distribution by Income and Loan Approval Decision")
        plt.xlabel("Was the loan approved?")
        plt.ylabel("Credit Score")
        plt.legend(title="Income Group")
        img = self.__fig_to_base64(plt)
        plt.close()
        return img

    def plot_avg_income_by_city(self) -> str:
        data = self.__get_data()
        sns.set(style="whitegrid")
        avg_income = data.groupby(["city", "loan_approved"])["income"].mean().unstack()
        plt.figure(figsize=(12, 6))
        avg_income.plot(kind="bar")
        plt.title("Average Income by City and Loan Approval Decision")
        plt.ylabel("Average Income")
        plt.xticks(rotation=45, ha="right")
        img = self.__fig_to_base64(plt)
        plt.close()
        return img

    def plot_pairplot_main(self) -> str:
        data = self.__get_data()
        sns.set(style="ticks")
        pairplot = sns.pairplot(data, vars=["income", "credit_score", "loan_amount"], hue="loan_approved", corner=True)
        pairplot.fig.suptitle("Relationships Between Key Variables", y=1.02)
        buf = io.BytesIO()
        pairplot.savefig(buf, format="png", bbox_inches="tight")
        buf.seek(0)
        encoded = base64.b64encode(buf.read()).decode("utf-8")
        buf.close()
        plt.close("all")
        return encoded

    def plot_loan_amount_box(self) -> str:
        data = self.__get_data()
        sns.set(style="whitegrid")
        plt.figure(figsize=(8, 5))
        sns.boxplot(data=data, x="loan_approved", y="loan_amount", palette="Set3")
        sns.stripplot(data=data, x="loan_approved", y="loan_amount", color="black", alpha=0.5)
        plt.title("Loan Amount vs Loan Approval Decision")
        plt.xlabel("Loan Approved")
        plt.ylabel("Loan Amount")
        img = self.__fig_to_base64(plt)
        plt.close()
        return img

    def plot_credit_score_histogram(self) -> str:
        data = self.__get_data()
        sns.set(style="whitegrid")
        plt.figure(figsize=(8, 5))
        sns.kdeplot(data=data[data["loan_approved"] == True]["credit_score"], label="Loan Approved")
        sns.kdeplot(data=data[data["loan_approved"] == False]["credit_score"], label="Loan Rejected")
        plt.title("Credit Score Distribution by Loan Approval Decision")
        plt.xlabel("Credit Score")
        plt.ylabel("Density")
        plt.legend()
        img = self.__fig_to_base64(plt)
        plt.close()
        return img

    def plot_income_hist_and_density(self) -> str:
        data = self.__get_data()
        plt.figure(figsize=(8, 5))
        sns.histplot(data["income"], kde=True, bins=20, color="skyblue")
        plt.title("Income Histogram and Density Distribution")
        plt.xlabel("Income")
        plt.ylabel("Number of Clients")
        return self.__fig_to_base64(plt)

    def plot_income_box(self) -> str:
        data = self.__get_data()
        plt.figure(figsize=(6, 4))
        sns.boxplot(y=data["income"], color="lightgreen")
        plt.title("Income Box Plot")
        plt.ylabel("Income")
        return self.__fig_to_base64(plt)

    def plot_income_ecdf(self) -> str:
        data = self.__get_data()
        plt.figure(figsize=(8, 5))
        sorted_income = np.sort(data["income"])
        ecdf = np.arange(1, len(sorted_income) + 1) / len(sorted_income)
        plt.step(sorted_income, ecdf, where="post")
        plt.title("Empirical Cumulative Distribution Function of Income")
        plt.xlabel("Income")
        plt.ylabel("P(X ≤ x)")
        return self.__fig_to_base64(plt)

    def plot_income_frequency(self) -> str:
        data = self.__get_data()
        bins = pd.cut(data["income"], bins=10)
        counts = bins.value_counts().sort_index()
        plt.figure(figsize=(10, 5))
        counts.plot(kind="bar", color="coral")
        plt.title("Client Frequency in Income Ranges")
        plt.xlabel("Income Range")
        plt.ylabel("Number of Clients")
        return self.__fig_to_base64(plt)

    def plot_income_relative_frequency(self) -> str:
        data = self.__get_data()
        bins = pd.cut(data["income"], bins=10)
        rel_freq = bins.value_counts(normalize=True).sort_index()
        plt.figure(figsize=(10, 5))
        rel_freq.plot(kind="bar", color="purple")
        plt.title("Relative Frequency of Incomes")
        plt.xlabel("Income Range")
        plt.ylabel("Proportion (%)")
        return self.__fig_to_base64(plt)

    def plot_loan_pie(self) -> str:
        data = self.__get_data()
        counts = data["loan_approved"].value_counts()
        plt.figure(figsize=(6, 6))
        plt.pie(counts, labels=["Rejected", "Approved"], autopct="%1.1f%%", colors=["#ff9999", "#99ff99"])
        plt.title("Share of Approved and Rejected Loans")
        return self.__fig_to_base64(plt)

    def plot_loan_group_means(self) -> str:
        data = self.__get_data()
        sns.set(style="whitegrid")

        cols = ["income", "credit_score", "loan_amount", "years_employed", "points"]
        group_means = data.groupby("loan_approved")[cols].mean().T

        plt.figure(figsize=(8, 5))
        group_means.plot(kind="bar", color=["#ff9999", "#99ff99"])
        plt.title("Comparison of Mean Client Features by Loan Decision")
        plt.xlabel("Client Feature")
        plt.ylabel("Mean Value")
        plt.xticks(rotation=45, ha="right")
        plt.legend(["Rejected", "Approved"], title="Decision")
        img = self.__fig_to_base64(plt)
        plt.close()
        return img

    def plot_income_radar(self) -> str:
        data = self.__get_data()
        means = data[["income", "loan_amount", "credit_score", "years_employed"]].mean()
        categories = list(means.index)
        values = means.values
        values = np.concatenate((values, [values[0]]))  # close the circle
        angles = np.linspace(0, 2 * np.pi, len(categories) + 1)
        plt.figure(figsize=(6, 6))
        ax = plt.subplot(111, polar=True)
        ax.plot(angles, values, "o-", linewidth=2)
        ax.fill(angles, values, alpha=0.25)
        ax.set_xticks(angles[:-1])
        ax.set_xticklabels(categories)
        plt.title("Radar Chart of Average Values")
        return self.__fig_to_base64(plt)

    def plot_age_pyramid(self) -> str:
        data = self.__get_data()
        bins = range(0, int(data["years_employed"].max()) + 5, 5)
        male = data[data["loan_approved"] == True]["years_employed"].value_counts(bins=bins).sort_index()
        female = -data[data["loan_approved"] == False]["years_employed"].value_counts(bins=bins).sort_index()
        plt.figure(figsize=(8, 6))
        plt.barh(male.index.astype(str), male.values, color="#99ff99", label="Approved")
        plt.barh(female.index.astype(str), female.values, color="#ff9999", label="Rejected")
        plt.title("Age Pyramid (Years of Employment ~ Age)")
        plt.xlabel("Number of Clients")
        plt.ylabel("Age Range")
        plt.legend()
        return self.__fig_to_base64(plt)

    def plot_income_line(self) -> str:
        data = self.__get_data().sort_values("income")
        plt.figure(figsize=(8, 5))
        plt.plot(data["income"].values, marker="o")
        plt.title("Line Plot of Income Values")
        plt.xlabel("Client (sorted)")
        plt.ylabel("Income")
        return self.__fig_to_base64(plt)
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
        ax_box.set_yticks([])  # Hide Y axis for the boxplot

        img = self.__fig_to_base64(plt)
        plt.close(fig)
        return img
    '''

    def plot_kurtosis_comparison(self) -> str:
        data = self.__get_data()
        sns.set(style="whitegrid")

        num_cols = data.select_dtypes(include=[np.number]).columns.tolist()

        selected_cols = [col for col in ["income", "loan_amount", "credit_score", "years_employed"] if col in num_cols]
        if not selected_cols:
            raise ValueError("No suitable numeric columns for kurtosis comparison.")

        plt.figure(figsize=(10, 6))

        for col in selected_cols:
            sns.kdeplot(data[col].dropna(), label=f"{col} (κ={data[col].kurtosis():.2f})", linewidth=2)

        plt.title("Kurtosis Comparison for Selected Numeric Variables")
        plt.xlabel("Value")
        plt.ylabel("Density")
        plt.legend(title="Variable (Kurtosis κ)")
        plt.grid(True, linestyle="--", alpha=0.4)

        img = self.__fig_to_base64(plt)
        plt.close()
        return img

