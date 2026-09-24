import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GreenApiError } from '@/shared/api'
import { showToast } from '@/shared/ui'
import { useInstanceSettingsStore } from './instanceSettingsStore'
import { REQUIRED_SETTINGS } from './settingsRequirements'

const api = vi.hoisted(() => ({ getSettings: vi.fn(), setSettings: vi.fn() }))
const session = vi.hoisted(() => ({ setOwnChatId: vi.fn() }))

vi.mock('@/entities/session', () => ({
  getApiClient: () => api,
  useSessionStore: { getState: () => session },
}))
vi.mock('@/shared/ui', () => ({ showToast: vi.fn() }))

const validSettings = { webhookUrl: '', incomingWebhook: 'yes', outgoingWebhook: 'yes' }
const store = () => useInstanceSettingsStore.getState()

describe('useInstanceSettingsStore', () => {
  beforeEach(() => {
    api.getSettings.mockReset()
    api.setSettings.mockReset()
    session.setOwnChatId.mockReset()
    vi.mocked(showToast).mockReset()
    useInstanceSettingsStore.setState({ status: 'unknown', problems: [] })
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('подходящие настройки — статус ok', async () => {
    api.getSettings.mockResolvedValue(validSettings)
    await store().check()
    expect(store()).toMatchObject({ status: 'ok', problems: [] })
  })

  it('запоминает в сессии chatId аккаунта инстанса', async () => {
    api.getSettings.mockResolvedValue({ ...validSettings, wid: '79991234567@c.us' })
    await store().check()
    expect(session.setOwnChatId).toHaveBeenCalledWith('79991234567@c.us')
  })

  it('неподходящие настройки — статус invalid со списком проблем', async () => {
    api.getSettings.mockResolvedValue({ ...validSettings, incomingWebhook: 'no' })
    await store().check()
    expect(store()).toMatchObject({
      status: 'invalid',
      problems: ['выключены уведомления о входящих'],
    })
  })

  it('не запускает вторую проверку, пока идёт первая', async () => {
    api.getSettings.mockResolvedValue(validSettings)
    await Promise.all([store().check(), store().check()])
    expect(api.getSettings).toHaveBeenCalledOnce()
  })

  it('на 429 повторяет запрос один раз через 2 секунды', async () => {
    vi.useFakeTimers()
    api.getSettings
      .mockRejectedValueOnce(new GreenApiError('429', 429))
      .mockResolvedValueOnce(validSettings)

    const checking = store().check()
    await vi.advanceTimersByTimeAsync(1999)
    expect(api.getSettings).toHaveBeenCalledOnce()

    await vi.advanceTimersByTimeAsync(1)
    await checking
    expect(api.getSettings).toHaveBeenCalledTimes(2)
    expect(store().status).toBe('ok')
  })

  it('если проверка не удалась, не показывает проблем', async () => {
    api.getSettings.mockRejectedValue(new GreenApiError('500', 500))
    await store().check()
    expect(api.getSettings).toHaveBeenCalledOnce()
    expect(store()).toMatchObject({ status: 'unknown', problems: [] })
  })

  it('исправляет настройки и сообщает об этом', async () => {
    useInstanceSettingsStore.setState({ status: 'invalid', problems: ['проблема'] })
    api.setSettings.mockResolvedValue({ saveSettings: true })

    await store().fix()
    expect(api.setSettings).toHaveBeenCalledWith(REQUIRED_SETTINGS)
    expect(store()).toMatchObject({ status: 'ok', problems: [] })
    expect(showToast).toHaveBeenCalledWith(expect.stringMatching(/Настройки сохранены/))
  })

  it('при ошибке исправления оставляет проблемы на месте', async () => {
    useInstanceSettingsStore.setState({ status: 'invalid', problems: ['проблема'] })
    api.setSettings.mockRejectedValue(new GreenApiError('500', 500))

    await store().fix()
    expect(store()).toMatchObject({ status: 'invalid', problems: ['проблема'] })
    expect(showToast).toHaveBeenCalledWith(expect.stringMatching(/Не удалось/))
  })
})
