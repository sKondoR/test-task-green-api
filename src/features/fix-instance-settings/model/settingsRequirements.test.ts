import { describe, expect, it } from 'vitest'
import { findSettingsProblems } from './settingsRequirements'

describe('findSettingsProblems', () => {
  it('подходящие настройки — без проблем', () => {
    expect(
      findSettingsProblems({ webhookUrl: '', incomingWebhook: 'yes', outgoingWebhook: 'yes' }),
    ).toEqual([])
    expect(
      findSettingsProblems({ webhookUrl: null, incomingWebhook: 'yes', outgoingWebhook: 'yes' }),
    ).toEqual([])
  })

  it('находит webhookUrl и выключенные уведомления', () => {
    expect(
      findSettingsProblems({
        webhookUrl: 'https://example.com/hook',
        incomingWebhook: 'no',
        outgoingWebhook: 'yes',
      }),
    ).toHaveLength(2)
  })
})
