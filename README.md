# MineBot - Система передачи данных в боты

## Архитектура

Система состоит из трёх основных компонентов:

### 1. Django Backend (`/backend`)
- REST API для управления ботами
- Аутентификация через JWT
- Генерирует JS файлы ботов с конфигурацией
- Отправляет команды к ботам через Bot Server

**Новые эндпоинты:**
- `POST /api/bots/{id}/command/` - Отправить команду боту
- `GET /api/bots/{id}/status/` - Получить статус бота

### 2. Bot Server (WebSocket) (`/bot_server`)
- Node.js сервер на порту 3008
- WebSocket сервер для подключения ботов
- REST API для отправки команд ботам
- Управление жизненным циклом ботов

**API:**
- `POST /api/bots/:botId/command` - Отправить команду боту
- `GET /api/bots/:botId/status` - Получить статус бота
- `GET /api/bots/status` - Получить статус всех ботов

### 3. Frontend React (`/frontend`)
- UI для управления ботами
- Отправка команд через Django API

## Запуск системы

### Шаг 1: Запустить Django Backend

```bash
cd backend
python manage.py runserver
```

Сервер будет на `http://localhost:8000`

### Шаг 2: Установить зависимости Bot Server

```bash
cd bot_server
npm install
```

### Шаг 3: Запустить Bot Server

```bash
cd bot_server
npm start
```

Сервер будет на `http://localhost:3008`

### Шаг 4: Запустить Frontend

```bash
cd frontend
npm install  # если ещё не установлено
npm run dev
```

Приложение будет на `http://localhost:5173`

## Поток данных

1. **Создание бота** (Frontend → Backend):
   - Frontend отправляет конфигурацию бота в Django
   - Django сохраняет данные в БД
   - Django генерирует JS файл бота

2. **Запуск бота** (Разработчик):
   - Запускает сгенерированный JS файл: `node backend/bots_runtime/{bot_id}.js`
   - Бот подключается к Bot Server через WebSocket
   - Бот регистрирует себя на сервере

3. **Отправка команды** (Frontend → Backend → Bot Server → Bot):
   - Frontend отправляет команду на Django
   - Django отправляет команду на Bot Server через HTTP
   - Bot Server отправляет команду боту через WebSocket
   - Бот выполняет команду в Minecraft

## Команды, поддерживаемые ботом

- `list` - Показать инвентарь
- `dig` - Копать блок под ботом
- `build` - Поставить блок под ботом
- `follow <ник>` - Следовать за игроком
- `equip <предмет>` - Взять предмет в руку
- `stop` - Остановить движение

## Примеры использования

### Отправить команду боту

```bash
curl -X POST http://localhost:8000/api/bots/{bot_id}/command/ \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{"command": "list"}'
```

### Получить статус бота

```bash
curl http://localhost:8000/api/bots/{bot_id}/status/ \
  -H "Authorization: Bearer {access_token}"
```

## Заметки

- Убедитесь, что Bot Server запущен перед запуском ботов
- Требуется Python 3.8+ для Django
- Требуется Node.js 14+ для Bot Server
- WebSocket порт по умолчанию: 3008
- Django порт по умолчанию: 8000
- Frontend порт по умолчанию: 5173
