import { ElMessageBox } from 'element-plus'
import { confirmAction, promptAction } from './dialog'

describe('dialog helpers', () => {
  afterEach(() => vi.restoreAllMocks())

  it('treats confirmation cancellation as a normal false result', async () => {
    vi.spyOn(ElMessageBox, 'confirm').mockRejectedValue('cancel')
    await expect(confirmAction('确认吗？', '确认')).resolves.toBe(false)
  })

  it('returns null when a prompt is cancelled', async () => {
    vi.spyOn(ElMessageBox, 'prompt').mockRejectedValue('cancel')
    await expect(promptAction('请输入', '输入')).resolves.toBeNull()
  })
})
