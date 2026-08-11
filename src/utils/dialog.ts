import { ElMessageBox } from 'element-plus'

type ConfirmOptions = Parameters<typeof ElMessageBox.confirm>[2]
type PromptOptions = Parameters<typeof ElMessageBox.prompt>[2]

export const confirmAction = async (message: string, title: string, options?: ConfirmOptions) => {
  try {
    await ElMessageBox.confirm(message, title, options)
    return true
  } catch {
    return false
  }
}

export const promptAction = async (message: string, title: string, options?: PromptOptions) => {
  try {
    return (await ElMessageBox.prompt(message, title, options)).value
  } catch {
    return null
  }
}
