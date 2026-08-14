<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ECharts } from 'echarts/core'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import { dashboardApi, type DashboardSummary } from '@/api/modules/dashboard'
import { attendanceStatusOptions, labelOf, leaveTypeOptions } from '@/constants/options'
import { formatDate } from '@/utils/data'
import { getChartMotionOptions } from '@/utils/motion'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)
const data = ref<DashboardSummary>()
const trendEl = ref<HTMLElement>()
const deptEl = ref<HTMLElement>()
const attendanceEl = ref<HTMLElement>()
echarts.use([BarChart, LineChart, PieChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

const charts: ECharts[] = []
let resizeObserver: ResizeObserver | undefined

const drawCharts = async () => {
  await nextTick()
  charts.splice(0).forEach((chart) => chart.dispose())
  if (!data.value || !trendEl.value || !deptEl.value || !attendanceEl.value) return
  const common = { ...getChartMotionOptions(), textStyle: { fontFamily: 'Inter, PingFang SC, sans-serif' } }
  const trend = echarts.init(trendEl.value)
  trend.setOption({ ...common, grid: { left: 42, right: 18, top: 24, bottom: 34 }, tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: data.value.trend.map((item) => item.month), axisLine: { lineStyle: { color: '#d0d5dd' } } }, yAxis: { type: 'value', splitLine: { lineStyle: { color: '#eef0f3' } } }, series: [{ type: 'line', smooth: true, symbolSize: 8, data: data.value.trend.map((item) => item.value), lineStyle: { width: 3, color: '#2563eb' }, itemStyle: { color: '#2563eb' }, areaStyle: { color: 'rgba(37,99,235,.08)' } }] })
  const dept = echarts.init(deptEl.value)
  dept.setOption({ ...common, tooltip: { trigger: 'item' }, legend: { bottom: 0, type: 'scroll' }, series: [{ type: 'pie', radius: ['45%', '70%'], center: ['50%', '43%'], label: { formatter: '{b}\n{c}人' }, data: data.value.departmentStats }] })
  const attendance = echarts.init(attendanceEl.value)
  attendance.setOption({ ...common, grid: { left: 62, right: 20, top: 12, bottom: 30 }, tooltip: { trigger: 'axis' }, xAxis: { type: 'value', splitLine: { lineStyle: { color: '#eef0f3' } } }, yAxis: { type: 'category', data: data.value.attendanceStats.map((item) => labelOf(attendanceStatusOptions, item.status)) }, series: [{ type: 'bar', barWidth: 16, data: data.value.attendanceStats.map((item) => item.value), itemStyle: { color: '#60a5fa', borderRadius: [0, 5, 5, 0] } }] })
  charts.push(trend, dept, attendance)
  resizeObserver?.disconnect()
  resizeObserver = new ResizeObserver(() => charts.forEach((chart) => chart.resize()))
  ;[trendEl.value, deptEl.value, attendanceEl.value].forEach((element) => resizeObserver!.observe(element))
}
const load = async () => { loading.value = true; try { data.value = await dashboardApi.summary(); await drawCharts() } finally { loading.value = false } }
onMounted(load)
onUnmounted(() => { resizeObserver?.disconnect(); charts.forEach((chart) => chart.dispose()) })
</script>

<template>
  <div class="page" v-loading="loading">
    <PageHeader title="工作台" description="人力资源核心指标与近期业务动态。"><el-button icon="Refresh" @click="load">刷新数据</el-button></PageHeader>
    <section v-if="data" class="metrics">
      <article><span class="metric-icon blue"><el-icon><User /></el-icon></span><div><p>在职员工</p><strong>{{ data.metrics.employees }}</strong><small>当前有效员工</small></div></article>
      <article><span class="metric-icon violet"><el-icon><OfficeBuilding /></el-icon></span><div><p>启用部门</p><strong>{{ data.metrics.departments }}</strong><small>组织架构节点</small></div></article>
      <article><span class="metric-icon green"><el-icon><CircleCheck /></el-icon></span><div><p>考勤正常率</p><strong>{{ data.metrics.attendanceRate }}%</strong><small>最近考勤日</small></div></article>
      <article><span class="metric-icon orange"><el-icon><Bell /></el-icon></span><div><p>待处理请假</p><strong>{{ data.metrics.pendingLeaves }}</strong><small>当前可见范围</small></div></article>
    </section>
    <section class="chart-grid"><article class="panel chart-card chart-card--wide"><header><h2>员工趋势</h2><span>近六个月</span></header><div ref="trendEl" class="chart" /></article><article class="panel chart-card"><header><h2>部门人数</h2><span>在职员工</span></header><div ref="deptEl" class="chart" /></article></section>
    <section class="bottom-grid"><article class="panel chart-card"><header><h2>考勤概览</h2><span>最近考勤日</span></header><div ref="attendanceEl" class="chart chart--short" /></article><article class="panel list-card"><header><h2>待处理请假</h2><el-button link type="primary" @click="router.push('/leave')">查看全部</el-button></header><div v-if="data?.pendingLeaves.length" class="activity-list"><div v-for="item in data.pendingLeaves" :key="item.id"><span class="list-avatar">{{ item.applicantName.slice(0, 1) }}</span><div><b>{{ item.applicantName }} · {{ labelOf(leaveTypeOptions, item.type) }}</b><small>{{ formatDate(item.startTime) }} · {{ item.duration }} 天</small></div><StatusTag :status="item.status" /></div></div><el-empty v-else description="暂无待处理申请" :image-size="72" /></article><article class="panel list-card"><header><h2>近期入职</h2><el-button v-if="auth.hasPermission('employee:view')" link type="primary" @click="router.push('/employees')">员工管理</el-button></header><div v-if="data?.recentEmployees.length" class="activity-list"><div v-for="item in data.recentEmployees" :key="item.id"><span class="list-avatar blue-bg">{{ item.name.slice(0, 1) }}</span><div><b>{{ item.name }}</b><small>{{ item.position }} · {{ formatDate(item.hireDate) }}</small></div></div></div><el-empty v-else description="暂无记录" :image-size="72" /></article></section>
  </div>
</template>

<style scoped>
.metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.metrics article { display: flex; align-items: center; gap: 16px; padding: 20px; border: 1px solid var(--hrms-border); border-radius: var(--hrms-radius); background: #fff; box-shadow: var(--hrms-shadow); }
.metrics p, .metrics small { margin: 0; color: var(--hrms-muted); } .metrics strong { display: block; margin: 3px 0; font-size: 26px; }
.metric-icon { display: grid; width: 46px; height: 46px; flex: none; place-items: center; border-radius: 10px; font-size: 22px; }
.metric-icon.blue { color: #2563eb; background: #eff6ff; } .metric-icon.violet { color: #7c3aed; background: #f5f3ff; } .metric-icon.green { color: #059669; background: #ecfdf5; } .metric-icon.orange { color: #d97706; background: #fffbeb; }
.chart-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; } .bottom-grid { display: grid; grid-template-columns: 1.15fr 1fr 1fr; gap: 16px; }
.chart-card header, .list-card header { display: flex; align-items: center; justify-content: space-between; } h2 { margin: 0; font-size: 16px; } header span { color: var(--hrms-muted); font-size: 12px; }
.chart { width: 100%; height: 290px; } .chart--short { height: 240px; }
.activity-list { display: grid; margin-top: 16px; gap: 8px; } .activity-list > div { display: flex; min-height: 52px; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f0f2f5; } .activity-list > div:last-child { border: 0; } .activity-list div div { min-width: 0; flex: 1; } .activity-list b, .activity-list small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .activity-list b { font-size: 13px; } .activity-list small { margin-top: 5px; color: var(--hrms-muted); font-size: 11px; }
.list-avatar { display: grid; width: 34px; height: 34px; flex: none; place-items: center; border-radius: 50%; color: #7c3aed; background: #f5f3ff; font-size: 13px; font-weight: 600; } .list-avatar.blue-bg { color: #2563eb; background: #eff6ff; }
@media (max-width: 1180px) { .metrics { grid-template-columns: repeat(2, 1fr); } .bottom-grid { grid-template-columns: 1fr 1fr; } .bottom-grid > :first-child { grid-column: 1 / -1; } }
@media (max-width: 800px) { .chart-grid, .bottom-grid { grid-template-columns: 1fr; } .bottom-grid > :first-child { grid-column: auto; } }
@media (max-width: 520px) { .metrics { grid-template-columns: 1fr; } }
</style>
