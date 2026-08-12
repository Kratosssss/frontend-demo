export const locales = ["en", "ar", "fr", "ru", "es"] as const;
export type Locale = (typeof locales)[number];
export type VehicleKind = "new" | "used";
export type BodyStyle = "SUV" | "Sedan" | "MPV" | "Pickup" | "Hatchback";

export interface Vehicle {
  slug: string;
  name: string;
  kind: VehicleKind;
  body: BodyStyle;
  power: string;
  year: string;
  price: number;
  range: string;
  drive: string;
  seats: number;
  image: string;
  accent: string;
}

export interface VehicleFilters { body: "all" | BodyStyle; kind: "all" | VehicleKind; budget: "all" | "under-15000" | "under-22000" | "over-22000"; }
export interface QuoteDraft { name: string; email: string; country: string; quantity: string; note: string; }
export interface TranslationDictionary {
  nav: string[]; heroKicker: string; heroTitle: string; heroCopy: string; heroPrimary: string; heroSecondary: string;
  filterTitle: string; filterCopy: string; body: string; kind: string; budget: string; filter: string; reset: string; all: string;
  latest: string; latestCopy: string; view: string; new: string; used: string; empty: string; trustKicker: string; trustTitle: string; trustCopy: string;
  stats: [string, string][]; services: [string, string][]; processTitle: string; processCopy: string; steps: string[];
  storyTitle: string; storyCopy: string; faqTitle: string; faqs: [string, string][]; quoteTitle: string; quoteCopy: string;
  form: { name: string; email: string; country: string; quantity: string; note: string; submit: string; success: string; required: string; };
  detail: { back: string; label: string; title: string; copy: string; specs: string; overview: string; inquiry: string; demo: string; };
  footer: string;
}

export const vehicles: Vehicle[] = [
  { slug: "atlas-x5", name: "TestCar Atlas X5", kind: "new", body: "SUV", power: "Plug-in Hybrid", year: "2026", price: 21800, range: "1,050 km combined", drive: "All-wheel drive", seats: 5, image: "/testcar/images/car-suv.jpg", accent: "#D8322A" },
  { slug: "horizon-e7", name: "TestCar Horizon E7", kind: "new", body: "SUV", power: "Pure Electric", year: "2026", price: 24900, range: "620 km WLTP", drive: "Rear-wheel drive", seats: 5, image: "/testcar/images/car-suv.jpg", accent: "#0E2A47" },
  { slug: "meridian-s", name: "TestCar Meridian S", kind: "used", body: "Sedan", power: "Gasoline", year: "2024", price: 12600, range: "6.2 L / 100 km", drive: "Front-wheel drive", seats: 5, image: "/testcar/images/car-sedan.jpg", accent: "#B96437" },
  { slug: "terra-p8", name: "TestCar Terra P8", kind: "new", body: "Pickup", power: "Diesel", year: "2026", price: 26800, range: "950 km", drive: "Four-wheel drive", seats: 5, image: "/testcar/images/car-pickup.jpg", accent: "#6B3A2C" },
  { slug: "nova-m6", name: "TestCar Nova M6", kind: "new", body: "MPV", power: "Hybrid", year: "2025", price: 19950, range: "980 km combined", drive: "Front-wheel drive", seats: 7, image: "/testcar/images/car-sedan.jpg", accent: "#B32F2A" },
  { slug: "pulse-c3", name: "TestCar Pulse C3", kind: "used", body: "Hatchback", power: "Pure Electric", year: "2023", price: 9800, range: "380 km WLTP", drive: "Front-wheel drive", seats: 5, image: "/testcar/images/car-suv.jpg", accent: "#245377" },
];

