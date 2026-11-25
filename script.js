/* =========================================
   CARZZ LANDING PAGE - INTERAKCIJE (script.js)
   ========================================= */

// Mobilni izbornik
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mainNav = document.getElementById("mainNav");

if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener("click", () => {
        mainNav.classList.toggle("open");
    });
}

// =========================================
// PODACI ZA LOKACIJE SERVISA U RIJECI
// =========================================
const servisiPodaci = [
    {
        id: 1,
        naziv: "AutoServis Krešimirova Pro",
        adresa: "Krešimirova ulica 16, Rijeka",
        kategorija: "servis",
        ocjena: "4.9 (142)",
        tagovi: ["Mali i veliki servis", "Dijagnostika"],
        lat: 45.3283,
        lng: 14.4332
    },
    {
        id: 2,
        naziv: "AutoCentar Delta & Cindrić",
        adresa: "Ulica Slavka Cindrića 9, Rijeka",
        kategorija: "servis",
        ocjena: "4.8 (115)",
        tagovi: ["Mehanika", "Kočnice i ovjes"],
        lat: 45.3247,
        lng: 14.4475
    },
    {
        id: 3,
        naziv: "Vulkanizer & Brzi Servis Školjić",
        adresa: "Školjić 10, Rijeka",
        kategorija: "vulkanizer",
        ocjena: "4.9 (98)",
        tagovi: ["Gume i optika", "Brzi servis"],
        lat: 45.3292,
        lng: 14.4472
    },
    {
        id: 4,
        naziv: "Servis & Vulkanizer Brajda",
        adresa: "Ulica Rudolfa Tomšića 10, Rijeka",
        kategorija: "vulkanizer",
        ocjena: "4.7 (84)",
        tagovi: ["Vulkanizer", "Zamjena ulja"],
        lat: 45.3316,
        lng: 14.4357
    },
    {
        id: 5,
        naziv: "ElektroAuto Zvonimirova",
        adresa: "Zvonimirova ulica 3, Rijeka",
        kategorija: "elektrika",
        ocjena: "4.9 (129)",
        tagovi: ["Autoelektrika", "Klima uređaji"],
        lat: 45.3324,
        lng: 14.4264
    }
];

// =========================================
// INICIJALIZACIJA PRAVE KARTE (LEAFLET)
// =========================================
const map = L.map('realMap').setView([45.3290, 14.4380], 14);

// Standardni OpenStreetMap (ne traži API ključ)
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
}).addTo(map);

// Prilagođena narančasta ikona pina
function kreirajPinIkonu(aktivan = false) {
    return L.divIcon({
        className: 'custom-leaflet-pin',
        html: `<div class="carzz-marker ${aktivan ? 'active' : ''}">📍</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -34]
    });
}

const serviceListEl = document.getElementById("serviceList");
const mapInfoBar = document.getElementById("mapInfoBar");
const filterBtns = document.querySelectorAll(".filter-btn");
const markeri = {};

// Generiranje popisa i pinova na karti
servisiPodaci.forEach((servis, index) => {
    // 1. Kreiraj karticu u lijevom popisu
    const item = document.createElement("div");
    item.className = `service-item ${index === 0 ? 'active' : ''}`;
    item.dataset.id = servis.id;
    item.dataset.category = servis.kategorija;

    item.innerHTML = `
        <div class="service-top">
            <h4>${servis.naziv}</h4>
            <span class="rating">★ ${servis.ocjena}</span>
        </div>
        <div class="service-meta">${servis.adresa}</div>
        <div class="service-tags">
            ${servis.tagovi.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
    `;

    item.addEventListener("click", () => odaberiServis(servis.id));
    serviceListEl.appendChild(item);

    // 2. Kreiraj pin na pravoj karti
    const marker = L.marker([servis.lat, servis.lng], {
        icon: kreirajPinIkonu(index === 0)
    }).addTo(map);

    marker.bindPopup(`
        <div class="carzz-popup">
            <strong>${servis.naziv}</strong><br>
            <span>${servis.adresa}</span>
        </div>
    `);

    marker.on("click", () => odaberiServis(servis.id, false));
    markeri[servis.id] = marker;
});

// Postavi početni info tekst i otvori prvi popup
if (servisiPodaci.length > 0) {
    mapInfoBar.innerHTML = `Odabrano: <strong>${servisiPodaci[0].naziv}</strong> — ${servisiPodaci[0].adresa}`;
    markeri[servisiPodaci[0].id].openPopup();
}

// Funkcija za sinkronizaciju popisa i karte
function odaberiServis(id, pomakniKartu = true) {
    const odabrani = servisiPodaci.find(s => s.id === id);
    if (!odabrani) return;

    // Označi karticu u popisu
    document.querySelectorAll(".service-item").forEach(el => {
        el.classList.toggle("active", Number(el.dataset.id) === id);
    });

    // Ažuriraj izgled pinova i otvori oblačić
    servisiPodaci.forEach(s => {
        const isTarget = s.id === id;
        markeri[s.id].setIcon(kreirajPinIkonu(isTarget));
        if (isTarget) {
            markeri[s.id].openPopup();
            if (pomakniKartu) {
                map.flyTo([s.lat, s.lng], 16, { duration: 0.8 });
            }
        }
    });

    // Ažuriraj donju traku s informacijama
    mapInfoBar.innerHTML = `Odabrano: <strong>${odabrani.naziv}</strong> — ${odabrani.adresa}`;
}

// Filtriranje po kategoriji
filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const filter = btn.dataset.filter;

        const vidljiviMarkeri = [];

        servisiPodaci.forEach(servis => {
            const prikazi = filter === "all" || servis.kategorija === filter;
            const kartica = document.querySelector(`.service-item[data-id="${servis.id}"]`);
            
            if (kartica) {
                kartica.style.display = prikazi ? "block" : "none";
            }

            if (prikazi) {
                markeri[servis.id].addTo(map);
                vidljiviMarkeri.push(markeri[servis.id]);
            } else {
                map.removeLayer(markeri[servis.id]);
            }
        });

        // Automatski prilagodi zum karte vidljivim servisima
        if (vidljiviMarkeri.length > 0) {
            const grupa = new L.featureGroup(vidljiviMarkeri);
            map.fitBounds(grupa.getBounds().pad(0.25));
        }
    });
});
