import type { InstanceSettings } from '@/shared/api'

/** Что нужно инстансу, чтобы уведомления приходили через HTTP API. */
export const REQUIRED_SETTINGS = {
  webhookUrl: '',
  incomingWebhook: 'yes',
  outgoingWebhook: 'yes',
} satisfies Partial<InstanceSettings>

/** Список проблем в настройках инстанса; пустой — всё в порядке. */
export function findSettingsProblems(settings: InstanceSettings): string[] {
  const problems: string[] = []
  if (settings.webhookUrl) {
    problems.push('задан webhookUrl — уведомления уходят на него, а не в очередь HTTP API')
  }
  if (settings.incomingWebhook !== 'yes') problems.push('выключены уведомления о входящих')
  if (settings.outgoingWebhook !== 'yes') problems.push('выключены уведомления об исходящих')
  return problems
}