const english: TranslationDictionary = {
  nav: ["Inventory", "Why TestCar", "Export Process", "FAQ"], heroKicker: "China Auto Export / 2026", heroTitle: "Move the right car. Across the right border.", heroCopy: "A fictional export showroom built to show how TestCar turns vehicle sourcing into a clear, traceable global journey.", heroPrimary: "Explore inventory", heroSecondary: "How export works",
  filterTitle: "Find the right starting point", filterCopy: "Filter a focused inventory by body, vehicle status and budget.", body: "Body structure", kind: "Vehicle status", budget: "Budget", filter: "Apply filter", reset: "Reset", all: "All",
  latest: "Ready for the road ahead", latestCopy: "Six fictional vehicles, one reusable export-ready detail experience.", view: "View vehicle", new: "New", used: "Used", empty: "No vehicles match this selection.", trustKicker: "Built around the deal", trustTitle: "Clarity is part of the cargo.", trustCopy: "TestCar pairs a confident showroom with the information an international buyer needs to decide.",
  stats: [["20+", "export markets"], ["48h", "quote response target"], ["6", "visible export stages"]], services: [["Vehicle sourcing", "Focused options, clear specifications and availability."], ["Pre-shipment readiness", "Inspection, documentation and optional customization."], ["Port coordination", "A traceable handoff from warehouse to destination." ]],
  processTitle: "Export without the fog", processCopy: "Every stage is visible before the vehicle moves.", steps: ["Confirm model and destination", "Align terms and vehicle condition", "Prepare inspection and documents", "Secure vehicle and optional upgrades", "Arrange port handoff", "Track shipment to destination"],
  storyTitle: "A showroom for the decision, not the noise.", storyCopy: "This concept keeps catalog, proof and inquiry in one focused path. It is a fictional TestCar sample built for demonstration only.", faqTitle: "Questions buyers ask before they move", faqs: [["Can I request a mixed vehicle order?", "Yes. The demo inquiry flow supports quantity and notes for mixed sourcing discussions."], ["Are prices final?", "No. Every price in this concept is fictional and exists only to demonstrate the quote hierarchy."], ["Can the site support more languages?", "Yes. This demo switches five core languages locally; production can add localized URLs and CMS content."]],
  quoteTitle: "Start with a clear request.", quoteCopy: "Send a local demo inquiry to experience the form flow. Nothing is transmitted.", form: { name: "Your name", email: "Work email", country: "Destination country", quantity: "Vehicle quantity", note: "What matters most?", submit: "Send demo inquiry", success: "Demo request recorded locally — no data was sent.", required: "Please complete the required fields." },
  detail: { back: "Back to inventory", label: "Export-ready vehicle", title: "One vehicle. A clearer route to export.", copy: "Specifications below are fictional demo data, arranged to show a conversion-focused vehicle detail page.", specs: "Key specifications", overview: "Vehicle overview", inquiry: "Request a quote", demo: "Concept inventory · not a commercial offer" }, footer: "TestCar concept demo · fictional inventory · no external contact details"
};

