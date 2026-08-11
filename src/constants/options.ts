export const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '其他', value: 'other' },
]

export const attendanceStatusOptions = [
  { label: '正常', value: 'normal' },
  { label: '迟到', value: 'late' },
  { label: '早退', value: 'early_leave' },
  { label: '缺勤', value: 'absent' },
  { label: '请假', value: 'leave' },
]

export const leaveTypeOptions = [
  { label: '年假', value: 'annual' },
  { label: '病假', value: 'sick' },
  { label: '事假', value: 'personal' },
  { label: '其他', value: 'other' },
]

export const labelOf = (options: Array<{ label: string; value: string }>, value: string) =>
  options.find((item) => item.value === value)?.label ?? value
