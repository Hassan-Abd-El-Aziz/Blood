/**
 * دالة استيراد البيانات من donors-data.js إلى Google Sheets
 * 
 * خطوات الاستخدام:
 * 1. انسخ هذا الكود بالكامل إلى Google Apps Script (في نفس ملف Code.gs)
 * 2. شغّل الدالة importDonorsData() من المحرر
 * 3. تحقق من التنفيذ في "السجلات" (View > Execution log)
 * 4. بعد الانتهاء، احذف هذا الكود أو اتركه للاستخدام المستقبلي
 */

// بيانات المتبرعين من donors-data.js
const donorsDatabase = [
    { id: 1, name: "محمد خالد عبد الوهاب", area: "مسجد الرحمة", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01011662484" },
    { id: 2, name: "فارس عبد العزيز صيام", area: "مسجد الرحمة", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "لا يوجد" },
    { id: 3, name: "محمد بكر أبو الخير", area: "مسجد البرهمه", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01018012542" },
    { id: 4, name: "شعبان فرج يونس", area: "مسجد الرحمة", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "لا يوجد" },
    { id: 5, name: "حسن عبد الحميد المنشاوي", area: "مسجد الرحمة", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01013832370" },
    { id: 6, name: "السيد سند بركات", area: "مسجد الرحمة", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01093748386" },
    { id: 7, name: "أحمد أبو العلاء القط", area: "مسجد النور", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "لا يوجد" },
    { id: 8, name: "أحمد اسماعيل جرس", area: "مسجد الإمام علي ابن أبي طالب", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01022071045" },
    { id: 9, name: "زكي يحيى زكريا غانم", area: "لا يوجد", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01099271754" },
    { id: 10, name: "عز الدين محمود", area: "عزبة راتب", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01014984119" },
    { id: 11, name: "حسني محمد الأشقر", area: "مسجد عمر ابن الخطاب", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01008488318" },
    { id: 12, name: "أحمد عماد أبو حشيش", area: "مسجد الحاج كمال غلاب", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01063305829" },
    { id: 13, name: "السعيد أحمد الشامي", area: "لا يوجد", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "لا يوجد" },
    { id: 14, name: "أحمد وحيد أبو جبة", area: "لا يوجد", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "لا يوجد" },
    { id: 15, name: "محمد رخاء أبو الخير", area: "مسجد البراهمه", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01009414664" },
    { id: 16, name: "ناصر طاهر قيور", area: "مسجد السيدة عائشة", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01090549020" },
    { id: 17, name: "عطية الورداني ندا", area: "مسجد الرحمة", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01021905610" },
    { id: 18, name: "إبراهيم محمد محمد رجب", area: "مسجد عمر ابن الخطاب", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01025476568" },
    { id: 19, name: "أحمد إبراهيم الدعاس", area: "مسجد عمر ابن الخطاب", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01065165567" },
    { id: 20, name: "طارق البدوي", area: "لا يوجد", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01101007196" },
    { id: 21, name: "فيصل شتا", area: "لا يوجد", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01008076466" },
    { id: 22, name: "السيد محمد المنسي", area: "مسجد الفتح", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01066661782" },
    { id: 23, name: "فرج نبيه أبو حشيش", area: "مسجد الحاج كمال غلاب", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01033129612" },
    { id: 24, name: "حسين عبد المنعم سلامة", area: "مسجد الكندري", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01022073127" },
    { id: 25, name: "إبراهيم السيد عبد الفتاح", area: "مسجد الحاج كمال غلاب", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01026564123" },
    { id: 26, name: "حمادة رضا الأشقر", area: "مسجد الحاج كمال غلاب", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01019192091" },
    { id: 27, name: "السعيد أيمن", area: "مسجد الرحمة", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01023506181" },
    { id: 28, name: "قدري السعيد عاطف الجندي", area: "مسجد الهدى", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01028224877" },
    { id: 29, name: "أحمد محمد سيد أحمد المنشاوي", area: "مسجد الحاج كمال غلاب", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01003283019" },
    { id: 30, name: "حسن عبد العزيز عبد الشافي", area: "مسجد الرحمة", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01009039628" },
    { id: 31, name: "عبده خالد عبد الوهاب", area: "مسجد الرحمة", bloodType: "A+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "لا يوجد" },
    { id: 32, name: "السعيد محمد أبو النجا", area: "مسجد الإمام علي ابن أبي طالب", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01008918905" },
    { id: 33, name: "محمد السعيد سلام", area: "مسجد البراهمه", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01095830801" },
    { id: 34, name: "إبراهيم أحمد خميس", area: "مسجد الرحمة", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01001071971" },
    { id: 35, name: "محمود حمدي حسن", area: "مسجد الرحمة", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01090827768" },
    { id: 36, name: "أحمد حمدي المنشاوي", area: "مسجد الرحمة", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01023809552" },
    { id: 37, name: "أحمد مسعد عبد الفتاح", area: "مسجد الرحمة", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "لا يوجد" },
    { id: 38, name: "الشحات بركات", area: "مسجد الرحمة", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01006414779" },
    { id: 39, name: "تامر عبد الباسط السباعي", area: "مسجد عمر ابن الخطاب", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01098769892" },
    { id: 40, name: "فخري سمير رمضان", area: "مسجد عمر ابن الخطاب", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01093640731" },
    { id: 41, name: "إبراهيم السني", area: "مسجد الفتح", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01063689200" },
    { id: 42, name: "محمد عبد المنعم رخا", area: "مسجد الرحمة", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01091626732" },
    { id: 43, name: "إبراهيم عبد الباسط", area: "مسجد الحاج كمال غلاب", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01017745600" },
    { id: 44, name: "محمد محمد حسين بركات", area: "مسجد الرحمة", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01017972338" },
    { id: 45, name: "محمود المعلم", area: "مسجد عمر ابن الخطاب", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01009667743" },
    { id: 46, name: "محمد نبيه أبو ضبه", area: "مسجد الإمام علي ابن أبي طالب", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01068857746" },
    { id: 47, name: "أحمد ربيع علي", area: "لا يوجد", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "لا يوجد" },
    { id: 48, name: "شريف طارق الدهمه", area: "مسجد الرحمة", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01025010534" },
    { id: 49, name: "محمد محمد علي شتا", area: "مسجد الحاج كمال غلاب", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01003906789" },
    { id: 50, name: "عبد المنعم فرج الخالدي", area: "لا يوجد", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "لا يوجد" },
    { id: 51, name: "محمد حسب الله", area: "لا يوجد", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "لا يوجد" },
    { id: 52, name: "محمد عصام لبيب", area: "مسجد الرحمة", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01013539649" },
    { id: 53, name: "عبدالله فكيه عبد المنعم خليفة عامر", area: "لا يوجد", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01033938865" },
    { id: 54, name: "عبدالله أحمد يونس", area: "مسجد الحاج كمال غلاب", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01008980368" },
    { id: 55, name: "عبد الفتاح السيد عبد الفتاح", area: "مسجد الحاج كمال غلاب", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01017417175" },
    { id: 56, name: "محمود عبدالله عبد الوهاب (قرقر)", area: "مسجد النور", bloodType: "B+", image: "https://img.icons8.com/?size=100&id=11178&format=png&color=000000", phone: "01067772529" }
];

/**
 * استيراد بيانات المتبرعين إلى Google Sheets
 */
function importDonorsData() {
    try {
        const sheet = getSheet(CONFIG.SHEET_NAME);
        
        // مسح البيانات القديمة (ما عدا العناوين)
        const lastRow = sheet.getLastRow();
        if (lastRow > 1) {
            sheet.getRange(2, 1, lastRow - 1, 6).clearContent();
        }
        
        // تجهيز البيانات للإدراج دفعة واحدة (أسرع)
        const rows = donorsDatabase.map(donor => [
            donor.id,
            donor.name,
            donor.area,
            donor.bloodType,
            donor.image,
            donor.phone
        ]);
        
        // إدراج البيانات
        if (rows.length > 0) {
            sheet.getRange(2, 1, rows.length, 6).setValues(rows);
        }
        
        // تنسيق العناوين
        sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#9b1d2c').setFontColor('#ffffff');
        
        // تعديل عرض الأعمدة
        sheet.setColumnWidth(1, 50);   // id
        sheet.setColumnWidth(2, 200);  // name
        sheet.setColumnWidth(3, 180);  // area
        sheet.setColumnWidth(4, 100);  // bloodType
        sheet.setColumnWidth(5, 300);  // image
        sheet.setColumnWidth(6, 130);  // phone
        
        console.log(`✅ تم استيراد ${donorsDatabase.length} متبرع بنجاح!`);
        console.log('يمكنك الآن اختبار الـ API:');
        console.log('https://script.google.com/macros/s/AKfycbwUAsPwACXDl5aPedMKFrIjpTFHQkHPLgSBOy_onDFImtSm7ItbIk5ewLUzQppOewkx/exec?action=getDonors&sheet=Donors');
        
        return `تم استيراد ${donorsDatabase.length} متبرع بنجاح`;
        
    } catch (error) {
        console.error('❌ خطأ في الاستيراد:', error);
        throw error;
    }
}

/**
 * التحقق من البيانات المستوردة
 */
function verifyImportedData() {
    const sheet = getSheet(CONFIG.SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    console.log('إجمالي الصفوف (مع العناوين):', data.length);
    console.log('العناوين:', data[0]);
    console.log('أول 3 متبرعين:');
    for (let i = 1; i < Math.min(4, data.length); i++) {
        console.log(data[i]);
    }
    
    // عد الفصائل
    const bloodTypes = {};
    for (let i = 1; i < data.length; i++) {
        const bt = data[i][3]; // bloodType في العمود D (فهرس 3)
        bloodTypes[bt] = (bloodTypes[bt] || 0) + 1;
    }
    console.log('توزيع فصائل الدم:', bloodTypes);
    
    return data;
}

/**
 * مسح جميع البيانات (ما عدا العناوين)
 */
function clearAllDonorsData() {
    const sheet = getSheet(CONFIG.SHEET_NAME);
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, 6).clearContent();
        console.log('تم مسح جميع البيانات');
    }
}