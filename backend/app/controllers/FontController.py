import requests
from pathlib import Path
from matplotlib import font_manager
import matplotlib.pyplot as plt

class FontController:
    __font_cache_dir = Path("/tmp/matplotlib_fonts")
    __downloaded_fonts = {}

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

    def set_font_for_language(self, language: str):
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

FontControllerInstance = FontController()
