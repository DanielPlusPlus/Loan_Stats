import io
import base64
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Rectangle, Polygon
from matplotlib import font_manager
import os
import requests
from pathlib import Path

from flask import Response
from app.controllers.FilesController import FilesControllerInstance
from app.controllers.LanguagesController import LanguagesControllerInstance

class ChernoffController:
    __data = None
    __font_cache_dir = Path("/tmp/matplotlib_fonts")
    __downloaded_fonts = {}

    def __get_data(self) -> pd.DataFrame:
        if self.__data is None: self.__data = FilesControllerInstance.get_data()
        return self.__data

    def __download_font(self, font_url: str, font_name: str) -> str:
        if font_name in self.__downloaded_fonts:
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
            except Exception as e:
                print(f"Failed to download font {font_name}: {e}")
                return None

        if font_path.exists():
            try:
                font_manager.fontManager.addfont(str(font_path))
                self.__downloaded_fonts[font_name] = str(font_path)
                return str(font_path)
            except Exception as e:
                print(f"Failed to register font {font_name}: {e}")
                return None

        return None

    def __fig_to_bytes(self, fig) -> bytes:
        buf = io.BytesIO()
        fig.savefig(buf, format="png", bbox_inches="tight")
        plt.close(fig)
        return buf.getvalue()

    def generate_chernoff_faces(self, language: str = "en"):
        plt.close('all')

        data = self.__get_data()
        cols = ["credit_score", "income", "loan_amount", "points", "years_employed"]

        self.__set_font_for_language(language)

        chernoff_data = LanguagesControllerInstance.get_translation(language, "chernoff", {})
        attributes_trans = chernoff_data.get('attributes', {})

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
            closest_q = min(distances, key=distances.get)

            ax = axes[idx]
            ax.set_xlim(-1.5, 1.5)
            ax.set_ylim(-3.0, 1.8)
            ax.set_aspect('equal')
            ax.axis('off')

            attr_name = attributes_trans.get(col, {}).get('name', col.replace('_', ' ').title())
            ax.set_title(attr_name, fontsize=14, pad=10, fontweight='bold')

            self.__draw_custom_face(ax, col, closest_q)

            self.__add_statistics_box(ax, col, mean, q1, q2, q3, closest_q, language)

            self.__add_attribute_legend(ax, col, language)

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
                ax.add_patch(Polygon(np.array([[0, -0.25], [-0.2, -0.55], [0.2, -0.55]]), facecolor='white', edgecolor=feature_color, linewidth=1.5))

        elif attribute == "points":
            if quartile == 'q1':
                ax.add_patch(Circle((-0.9, 0), 0.2, facecolor=face_color, edgecolor=feature_color, linewidth=1.5))
                ax.add_patch(Circle((0.9, 0), 0.2, facecolor=face_color, edgecolor=feature_color, linewidth=1.5))
            elif quartile == 'q2':
                ax.add_patch(Rectangle((-1.1, -0.15), 0.25, 0.3, facecolor=face_color, edgecolor=feature_color, linewidth=1.5))
                ax.add_patch(Rectangle((0.85, -0.15), 0.25, 0.3, facecolor=face_color, edgecolor=feature_color, linewidth=1.5))
            else:
                ax.add_patch(Polygon(np.array([[-0.9, 0.2], [-1.1, -0.2], [-0.7, -0.2]]), facecolor=face_color, edgecolor=feature_color, linewidth=1.5))
                ax.add_patch(Polygon(np.array([[0.9, 0.2], [0.7, -0.2], [1.1, -0.2]]), facecolor=face_color, edgecolor=feature_color, linewidth=1.5))

        elif attribute == "years_employed":
            if quartile == 'q1':
                ax.add_patch(Circle((0, 0), 0.2, facecolor=face_color, edgecolor=feature_color, linewidth=1.5))
            elif quartile == 'q2':
                ax.add_patch(Rectangle((-0.15, -0.15), 0.3, 0.3, facecolor=face_color, edgecolor=feature_color, linewidth=1.5))
            else:
                ax.add_patch(Polygon(np.array([[0, 0.2], [-0.2, -0.15], [0.2, -0.15]]), facecolor=face_color, edgecolor=feature_color, linewidth=1.5))

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
            plt.rcParams['font.family'] = default_font

        plt.rcParams['axes.unicode_minus'] = False

    def __add_statistics_box(self, ax, attribute, mean, q1, q2, q3, closest_q, language):
        chernoff_data = LanguagesControllerInstance.get_translation(language, "chernoff", {})

        stats = chernoff_data.get('stats', {})
        avg_label = stats.get('avg', 'Avg')
        closest_label = stats.get('closest', 'Closest')

        ax.text(0, -1.7, f"{avg_label}: {mean:.1f}\nQ1: {q1:.1f}\nQ2: {q2:.1f}\nQ3: {q3:.1f}\n{closest_label}: Q{closest_q[1]}", ha='center', va='top', fontsize=10,
               bbox=dict(boxstyle='round,pad=0.6', facecolor='lightgray', alpha=0.8, linewidth=1.5))

    def __add_attribute_legend(self, ax, attribute, language):
        chernoff_data = LanguagesControllerInstance.get_translation(language, "chernoff", {})

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

