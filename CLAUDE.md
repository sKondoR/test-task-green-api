# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## О проекте

Тестовое задание: чат на React для отправки и получения текстовых сообщений через GREEN-API. Внешний вид копирует web.max.ru, но инстанс и API — **WhatsApp** (`waInstance…`, `checkWhatsapp`, `chatId` вида `79991234567@c.us`). Методы API для MAX на этом инстансе отвечают 404.

Исходное задание — `../task.md` (лежит вне этого git-репозитория). Все принятые продуктовые и технические решения, включая факты об API и открытые вопросы (LID-идентификаторы `@lid`), — в [docs/decisions.md](docs/decisions.md). Это фактическая спецификация: сверяйтесь с ней перед изменением поведения и обновляйте её при новых решениях. Документация и комментарии в коде — на русском.

## Команды

Пакетный менеджер — pnpm (`.npmrc` задаёт `node-linker=hoisted`: на Windows без прав на симлинки pnpm иначе падает с EPERM).

```bash
pnpm dev             # Vite dev-сервер, http://localhost:5173
pnpm build           # tsc -b + vite build в dist/
pnpm test            # vitest run (все тесты)
pnpm vitest run src/shared/lib/phone.test.ts   # один файл
pnpm vitest run -t "имя теста"                  # по имени
pnpm lint            # ESLint, включая границы слоёв FSD
pnpm typecheck       # tsc -b
pnpm format          # Prettier (format:check — только проверка)
```

Тесты — только `src/**/*.test.ts` в окружении `node` (без jsdom): тестируется чистая логика, а не компоненты. Адрес API — `VITE_GREEN_API_URL` в `.env` (по умолчанию `https://api.green-api.com`).

## Архитектура

React 19 + TypeScript + Vite, Zustand, CSS Modules + CSS-переменные из `src/app/styles/tokens.css`. Роутера нет: `App.tsx` выбирает `LoginPage`/`MessengerPage` по наличию учётных данных в session store, открытый чат — `activeChatId` в chat store.

### Feature-Sliced Design и границы

Слои сверху вниз: `app → pages → widgets → features → entities → shared`. Слой импортирует только нижележащие, а в чужой slice заходит только через его `index.ts` (алиас `@/…` → `src/`). Это enforced правилом `boundaries/dependencies` в `eslint.config.js` — новый экспорт нужно добавить в `index.ts` slice'а, иначе lint упадёт. Сегменты `shared/*` могут импортировать друг друга; тесты и `main.tsx` из проверки исключены.

### Ключевые потоки (затрагивают несколько файлов)

- **Клиент API** — `shared/api/green-api/client.ts`: фабрика `createGreenApiClient(credentials)`, ошибки — `GreenApiError` со `status` (`null` = сеть недоступна); `isAuthError` (401/403) используется везде для выхода на экран входа.
- **Получение сообщений** — `features/receive-notifications`: `notificationLoop.ts` — последовательный long-poll `receiveNotification(receiveTimeout=20)` → обработка → `deleteNotification`. Каждое уведомление удаляется всегда, даже если не текстовое или обработчик упал, иначе очередь FIFO встанет. Сетевые ошибки/5xx — backoff 1→30 с и статус `reconnecting`; 401/403 — `logout`. `shared/api/.../textMessageEvent.ts` превращает сырое уведомление (входящие и оба вида исходящих) в `TextMessageEvent`, `applyMessageEvent.ts` кладёт его в сторы: создаёт чат при неизвестном `chatId`, дедуплицирует по `idMessage`, считает непрочитанные.
- **Хранение** — сторы `entities/chat` и `entities/message` через `persist` пишут в `instanceScopedStorage` (`shared/lib/storage.ts`) под ключами `gapi-max:{idInstance}:{name}`. `app/providers/instanceData.ts` подписан на session store: при смене инстанса сбрасывает scope в `null`, чистит сторы и делает `rehydrate()` для нового. Пока scope `null`, запись игнорируется — поэтому выход не затирает сохранённую историю (удаляются только учётные данные).
- **Настройки инстанса** — `features/fix-instance-settings`: после входа `getSettings` проверяется на `webhookUrl: ""`, `incomingWebhook/outgoingWebhook: "yes"`; без них уведомления не приходят. Исправление через `setSettings` — только по кнопке пользователя.

Бизнес-логику (применение уведомлений, нормализация номера, форматирование дат, проверка настроек) держите в чистых функциях рядом с тестами, а не в компонентах.
