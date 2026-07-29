export type Locale = "zh" | "en";
export type ProductCategory = "terminal" | "connector" | "io" | "energy";
export type ProductApplication = "automation" | "energy" | "rail" | "building";

export type LocalizedText = Record<Locale, string>;

export interface ProductSpec {
  label: LocalizedText;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  series: string;
  name: LocalizedText;
  summary: LocalizedText;
  category: ProductCategory;
  applications: ProductApplication[];
  current: number;
  voltage: string;
  protection: string;
  pitch: string;
  variant: number;
  specs: ProductSpec[];
}

export const text = <T extends LocalizedText>(value: T, locale: Locale) =>
  value[locale];

export const categoryLabels: Record<ProductCategory, LocalizedText> = {
  terminal: { zh: "接线端子", en: "Terminal blocks" },
  connector: { zh: "工业连接器", en: "Industrial connectors" },
  io: { zh: "设备接口", en: "Device interfaces" },
  energy: { zh: "能源连接", en: "Energy connections" },
};

export const applicationLabels: Record<ProductApplication, LocalizedText> = {
  automation: { zh: "智能制造", en: "Smart manufacturing" },
  energy: { zh: "新能源与储能", en: "New energy & storage" },
  rail: { zh: "轨道交通", en: "Rail transit" },
  building: { zh: "智慧建筑", en: "Smart buildings" },
};

const sharedSpecs = (
  current: string,
  voltage: string,
  protection: string,
  pitch: string,
): ProductSpec[] => [
  { label: { zh: "额定电流", en: "Rated current" }, value: current },
  { label: { zh: "额定电压", en: "Rated voltage" }, value: voltage },
  { label: { zh: "防护等级", en: "Protection" }, value: protection },
  { label: { zh: "连接间距", en: "Pitch" }, value: pitch },
];

