export interface GreenApiCredentials {
  idInstance: string
  apiTokenInstance: string
}

export type InstanceState =
  | 'authorized'
  | 'notAuthorized'
  | 'blocked'
  | 'sleepMode'
  | 'starting'
  | 'yellowCard'
  | (string & {})

export interface StateInstanceResponse {
  stateInstance: InstanceState
}

export type YesNo = 'yes' | 'no'

export interface InstanceSettings {
  webhookUrl?: string | null
  incomingWebhook?: YesNo
  outgoingWebhook?: YesNo
  stateWebhook?: YesNo
  [key: string]: unknown
}

export interface SetSettingsResponse {
  saveSettings: boolean
}

export interface CheckWhatsappResponse {
  existsWhatsapp: boolean
}

/** Поля ответа getContactInfo, которые нужны приложению. */
export interface ContactInfoResponse {
  /** Имя из профиля WhatsApp; пустое, если скрыто. */
  name: string
  /** Имя из телефонной книги инстанса; пустое, если контакт не сохранён. */
  contactName: string
}

export interface SendMessageResponse {
  idMessage: string
}

export interface SenderData {
  chatId: string
  sender?: string
  senderName?: string
  chatName?: string
}

export interface MessageData {
  typeMessage: string
  textMessageData?: { textMessage: string }
  extendedTextMessageData?: { text: string }
}

export interface NotificationBody {
  typeWebhook: string
  /** Unix-время в секундах. */
  timestamp?: number
  idMessage?: string
  senderData?: SenderData
  messageData?: MessageData
}

export interface Notification {
  receiptId: number
  body: NotificationBody
}
