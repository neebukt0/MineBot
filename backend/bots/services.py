from pathlib import Path
from django.conf import settings
from .models import Bot

def create_bot_file(bot: Bot) -> Path:
    """
    Читает шаблон mkb.js и заменяет имена переменных на реальные значения из базы данных,
    форматируя их под синтаксис JavaScript.
    """
    bots_dir = Path(settings.BASE_DIR) / "bots_runtime"
    bots_dir.mkdir(exist_ok=True)
    
    template_path = bots_dir / "mkb.js"
    file_path = bots_dir / f"{bot.id}.js"

    if not template_path.exists():
        raise FileNotFoundError(f"Шаблон mkb.js не найден в папке {bots_dir}")

    # Читаем текст шаблона
    code = template_path.read_text(encoding="utf-8")

    # Выполняем замену. Для строк (host, username, version) добавляем кавычки,
    # а для числа (port) и ID подставляем как есть.
    code = code.replace("bot_id", f"'{bot.id}'")
    code = code.replace("server_ip", f"'{bot.server_ip}'")
    code = code.replace("server_port", str(bot.server_port))
    code = code.replace("bot_username", f"'{bot.username}'")
    code = code.replace("server_version", f"'{bot.version}'")

    # Записываем готовый файл для запуска конкретного бота
    file_path.write_text(code, encoding="utf-8")

    return file_path