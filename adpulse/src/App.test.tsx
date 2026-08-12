import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('AdPulse core SPA flows', () => {
  beforeEach(() => { window.location.hash = '#/' })

  it('navigates from the overview into a campaign detail', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByRole('heading', { name: '今天，增长正在发生' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: /全部活动/ }))
    expect(screen.getByRole('heading', { name: '活动管理' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: /秋季新品/ }))
    expect(screen.getByRole('heading', { name: '秋季新品 · 节气礼盒' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /暂停投放/ })).toBeInTheDocument()
  })

  it('validates and saves a new campaign draft', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('link', { name: /新建投放活动/ }))
    await user.click(screen.getByRole('button', { name: /保存为草稿/ }))
    expect(screen.getByText('请填写活动名称')).toBeInTheDocument()
    await user.type(screen.getByPlaceholderText('例如：秋季新品 · 节气礼盒'), '秋分会员专项')
    await user.click(screen.getByRole('button', { name: /保存为草稿/ }))
    expect(screen.getByRole('heading', { name: '秋分会员专项' })).toBeInTheDocument()
    expect(screen.getByText('草稿')).toBeInTheDocument()
  })
})
