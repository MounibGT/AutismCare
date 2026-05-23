const fs = require('fs');
const obj = require('./messages/ar.json');

// Ensure Dashboard exists
if (!obj.Dashboard) obj.Dashboard = {};

// Add profileModal under Dashboard
obj.Dashboard.profileModal = {
  title: "أكمل ملفك الشخصي",
  subtitle: "ساعدنا في العثور على أفضل تناسب لك مع العملاء",
  steps: {
    issueTypes: "أنواع المشاكل",
    issueTypesDesc: "التخصصات",
    approaches: "المنهجيات",
    approachesDesc: "الأساليب",
    ageGroups: "الفئات العمرية",
    ageGroupsDesc: "الفئات",
    additionalInfo: "معلومات إضافية",
    additionalInfoDesc: "المهارات والسيرة الذاتية"
  },
  step1: {
    title: "أنواع المشاكل التي تتفرد بها",
    required: "*",
    subtitle: "اختر التحديات الصحية النفسية التي أنت مؤهل لمعالجتها",
    minSelection: "اختر نوع مشكلة واحدة على الأقل"
  },
  step2: {
    title: "المنهجيات العلاجية",
    subtitle: "اختر الأساليب والمنهجيات التي تستخدمها في ممارستك",
    minSelection: "اختر منهجية واحدة على الأقل"
  },
  step3: {
    title: "الفئات العمرية",
    subtitle: "اختر الفئات العمرية التي تعمل معها",
    minSelection: "اختر فئة عمرية واحدة على الأقل"
  },
  step4: {
    title: "معلومات إضافية",
    subtitle: "أخبرنا المزيد عن خبرتك ومهاراتك",
    yearsExp: "سنوات الخبرة",
    yearsExpRequired: "*",
    yearsPlaceholder: "مثال: 5",
    additionalSkills: "مهارات إضافية (اختياري)",
    additionalSkillsDesc: "اختر أي مهارة إضافية تمتلكها",
    servicesOffered: "الخدمات المقدمة",
    servicesOfferedDesc: "ما types of sessions do you offer? (اختر الكل)",
    sessionFormats: "تنسيقات الجلسات",
    sessionFormatsDesc: "ما types of sessions do you provide?",
    languagesSpoken: "اللغات المنطوقة",
    languagesDesc: "ما هي اللغات التي تتحدثها مع العملاء؟",
    certifications: "الشهادات والمؤهلات",
    certificationsDesc: "اختر جميع الشهادات والمؤهلات التي تمتلكها (اختياري)",
    bio: "السيرة الذاتية المهنية",
    bioRequired: "*",
    bioPlaceholder: "حدثنا عن منهجك, خبرتك, وما يميز ممارستك...",
    bioMinLength: "يجب أن تحتوي السيرة الذاتية على 50 حرفًا على الأقل"
  },
  buttons: {
    back: "رجوع",
    next: "التالي",
    complete: "إكمال الملف الشخصي"
  },
  selected: "محدد"
};

// Remove any stray root-level profileModal if exists
delete obj.profileModal;

// Write back
fs.writeFileSync('./messages/ar.json', JSON.stringify(obj, null, 2));
console.log('Added Dashboard.profileModal to Arabic translations');
// Validate
try {
  JSON.parse(JSON.stringify(obj));
  console.log('JSON valid');
} catch(e) {
  console.error('Invalid JSON:', e.message);
}