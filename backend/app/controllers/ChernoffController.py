import io
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Rectangle, Polygon
import textwrap
from flask import Response
from typing import Optional, cast
from app.controllers.FilesController import FilesControllerInstance
from app.controllers.LanguagesController import LanguagesControllerInstance
from app.controllers.FontController import FontControllerInstance

class ChernoffController:
    __data: Optional[pd.DataFrame] = None

    def __get_data(self, mode: str = 'normal') -> Optional[pd.DataFrame]:
        mode_norm = (mode or 'normal').strip().lower()
        if mode_norm == 'prognosis':
            data = FilesControllerInstance.get_prognosis_only_data()
            if data is None:
                raise ValueError('No data loaded')
            return data
        if mode_norm == 'merged':
            data = FilesControllerInstance.get_prognosis_data()
            if data is None:
                raise ValueError('No data loaded')
            return data
        if self.__data is None:
            self.__data = FilesControllerInstance.get_data()
        return self.__data

    def __fig_to_bytes(self, fig) -> bytes:
        buf = io.BytesIO()
        fig.savefig(buf, format="png", bbox_inches="tight")
        plt.close(fig)
        return buf.getvalue()

    def generate_chernoff_faces(self, language: str = "en", mode: str = 'normal', single_face: Optional[str] = None):
        plt.close('all')
        data = self.__get_data(mode)

        if data is None:
            fig, ax = plt.subplots(figsize=(6, 6))
            ax.text(0.5, 0.5, "No data available to generate faces.", horizontalalignment='center', verticalalignment='center')
            ax.set_axis_off()
            return Response(self.__fig_to_bytes(fig), mimetype='image/png')

        cols = ["credit_score", "income", "loan_amount", "points", "years_employed"]

        FontControllerInstance.set_font_for_language(language)

        chernoff_data = cast(dict, LanguagesControllerInstance.get_translation(language, "chernoff", {}))
        attributes_trans = chernoff_data.get('attributes', {})

        if single_face and single_face in cols:
            fig, axes = plt.subplots(1, 1, figsize=(6, 6))
            axes = [axes]
            cols = [single_face]
        else:
            fig, axes = plt.subplots(1, 5, figsize=(24, 6))

        for idx, col in enumerate(cols):
            q1 = data[col].quantile(0.25)
            q2 = data[col].quantile(0.50)
            q3 = data[col].quantile(0.75)
            mean = data[col].mean()

            distances = {
                'q1': abs(mean - q1),
                'q2': abs(mean - q2),
                'q3': abs(mean - q3)
            }
            closest_q = min(distances.keys(), key=lambda k: distances[k])

            ax = axes[idx]
            ax.set_xlim(-1.5, 1.5)
            ax.set_ylim(-3.0, 1.8)
            ax.set_aspect('equal')
            ax.axis('off')

            attr_name = attributes_trans.get(col, {}).get('name', col.replace('_', ' ').title())
            ax.set_title(attr_name, fontsize=14, pad=10, fontweight='bold')

            self.__draw_custom_face(ax, col, closest_q)

            self.__add_statistics_box(ax, col, mean, q1, q2, q3, closest_q, chernoff_data)

            self.__add_attribute_legend(ax, col, chernoff_data)

        plt.subplots_adjust(left=0.05, right=0.95, top=0.88, bottom=0.12, wspace=0.4)

        return Response(self.__fig_to_bytes(fig), mimetype='image/png')

    def __draw_custom_face(self, ax, attribute, quartile):
        face_color = '#FFE4B5'
        feature_color = '#000000'

        if quartile == 'q1':
            ax.add_patch(Circle((0, 0), 1, facecolor=face_color, edgecolor=feature_color, linewidth=2))
        elif quartile == 'q2':
            ax.add_patch(Rectangle((-0.8, -0.8), 1.6, 1.6, facecolor=face_color, edgecolor=feature_color, linewidth=2))
        else:
            ax.add_patch(Polygon(np.array([[0, 1], [-0.87, -0.5], [0.87, -0.5]]), facecolor=face_color, edgecolor=feature_color, linewidth=2))

        if attribute == "credit_score":
            pass

        elif attribute == "income":
            if quartile == 'q1':
                ax.add_patch(Circle((-0.3, 0.3), 0.15, facecolor='white', edgecolor=feature_color, linewidth=1.5))
                ax.add_patch(Circle((0.3, 0.3), 0.15, facecolor='white', edgecolor=feature_color, linewidth=1.5))
                ax.add_patch(Circle((-0.3, 0.3), 0.05, facecolor=feature_color))
                ax.add_patch(Circle((0.3, 0.3), 0.05, facecolor=feature_color))
            elif quartile == 'q2':
                ax.add_patch(Rectangle((-0.4, 0.2), 0.2, 0.2, facecolor='white', edgecolor=feature_color, linewidth=1.5))
                ax.add_patch(Rectangle((0.2, 0.2), 0.2, 0.2, facecolor='white', edgecolor=feature_color, linewidth=1.5))
                ax.add_patch(Circle((-0.3, 0.3), 0.05, facecolor=feature_color))
                ax.add_patch(Circle((0.3, 0.3), 0.05, facecolor=feature_color))
            else:
                ax.add_patch(Polygon(np.array([[-0.3, 0.45], [-0.45, 0.15], [-0.15, 0.15]]), facecolor='white', edgecolor=feature_color, linewidth=1.5))
                ax.add_patch(Polygon(np.array([[0.3, 0.45], [0.15, 0.15], [0.45, 0.15]]), facecolor='white', edgecolor=feature_color, linewidth=1.5))
                ax.add_patch(Circle((-0.3, 0.25), 0.05, facecolor=feature_color))
                ax.add_patch(Circle((0.3, 0.25), 0.05, facecolor=feature_color))
        elif attribute == "loan_amount":
            if quartile == 'q1':
                ax.add_patch(Circle((0, -0.4), 0.2, facecolor='white', edgecolor=feature_color, linewidth=1.5))
            elif quartile == 'q2':
                ax.add_patch(Rectangle((-0.2, -0.55), 0.4, 0.15, facecolor='white', edgecolor=feature_color, linewidth=1.5))
            else:
                ax.add_patch(Polygon(np.array([[0, -0.1], [-0.18, -0.35], [0.18, -0.35]]), facecolor='white', edgecolor=feature_color, linewidth=1.5))

        elif attribute == "points":
            if quartile == 'q1':
                ax.add_patch(Circle((-1.15, 0), 0.2, facecolor=face_color, edgecolor=feature_color, linewidth=1.5))
                ax.add_patch(Circle((1.15, 0), 0.2, facecolor=face_color, edgecolor=feature_color, linewidth=1.5))
            elif quartile == 'q2':
                ax.add_patch(Rectangle((-1.1, -0.15), 0.25, 0.3, facecolor=face_color, edgecolor=feature_color, linewidth=1.5))
                ax.add_patch(Rectangle((0.85, -0.15), 0.25, 0.3, facecolor=face_color, edgecolor=feature_color, linewidth=1.5))
            else:
                ax.add_patch(Polygon(np.array([[-1.05, 0.2], [-1.25, -0.2], [-0.85, -0.2]]), facecolor=face_color, edgecolor=feature_color, linewidth=1.5))
                ax.add_patch(Polygon(np.array([[1.05, 0.2], [0.85, -0.2], [1.25, -0.2]]), facecolor=face_color, edgecolor=feature_color, linewidth=1.5))

        elif attribute == "years_employed":
            if quartile == 'q1':
                ax.add_patch(Circle((0, 0), 0.2, facecolor=face_color, edgecolor=feature_color, linewidth=1.5))
            elif quartile == 'q2':
                ax.add_patch(Rectangle((-0.15, -0.15), 0.3, 0.3, facecolor=face_color, edgecolor=feature_color, linewidth=1.5))
            else:
                ax.add_patch(Polygon(np.array([[0, 0.2], [-0.2, -0.15], [0.2, -0.15]]), facecolor=face_color, edgecolor=feature_color, linewidth=1.5))

    def __add_statistics_box(self, ax, attribute, mean, q1, q2, q3, closest_q, chernoff_data):
        stats = chernoff_data.get('stats', {})
        avg_label = stats.get('avg', 'Avg')
        closest_label = stats.get('closest', 'Closest')

        ax.text(0, -1.7, f"{avg_label}: {mean:.1f}\nQ1: {q1:.1f}\nQ2: {q2:.1f}\nQ3: {q3:.1f}\n{closest_label}: Q{closest_q[1]}", ha='center', va='top', fontsize=10,
               bbox=dict(boxstyle='round,pad=0.6', facecolor='lightgray', alpha=0.8, linewidth=1.5))

    def __add_attribute_legend(self, ax, attribute, chernoff_data):
        attrs = chernoff_data.get('attributes', {})
        attr_info = attrs.get(attribute, {})

        legend_map = {
            "credit_score": [
                attr_info.get('q1', 'Q1: Circle'),
                attr_info.get('q2', 'Q2: Rectangle'),
                attr_info.get('q3', 'Q3: Triangle')
            ],
            "income": [
                attr_info.get('q1', 'Q1: Circle + Circle eyes'),
                attr_info.get('q2', 'Q2: Rectangle + Rect eyes'),
                attr_info.get('q3', 'Q3: Triangle + Tri eyes')
            ],
            "loan_amount": [
                attr_info.get('q1', 'Q1: Circle + Circle mouth'),
                attr_info.get('q2', 'Q2: Rectangle + Rect mouth'),
                attr_info.get('q3', 'Q3: Triangle + Tri mouth')
            ],
            "points": [
                attr_info.get('q1', 'Q1: Circle + Circle ears'),
                attr_info.get('q2', 'Q2: Rectangle + Rect ears'),
                attr_info.get('q3', 'Q3: Triangle + Tri ears')
            ],
            "years_employed": [
                attr_info.get('q1', 'Q1: Circle + Circle nose'),
                attr_info.get('q2', 'Q2: Rectangle + Rect nose'),
                attr_info.get('q3', 'Q3: Triangle + Tri nose')
            ]
        }

        ax.text(0, -2.8, '\n'.join(legend_map.get(attribute, ['Q1: Circle', 'Q2: Rectangle', 'Q3: Triangle'])), ha='center', va='top', fontsize=9,
               bbox=dict(boxstyle='round,pad=0.6', facecolor='lightyellow', edgecolor='black', linewidth=1.5))

    def generate_chernoff_legend(self, language: str = "pl"):
        plt.close('all')
        FontControllerInstance.set_font_for_language(language)
        chernoff_data = cast(dict, LanguagesControllerInstance.get_translation(language, "chernoff", {}))

        attributes_trans = chernoff_data.get('attributes', {})
        legend_trans = chernoff_data.get('legend', {})

        row_keys = ["credit_score", "income", "loan_amount", "points", "years_employed"]
        col_keys = ['q1', 'q2', 'q3']

        row_labels = [textwrap.fill(attributes_trans.get(key, {}).get('name', key.replace('_', ' ').title()), width=12) for key in row_keys]
        col_labels = [legend_trans.get(key, f'Quartile {key.upper()}') for key in col_keys]

        n_rows = len(row_keys)
        n_cols = len(col_keys)

        width_ratios = [0.8] + [1.0] * n_cols
        fig, axes = plt.subplots(n_rows, n_cols + 1, figsize=(24, 8), gridspec_kw={'width_ratios': width_ratios})

        if n_rows == 1:
            axes = axes.reshape(1, -1)

        for i, attr in enumerate(row_keys):
            label_ax = axes[i, 0]
            label_ax.axis('off')
            label_text = row_labels[i]
            label_ax.text(0.0, 0.5, label_text, ha='left', va='center', fontsize=12, fontweight='bold', wrap=True)

            for j, q_key in enumerate(col_keys):
                ax = axes[i, j + 1]
                ax.set_xlim(-1.5, 1.5)
                ax.set_ylim(-1.5, 1.5)
                ax.set_aspect('equal')
                ax.axis('off')
                self.__draw_custom_face(ax, attr, q_key)

        for j, col_label in enumerate(col_labels):
            ax = axes[0, j + 1]
            wrapped = textwrap.fill(col_label, width=18)
            ax.set_title(wrapped, pad=20, fontsize=12, fontweight='bold')

        for row in axes:
            for ax in row:
                ax.tick_params(labelleft=False, labelbottom=False, left=False, bottom=False)

        fig.text(0.05, 0.88, legend_trans.get('attributes_label', 'Attribute'), ha='left', va='top', fontsize=12, fontweight='bold')

        fig.tight_layout(rect=(0.02, 0.02, 0.98, 0.90))

        return Response(self.__fig_to_bytes(fig), mimetype='image/png')