const compact = (copy: TranslationDictionary): TranslationDictionary => copy;
export const translations: Record<Locale, TranslationDictionary> = {
  en: english,
  fr: compact({ ...english, nav: ["Inventaire", "Pourquoi TestCar", "Processus export", "FAQ"], heroKicker: "Export automobile chinois / 2026", heroTitle: "Le bon véhicule. Vers la bonne frontière.", heroCopy: "Un showroom d’exportation fictif qui montre comment TestCar rend l’achat international clair et traçable.", heroPrimary: "Voir l’inventaire", heroSecondary: "Comprendre l’export", filterTitle: "Trouvez le bon point de départ", filterCopy: "Filtrez l’inventaire par carrosserie, état et budget.", body: "Carrosserie", kind: "État du véhicule", budget: "Budget", filter: "Filtrer", reset: "Réinitialiser", latest: "Prêts pour la route", latestCopy: "Six véhicules fictifs, une expérience d’export cohérente.", view: "Voir le véhicule", new: "Neuf", used: "Occasion", empty: "Aucun véhicule ne correspond.", trustKicker: "Conçu autour de l’accord", trustTitle: "La clarté fait partie du transport.", trustCopy: "TestCar associe un showroom affirmé aux informations nécessaires pour décider.", processTitle: "Exporter sans brouillard", processCopy: "Chaque étape est visible avant le départ.", storyTitle: "Un showroom pour décider, pas pour distraire.", storyCopy: "Ce concept réunit catalogue, preuves et demande. Les données sont fictives.", faqTitle: "Les questions avant l’achat", quoteTitle: "Commencez par une demande claire.", quoteCopy: "Testez le formulaire local. Aucune donnée n’est transmise.", footer: "Concept TestCar · inventaire fictif · aucune coordonnée externe" }),
  es: compact({ ...english, nav: ["Inventario", "Por qué TestCar", "Proceso de exportación", "FAQ"], heroKicker: "Exportación de autos chinos / 2026", heroTitle: "El auto correcto. A través de la frontera correcta.", heroCopy: "Un showroom ficticio que demuestra una ruta clara y trazable para la exportación.", heroPrimary: "Ver inventario", heroSecondary: "Cómo funciona", filterTitle: "Encuentra el mejor inicio", filterCopy: "Filtra por carrocería, estado y presupuesto.", body: "Carrocería", kind: "Estado", budget: "Presupuesto", filter: "Aplicar filtro", reset: "Restablecer", latest: "Listos para el camino", latestCopy: "Seis vehículos ficticios, una experiencia de exportación.", view: "Ver vehículo", new: "Nuevo", used: "Usado", empty: "No hay vehículos para esta selección.", trustKicker: "Pensado para el acuerdo", trustTitle: "La claridad también viaja.", trustCopy: "TestCar reúne showroom e información para decidir con seguridad.", processTitle: "Exportar sin niebla", processCopy: "Cada paso se ve antes de mover el vehículo.", storyTitle: "Un showroom para decidir, no para distraer.", storyCopy: "Este concepto reúne catálogo, prueba y consulta. Los datos son ficticios.", faqTitle: "Preguntas antes de mover", quoteTitle: "Empieza con una solicitud clara.", quoteCopy: "Prueba el formulario local. No se transmite información.", footer: "Concepto TestCar · inventario ficticio · sin datos externos" }),
  ru: compact({ ...english, nav: ["Автомобили", "Почему TestCar", "Экспорт", "FAQ"], heroKicker: "Экспорт автомобилей из Китая / 2026", heroTitle: "Нужный автомобиль. Через нужную границу.", heroCopy: "Вымышленный экспортный шоурум, показывающий понятный и отслеживаемый путь покупки.", heroPrimary: "Смотреть автомобили", heroSecondary: "Как работает экспорт", filterTitle: "Начните с подходящего варианта", filterCopy: "Фильтруйте по кузову, состоянию и бюджету.", body: "Тип кузова", kind: "Состояние", budget: "Бюджет", filter: "Применить", reset: "Сбросить", latest: "Готовы к дороге", latestCopy: "Шесть вымышленных автомобилей, единый экспортный путь.", view: "Открыть автомобиль", new: "Новый", used: "С пробегом", empty: "Подходящих автомобилей нет.", trustKicker: "Вокруг сделки", trustTitle: "Ясность — часть груза.", trustCopy: "TestCar сочетает шоурум с информацией для международного покупателя.", processTitle: "Экспорт без тумана", processCopy: "Каждый этап виден до отправки.", storyTitle: "Шоурум для решения, а не для шума.", storyCopy: "Это демонстрационный концепт с вымышленными данными.", faqTitle: "Вопросы перед отправкой", quoteTitle: "Начните с понятного запроса.", quoteCopy: "Проверьте локальную форму. Данные не отправляются.", footer: "Концепт TestCar · вымышленный каталог · без внешних контактов" }),
  ar: compact({ ...english, nav: ["المخزون", "لماذا TestCar", "خطوات التصدير", "الأسئلة"], heroKicker: "تصدير السيارات الصينية / 2026", heroTitle: "السيارة المناسبة. إلى الوجهة المناسبة.", heroCopy: "صالة عرض افتراضية توضح كيف تجعل TestCar تصدير السيارات واضحاً وقابلاً للتتبع.", heroPrimary: "استكشف المخزون", heroSecondary: "كيف يعمل التصدير", filterTitle: "ابدأ بالخيار المناسب", filterCopy: "صفِّ المخزون حسب الهيكل والحالة والميزانية.", body: "هيكل السيارة", kind: "حالة السيارة", budget: "الميزانية", filter: "تطبيق", reset: "إعادة ضبط", latest: "جاهزة للطريق", latestCopy: "ست سيارات افتراضية وتجربة تصدير واحدة واضحة.", view: "عرض السيارة", new: "جديدة", used: "مستعملة", empty: "لا توجد سيارات مطابقة.", trustKicker: "مبني حول الصفقة", trustTitle: "الوضوح جزء من الشحنة.", trustCopy: "تجمع TestCar بين صالة عرض وبيانات تساعد المشتري الدولي على القرار.", processTitle: "تصدير بلا ضباب", processCopy: "كل مرحلة واضحة قبل تحريك السيارة.", storyTitle: "صالة عرض للقرار، لا للضجيج.", storyCopy: "هذا نموذج توضيحي ببيانات افتراضية فقط.", faqTitle: "أسئلة قبل الشراء", quoteTitle: "ابدأ بطلب واضح.", quoteCopy: "جرّب النموذج المحلي. لا يتم إرسال أي بيانات.", footer: "نموذج TestCar · مخزون افتراضي · دون بيانات اتصال خارجية" }),
};

export function formatPrice(value: number, locale: Locale) { return new Intl.NumberFormat(locale === "ar" ? "ar" : locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value); }
export function getVehicle(slug: string | null) { return vehicles.find((vehicle) => vehicle.slug === slug) ?? vehicles[0]; }
