let quranData = null;
let scrollInterval = null;
let currentFontSize = 24;
// دالة لإخفاء شاشة التحميل بعد 3 ثواني
function hideIntro() {
    const introScreen = document.getElementById('intro-screen');
    const mainContainer = document.querySelector('.container');
    
    // الانتظار 3 ثواني (3000 مللي ثانية)
    setTimeout(() => {
        if (introScreen) {
            introScreen.style.opacity = '0';
            setTimeout(() => {
                introScreen.style.display = 'none';
                if (mainContainer) mainContainer.style.display = 'block';
            }, 500);
        }
    }, 3000); 
}


// تحميل الملف المحلي
fetch('quran-uthmani.xml')
    .then(response => {
        if (!response.ok) throw new Error("الملف غير موجود");
        return response.text();
    })
    .then(str => {
        quranData = (new DOMParser()).parseFromString(str, "text/xml");
        const surahs = quranData.getElementsByTagName("sura");
        const select = document.getElementById("surahSelect");

        // ملء قائمة السور
        Array.from(surahs).forEach((sura, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = sura.getAttribute("name");
            select.appendChild(option);
        });

        // استرجاع آخر سورة أو البدء بالفاتحة
        const lastSurah = localStorage.getItem('lastRead') || 0;
        showSurah(lastSurah);

        select.addEventListener('change', (e) => showSurah(e.target.value));
        
        // إخفاء شاشة التحميل فوراً بعد المعالجة
        hideIntro();
    })
    .catch(err => {
        console.error(err);
        // لو فشل التحميل، بنخفي الإنترو عشان نشوف رسالة الخطأ أو المحتوى
        hideIntro();
        alert("تأكد من وجود ملف quran-uthmani.xml في نفس المجلد");
    });

function showSurah(index) {
    stopAutoScroll();
    const box = document.getElementById('ayah-box');
    const select = document.getElementById("surahSelect");
    if (!quranData || !box) return;

    index = parseInt(index);
    select.value = index;
    box.innerHTML = '';
    
    localStorage.setItem('lastRead', index);

    const surahs = quranData.getElementsByTagName("sura");
    const selectedSura = surahs[index];
    const ayahs = selectedSura.getElementsByTagName('aya');

    // إضافة البسملة (إلا في التوبة والفاتحة)
    if (index !== 8 && index !== 0) {
        const bismillah = document.createElement('p');
        bismillah.className = 'ayah-text';
        bismillah.style.fontSize = (currentFontSize + 4) + "px";
        bismillah.style.color = "#4facfe";
        bismillah.innerHTML = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ";
        box.appendChild(bismillah);
    }

    Array.from(ayahs).forEach(aya => {
        const p = document.createElement('p');
        p.className = 'ayah-text';
        p.style.fontSize = currentFontSize + "px";
        let text = aya.getAttribute('text');
        let num = aya.getAttribute('index');

        // تنظيف البسملة المدمجة في أول آية
        if (index !== 0 && num === "1") {
            text = text.replace("بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ", "");
        }

        p.innerHTML = `${text} <span class="ayah-num">(${num})</span>`;
        box.appendChild(p);
    });
    window.scrollTo(0, 0);
}

// وظائف البحث والتحكم والتحريك تظل كما هي
function searchSurah() {
    const input = document.getElementById('searchInput').value;
    const select = document.getElementById('surahSelect');
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].text.includes(input)) {
            select.value = select.options[i].value;
            showSurah(select.value);
            break; 
        }
    }
}

function changeFontSize(delta) {
    currentFontSize += delta;
    document.querySelectorAll('.ayah-text').forEach(t => t.style.fontSize = currentFontSize + "px");
}

function nextSurah() {
    const select = document.getElementById("surahSelect");
    if (parseInt(select.value) < 113) showSurah(parseInt(select.value) + 1);
}

function prevSurah() {
    const select = document.getElementById("surahSelect");
    if (parseInt(select.value) > 0) showSurah(parseInt(select.value) - 1);
}

function toggleAutoScroll() {
    const btn = document.getElementById('scrollBtn');
    if (scrollInterval) {
        stopAutoScroll();
        btn.innerText = "قراءة تلقائية";
        btn.style.background = "#4facfe";
    } else {
        scrollInterval = setInterval(() => window.scrollBy(0, 1), 40);
        btn.innerText = "إيقاف الحركة";
        btn.style.background = "#ff4b2b";
    }
}

function stopAutoScroll() {
    clearInterval(scrollInterval);
    scrollInterval = null;
}
