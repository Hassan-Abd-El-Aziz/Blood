# إعداد Google Sheets للمشروع

## خطوات الإعداد

### 1. إنشاء Google Spreadsheet
1. اذهب إلى [Google Sheets](https://sheets.google.com)
2. أنشئ جدول بيانات جديد
3. سمِ الورقة الأولى باسم `Donors` (بالضبط بهذا الاسم)
4. أضف العناوين التالية في الصف الأول (A1:F1):
   - A1: `id`
   - B1: `name`
   - C1: `area`
   - D1: `bloodType`
   - E1: `image`
   - F1: `phone`

### 2. الحصول على Spreadsheet ID
من رابط الجدول: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
انسخ الـ `SPREADSHEET_ID` (الجزء الطويل بين `/d/` و `/edit`)

### 3. إنشاء Google Apps Script
1. اذهب إلى [Google Apps Script](https://script.google.com)
2. اضغط على "مشروع جديد" (New Project)
3. احذف الكود الموجود واستبدله بمحتوى ملف `google-apps-script.gs`
4. استبدل `YOUR_SPREADSHEET_ID_HERE` بـ الـ ID الذي نسخته
5. (اختياري) أضف `API_KEY` للحماية - نفس القيمة في الملفين

### 4. النشر ك Web App
1. اضغط على "نشر" (Deploy) > "نشر جديد" (New deployment)
2. اختر النوع: "تطبيق ويب" (Web app)
3. التنفيذ كـ: "أنا" (Me)
4. من لديه حق الوصول: "أي شخص" (Anyone) أو "أي شخص لديه الرابط"
5. اضغط "نشر" (Deploy)
6. **انسخ رابط التطبيق (Web App URL)**

### 5. تحديث إعدادات المشروع
افتح ملف `google-sheets-api.js` واستبدل:
```javascript
apiUrl: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE',
```
برابط التطبيق الذي نسخته.

إذا وضعت `API_KEY` في Apps Script، ضعه أيضاً هنا:
```javascript
apiKey: 'YOUR_API_KEY_HERE',
```

### 6. اختبار الإعداد
1. افتح `index.html` في المتصفح
2. يجب أن تظهر رسالة "تم تحميل البيانات من Google Sheets"
3. اضغط على "إضافة متبرع جديد" وجرب إضافة بيانات

## استيراد البيانات الموجودة

إذا كان لديك بيانات في `donors-data.js` وتريد نقلها:

1. في Google Apps Script، أضف هذه الدالة المؤقتة:
```javascript
function importExistingData() {
    const sheet = getSheet(CONFIG.SHEET_NAME);
    const donors = [
        // انسخ محتوى donorsDatabase من donors-data.js هنا
    ];
    
    donors.forEach((donor, index) => {
        sheet.appendRow([
            index + 1,
            donor.name,
            donor.area,
            donor.bloodType,
            donor.image,
            donor.phone
        ]);
    });
}
```
2. شغّل الدالة من المحرر
3. احذف الدالة بعد الانتهاء

## استكشاف الأخطاء

### "فشل في تحميل البيانات، جاري استخدام البيانات المحلية"
- تحقق من صحة `apiUrl` في `google-sheets-api.js`
- تأكد من نشر Apps Script كـ "Anyone" access
- تحقق من وحدة تحكم المتصفح (F12) للأخطاء

### "Invalid API key"
- تأكد من تطابق `API_KEY` في الملفين
- أو اتركهما فارغين في كلاهما

### خطأ CORS
- تأكد من نشر Apps Script كإصدار جديد بعد أي تعديل
- جرب فتح رابط الـ Web App مباشرة في المتصفح

## ملاحظات مهمة

- البيانات تُخزن في Google Sheets وتظهر فوراً للجميع
- يوجد كاش لمدة 5 دقائق للقراءة (لتحسين الأداء)
- كلمة المرور لإظهار الأرقام: `hassan1234`
- يمكن إضافة/تعديل/حذف البيانات من الواجهة مباشرة