from pathlib import Path
from django.conf import settings


def create_bot_file(bot):
    bots_dir = Path(settings.BASE_DIR) / "bots_runtime"
    bots_dir.mkdir(exist_ok=True)
    file_path = bots_dir / f"{bot.id}.js"
    code=""""""
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(code)

    return file_path