# Чат в стиле MAX на GREEN-API (WhatsApp)

Тестовое задание: веб-интерфейс в стиле [web.max.ru](https://web.max.ru/) для отправки и получения текстовых сообщений через [GREEN-API](https://green-api.com/). Внешний вид взят из MAX, а мессенджер — WhatsApp: задание это допускает, если MAX недоступен.

- Отправка — метод [`sendMessage`](https://green-api.com/v3/docs/api/sending/SendMessage/).
- Получение — [HTTP API](https://green-api.com/v3/docs/api/receiving/technology-http-api/): `receiveNotification` + `deleteNotification`.

## Быстрый старт

Нужны Node.js 20+ и pnpm.

```bash
pnpm install
pnpm dev
```

Адрес API задаётся в `.env` переменной `VITE_GREEN_API_URL` (по умолчанию `https://api.green-api.com`).

Откройте http://localhost:5173 и введите данные инстанса из [консоли GREEN-API](https://console.green-api.com):

| Поле               | Где взять      |
| ------------------ | -------------- |
| `idInstance`       | ID инстанса    |
| `apiTokenInstance` | токен инстанса |

Инстанс должен быть авторизован (QR-код отсканирован в WhatsApp).

### Настройки инстанса

Чтобы уведомления приходили через HTTP API, у инстанса должны быть:

```json
{ "webhookUrl": "", "incomingWebhook": "yes", "outgoingWebhook": "yes" }
```

После входа приложение проверяет это через `getSettings`. Если что-то не так, появляется баннер с кнопкой «Исправить»: она вызывает `setSettings`. Изменения применяются в течение нескольких минут.

## Сценарий проверки

1. Войдите с данными инстанса.
2. Нажмите «+» и введите номер получателя. Номер проверяется через `checkWhatsapp`, затем открывается чат с `chatId` `{номер}@c.us`.
3. Напишите сообщение. Оно уйдёт через `sendMessage`, у него появится галочка.
4. Ответьте с телефона получателя в WhatsApp. Ответ появится в чате. Если чат не открыт, у него появится счётчик непрочитанных.

> Если собеседник напишет первым, чат с ним появится в списке автоматически.

## Что реализовано

- Экран входа с проверкой `getStateInstance`: понятные ошибки для неверного токена, неавторизованного инстанса и недоступного сервера.
- Создание чата по номеру телефона с проверкой через `checkWhatsapp`.
- Список чатов: превью последнего сообщения, время, счётчики непрочитанных.
- Чат: пузыри сообщений, разделители дат, статусы «отправляется / отправлено / ошибка» с повтором, кнопка «вниз».
- Поле ввода: Enter — отправить, Shift+Enter — перенос строки, лимит 4000 символов.
- Получение сообщений последовательным long-poll (`receiveTimeout=20`). Каждое уведомление удаляется из очереди, даже неинтересное, иначе очередь встанет. Сообщения, отправленные с телефона и через API, тоже попадают в ленту, дубликаты отсекаются по `idMessage`.
- При сетевых ошибках запрос повторяется с растущей паузой до 30 с и показывается «Соединение…». При 401/403 — выход на экран входа.
- История чатов сохраняется в `localStorage` отдельно для каждого инстанса. При выходе удаляются только учётные данные.
- Адаптивная вёрстка: на ширине до 768 px виден либо список, либо чат.

## Скрипты

| Команда          | Что делает                                   |
| ---------------- | -------------------------------------------- |
| `pnpm dev`       | dev-сервер Vite                              |
| `pnpm build`     | проверка типов и production-сборка в `dist/` |
| `pnpm test`      | unit-тесты (Vitest)                          |
| `pnpm lint`      | ESLint, включая границы слоёв FSD            |
| `pnpm typecheck` | проверка типов                               |
| `pnpm format`    | Prettier                                     |

## Архитектура

React 19 + TypeScript + Vite, состояние в Zustand, стили — CSS Modules и CSS-переменные ([tokens.css](src/app/styles/tokens.css)).

Код организован по [Feature-Sliced Design](https://feature-sliced.design/):

```
src/
  app/        точка сборки: глобальные стили, синхронизация данных с сессией
  pages/      login, messenger
  widgets/    nav-rail, chat-list-panel, chat-window, instance-settings-banner
  features/   auth, send-message, receive-notifications, create-chat,
              fix-instance-settings, logout
  entities/   session, chat, message
  shared/     api (клиент GREEN-API), ui, lib, config
```

Слой импортирует только нижележащие слои, а в чужой slice заходит только через `index.ts`. Это проверяет `eslint-plugin-boundaries`.

Ключевые решения записаны в [docs/decisions.md](docs/decisions.md).