export const products: Product[] = [
  {
    id: "P-01",
    slug: "mx-c120",
    series: "MX-C120",
    name: { zh: "模块化工业连接器", en: "Modular industrial connector" },
    summary: {
      zh: "面向控制柜与现场设备的高密度电源、信号与数据混合接口。",
      en: "A high-density hybrid interface for power, signal and data in control cabinets and field devices.",
    },
    category: "connector",
    applications: ["automation", "energy", "rail"],
    current: 120,
    voltage: "1000 V",
    protection: "IP67",
    pitch: "5.08 mm",
    variant: 1,
    specs: sharedSpecs("120 A", "1000 V", "IP67", "5.08 mm"),
  },
  {
    id: "P-02",
    slug: "tb-320",
    series: "TB-320",
    name: { zh: "免工具接线端子", en: "Tool-free terminal block" },
    summary: {
      zh: "推入式弹簧连接，适合高密度控制柜与快速维护场景。",
      en: "Push-in spring connection for dense control cabinets and rapid maintenance.",
    },
    category: "terminal",
    applications: ["automation", "building"],
    current: 32,
    voltage: "800 V",
    protection: "IP20",
    pitch: "6.2 mm",
    variant: 2,
    specs: sharedSpecs("32 A", "800 V", "IP20", "6.2 mm"),
  },
  {
    id: "P-03",
    slug: "io-m12",
    series: "IO-M12",
    name: { zh: "M12 现场接口", en: "M12 field interface" },
    summary: {
      zh: "传感器与执行器的标准化现场接口，兼顾紧凑尺寸与可靠密封。",
      en: "A standardized field interface for sensors and actuators with compact sealing.",
    },
    category: "io",
    applications: ["automation", "rail"],
    current: 16,
    voltage: "60 V",
    protection: "IP68",
    pitch: "M12",
    variant: 3,
    specs: sharedSpecs("16 A", "60 V", "IP68", "M12"),
  },
  {
    id: "P-04",
    slug: "pv-s8",
    series: "PV-S8",
    name: { zh: "储能高压连接器", en: "Storage high-voltage connector" },
    summary: {
      zh: "面向电池簇与功率变换系统的防误插高压连接方案。",
      en: "A keyed high-voltage connection for battery clusters and power conversion systems.",
    },
    category: "energy",
    applications: ["energy"],
    current: 200,
    voltage: "1500 V",
    protection: "IP67",
    pitch: "8 mm",
    variant: 4,
    specs: sharedSpecs("200 A", "1500 V", "IP67", "8 mm"),
  },
  {
    id: "P-05",
    slug: "hm-48",
    series: "HM-48",
    name: { zh: "重载矩形插芯", en: "Heavy-duty rectangular insert" },
    summary: {
      zh: "用于机器人、轨交与重型设备的模块化多芯连接系统。",
      en: "A modular multipole connection system for robotics, rail and heavy equipment.",
    },
    category: "connector",
    applications: ["automation", "rail"],
    current: 80,
    voltage: "1000 V",
    protection: "IP65",
    pitch: "10.16 mm",
    variant: 5,
    specs: sharedSpecs("80 A", "1000 V", "IP65", "10.16 mm"),
  },
  {
    id: "P-06",
    slug: "rl-08",
    series: "RL-08",
    name: { zh: "紧凑继电器模块", en: "Compact relay module" },
    summary: {
      zh: "将信号隔离、状态指示与可插拔维护集成于窄型模块。",
      en: "Signal isolation, status indication and pluggable maintenance in a slim module.",
    },
    category: "io",
    applications: ["automation", "building"],
    current: 8,
    voltage: "250 V",
    protection: "IP20",
    pitch: "6.2 mm",
    variant: 6,
    specs: sharedSpecs("8 A", "250 V", "IP20", "6.2 mm"),
  },
  {
    id: "P-07",
    slug: "cb-64",
    series: "CB-64",
    name: { zh: "控制柜分配模块", en: "Cabinet distribution module" },
    summary: {
      zh: "将多路电源与信号分配整理为可识别、可扩展的布线节点。",
      en: "Organizes multi-channel power and signal distribution into an expandable wiring node.",
    },
    category: "terminal",
    applications: ["automation", "building"],
    current: 64,
    voltage: "600 V",
    protection: "IP20",
    pitch: "7.62 mm",
    variant: 7,
    specs: sharedSpecs("64 A", "600 V", "IP20", "7.62 mm"),
  },
  {
    id: "P-08",
    slug: "es-24",
    series: "ES-24",
    name: { zh: "储能信号连接系统", en: "Storage signal connection system" },
    summary: {
      zh: "面向 BMS 采集、温度监测与模块维护的紧凑连接组件。",
      en: "A compact connection assembly for BMS sensing, thermal monitoring and module service.",
    },
    category: "energy",
    applications: ["energy", "automation"],
    current: 24,
    voltage: "250 V",
    protection: "IP54",
    pitch: "3.5 mm",
    variant: 8,
    specs: sharedSpecs("24 A", "250 V", "IP54", "3.5 mm"),
  },
];

export const solutions = [
  {
    id: "01",
    title: { zh: "智能制造", en: "Smart manufacturing" },
    summary: {
      zh: "控制柜、机器人、传感器与现场总线的模块化连接。",
      en: "Modular connections across control cabinets, robots, sensors and fieldbus.",
    },
    meta: "CONTROL · ROBOTICS · SENSOR",
  },
  {
    id: "02",
    title: { zh: "新能源与储能", en: "New energy & storage" },
    summary: {
      zh: "覆盖 PCS、BMS、电池簇与配电单元的高压及信号连接。",
      en: "High-voltage and signal connections across PCS, BMS, battery clusters and distribution.",
    },
    meta: "PCS · BMS · BATTERY",
  },
  {
    id: "03",
    title: { zh: "轨道交通", en: "Rail transit" },
    summary: {
      zh: "面向车载设备、信号系统和严苛振动环境的可靠接口。",
      en: "Reliable interfaces for onboard equipment, signaling and high-vibration conditions.",
    },
    meta: "VEHICLE · SIGNAL · VIBRATION",
  },
] as const;

export const newsItems = [
  {
    date: "2026.07",
    zh: "MX-C120 模块化混合接口完成概念验证",
    en: "MX-C120 modular hybrid interface completes concept validation",
  },
  {
    date: "2026.06",
    zh: "储能连接系统选型指南发布",
    en: "Energy-storage connection selection guide released",
  },
  {
    date: "2026.04",
    zh: "环境与寿命验证项目扩展",
    en: "Environmental and lifecycle validation program expanded",
  },
] as const;
