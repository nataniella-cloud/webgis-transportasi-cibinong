/* ============================================================
   WEBGIS TRANSPORTASI CIBINONG
   SCRIPT.JS - FINAL REVISI
   ============================================================ */


/* ============================================================
   1. FILE DATA
   ============================================================ */

const roadFiles = {

    arteri:
        'data/jalan_arteri.geojson',

    lokal:
        'data/jalan_lokal.geojson',

    utama:
        'data/jalan_lain.geojson',

    kecil:
        'data/jalan_setapak.geojson'

};


const pointFile =
    'data/Data_Transportasi.geojson';


const bufferFiles = {

    bufferArteri:
        'data/buffer_jalan_arteri.geojson',

    bufferLokal:
        'data/buffer_jalan_lokal.geojson',

    bufferUtama:
        'data/buffer_jalan_lain.geojson',

    bufferKecil:
        'data/buffer_jalan_setapak.geojson',

    bufferTitik:
        'data/Titik_Buffer.geojson'

};


/* ============================================================
   2. NAMA LAYER
   ============================================================ */

const roadNames = {

    arteri:
        'Jalan Arteri',

    lokal:
        'Jalan Lokal',

    utama:
        'Jalan Utama',

    kecil:
        'Jalan Setapak'

};


const bufferNames = {

    bufferArteri:
        'Buffer Jalan Arteri',

    bufferLokal:
        'Buffer Jalan Lokal',

    bufferUtama:
        'Buffer Jalan Utama',

    bufferKecil:
        'Buffer Jalan Setapak',

    bufferTitik:
        'Buffer Titik Fasilitas'

};


const bufferDistances = {

    bufferArteri:
        '100 m',

    bufferLokal:
        '50 m',

    bufferUtama:
        '50 m',

    bufferKecil:
        '20 m',

    bufferTitik:
        '500 m'

};


/* ============================================================
   3. KATEGORI TITIK
   ============================================================ */

const categoryConfig = {

    'Akses Pejalan Kaki': {

        color:
            '#e53935',

        icon:
            'fa-person-walking',

        className:
            'pedestrian'

    },


    'Angkutan Umum': {

        color:
            '#159447',

        icon:
            'fa-bus',

        className:
            'angkutan'

    },


    'Stasiun': {

        color:
            '#1769aa',

        icon:
            'fa-train-subway',

        className:
            'stasiun'

    },


    'Fasilitas Umum': {

        color:
            '#8a3fd1',

        icon:
            'fa-building',

        className:
            'fasilitas'

    }

};


/* ============================================================
   4. PUSAT PETA
   ============================================================ */

const cibinong = [

    -6.4854,

    106.8422

];


/* ============================================================
   5. INISIALISASI PETA
   ============================================================ */

const map =
    L.map(
        'mapid',
        {

            zoomControl:
                false,

            attributionControl:
                true

        }
    )
    .setView(
        cibinong,
        14
    );


/* ============================================================
   6. BASEMAP
   ============================================================ */

L.tileLayer(

    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

    {

        maxZoom:
            19,

        attribution:
            '&copy; OpenStreetMap contributors'

    }

).addTo(map);


/* ============================================================
   7. LAYER GROUP
   ============================================================ */

const layerGroups = {

    /* JALAN */

    arteri:
        L.layerGroup().addTo(map),

    lokal:
        L.layerGroup().addTo(map),

    utama:
        L.layerGroup().addTo(map),

    kecil:
        L.layerGroup().addTo(map),


    /* TITIK */

    aksesPejalan:
        L.layerGroup().addTo(map),

    angkutanUmum:
        L.layerGroup().addTo(map),

    stasiun:
        L.layerGroup().addTo(map),

    fasilitasUmum:
        L.layerGroup().addTo(map),


    /* BATAS KECAMATAN
       TIDAK LANGSUNG AKTIF */

    batasKecamatan:
        L.layerGroup(),


    /* BUFFER */

    bufferArteri:
        L.layerGroup(),

    bufferLokal:
        L.layerGroup(),

    bufferUtama:
        L.layerGroup(),

    bufferKecil:
        L.layerGroup(),

    bufferTitik:
        L.layerGroup()

};


/* ============================================================
   8. STYLE JALAN
   ============================================================ */

const roadStyles = {

    arteri: {

        color:
            '#e53935',

        weight:
            4,

        opacity:
            0.95

    },


    lokal: {

        color:
            '#f1a51c',

        weight:
            2.5,

        opacity:
            0.95

    },


    utama: {

        color:
            '#1769aa',

        weight:
            3,

        opacity:
            0.9

    },


    kecil: {

        color:
            '#333333',

        weight:
            1.8,

        opacity:
            0.8

    }

};


/* ============================================================
   9. STYLE BUFFER
   ============================================================ */

const bufferStyles = {

    bufferArteri: {

        color:
            '#e53935',

        weight:
            1.2,

        fillColor:
            '#e53935',

        fillOpacity:
            0.20

    },


    bufferLokal: {

        color:
            '#f1a51c',

        weight:
            1.2,

        fillColor:
            '#f1a51c',

        fillOpacity:
            0.20

    },


    bufferUtama: {

        color:
            '#1769aa',

        weight:
            1.2,

        fillColor:
            '#1769aa',

        fillOpacity:
            0.20

    },


    bufferKecil: {

        color:
            '#333333',

        weight:
            1.2,

        fillColor:
            '#333333',

        fillOpacity:
            0.16

    },


    bufferTitik: {

        color:
            '#8a3fd1',

        weight:
            1.2,

        fillColor:
            '#8a3fd1',

        fillOpacity:
            0.20

    }

};


/* ============================================================
   10. VARIABEL GLOBAL
   ============================================================ */

let facilityFeatures = [];

let roadStatistics = {};

let analysisMiniMap =
    null;

let analysisMiniLayer =
    null;

/* ============================================================
   TAMPILKAN TUTUPAN LAHAN
   ============================================================ */

const tutupanLahanFiles = {
    tutupan2018: 'data/Tutupan_Lahan_2018.geojson',
    tutupan2025: 'data/Tutupan_Lahan_2025.geojson'
};

let tutupanLahanLayer = null;
let tutupanLahanAktif = null;


async function tampilkanTutupanLahan(tahun) {
    const file = tutupanLahanFiles[tahun];
    if (!file) return;

    try {
        const [resLahan, resBatas] = await Promise.all([
            fetch(file),
            fetch('data/batas_cibinong.geojson')
        ]);

        if (!resLahan.ok || !resBatas.ok) {
            throw new Error('File tutupan lahan atau batas Cibinong tidak ditemukan.');
        }

        const geojson = await resLahan.json();
        const batasData = await resBatas.json();

        if (tutupanLahanLayer) {
            map.removeLayer(tutupanLahanLayer);
            tutupanLahanLayer = null;
        }

        // 1. Isi seluruh area di dalam batas dengan ungu sebagai NO DATA.
        const dasarNoData = L.geoJSON(batasData, {
            style: {
                color: '#d500f9',
                weight: 0,
                fillColor: '#d500f9',
                fillOpacity: 0.85
            }
        }).addTo(map);

        // 2. Gambar kelas tutupan lahan di atas dasar ungu.
        const kelasTutupan = L.geoJSON(geojson, {
            filter: function(feature) {
                // Kelas 0 dianggap NO DATA, jadi tidak digambar
                // sebagai kotak di atas wilayah.
                return Number(feature.properties?.gridcode) !== 0;
            },

            style: function(feature) {
                const kode = Number(feature.properties?.gridcode);

                const warnaKelas = {
                    1: '#16a34a', // Kebun Campuran
                    2: '#e51c23', // Permukiman
                    3: '#ffdf00'  // Industri
                };

                const warna = warnaKelas[kode] || '#777777';

                return {
                    color: warna,
                    weight: 0,
                    fillColor: warna,
                    fillOpacity: 0.95
                };
            }
        }).addTo(map);

        // Gabungkan kedua layer agar mudah dihapus saat ganti tahun.
        tutupanLahanLayer = L.layerGroup([
            dasarNoData,
            kelasTutupan
        ]).addTo(map);

        tutupanLahanAktif = tahun;

        if (window.cibinongBoundary) {
            window.cibinongBoundary.bringToFront();
        }

        console.log('Tutupan lahan berhasil ditampilkan.');

    } catch (error) {
        console.error('Gagal menampilkan tutupan lahan:', error);
        alert(error.message);
    }
}

const accuracyAreaData = {
    tutupan2018: {
        accuracy: '90.33% (Adjusted)',
        kappa: '0.8802 (Adjusted)',
        model: 'RF',
        area: {
            lahanKosong: '364.18 Ha',
            kebunCampuran: '1687.78 Ha',
            permukiman: '2367.82 Ha',
            industri: '244.35 Ha'
        }
    },

    tutupan2025: {
        accuracy: '90.61% (Adjusted)',
        kappa: '0.8849 (Adjusted)',
        model: 'RF',
        area: {
            lahanKosong: '351.10 Ha',
            kebunCampuran: '1574.53 Ha',
            permukiman: '2432.60 Ha',
            industri: '305.89 Ha'
        }
    }
};

function updateAccuracyAreaCard(tahun) {
    const data = accuracyAreaData[tahun];
    if (!data) return;

    document.getElementById('overallAccuracy').textContent =
        data.accuracy;
    document.getElementById('kappaValue').textContent =
        data.kappa;
    document.getElementById('modelValue').textContent =
        data.model;

    document.getElementById('areaLahanKosong').textContent =
        data.area.lahanKosong;
    document.getElementById('areaKebunCampuran').textContent =
        data.area.kebunCampuran;
    document.getElementById('areaPermukiman').textContent =
        data.area.permukiman;
    document.getElementById('areaIndustri').textContent =
        data.area.industri;
}


/* ============================================================
   11. LOAD GEOJSON
   ============================================================ */
async function loadGeoJSON(url) {

    try {

        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                `File tidak ditemukan: ${url}`
            );

        }


        return await response.json();

    } catch (error) {

        console.error(error);

    }

}


/* ============================================================
   12. SET TEXT
   ============================================================ */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


/* ============================================================
   13. FORMAT ANGKA
   ============================================================ */

function formatNumber(value) {

    return Number(
        value
    ).toLocaleString(
        'id-ID'
    );

}


/* ============================================================
   14. FORMAT PANJANG
   ============================================================ */

function formatLength(
    meters
) {

    return (

        Number(meters) / 1000

    ).toLocaleString(

        'id-ID',

        {

            minimumFractionDigits:
                2,

            maximumFractionDigits:
                2

        }

    ) + ' km';

}


/* ============================================================
   15. HITUNG PANJANG GARIS
   ============================================================ */

function calculateLineLength(
    feature
) {

    const geometry =
        feature?.geometry;


    if (!geometry) {

        return 0;

    }


    function distance(
        a,
        b
    ) {

        const R =
            6371000;


        const lon1 =
            a[0] *
            Math.PI /
            180;


        const lat1 =
            a[1] *
            Math.PI /
            180;


        const lon2 =
            b[0] *
            Math.PI /
            180;


        const lat2 =
            b[1] *
            Math.PI /
            180;


        const dLat =
            lat2 -
            lat1;


        const dLon =
            lon2 -
            lon1;


        const x =

            Math.sin(
                dLat / 2
            ) ** 2

            +

            Math.cos(lat1) *
            Math.cos(lat2) *

            Math.sin(
                dLon / 2
            ) ** 2;


        return (

            R *
            2 *
            Math.atan2(

                Math.sqrt(x),

                Math.sqrt(
                    1 - x
                )

            )

        );

    }


    function lineLength(
        coords
    ) {

        let total =
            0;


        for (

            let i = 0;

            i <
            coords.length - 1;

            i++

        ) {

            total +=
                distance(
                    coords[i],
                    coords[i + 1]
                );

        }


        return total;

    }


    if (
        geometry.type ===
        'LineString'
    ) {

        return lineLength(
            geometry.coordinates
        );

    }


    if (
        geometry.type ===
        'MultiLineString'
    ) {

        return geometry.coordinates.reduce(

            (
                total,
                part
            ) => {

                return (

                    total +
                    lineLength(part)

                );

            },

            0

        );

    }


    return 0;

}


/* ============================================================
   16. BATAS KECAMATAN
   ============================================================ */

async function loadBoundary() {

    try {

        const data =
            await loadGeoJSON(
                'data/batas_cibinong.geojson'
            );


        const boundary =
            L.geoJSON(

                data,

                {

                    style: {

                        color:
                            '#111111',

                        weight:
                            2,

                        opacity:
                            1,

                        fill:
                            false,

                        dashArray:
                            '6,5'

                    },


                    onEachFeature:
                        function(
                            feature,
                            layer
                        ) {

                            layer.bindPopup(`

                                <div class="popup-content">

                                    <b>
                                        Batas Kecamatan Cibinong
                                    </b>

                                    <br>

                                    Kecamatan Cibinong,
                                    Kabupaten Bogor,
                                    Jawa Barat.

                                </div>

                            `);

                        }

                }

            );


        /*
         * SIMPAN REFERENSI
         */

        window.cibinongBoundary =
            boundary;


        /*
         * MASUKKAN KE GROUP
         */

        boundary.addTo(
            layerGroups.batasKecamatan
        );


        /*
         * IKUTI KONDISI CHECKBOX
         */

        const checkbox =
            document.getElementById(
                'batasKecamatan'
            );


        if (
            checkbox &&
            checkbox.checked
        ) {

            layerGroups.batasKecamatan
                .addTo(map);

            boundary.bringToFront();

        }

        else {

            map.removeLayer(
                layerGroups.batasKecamatan
            );

        }


        console.log(
            'Batas Kecamatan berhasil dimuat.'
        );

    }


    catch (error) {

        console.error(
            'Gagal memuat batas wilayah:',
            error
        );

    }

}


/* ============================================================
   17. LOAD JALAN
   ============================================================ */

async function loadRoad(
    type
) {

    try {

        const data =
            await loadGeoJSON(
                roadFiles[type]
            );


        const layer =
            L.geoJSON(

                data,

                {

                    style:
                        roadStyles[type],


                    onEachFeature:
                        function(
                            feature,
                            roadLayer
                        ) {

                            roadLayer.bindPopup(`

                                <div class="popup-content">

                                    <b>
                                        ${roadNames[type]}
                                    </b>

                                </div>

                            `);

                        }

                }

            );


        layer.addTo(
            layerGroups[type]
        );


        const length =

            (
                data.features || []
            ).reduce(

                (
                    total,
                    feature
                ) => {

                    return (

                        total +
                        calculateLineLength(
                            feature
                        )

                    );

                },

                0

            );


        return {

            count:
                (
                    data.features || []
                ).length,

            length:
                length

        };

    }


    catch (error) {

        console.error(

            `Gagal memuat ${roadNames[type]}:`,

            error

        );


        return {

            count:
                0,

            length:
                0

        };

    }

}


/* ============================================================
   18. LOAD SEMUA JALAN
   ============================================================ */

async function loadAllRoads() {

    const roads = {

        arteri:
            await loadRoad(
                'arteri'
            ),

        lokal:
            await loadRoad(
                'lokal'
            ),

        utama:
            await loadRoad(
                'utama'
            ),

        kecil:
            await loadRoad(
                'kecil'
            )

    };


    roadStatistics =
        roads;


    updateRoadStatistics(
        roads
    );

}


/* ============================================================
   19. UPDATE STATISTIK JALAN
   ============================================================ */

function updateRoadStatistics(
    roads
) {

    const total =

        Object.values(
            roads
        ).reduce(

            (
                sum,
                road
            ) => {

                return (
                    sum +
                    road.count
                );

            },

            0

        );


    const totalLength =

        Object.values(
            roads
        ).reduce(

            (
                sum,
                road
            ) => {

                return (

                    sum +
                    road.length

                );

            },

            0

        );


    /* ========================================================
       TABEL STATISTIK
       ======================================================== */

    setText(
        'tableArteri',
        formatNumber(
            roads.arteri.count
        )
    );


    setText(
        'tableLokal',
        formatNumber(
            roads.lokal.count
        )
    );


    setText(
        'tableUtama',
        formatNumber(
            roads.utama.count
        )
    );


    setText(
        'tableSetapak',
        formatNumber(
            roads.kecil.count
        )
    );


    setText(
        'tableTotal',
        formatNumber(
            total
        )
    );


    /* ========================================================
       PANJANG
       ======================================================== */

    setText(
        'lengthArteri',
        formatLength(
            roads.arteri.length
        )
    );


    setText(
        'lengthLokal',
        formatLength(
            roads.lokal.length
        )
    );


    setText(
        'lengthUtama',
        formatLength(
            roads.utama.length
        )
    );


    setText(
        'lengthSetapak',
        formatLength(
            roads.kecil.length
        )
    );


    setText(
        'lengthTotal',
        formatLength(
            totalLength
        )
    );


    /* ========================================================
       STATISTIK PANEL
       ======================================================== */

    setText(
        'infoArteri',
        formatNumber(
            roads.arteri.count
        )
    );


    setText(
        'infoLokal',
        formatNumber(
            roads.lokal.count
        )
    );


    setText(
        'infoUtama',
        formatNumber(
            roads.utama.count
        )
    );


    setText(
        'infoKecil',
        formatNumber(
            roads.kecil.count
        )
    );


    setText(
        'infoTotal',
        formatNumber(
            total
        )
    );


    /* ========================================================
       ID LAMA
       ======================================================== */

    setText(
        'totalRoads',
        formatNumber(
            total
        )
    );


    setText(
        'countArteri',
        formatNumber(
            roads.arteri.count
        )
    );


    setText(
        'countLokal',
        formatNumber(
            roads.lokal.count
        )
    );


    setText(
        'countUtama',
        formatNumber(
            roads.utama.count
        )
    );


    setText(
        'countKecil',
        formatNumber(
            roads.kecil.count
        )
    );

}


/* ============================================================
   20. ICON TITIK
   ============================================================ */

function makeFacilityIcon(
    category
) {

    const config =

        categoryConfig[category]

        ||

        categoryConfig[
            'Fasilitas Umum'
        ];


    return L.divIcon({

        className:
            'facility-map-icon',

        html: `

            <span
                style="
                    --marker-color:${config.color};
                "
            >

                <i
                    class="fa-solid ${config.icon}"
                ></i>

            </span>

        `,

        iconSize:
            [32, 32],

        iconAnchor:
            [16, 16],

        popupAnchor:
            [0, -15]

    });

}


/* ============================================================
   21. KATEGORI TITIK
   ============================================================ */

function getFacilityCategory(
    properties
) {

    const kategori =

        String(
            properties?.Kategori || ''
        ).trim();


    if (
        categoryConfig[kategori]
    ) {

        return kategori;

    }


    const name =

        String(
            properties?.Nama || ''
        )
        .toLowerCase();


    if (
        name.includes('stasiun')
    ) {

        return 'Stasiun';

    }


    if (

        name.includes('terminal')||
        name.includes( 'halte' ) ||
        name.includes('bus') ||
        name.includes('shelter')
    ) {
        return 'Angkutan Umum';
    }

    if (
        name.includes('jalan')  ||
        name.includes( 'skywalk' )  ||
        name.includes('pejalan')

    ) {

        return 'Akses Pejalan Kaki';
    }

    return 'Fasilitas Umum';

}


/* ============================================================
   22. LOAD TITIK
   ============================================================ */
function getFacilityImage(name) {

    const imageMap = {

        'Cibinong City Mall Bus Stop':
            'assets/Cibinong_City_Mall.png',

        'Terminal Cibinong':
            'assets/Terminal_Cibinong.png',

        'Stasiun Cibinong':
            'assets/Stasiun_Cibinong.png',

        'Halte St. Cibinong':
             'assets/Halte_St_Cibinong.png',

        'Pasar Cibinong':
            'assets/Pasar_Cibinong.png',

        'Ramayana Cibinong City Point':
            'assets/Ramayana_Cibinong_City_Point.png',

        'Cibinong Mall':
            'assets/Cibinong_Mall.png',

        'Halte RSUD Cibinong':
            'assets/Halte_RSUD_Cibinong.png',

        'Alun-alun Kabupaten Bogor':
            'assets/Alun-Alun-Kota-Bogor.png',

        'Stadion Pakansari':
            'assets/Stadion_Pakansari.jpg',

        'Stadion Mini Cibinong Kabupaten Bogor':
            'assets/Stadion_Mini_Cibinong.png',

        'Shelter RSSM':
            'assets/Halte_RSSM.png',

        'Skywalk Tegar Beriman Cibinong':
            'assets/Skywalk.png'
    };

    return imageMap[name] || null;

}

async function loadFacilities() {

    try {

        const data =
            await loadGeoJSON(
                pointFile
            );


        if (
            !data ||
            data.type !== 'FeatureCollection'
        ) {

            throw new Error(
                'Format GeoJSON titik tidak valid.'
            );

        }


        facilityFeatures =
            Array.isArray(
                data.features
            )
                ? data.features
                : [];


        console.log(
            'Jumlah titik:',
            facilityFeatures.length
        );


        /* ====================================================
           CLEAR LAYER
           ==================================================== */

        layerGroups.aksesPejalan
            .clearLayers();

        layerGroups.angkutanUmum
            .clearLayers();

        layerGroups.stasiun
            .clearLayers();

        layerGroups.fasilitasUmum
            .clearLayers();


        /* ====================================================
           PROSES TITIK
           ==================================================== */

        facilityFeatures.forEach(
            (
                feature,
                index
            ) => {

                const props =
                    feature.properties ||
                    {};


                const geometry =
                    feature.geometry;


                if (
                    !geometry ||
                    geometry.type !== 'Point' ||
                    !Array.isArray(
                        geometry.coordinates
                    )
                ) {

                    return;

                }


                const [
                    lng,
                    lat
                ] =
                    geometry.coordinates;


                if (
                    !Number.isFinite(lat) ||
                    !Number.isFinite(lng)
                ) {

                    return;

                }


                const name =
                    props.Nama ||
                    `Titik ${index + 1}`;


                const category =
                    getFacilityCategory(
                        props
                    );


                const marker =
                    L.marker(
                        [
                            lat,
                            lng
                        ],
                        {
                            icon:
                                makeFacilityIcon(
                                    category
                                )
                        }
                    );
/* ====================================================
   POPUP FASILITAS — DESAIN BARU
   ==================================================== */

const facilityImage = getFacilityImage(name);

const facilitySource = String(
    props['Sumber Foto'] ||
    props['Sumber_Foto'] ||
    ''
).trim();

let facilitySourceHTML = '';

if (facilitySource) {
    const isURL = /^https?:\/\/\S+$/i.test(facilitySource);

    let namaSumber = facilitySource;

    if (isURL) {
        try {
            namaSumber = new URL(facilitySource).hostname
                .replace(/^www\./, '');
        } catch (error) {
            namaSumber = facilitySource;
        }
    }

    facilitySourceHTML = isURL
        ? `<a href="${escapeHTML(facilitySource)}"
              target="_blank"
              rel="noopener noreferrer">${escapeHTML(namaSumber)}</a>`
        : `<span>${escapeHTML(namaSumber)}</span>`;
} else {
    facilitySourceHTML = '<span>Sumber belum dicantumkan</span>';
}

const popupImageHTML = facilityImage
    ? `
        <div class="facility-popup-hero">
            <img
                src="${escapeHTML(facilityImage)}"
                alt="${escapeHTML(name)}"
                class="facility-popup-image"
                onerror="this.parentElement.style.display='none';"
            >

            <div class="facility-popup-overlay">
                <div class="facility-popup-title">
                    ${escapeHTML(name)}
                </div>

                <div class="facility-popup-source">
                    <i class="fa-regular fa-image"></i>
                    <span>Sumber foto:</span>
                    ${facilitySourceHTML}
                </div>
            </div>
        </div>
    `
    : `
        <div class="facility-popup-no-photo">
            <div class="facility-popup-title">
                ${escapeHTML(name)}
            </div>

            <div class="facility-popup-source">
                <i class="fa-regular fa-image"></i>
                <span>Sumber foto:</span>
                ${facilitySourceHTML}
            </div>
        </div>
    `;

marker.bindPopup(
    `
    <div class="facility-popup">

        ${popupImageHTML}

        <div class="facility-popup-info">

            <div class="facility-popup-row">
                <div class="facility-popup-icon pedestrian">
                    <i class="fa-solid ${categoryConfig[category]?.icon || 'fa-location-dot'}"></i>
                </div>
                <div class="facility-popup-detail">
                    <span>Jenis</span>
                    <b>${escapeHTML(category)}</b>
                </div>
            </div>

            <div class="facility-popup-row">
                <div class="facility-popup-icon location">
                    <i class="fa-solid fa-location-dot"></i>
                </div>
                <div class="facility-popup-detail">
                    <span>Alamat</span>
                    <b>${escapeHTML(props.Alamat || '-')}</b>
                </div>
            </div>

            <div class="facility-popup-row">
                <div class="facility-popup-icon coordinates">
                    <i class="fa-solid fa-crosshairs"></i>
                </div>
                <div class="facility-popup-detail">
                    <span>Koordinat</span>
                    <b>${lat.toFixed(6)}, ${lng.toFixed(6)}</b>
                </div>
            </div>

        </div>
    </div>
    `,
{
    maxWidth: 300,
    minWidth: 0,
    className: 'facility-popup-container',
    closeButton: true,
    autoPan: true,
    autoPanPadding: [30, 30]
}
);
                /* ====================================================
                   MASUK KE GROUP SESUAI KATEGORI
                   ==================================================== */

                if (
                    category ===
                    'Akses Pejalan Kaki'
                ) {

                    marker.addTo(
                        layerGroups.aksesPejalan
                    );

                }

                else if (
                    category ===
                    'Angkutan Umum'
                ) {

                    marker.addTo(
                        layerGroups.angkutanUmum
                    );

                }

                else if (
                    category ===
                    'Stasiun'
                ) {

                    marker.addTo(
                        layerGroups.stasiun
                    );

                }

                else {

                    marker.addTo(
                        layerGroups.fasilitasUmum
                    );

                }

            }
        );


        /* ====================================================
           UPDATE STATISTIK DAN DAFTAR
           ==================================================== */

        updateFacilityStatistics();

        updateFacilityList();


        console.log(
            'Semua titik berhasil dimuat.'
        );


    }

    catch (error) {

        console.error(
            'Gagal memuat titik:',
            error
        );


        facilityFeatures = [];


        const list =
            document.getElementById(
                'facilityList'
            );


        if (list) {

            list.innerHTML = `
                <div class="facility-list-item">
                    Gagal memuat data titik.
                </div>
            `;

        }

    }

}

/* ============================================================
   23. ESCAPE HTML
   ============================================================ */

function escapeHTML(
    value
) {

    return String(
        value ?? ''
    )
    .replace(

        /[&<>"']/g,

        function(character) {

            return {

                '&':
                    '&amp;',

                '<':
                    '&lt;',

                '>':
                    '&gt;',

                '"':
                    '&quot;',

                "'":
                    '&#039;'

            }[character];

        }

    );

}


/* ============================================================
   24. STATISTIK TITIK
   ============================================================ */

function updateFacilityStatistics() {

    let pedestrian =
        0;

    let angkutan =
        0;

    let stasiun =
        0;

    let fasilitas =
        0;


    facilityFeatures.forEach(

        feature => {

            const category =
                getFacilityCategory(
                    feature.properties || {}
                );


            if (
                category ===
                'Akses Pejalan Kaki'
            ) {

                pedestrian++;

            }


            else if (
                category ===
                'Angkutan Umum'
            ) {

                angkutan++;

            }


            else if (
                category ===
                'Stasiun'
            ) {

                stasiun++;

            }


            else {

                fasilitas++;

            }

        }

    );


    /* KATEGORI */

    setText(
        'countPedestrian',
        formatNumber(
            pedestrian
        )
    );


    setText(
        'countAngkutan',
        formatNumber(
            angkutan
        )
    );


    setText(
        'countStasiun',
        formatNumber(
            stasiun
        )
    );


    setText(
        'countFasilitas',
        formatNumber(
            fasilitas
        )
    );


    /* ID LAMA */

    setText(
        'totalFacilities',
        formatNumber(
            facilityFeatures.length
        )
    );


    setText(
        'countTerminal',
        formatNumber(
            angkutan
        )
    );


    setText(
        'countHalte',
        formatNumber(
            pedestrian +
            fasilitas
        )
    );

}


/* ============================================================
   25. DAFTAR TITIK
   ============================================================ */

function updateFacilityList() {

    const container =
        document.getElementById(
            'facilityList'
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        '';


    if (
        facilityFeatures.length ===
        0
    ) {

        container.innerHTML = `

            <div class="facility-list-item">

                Data titik tidak tersedia.

            </div>

        `;

        return;

    }


    facilityFeatures.forEach(

        (
            feature,
            index
        ) => {

            const props =
                feature.properties ||
                {};


            const geometry =
                feature.geometry;


            if (

                !geometry ||

                geometry.type !==
                'Point'

            ) {

                return;

            }


            const [
                lng,
                lat
            ] =
                geometry.coordinates;


            const name =

                props.Nama ||

                `Titik ${index + 1}`;


            const category =
                getFacilityCategory(
                    props
                );


            let iconClass =
                'fa-building';


            let categoryClass =
                'fasilitas';


            if (
                category ===
                'Akses Pejalan Kaki'
            ) {

                iconClass =
                    'fa-person-walking';

                categoryClass =
                    'pedestrian';

            }


            else if (
                category ===
                'Angkutan Umum'
            ) {

                iconClass =
                    'fa-bus';

                categoryClass =
                    'angkutan';

            }


            else if (
                category ===
                'Stasiun'
            ) {

                iconClass =
                    'fa-train-subway';

                categoryClass =
                    'stasiun';

            }


            const item =
                document.createElement(
                    'div'
                );


            item.className =
                'facility-list-item';


            item.innerHTML = `

                <div
                    class="
                        facility-list-icon
                        ${categoryClass}
                    "
                >

                    <i
                        class="
                            fa-solid
                            ${iconClass}
                        "
                    ></i>

                </div>


                <div
                    class="
                        facility-list-name
                    "
                >

                    ${escapeHTML(name)}

                </div>


                <div
                    class="
                        facility-list-category
                        ${categoryClass}
                    "
                >

                    ${escapeHTML(category)}

                </div>


                <div
                    class="
                        facility-list-arrow
                    "
                >

                    <i
                        class="
                            fa-solid
                            fa-chevron-right
                        "
                    ></i>

                </div>

            `;


            item.style.cursor =
                'pointer';


            item.addEventListener(

                'click',

                function() {

                    map.setView(

                        [
                            lat,
                            lng
                        ],

                        17

                    );


                    const targetLayer =
                        getFacilityLayer(
                            category
                        );


                    targetLayer.eachLayer(

                        layer => {

                            if (

                                layer.getLatLng &&

                                Math.abs(
                                    layer.getLatLng().lat -
                                    lat
                                ) < 0.000001

                                &&

                                Math.abs(
                                    layer.getLatLng().lng -
                                    lng
                                ) < 0.000001

                            ) {

                                layer.openPopup();

                            }

                        }

                    );

                }

            );


            container.appendChild(
                item
            );

        }

    );

}


/* ============================================================
   26. GET GROUP TITIK
   ============================================================ */

function getFacilityLayer(
    category
) {

    if (
        category ===
        'Akses Pejalan Kaki'
    ) {

        return layerGroups
            .aksesPejalan;

    }


    if (
        category ===
        'Angkutan Umum'
    ) {

        return layerGroups
            .angkutanUmum;

    }


    if (
        category ===
        'Stasiun'
    ) {

        return layerGroups
            .stasiun;

    }


    return layerGroups
        .fasilitasUmum;

}


/* ============================================================
   27. CHECKBOX JALAN
   ============================================================ */

function setupRoadCheckboxes() {

    const configs = [

        [
            'arteri',
            layerGroups.arteri
        ],

        [
            'lokal',
            layerGroups.lokal
        ],

        [
            'utama',
            layerGroups.utama
        ],

        [
            'kecil',
            layerGroups.kecil
        ]

    ];


    configs.forEach(

        item => {

            const id =
                item[0];

            const group =
                item[1];


            const checkbox =
                document.getElementById(
                    id
                );


            if (!checkbox) {

                return;

            }


            /*
             * KONDISI AWAL
             */

            if (
                checkbox.checked
            ) {

                group.addTo(map);

            }

            else {

                map.removeLayer(
                    group
                );

            }


            /*
             * ON / OFF
             */

            checkbox.addEventListener(

                'change',

                function() {

                    if (
                        checkbox.checked
                    ) {

                        group.addTo(map);

                    }

                    else {

                        map.removeLayer(
                            group
                        );

                    }

                }

            );

        }

    );

}


/* ============================================================
   28. CHECKBOX BATAS KECAMATAN
   ============================================================ */

function setupBoundaryCheckbox() {

    const checkbox =
        document.getElementById(
            'batasKecamatan'
        );


    if (!checkbox) {

        console.warn(
            'Checkbox batasKecamatan tidak ditemukan.'
        );

        return;

    }


    /*
     * KONDISI AWAL
     */

    if (
        window.cibinongBoundary
    ) {

        if (
            checkbox.checked
        ) {

            layerGroups
                .batasKecamatan
                .addTo(map);

            window.cibinongBoundary
                .bringToFront();

        }

        else {

            map.removeLayer(
                layerGroups
                    .batasKecamatan
            );

        }

    }


    /*
     * EVENT CHECKBOX
     */

    checkbox.addEventListener(

        'change',

        function() {

            if (
                this.checked
            ) {

                /*
                 * ON
                 */

                layerGroups
                    .batasKecamatan
                    .addTo(map);


                if (
                    window.cibinongBoundary
                ) {

                    window.cibinongBoundary
                        .bringToFront();

                }


                console.log(
                    'Batas Kecamatan: ON'
                );

            }

            else {

                /*
                 * OFF
                 */

                map.removeLayer(
                    layerGroups
                        .batasKecamatan
                );


                console.log(
                    'Batas Kecamatan: OFF'
                );

            }

        }

    );

}


/* ============================================================
   29. CHECKBOX TITIK
   ============================================================ */

function setupFacilityCheckboxes() {

    const aksesPejalan =
        document.getElementById(
            'aksesPejalan'
        );


    const terminal =
        document.getElementById(
            'terminal'
        );


    const stasiun =
        document.getElementById(
            'stasiun'
        );


    const halte =
        document.getElementById(
            'halte'
        );


    /*
     * AKSES PEJALAN KAKI
     */

    if (aksesPejalan) {

        if (
            aksesPejalan.checked
        ) {

            layerGroups
                .aksesPejalan
                .addTo(map);

        }

        else {

            map.removeLayer(
                layerGroups
                    .aksesPejalan
            );

        }


        aksesPejalan.addEventListener(

            'change',

            function() {

                if (
                    aksesPejalan.checked
                ) {

                    layerGroups
                        .aksesPejalan
                        .addTo(map);

                }

                else {

                    map.removeLayer(
                        layerGroups
                            .aksesPejalan
                    );

                }

            }

        );

    }


    /*
     * ANGKUTAN UMUM
     */

    if (terminal) {

        if (
            terminal.checked
        ) {

            layerGroups
                .angkutanUmum
                .addTo(map);

        }

        else {

            map.removeLayer(
                layerGroups
                    .angkutanUmum
            );

        }


        terminal.addEventListener(

            'change',

            function() {

                if (
                    terminal.checked
                ) {

                    layerGroups
                        .angkutanUmum
                        .addTo(map);

                }

                else {

                    map.removeLayer(
                        layerGroups
                            .angkutanUmum
                    );

                }

            }

        );

    }


    /*
     * STASIUN
     */

    if (stasiun) {

        if (
            stasiun.checked
        ) {

            layerGroups
                .stasiun
                .addTo(map);

        }

        else {

            map.removeLayer(
                layerGroups
                    .stasiun
            );

        }


        stasiun.addEventListener(

            'change',

            function() {

                if (
                    stasiun.checked
                ) {

                    layerGroups
                        .stasiun
                        .addTo(map);

                }

                else {

                    map.removeLayer(
                        layerGroups
                            .stasiun
                    );

                }

            }

        );

    }


    /*
     * FASILITAS UMUM
     */

    if (halte) {

        if (
            halte.checked
        ) {

            layerGroups
                .fasilitasUmum
                .addTo(map);

        }

        else {

            map.removeLayer(
                layerGroups
                    .fasilitasUmum
            );

        }


        halte.addEventListener(

            'change',

            function() {

                if (
                    halte.checked
                ) {

                    layerGroups
                        .fasilitasUmum
                        .addTo(map);

                }

                else {

                    map.removeLayer(
                        layerGroups
                            .fasilitasUmum
                    );

                }

            }

        );

    }

}


/* ============================================================
   30. LOAD BUFFER
   ============================================================ */

async function loadBuffer(
    key
) {

    try {

        const data =
            await loadGeoJSON(
                bufferFiles[key]
            );


        const layer =
            L.geoJSON(

                data,

                {

                    style:
                        bufferStyles[key]

                }

            );


        layerGroups[key] =
            layer;


        return true;

    }


    catch (error) {

        console.error(

            `Gagal memuat ${bufferNames[key]}:`,

            error

        );


        return false;

    }

}


/* ============================================================
   31. LOAD SEMUA BUFFER
   ============================================================ */

async function loadAllBuffers() {

    await loadBuffer(
        'bufferArteri'
    );


    await loadBuffer(
        'bufferLokal'
    );


    await loadBuffer(
        'bufferUtama'
    );


    await loadBuffer(
        'bufferKecil'
    );


    await loadBuffer(
        'bufferTitik'
    );

}


/* ============================================================
   32. ANALISIS SPASIAL
   ============================================================ */
function setupAnalysis() {

    const select =
        document.getElementById(
            'analysisSelect'
        );

    if (!select) {

        return;

    }

    /*
     * MINI MAP LANGSUNG DIBUAT
     * SAAT WEBGIS DIBUKA
     */

    initAnalysisMiniMap();

    /*
     * KONDISI AWAL
     */

    setText(
        'analysisType',
        '-'
    );

    setText(
        'analysisDistance',
        '-'
    );

    /*
     * EVENT PILIH ANALISIS
     */

    select.addEventListener(

        'change',

        function() {

            const value =
                select.value;

updateAccuracyAreaCard(value);

const accuracyAreaCard =
    document.getElementById('accuracyAreaCard');

const isTutupanLahan =
    value === 'tutupan2018' ||
    value === 'tutupan2025';

if (accuracyAreaCard) {
    accuracyAreaCard.hidden = !isTutupanLahan;
}

if (isTutupanLahan) {
const areaPerClass = {
    tutupan2018: {
        lahanKosong: 364.18,
        kebunCampuran: 1687.78,
        permukiman: 2367.82,
        industri: 244.35
    },
    tutupan2025: {
        lahanKosong: 351.10,
        kebunCampuran: 1574.53,
        permukiman: 2432.60,
        industri: 305.89
    }
};
    // Sembunyikan buffer sebelumnya
    Object.keys(layerGroups).forEach(function(key) {
        if (key.startsWith('buffer')) {
            map.removeLayer(layerGroups[key]);
        }
    });

    setText(
        'analysisType',
        value === 'tutupan2018'
            ? 'Tutupan Lahan 2018'
            : 'Tutupan Lahan 2025'
    );

    setText('analysisDistance', '-');

    // Mini map tetap tersedia
updateAnalysisMiniMap(value);

    // Tampilkan hasil di peta utama
    tampilkanTutupanLahan(value);

    return;
}
            // Jika memilih buffer, sembunyikan tutupan lahan
            if (tutupanLahanLayer) {
                map.removeLayer(tutupanLahanLayer);
                tutupanLahanAktif = null;
            }
const tutupanLegend = document.getElementById('tutupanLegend');

if (tutupanLegend) {
    tutupanLegend.style.display = 'none';
}
            /*
             * BELUM PILIH ANALISIS
             */

            if (
                value === 'none' ||
                !value
            ) {

                setText(
                    'analysisType',
                    '-'
                );


                setText(
                    'analysisDistance',
                    '-'
                );


                updateAnalysisMiniMap(
                    'none'
                );


                /*
                 * JANGAN HILANGKAN MINI MAP
                 */

                return;

            }


            /*
             * UPDATE INFORMASI
             */

            setText(

                'analysisType',

                bufferNames[value] ||
                '-'

            );


            setText(

                'analysisDistance',

                bufferDistances[value] ||
                '-'

            );


            /*
             * TAMPILKAN BUFFER
             * DI MINI MAP
             */

            updateAnalysisMiniMap(
                value
            );


            /*
             * TAMPILKAN BUFFER
             * DI PETA UTAMA
             */

            showAnalysisBuffer(
                value
            );

        }

    );

}

/* ============================================================
   33. TAMPILKAN BUFFER ANALISIS
   ============================================================ */

function showAnalysisBuffer(
    key
) {

    const group =
        layerGroups[key];


    if (!group) {

        return;

    }


    Object.keys(
        layerGroups
    ).forEach(

        layerKey => {

            if (
                layerKey.startsWith(
                    'buffer'
                )
            ) {

                map.removeLayer(
                    layerGroups[layerKey]
                );

            }

        }

    );


    group.addTo(map);


    if (
        map.hasLayer(group)
    ) {

        try {

            const bounds =
                group.getBounds();


            if (
                bounds.isValid()
            ) {

                map.fitBounds(

                    bounds,

                    {

                        padding:
                            [20, 20]

                    }

                );

            }

        }

        catch (error) {

            console.log(
                'Tidak dapat menyesuaikan extent buffer.'
            );

        }

    }


    updateAnalysisMiniMap(
        group
    );

}

/* ============================================================
   34. MINI MAP ANALISIS
   ============================================================ */

function initAnalysisMiniMap() {

    const element =
        document.getElementById(
            'analysisMap'
        );


    if (!element) {

        return;

    }


    /*
     * JANGAN BUAT MAP DUA KALI
     */

    if (analysisMiniMap) {

        setTimeout(

            function() {

                analysisMiniMap
                    .invalidateSize();

            },

            100

        );

        return;

    }


    /*
     * BUAT MINI MAP SEJAK WEB DIBUKA
     */

    analysisMiniMap =

        L.map(

            element,

            {

                zoomControl:
                    true,

                attributionControl:
                    true,

                dragging:
                    true,

                scrollWheelZoom:
                    false

            }

        )
        .setView(

            cibinong,

            12

        );


    /*
     * BASEMAP OSM
     */

    L.tileLayer(

        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

        {

            maxZoom:
                19,

            attribution:
                '&copy; OpenStreetMap contributors'

        }

    ).addTo(
        analysisMiniMap
    );


    /*
     * PASTIKAN UKURAN TERBACA
     */

    setTimeout(

        function() {

            analysisMiniMap
                .invalidateSize();

        },

        200

    );

}


/* ============================================================
   TAMPILKAN BUFFER DI MINI MAP
   ============================================================ */

async function updateAnalysisMiniMap(
    key
) {

    /*
     * PASTIKAN MINI MAP SUDAH ADA
     */

    initAnalysisMiniMap();


    if (!analysisMiniMap) {

        return;

    }


    /*
     * HAPUS BUFFER SEBELUMNYA
     */

    if (
        analysisMiniLayer
    ) {

        analysisMiniMap
            .removeLayer(
                analysisMiniLayer
            );

        analysisMiniLayer =
            null;

    }


    /*
     * JIKA TIDAK ADA ANALISIS
     * MINI MAP TETAP TAMPIL
     */

    if (
        !key ||
        key === 'none'
    ) {

        analysisMiniMap
            .setView(

                cibinong,

                12

            );

        return;

    }

    /* ============================================
       TAMPILKAN TUTUPAN LAHAN DI MINI MAP
       ============================================ */

    if (
        key === 'tutupan2018' ||
        key === 'tutupan2025'
    ) {
        try {
            const [resLahan, resBatas] = await Promise.all([
                fetch(tutupanLahanFiles[key]),
                fetch('data/batas_cibinong.geojson')
            ]);

            if (!resLahan.ok || !resBatas.ok) {
                throw new Error(
                    'File tutupan lahan atau batas Cibinong tidak ditemukan.'
                );
            }

            const geojson = await resLahan.json();
            const batasData = await resBatas.json();

            // Warna kelas harus sama dengan peta utama.
            const warnaKelas = {
                1: '#16a34a', // Kebun Campuran
                2: '#e51c23', // Permukiman
                3: '#ffdf00'  // Industri
            };

            // Dasar wilayah: ungu untuk area No Data.
            const dasarNoData = L.geoJSON(batasData, {
                style: {
                    color: '#d500f9',
                    weight: 0,
                    fillColor: '#d500f9',
                    fillOpacity: 0.85
                }
            });

            // Hasil klasifikasi tutupan lahan.
            const kelasLahan = L.geoJSON(geojson, {
                filter: function(feature) {
                    return Number(feature.properties?.gridcode) !== 0;
                },

                style: function(feature) {
                    const kode = Number(feature.properties?.gridcode);
                    const warna = warnaKelas[kode] || '#777777';

                    return {
                        color: warna,
                        weight: 0,
                        fillColor: warna,
                        fillOpacity: 0.95
                    };
                }
            });

            // Gabungkan agar batas dan kelas tampil bersama.
            analysisMiniLayer = L.featureGroup([
                dasarNoData,
                kelasLahan
            ]).addTo(analysisMiniMap);

            // Fokus ke seluruh wilayah hasil analisis.
            const bounds = analysisMiniLayer.getBounds();

            if (bounds.isValid()) {
                analysisMiniMap.fitBounds(bounds, {
                    padding: [8, 8],
                    maxZoom: 12
                });
            }

            setTimeout(function() {
                analysisMiniMap.invalidateSize();
            }, 150);

            console.log(
                'Tutupan lahan berhasil ditampilkan di mini map:',
                key
            );

        } catch (error) {
            console.error(
                'Gagal menampilkan tutupan lahan di mini map:',
                error
            );
        }

        return;
    }

    const file =
        bufferFiles[key];


    if (!file) {

        return;

    }


    try {

        const response =
            await fetch(file);


        if (!response.ok) {

            throw new Error(

                'File buffer tidak ditemukan: ' +
                file

            );

        }


        const geojson =
            await response.json();


        /*
         * TAMPILKAN BUFFER
         */

        analysisMiniLayer =

            L.geoJSON(

                geojson,
                
                {

                    style:

                        bufferStyles[key] || {

                            color:
                                '#1769aa',

                            weight:
                                1,

                            fillColor:
                                '#1769aa',

                            fillOpacity:
                                0.25

                        },


                    onEachFeature:

                        function(
                            feature,
                            layer
                            
                        ) {
                            layer.bindPopup(`

                                <div
                                    class="popup-content"
                                >

                                    <b>
                                        ${bufferNames[key]}
                                    </b>

                                    <br>

                                    Jarak buffer:
                                    ${bufferDistances[key]}

                                </div>

                            `);

                        }

                }

            )
            
            .addTo(
                analysisMiniMap
            );

        /*
         * ZOOM KE HASIL BUFFER
         */

        const bounds =
            analysisMiniLayer
                .getBounds();


        if (
            bounds &&
            bounds.isValid()
        ) {

            analysisMiniMap
                .fitBounds(

                    bounds,

                    {

                        padding:
                            [8, 8],

                        maxZoom:
                            15

                    }

                );

        }


        setTimeout(

            function() {

                analysisMiniMap
                    .invalidateSize();

            },

            100

        );

    }


    catch (error) {

        console.error(

            'Gagal menampilkan mini map analisis:',

            error

        );

    }

}

/* ============================================================
   35. CLEAR MINI MAP
   ============================================================ */

function clearAnalysisMap() {

    if (

        analysisMiniLayer &&

        analysisMiniMap

    ) {

        analysisMiniMap
            .removeLayer(
                analysisMiniLayer
            );


        analysisMiniLayer =
            null;

    }


    if (
        analysisMiniMap
    ) {

        analysisMiniMap.setView(
            cibinong,
            12
        );

    }


    Object.keys(
        layerGroups
    ).forEach(

        key => {

            if (
                key.startsWith(
                    'buffer'
                )
            ) {

                map.removeLayer(
                    layerGroups[key]
                );

            }

        }

    );

}


/* ============================================================
   36. SEARCH
   ============================================================ */

function setupSearch() {

    const input =
        document.getElementById(
            'searchInput'
        );


    const button =
        document.getElementById(
            'searchBtn'
        );


    if (!input) {

        return;

    }


    function search() {

        const query =

            input.value
                .trim()
                .toLowerCase();


        if (!query) {

            return;

        }


        let found =
            false;


        facilityFeatures.forEach(

            feature => {

                const props =
                    feature.properties ||
                    {};


                const name =
                    String(
                        props.Nama ||
                        ''
                    );


                const alamat =
                    String(
                        props.Alamat ||
                        ''
                    );


                const text =

                    (

                        name +
                        ' ' +
                        alamat

                    ).toLowerCase();


                if (

                    !found &&

                    text.includes(query)

                ) {

                    const geometry =
                        feature.geometry;


                    if (

                        geometry &&

                        geometry.type ===
                        'Point'

                    ) {

                        const [
                            lng,
                            lat
                        ] =
                            geometry.coordinates;


                        map.setView(

                            [
                                lat,
                                lng
                            ],

                            17

                        );


                        const category =
                            getFacilityCategory(
                                props
                            );


                        const targetLayer =
                            getFacilityLayer(
                                category
                            );


                        targetLayer.eachLayer(

                            layer => {

                                if (

                                    layer.getLatLng &&

                                    Math.abs(

                                        layer
                                            .getLatLng()
                                            .lat -
                                        lat

                                    ) < 0.000001

                                    &&

                                    Math.abs(

                                        layer
                                            .getLatLng()
                                            .lng -
                                        lng

                                    ) < 0.000001

                                ) {

                                    layer.openPopup();

                                }

                            }

                        );


                        found =
                            true;

                    }

                }

            }

        );


        if (!found) {

            alert(
                'Lokasi tidak ditemukan.'
            );

        }

    }


    if (button) {

        button.addEventListener(
            'click',
            search
        );

    }


    input.addEventListener(

        'keydown',

        function(event) {

            if (
                event.key ===
                'Enter'
            ) {

                search();

            }

        }

    );

}

/* ============================================================
   38. NAVIGASI HOME
   ============================================================ */

function goHome() {

    map.setView(
        cibinong,
        14
    );

}


/* ============================================================
   39. SCROLL SECTION
   ============================================================ */
function scrollToSection(id) {

    const element = document.getElementById(id);

    if (element) {

        // Kembalikan tampilan halaman ke area peta
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        // Kembalikan pusat dan zoom peta ke Cibinong
        if (id === 'map') {

            map.setView(cibinong, 14);

            // Sesuaikan ulang ukuran tampilan Leaflet
            setTimeout(() => {
                map.invalidateSize();
            }, 400);

        }
    }
}

/* ============================================================
   40. INFORMASI
   ============================================================ */

function showInfo() {

    const modal =
        document.getElementById(
            'infoModal'
        );


    const body =
        document.getElementById(
            'modalBody'
        );


    if (
        !modal ||
        !body
    ) {

        return;

    }


    body.innerHTML = `

        <h2>
            Informasi WebGIS
        </h2>

        <h3>
            Data Jaringan Jalan
        </h3>


        <p>
Data jaringan jalan diklasifikasikan menjadi empat jenis, yaitu Jalan Arteri, Jalan Lokal, Jalan Utama, dan Jalan Setapak. Setiap klasifikasi ditampilkan menggunakan simbol dan warna yang berbeda untuk memudahkan identifikasi karakteristik jaringan jalan di wilayah penelitian.

        </p>


        <h3>
            Persebaran Titik
        </h3>


        <p>
Informasi fasilitas transportasi dikelompokkan menjadi empat kategori, yaitu Akses Pejalan Kaki, Angkutan Umum, Stasiun, dan Fasilitas Umum. Setiap titik dilengkapi dengan informasi nama lokasi, jenis fasilitas, alamat, koordinat, serta sumber foto apabila tersedia.
        </p>


        <h3>
            Analisis Spasial
        </h3>


        <p>
Fitur analisis spasial digunakan untuk menampilkan hasil pengolahan data berbasis lokasi. Analisis yang tersedia mencakup analisis buffer untuk menggambarkan jangkauan berdasarkan jarak tertentu dari objek jaringan jalan maupun fasilitas transportasi.

        </p>

        <h3>
            Sumber Data
        </h3>


        <p>
Informasi dalam WebGIS ini bersumber dari data jaringan jalan BIG dan MoovitApp, data persebaran fasilitas dari Google Maps, serta hasil pengolahan dan visualisasi spasial menggunakan Google Earth Engine dan ArcMap.
        </p>

    `;


    modal.classList.remove(
        'hidden'
    );

}


/* ============================================================
   41. TENTANG
   ============================================================ */

function showAbout() {

    const modal =
        document.getElementById(
            'infoModal'
        );


    const body =
        document.getElementById(
            'modalBody'
        );


    if (
        !modal ||
        !body
    ) {

        return;

    }


    body.innerHTML = `

        <h2>
            Tentang WebGIS
        </h2>


        <p>

WebGIS Transportasi Cibinong merupakan sistem informasi geografis berbasis web yang dikembangkan untuk menyajikan visualisasi jaringan jalan, persebaran fasilitas transportasi, dan informasi spasial di Kecamatan Cibinong, Kabupaten Bogor.

        </p>


        <h3>
            Wilayah Kajian
        </h3>


        <p>

            Kecamatan Cibinong,
            Kabupaten Bogor,
            Jawa Barat.

        </p>

        <h3>
            Pengembang
        </h3>


        <p>

1. Nathaniella Christin — Infrastruktur dan Frontend WebGIS
<br>
2. Naysilla Aprilia Rivai — Pengolahan dan Pengembangan Data

        </p>

        <h3>
            Institusi
        </h3>


        <p>

            Program Studi S1 Teknik Geomatika

            <br>

Fakultas Teknologi Mineral dan Energi
Universitas Pembangunan Nasional “Veteran” YogyakartaUniversitas Pembangunan Nasional
            “Veteran” Yogyakarta

            <br>

            Tahun 2026

        </p>

    `;


    modal.classList.remove(
        'hidden'
    );

}


/* ============================================================
   42. CLOSE MODAL
   ============================================================ */

function closeModal() {

    const modal =
        document.getElementById(
            'infoModal'
        );


    if (modal) {

        modal.classList.add(
            'hidden'
        );

    }

}


/* ============================================================
   43. MODAL CLICK
   ============================================================ */

function setupModal() {

    const modal =
        document.getElementById(
            'infoModal'
        );


    if (!modal) {

        return;

    }


    modal.addEventListener(

        'click',

        function(event) {

            if (
                event.target ===
                modal
            ) {

                closeModal();

            }

        }

    );

}


/* ============================================================
   44. RESET BUTTON
   ============================================================ */

function setupResetButton() {

    const resetButton =
        document.querySelector(
            '.reset-btn'
        );


    if (!resetButton) {

        return;

    }


    resetButton.addEventListener(

        'click',

        function() {

            resetLayers();

        }

    );

}


/* ============================================================
   45. INISIALISASI
   ============================================================ */

async function init() {
    await loadTrayek64();

    console.log(
        '================================'
    );


    console.log(
        'WEBGIS TRANSPORTASI CIBINONG'
    );


    console.log(
        'Memulai sistem...'
    );


    /* ========================================================
       BATAS
       ======================================================== */

    await loadBoundary();


    /* ========================================================
       JALAN
       ======================================================== */

    await loadAllRoads();


    /* ========================================================
       TITIK
       ======================================================== */

    await loadFacilities();


    /* ========================================================
       BUFFER
       ======================================================== */

    await loadAllBuffers();


    /* ========================================================
       CHECKBOX JALAN
       ======================================================== */

    setupRoadCheckboxes();


    /* ========================================================
       CHECKBOX BATAS
       ======================================================== */

    setupBoundaryCheckbox();


    /* ========================================================
       CHECKBOX TITIK
       ======================================================== */

    setupFacilityCheckboxes();


    /* ========================================================
       ANALISIS
       ======================================================== */

    setupAnalysis();


    /* ========================================================
       SEARCH
       ======================================================== */

    setupSearch();


    /* ========================================================
       MODAL
       ======================================================== */

    setupModal();


    /* ========================================================
       RESET
       ======================================================== */

    setupResetButton();


    /* ========================================================
       ZOOM CONTROL
       ======================================================== */

    L.control.zoom({

        position:
            'topright'

    }).addTo(map);


    /* ========================================================
       BATAS DI DEPAN JIKA AKTIF
       ======================================================== */

    const batas =
        document.getElementById(
            'batasKecamatan'
        );


    if (

        batas &&

        batas.checked &&

        window.cibinongBoundary

    ) {

        window.cibinongBoundary
            .bringToFront();

    }


    console.log(
        '================================'
    );


    console.log(
        'WEBGIS BERHASIL DIMUAT'
    );

    console.log(
        'Jumlah titik:',
        facilityFeatures.length
    );

    console.log(
        '================================'
    );
}


/* =========================================
   PENANDA TITIK AWAL DAN AKHIR TRAYEK
========================================= */

function buatIkonRute(jenis) {
    const isAwal = jenis === 'awal';

    return L.divIcon({
        className: `penanda-rute penanda-${jenis}`,
        html: `
            <div class="pin">
                <span class="simbol">${isAwal ? '▶' : '■'}</span>
            </div>
        `,
        iconSize: [38, 46],
        iconAnchor: [19, 40],
        popupAnchor: [0, -38]
    });
}

function ambilKoordinatRute(data) {
    const koordinat = [];

    function telusuriKoordinat(value) {
        if (!Array.isArray(value)) return;

        // Format satu titik GeoJSON: [longitude, latitude]
        if (
            value.length >= 2 &&
            typeof value[0] === 'number' &&
            typeof value[1] === 'number'
        ) {
            koordinat.push([value[1], value[0]]);
            return;
        }

        value.forEach(telusuriKoordinat);
    }

    (data.features || []).forEach(feature => {
        const geometry = feature.geometry;

        if (geometry && geometry.coordinates) {
            telusuriKoordinat(geometry.coordinates);
        }
    });

    return koordinat;
}


function pasangPenandaAwalAkhir(layerTrayek, data, nomorTrayek) {
    const koordinat = ambilKoordinatRute(data);

    if (!koordinat.length) {
        console.warn(`Trayek ${nomorTrayek}: koordinat tidak ditemukan.`);
        return;
    }

    let titikAwal = koordinat[0];
    let titikAkhir = koordinat[koordinat.length - 1];

    // KHUSUS TRAYEK 72:
    // Tukar posisi simbol awal dan akhir saja.
    if (String(nomorTrayek) === '72' && arahTrayek72Terbalik) {
        [titikAwal, titikAkhir] = [titikAkhir, titikAwal];
    }

    const markerAwal = L.marker(titikAwal, {
        icon: buatIkonRute('awal'),
        zIndexOffset: 1000
    }).bindPopup(`
        <b>Titik Awal Trayek ${nomorTrayek}</b>
    `);

    const markerAkhir = L.marker(titikAkhir, {
        icon: buatIkonRute('akhir'),
        zIndexOffset: 1000
    }).bindPopup(`
        <b>Titik Akhir Trayek ${nomorTrayek}</b>
    `);

    layerTrayek.addLayer(markerAwal);
    layerTrayek.addLayer(markerAkhir);
}

/* ============================================================
   TRAYEK 64 — ROUTING MENGIKUTI JARINGAN JALAN OSM
   ============================================================ */

let trayek64Layer = null;
let trayek64CheckboxHandler = null;

// Titik pengarah perkiraan dalam format [longitude, latitude].
// Titik-titik ini harus divalidasi terhadap rute angkot sebenarnya.
const waypointTrayek64 = [
    [106.8422, -6.4854], // Cibinong
    [106.8830, -6.4770], // Koridor Citeureup
    [106.9070, -6.4500], // Koridor Gunung Putri
    [106.9690, -6.3940], // Koridor Cileungsi
    [107.0510, -6.4660]  // Jonggol
];

async function loadTrayek64() {
    const checkbox = document.querySelector(
        '.angkot-route-checkbox[value="64"]'
    );

    try {
        const response = await fetch('./data/Trayek_64.geojson');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.features || data.features.length === 0) {
            throw new Error('GeoJSON Trayek 64 tidak memiliki fitur.');
        }

        trayek64Layer = L.geoJSON(data, {
            style: {
                color: '#159447',
                weight: 5,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round'
            },
            onEachFeature: function(feature, layer) {
                layer.bindPopup('<b>Trayek Angkot 64</b>');
            }
        });
pasangDetailTrayek(trayek64Layer, data, '64');
// TAMBAHKAN PENANDA TITIK AWAL DAN AKHIR
        pasangPenandaAwalAkhir(trayek64Layer, data, '64');
        if (checkbox && checkbox.checked) {
            trayek64Layer.addTo(map);
        }

        if (checkbox && !trayek64CheckboxHandler) {
            trayek64CheckboxHandler = function() {
                if (this.checked) {
                    trayek64Layer.addTo(map);
                } else {
                    map.removeLayer(trayek64Layer);
                }
            };

            checkbox.addEventListener(
                'change',
                trayek64CheckboxHandler
            );
        }

        console.log('Trayek 64 berhasil dimuat:', data);

    } catch (error) {
        console.error('Gagal memuat Trayek 64:', error);
    }
}

let layerTitikPengarah64 = null;

async function loadTitikPengarah64() {
  try {
    const url = "./data/trayek64_titik_pengarah_draft.geojson";
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `File GeoJSON gagal dibaca: HTTP ${response.status}`
      );
    }

    const geojson = await response.json();

    console.log("GeoJSON titik:", geojson);

    if (!geojson.features || geojson.features.length === 0) {
      throw new Error("GeoJSON tidak memiliki fitur.");
    }

    // Hapus layer lama
    if (layerTitikPengarah64) {
      map.removeLayer(layerTitikPengarah64);
    }

    // Tampilkan titik dengan ukuran lebih besar
    layerTitikPengarah64 = L.geoJSON(geojson, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 8,
          color: "#ffffff",
          weight: 2,
          fillColor: "#ff1744",
          fillOpacity: 1,
          pane: "markerPane"
        });
      },

      onEachFeature: function (feature, layer) {
        const p = feature.properties || {};

        layer.bindPopup(
          `<b>Trayek 64</b><br>
           Titik pengarah: ${p.urutan ?? "-"}<br>
           ID: ${p.id_titik ?? "-"}<br>
           Status: Draft, belum terverifikasi`
        );

        layer.bindTooltip(
          String(p.urutan ?? ""),
          { permanent: false, direction: "top" }
        );
      }
    }).addTo(map);

    layerTitikPengarah64.bringToFront();

    console.log(
      "Jumlah titik pengarah:",
      geojson.features.length
    );

  } catch (error) {
    console.error("Gagal menampilkan titik Trayek 64:", error);
  }
}

const tombolTutupTrayek = document.getElementById(
    "closeTrayekDetail"
);

if (tombolTutupTrayek) {
    tombolTutupTrayek.addEventListener("click", () => {
        document.getElementById("trayekDetailPanel").hidden = true;
    });
}

const toggleTrayek64 = document.getElementById("trayek64MapToggle");
const checkboxTrayek64 = document.querySelector(
    '.angkot-route-checkbox[value="64"]'
);

if (toggleTrayek64 && checkboxTrayek64) {
    toggleTrayek64.addEventListener("change", () => {
        checkboxTrayek64.checked = toggleTrayek64.checked;
        checkboxTrayek64.dispatchEvent(
            new Event("change", { bubbles: true })
        );
    });

    checkboxTrayek64.addEventListener("change", () => {
        toggleTrayek64.checked = checkboxTrayek64.checked;
    });
}

/* ============================================================
   TRAYEK 72 — GEOJSON + TUKAR ARAH
============================================================ */

let layerTrayek72 = null;
let dataTrayek72Asli = null;
arahTrayek72Terbalik = true;

async function loadTrayek72() {
    const checkbox = document.querySelector(
        '.angkot-route-checkbox[value="72"]'
    );

    try {
        const response = await fetch('./data/Trayek_72.geojson');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.features || data.features.length === 0) {
            throw new Error('GeoJSON Trayek 72 tidak memiliki fitur.');
        }

        dataTrayek72Asli = JSON.parse(JSON.stringify(data));
arahTrayek72Terbalik = true;
        gambarTrayek72(checkbox);

        if (checkbox) {
            checkbox.onchange = function () {
                if (this.checked) {
                    layerTrayek72.addTo(map);
                } else {
                    map.removeLayer(layerTrayek72);
                }
            };
        }

        console.log('Trayek 72 berhasil dimuat.');

    } catch (error) {
        console.error('Gagal memuat Trayek 72:', error);
    }
}


function gambarTrayek72(checkbox) {
    if (!dataTrayek72Asli) return;

    // Salin GeoJSON asli.
    const data = JSON.parse(JSON.stringify(dataTrayek72Asli));

    const sedangTampil = checkbox
        ? checkbox.checked
        : (layerTrayek72 && map.hasLayer(layerTrayek72));

    if (layerTrayek72 && map.hasLayer(layerTrayek72)) {
        map.removeLayer(layerTrayek72);
    }

    layerTrayek72 = L.geoJSON(data, {
        style: {
            color: '#A855F7',
            weight: 5,
            opacity: 1,
            lineCap: 'round',
            lineJoin: 'round'
        }
    });

    // Detail dan jalur tetap menggunakan Trayek 72.
    pasangDetailTrayek(layerTrayek72, data, '72');

    // Penanda awal dan akhir dibuat ulang sesuai arah koordinat.
    pasangPenandaAwalAkhir(layerTrayek72, data, '72');

    if (sedangTampil) {
        layerTrayek72.addTo(map);
    }
}

function tukarArahTrayek72() {
    if (!dataTrayek72Asli) {
        console.error('Data Trayek 72 belum dimuat.');
        return;
    }

    arahTrayek72Terbalik = !arahTrayek72Terbalik;

    const checkbox = document.querySelector(
        '.angkot-route-checkbox[value="72"]'
    );

    gambarTrayek72(checkbox);
}

/* ============================================================
   TRAYEK 32 — GEOJSON HASIL DIGITASI
   ============================================================ */

let layerTrayek32 = null;

async function loadTrayek32() {
    const checkbox = document.querySelector(
        '.angkot-route-checkbox[value="32"]'
    );

    try {
        const response = await fetch('./data/Trayek_32.geojson');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.features || data.features.length === 0) {
            throw new Error(
                'GeoJSON Trayek 32 tidak memiliki fitur.'
            );
        }

        // Buat layer dari geometri GeoJSON.
        layerTrayek32 = L.geoJSON(data, {
            style: {
                color: '#FF4FA3',
                weight: 5,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round'
            },

            onEachFeature: function(feature, layer) {
                layer.bindPopup(
                    '<b>Trayek Angkot 32</b>'
                );
            }
        });

        // Aktifkan panel detail Trayek 32.
        if (typeof pasangDetailTrayek === 'function') {
            pasangDetailTrayek(
                layerTrayek32,
                data,
                '32'
            );
            pasangPenandaAwalAkhir(layerTrayek32, data, '32');
        }

        // Tampilkan rute jika checkbox sudah aktif.
        if (checkbox && checkbox.checked) {
            layerTrayek32.addTo(map);
        }

        // Hubungkan checkbox dengan layer Trayek 32.
        if (checkbox) {
            checkbox.onchange = function() {
                if (this.checked) {
                    layerTrayek32.addTo(map);
                } else {
                    map.removeLayer(layerTrayek32);
                }
            };
        } else {
            console.warn(
                'Checkbox Trayek 32 tidak ditemukan. Periksa index.html.'
            );
        }

        console.log(
            'Trayek 32 berhasil dimuat:',
            data
        );

    } catch (error) {
        console.error(
            'Gagal memuat Trayek 32:',
            error
        );
    }
}

/* ============================================================
   TRAYEK 35 — GEOJSON HASIL DIGITASI
   ============================================================ */

let layerTrayek35 = null;

async function loadTrayek35() {
    const checkbox = document.querySelector(
        '.angkot-route-checkbox[value="35"]'
    );

    try {
        const response = await fetch('./data/Trayek_35.geojson');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.features || data.features.length === 0) {
            throw new Error(
                'GeoJSON Trayek 35 tidak memiliki fitur.'
            );
        }

        // Membuat layer berdasarkan geometri GeoJSON.
        layerTrayek35 = L.geoJSON(data, {
            style: {
                color: '#00C2D1',
                weight: 5,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round'
            },

            onEachFeature: function(feature, layer) {
                layer.bindPopup('<b>Trayek Angkot 35</b>');
            }
        });

// AKTIFKAN PANEL DETAIL TRAYEK 35
pasangDetailTrayek(layerTrayek35, data, '35');

// TAMBAHKAN PENANDA TITIK AWAL DAN AKHIR
pasangPenandaAwalAkhir(layerTrayek35, data, '35');

// Tampilkan jika checkbox sudah dicentang.
if (checkbox && checkbox.checked) {
    layerTrayek35.addTo(map);
}

        // Hubungkan checkbox dengan layer.
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                if (!layerTrayek35) return;

                if (this.checked) {
                    layerTrayek35.addTo(map);
                } else {
                    map.removeLayer(layerTrayek35);
                }
            });
        } else {
            console.warn(
                'Checkbox Trayek 35 tidak ditemukan. Periksa HTML.'
            );
        }

        console.log('Trayek 35 berhasil dimuat:', data);

    } catch (error) {
        console.error('Gagal memuat Trayek 35:', error);
    }
}


/* ============================================================
   TRAYEK 38 — GEOJSON HASIL DIGITASI
   ============================================================ */

let layerTrayek38 = null;

async function loadTrayek38() {
    const checkbox = document.querySelector(
        '.angkot-route-checkbox[value="38"]'
    );

    try {
        const response = await fetch('./data/Trayek_38.geojson');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.features || data.features.length === 0) {
            throw new Error(
                'GeoJSON Trayek 38 tidak memiliki fitur.'
            );
        }
    
        layerTrayek38 = L.geoJSON(data, {
            style: {
                color: '#8B7D32',
                weight: 5,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round'
            },

            onEachFeature: function(feature, layer) {
                layer.bindPopup('<b>Trayek Angkot 38</b>');
            }
        });

        // AKTIFKAN PANEL DETAIL TRAYEK 38
        pasangDetailTrayek(layerTrayek38, data, '38');
        pasangPenandaAwalAkhir(layerTrayek38, data, '38');

        // Tampilkan jika checkbox dicentang
        if (checkbox && checkbox.checked) {
            layerTrayek38.addTo(map);
        }

        if (checkbox) {
            checkbox.addEventListener('change', function() {
                if (!layerTrayek38) return;

                if (this.checked) {
                    layerTrayek38.addTo(map);
                } else {
                    map.removeLayer(layerTrayek38);
                }
            });
        } else {
            console.warn(
                'Checkbox Trayek 38 tidak ditemukan. Periksa HTML.'
            );
        }

        console.log('Trayek 38 berhasil dimuat:', data);

    } catch (error) {
        console.error('Gagal memuat Trayek 38:', error);
    }
}


/* ============================================================
   TRAYEK 41 — GEOJSON HASIL DIGITASI
   ============================================================ */

let layerTrayek41 = null;

async function loadTrayek41() {
    const checkbox = document.querySelector(
        '.angkot-route-checkbox[value="41"]'
    );

    try {
        const response = await fetch('./data/Trayek_41.geojson');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.features || data.features.length === 0) {
            throw new Error(
                'GeoJSON Trayek 41 tidak memiliki fitur.'
            );
        }

        layerTrayek41 = L.geoJSON(data, {
            style: {
                color: '#F472B6',
                weight: 5,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round'
            },

            onEachFeature: function(feature, layer) {
                layer.bindPopup('<b>Trayek Angkot 41</b>');
            }
        });

        if (checkbox && checkbox.checked) {
            layerTrayek41.addTo(map);
        }

        if (checkbox) {
            checkbox.addEventListener('change', function() {
                if (!layerTrayek41) return;

                if (this.checked) {
                    layerTrayek41.addTo(map);
                } else {
                    map.removeLayer(layerTrayek41);
                }
            });
        } else {
            console.warn(
                'Checkbox Trayek 41 tidak ditemukan. Periksa HTML.'
            );
        }

        console.log('Trayek 41 berhasil dimuat:', data);

    } catch (error) {
        console.error('Gagal memuat Trayek 41:', error);
    }
}


/* ======================================================
   TRAYEK 66 - GEOJSON HASIL DIGITASI
====================================================== */

let layerTrayek66 = null;

async function loadTrayek66() {
  const checkbox = document.querySelector(
    '.angkot-route-checkbox[value="66"]'
  );

  try {
    const response = await fetch('./data/Trayek_66.geojson');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      throw new Error('GeoJSON Trayek 66 tidak memiliki fitur.');
    }

layerTrayek66 = L.geoJSON(data, {
  style: {
    color: '#C6FF00',
    weight: 5,
    opacity: 1,
    lineCap: 'round',
    lineJoin: 'round'
  },

  onEachFeature: (feature, layer) => {
    layer.bindPopup('<b>Trayek Angkot 66</b>');
  }
});

// TAMBAHKAN DI SINI
pasangDetailTrayek(layerTrayek66, data, '66');
pasangPenandaAwalAkhir(layerTrayek66, data, '66');


if (checkbox && checkbox.checked) {
  layerTrayek66.addTo(map);
}

if (checkbox) {
  checkbox.addEventListener('change', function () {
    if (!layerTrayek66) return;

    if (this.checked) {
      layerTrayek66.addTo(map);
    } else {
      map.removeLayer(layerTrayek66);
    }
  });
} else {
  console.warn('Checkbox Trayek 66 tidak ditemukan.');
}

console.log('Trayek 66 berhasil dimuat:', data);

} catch (error) {
  console.error('Gagal memuat Trayek 66:', error);
}
}

/* ======================================================
   TRAYEK 71 - GEOJSON HASIL DIGITASI
====================================================== */
let layerTrayek71 = null;

async function loadTrayek71() {
  const checkbox = document.querySelector(
    '.angkot-route-checkbox[value="71"]'
  );

  try {
    const response = await fetch('./data/Trayek_71.geojson');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      throw new Error('GeoJSON Trayek 71 tidak memiliki fitur.');
    }

    layerTrayek71 = L.geoJSON(data, {
      style: {
        color: '#7CFC00',
        weight: 5,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round'
      },

        onEachFeature: (feature, layer) => {
    layer.bindPopup('<b>Trayek Angkot 71</b>');
  }
});

// TAMBAHKAN BARIS INI
pasangDetailTrayek(layerTrayek71, data, '71');
pasangPenandaAwalAkhir(layerTrayek71, data, '71');
if (checkbox && checkbox.checked) {
  layerTrayek71.addTo(map);
}

    if (checkbox) {
      checkbox.addEventListener('change', function () {
        if (!layerTrayek71) return;

        if (this.checked) {
          layerTrayek71.addTo(map);
        } else {
          map.removeLayer(layerTrayek71);
        }
      });
    } else {
      console.warn('Checkbox Trayek 71 tidak ditemukan.');
    }

    console.log('Trayek 71 berhasil dimuat:', data);

  } catch (error) {
    console.error('Gagal memuat Trayek 71:', error);
  }
}

loadTrayek72();
loadTrayek32();
loadTrayek35();
loadTrayek38();
loadTrayek41();
loadTrayek66();
loadTrayek71();

/* ======================================================
   PANEL DETAIL TRAYEK ANGKOT
====================================================== */

let panelDetailTrayek = null;

function buatPanelDetailTrayek() {
  if (panelDetailTrayek) return panelDetailTrayek;

  const mapContainer = map.getContainer();

  // Pastikan panel menjadi bagian dari area peta
  if (getComputedStyle(mapContainer).position === 'static') {
    mapContainer.style.position = 'relative';
  }

  const style = document.createElement('style');
  style.id = 'style-panel-detail-trayek';

  style.textContent = `
.panel-detail-trayek {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 320px;
  height: 430px;
  max-width: calc(100% - 36px);
  max-height: calc(100% - 36px);
  overflow: hidden;
  z-index: 1000;
  background: #ffffff;
  border-radius: 9px;
  box-shadow: 0 4px 18px rgba(0,0,0,.25);
  font-family: Arial, sans-serif;
  font-size: 12px;
  color: #263445;
  display: none;
  flex-direction: column;
}

    .panel-detail-trayek .detail-header {
      background: #0b3158;
      color: white;
      padding: 13px 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
    }

    .panel-detail-trayek .detail-header h3 {
      margin: 0 0 5px;
      font-size: 15px;
    }

    .panel-detail-trayek .detail-subtitle {
      font-size: 10px;
      color: #d8e7f5;
      line-height: 1.5;
    }

    .panel-detail-trayek .detail-close {
      border: none;
      background: transparent;
      color: white;
      font-size: 21px;
      cursor: pointer;
      padding: 0 2px;
    }

.panel-detail-trayek .detail-body {
  padding: 13px;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: #9caec0 #f1f5f9;
}

.panel-detail-trayek .detail-header {
  flex-shrink: 0;
}

.panel-detail-trayek .detail-route-list {
  max-height: none;
}

    .panel-detail-trayek .detail-row {
      margin-bottom: 12px;
      line-height: 1.6;
    }

    .panel-detail-trayek .detail-label {
      color: #64748b;
      font-size: 11px;
    }

    .panel-detail-trayek .detail-value {
      font-weight: 700;
      color: #172b42;
      font-size: 13px;
    }

    .panel-detail-trayek .detail-section-title {
      font-weight: 700;
      margin: 13px 0 9px;
      color: #173b60;
    }

    .panel-detail-trayek .detail-route-list {
      list-style: none;
      padding: 0 0 0 12px;
      margin: 0;
      border-left: 2px solid #cbd5e1;
    }

    .panel-detail-trayek .detail-route-list li {
      position: relative;
      padding: 0 0 12px 9px;
      line-height: 1.5;
      overflow-wrap: anywhere;
    }

    .panel-detail-trayek .detail-route-list li:last-child {
      padding-bottom: 2px;
    }

    .panel-detail-trayek .detail-route-list li::before {
      content: "";
      position: absolute;
      left: -17px;
      top: 4px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #0b78bd;
      border: 2px solid white;
      box-shadow: 0 0 0 1px #0b78bd;
    }

    .panel-detail-trayek .detail-note {
      background: #eef6fc;
      color: #47627a;
      border-radius: 5px;
      padding: 9px;
      margin: 13px 0;
      font-size: 10px;
      line-height: 1.6;
    }

    .panel-detail-trayek .detail-show-route {
      width: 100%;
      padding: 10px;
      border: none;
      border-radius: 5px;
      background: #0b3158;
      color: white;
      font-weight: 700;
      cursor: pointer;
    }

    .panel-detail-trayek .detail-show-route:hover {
      background: #164b7e;
    }
  `;

  document.head.appendChild(style);

  panelDetailTrayek = document.createElement('div');
  panelDetailTrayek.className = 'panel-detail-trayek';

  // Mencegah klik pada panel mengganggu interaksi peta
  L.DomEvent.disableClickPropagation(panelDetailTrayek);
  L.DomEvent.disableScrollPropagation(panelDetailTrayek);

  mapContainer.appendChild(panelDetailTrayek);

  return panelDetailTrayek;
}


/* ======================================================
   HITUNG PANJANG DAN AMBIL GEOMETRI GEOJSON
====================================================== */
function hitungPanjangTrayek(data) {
  let totalMeter = 0;

  function hitungKoordinat(coords) {
    if (!Array.isArray(coords) || coords.length === 0) return;

    // Satu pasangan koordinat GeoJSON: [longitude, latitude]
    if (
      typeof coords[0] === 'number' &&
      typeof coords[1] === 'number'
    ) {
      return;
    }

    // Jika berisi beberapa titik koordinat
    if (
      Array.isArray(coords[0]) &&
      typeof coords[0][0] === 'number'
    ) {
      for (let i = 1; i < coords.length; i++) {
        const a = coords[i - 1];
        const b = coords[i];

        totalMeter += L.latLng(a[1], a[0])
          .distanceTo(L.latLng(b[1], b[0]));
      }

      return;
    }

    // Menangani MultiLineString dan kumpulan geometri
    coords.forEach(hitungKoordinat);
  }

  function prosesGeometri(geometry) {
    if (!geometry) return;

    if (geometry.type === 'GeometryCollection') {
      geometry.geometries.forEach(prosesGeometri);
      return;
    }

    hitungKoordinat(geometry.coordinates);
  }

  (data.features || []).forEach(feature => {
    prosesGeometri(feature.geometry);
  });

  return totalMeter / 1000;
}

function ambilUrutanLokasi() {
  // Daftar pemberhentian Trayek 64 arah Cibinong
  // Sumber: PDF Moovit Trayek 64, halaman 1–4
  const pemberhentian64Cibinong = [
    "Jalan Asrama Polisi",
    "Jalan Raya Jonggol",
    "Jalan Raya Jonggol",
    "Jalan Raya Singasari Cibodas",
    "Jalan Raya Letkol Murlin",
    "Jalan Baru Jonggol 26",
    "Jalan Raya Jonggol 26",
    "Jalan Raya Singasari Cibodas",
    "Jalan Raya Cileungsi",
    "Jalan Raya Cileungsi",
    "Jalan Raya Cileungsi",
    "Jalan Raya Cileungsi",
    "Jalan Raya Cileungsi",
    "Jalan Raya Cileungsi",
    "Jalan Tunggulis 8",
    "Jalan Tunggulis 8",
    "Jalan Tunggulis 12",
    "Jalan Raya Singasari Cibodas 9",
    "Jalan Raya Singasari Cibodas 99",
    "Jalan Raya Singasari Cibodas 99",
    "Jalan Raya Singasari Cibodas 56",
    "Jalan Raya Singasari Cibodas 77",
    "Jalan Raya Singasari Cibodas 405",
    "Jalan Raya Singasari Cibodas 9",
    "Jalan Raya Singasari Cibodas 80",
    "Cileungsi Indah",
    "Jalan Raya Narogong 47",
    "Jalan Raya Narogong 9",
    "Cileungsi Trade Center 2",
    "Jalan Raya Narogong 3",
    "Jalan Raya Narogong 160",
    "Jalan Raya Narogong 34",
    "Jalan Raya Narogong 34",
    "Jalan Raya Narogong",
    "Jalan Raya Narogong",
    "Jalan Raya Narogong",
    "Jalan Raya Narogong",
    "Jalan Raya Narogong",
    "Jalan Raya Narogong 5",
    "Jalan Raya Narogong",
    "Jalan Raya Narogong",
    "Jalan Raya Narogong 117",
    "Jalan Raya Narogong 117",
    "Jalan Raya Narogong 117",
    "Jalan Raya Narogong 117",
    "Jalan Raya Narogong 117",
    "Jalan Raya Narogong 117",
    "Jalan Raya Narogong 117",
    "Jalan Raya Narogong 117",
    "Jalan Raya Narogong 117",
    "Jalan Raya Narogong",
    "Jalan Raya Narogong",
    "Jalan Raya Narogong 26",
    "Jalan Raya Narogong 26.5",
    "Jalan Raya Narogong 71",
    "Jalan Raya Narogong 24",
    "Jalan Raya Narogong 22",
    "Jalan Raya Narogong 22",
    "Jalan Tlajung Udik 375",
    "Jalan Tlajung Udik 425",
    "Jalan Tlajung Udik 30",
    "Jalan Tlajung Udik 30",
    "Jalan Tlajung Udik 30",
    "Jalan Tlajung Udik 404",
    "Jalan Tlajung Udik 404",
    "Jalan Tlajung Udik 279",
    "Jalan Tlajung Udik 279",
    "Jalan Tlajung Udik 15",
    "Jalan Tlajung Udik 247",
    "Jalan Tlajung Udik 242a",
    "Jalan Tlajung Udik 242a",
    "Jalan Raya Gunung Putri 77",
    "Jalan Raya Gunung Putri 77",
    "Jalan Raya Gunung Putri 65",
    "Jalan Raya Gunung Putri 71",
    "Jalan Raya Gunung Putri 36",
    "Jalan Raya Gunung Putri 31",
    "Jalan Raya Gunung Putri 230",
    "Jalan Raya Gunung Putri 39",
    "Jalan Raya Gunung Putri 121",
    "Jalan Raya Gunung Putri 176",
    "Jalan Raya Gunung Putri 171b",
    "Jalan Raya Gunung Putri 11a",
    "Jalan Kampung Citeureup 1",
    "Jalan Raya Gunung Putri 10",
    "Jalan Raya Gunung Putri 10",
    "Jalan Kampung Citeureup 2",
    "Jalan Raya Gunung Putri 78",
    "Jalan Raya Gunung Putri 78",
    "Jalan Kampung Citeureup 3",
    "Jalan Mayor Oking Citeureup",
    "Jalan Mayor Oking Citeureup",
    "Jalan Kampung Citeureup 4",
    "Jalan Mayor Oking Citeureup 8",
    "Jalan Mayor Oking Citeureup 36",
    "Jalan Raya Kamurang 31",
    "Jalan Mayor Oking Citeureup 7",
    "Jalan Raya Kamurang 1",
    "Jalan Kampung Citeureup 5",
    "Pasar Citeureup",
    "Jalan Raya Mayor Oking 35",
    "Jalan Raya Mayor Oking 4",
    "Jalan Raya Mayor Oking 2",
    "Jalan Raya Mayor Oking 3",
    "Jalan Raya Mayor Oking 4",
    "Jalan Raya Mayor Oking 5",
    "Jalan Raya Mayor Oking 6",
    "Jalan Raya Mayor Oking 7",
    "Jalan Haji Muhammad Ashari 3",
    "Jalan Kayu Manis 8",
    "Jalan Kayu Manis 79",
    "Jalan Kayu Manis",
    "Jalan Kayu Manis",
    "Jalan Kayu Manis",
    "Jalan Kayu Manis 105",
    "Cibinong",
    "Cibinong City Point",
    "Jalan Raya Bogor 2"
  ];

  return pemberhentian64Cibinong;
}

function ambilUrutanLokasi72() {
  return [
    "Pasar Kucung Kampung Sawah 2",
    "Jalan Kampung Sawah",
    "Jalan Kampung Sawah",
    "Jalan Kampung Sawah",
    "Jalan Kampung Sawah",
    "Jalan Kampung Sawah",
    "MI Al-Hidayah",
    "Jalan Kampung Sawah, 31",
    "Jalan Kampung Sawah, 32",
    "Jalan Kampung Sawah, 32",
    "Jalan Kampung Sawah, 32",
    "Jalan Kampung Sawah, 34",
    "Alfamidi Kp. Sawah",
    "Jalan Kampung Sawah, 63",
    "Jalan Kampung Sawah",
    "Jalan Kampung Sawah, 24",
    "Perlintasan Kereta Jl. Pd. Rajeg Timur",
    "Jalan Raya PONDOK Rajeg, 31a",
    "Jalan Raya PONDOK Rajeg, 39",
    "Jalan Raya PONDOK Rajeg, 2",
    "Jalan Raya PONDOK Rajeg, 1",
    "Jalan Raya PONDOK Rajeg, 88",
    "Jalan Raya PONDOK Rajeg, 88",
    "Jalan Raya PONDOK Rajeg, 88",
    "Jalan Raya PONDOK Rajeg, 24",
    "Jalan Raya PONDOK Rajeg, 44",
    "Indomaret Jl. Raya Pd. Rajeg",
    "Jalan Raya PONDOK Rajeg, 22",
    "Jalan Raya PONDOK Rajeg, 515",
    "Jalan Raya PONDOK Rajeg, 515",
    "Jalan Raya PONDOK Rajeg, 515",
    "Jalan Raya PONDOK Rajeg, 515",
    "Jalan Raya PONDOK Rajeg, 515",
    "Jalan Raya PONDOK Rajeg, 515",
    "Jalan Raya PONDOK Rajeg, 515",
    "Simpang PONDOK Rajeg 2",
    "Sebrang Setu Cikaret",
    "Setu Cikaret 2",
    "Yayasan Nurul Huda",
    "Jalan Raya Setu Cikaret, 15",
    "Jalan Raya Setu Cikaret, 42",
    "Masjid Jami AL Barokah",
    "Sebrang SDN Cikaret 02",
    "Jalan Raya Setu Cikaret, 36",
    "Jl. Cikaret Al-Falah 2",
    "Sekolah AL Fath",
    "Jalan Al~Falah Cikaret",
    "GANG Berkah",
    "Superindo Cikaret",
    "Jalan Raya Cikaret",
    "Jl. Puri Nirwana III Timur",
    "Jalan Al~Falah Cikaret",
    "Pegadaian Cikaret",
    "Komplek Nirwana Estate 2",
    "Salsabila Medical Center",
    "Simpang Cikaret",
    "Jalan Raya Bogor, 7",
    "Yamaha Cibinong",
    "RS Trimitra Cibinong",
    "Daihatsu Cibinong",
    "Sebrang Graha Cibinong",
    "Jl Raya Bogor",
    "Cibinong",
    "Cibinong City Point",
    "Terminal Cibinong"
  ];
}

function ambilUrutanLokasi72() {
  return [
    "Terminal Cibinong",
    "Pintu Belakang Cibinong City",
    "Jalan Hr. Lukhman, 18-19",
    "Jalan Hr. Lukhman, 51",
    "Jl. Raya Bogor 2",
    "Komplek Ruko Graha Cibinong",
    "RS Trimitra Cibinong 2",
    "Jalan Asrama Palad, 102",
    "Simpang Cikaret 2",
    "Komplek Nirwana Estate",
    "Jl. Puri Nirwana III Barat",
    "Nirwana Estate",
    "GANG H. Saiyan",
    "Seberang GANG Berkah",
    "GANG Swadaya",
    "Jalan Cikaret AL Falah",
    "SDN Cikaret 02",
    "Jalan Raya Setu Cikaret, 15",
    "Masjid Jami Asyuhada",
    "Setu Cikaret",
    "Jalan Raya Setu Cikaret",
    "Simpang PONDOK Rajeg 1",
    "SDIT AL Hidayah Cibinong",
    "RSUD Cibinong",
    "SPBU Dedi Kusmayadi",
    "Perhutani Kph Bogor",
    "KPP Pratama Cibinong",
    "PMI Kabupaten Bogor",
    "Seberang Kelurahan Tengah",
    "Yayasan Bina Qolbu Mutmainnah",
    "Seberang Cibinong Asri",
    "Jalan Cempaka",
    "Seberang Bumi Cibinong Endah",
    "Masjid Jami Nurul Falah",
    "PDAM Tirta Kahuripan 1",
    "Sebrang PDAM Kabupaten Bogor",
    "Graha Kartika Pratama",
    "GANG Maurup",
    "Kantor Desa Bojong Baru",
    "RS Harapan Sehati",
    "Bambu Kuning"
      ];
}

function ambilUrutanLokasi71() {
  return [
    "Terminal Cibinong",
    "Pintu Keluar Terminal Cibinong",
    "Pintu Belakang Cibinong City",
    "Jalan Hr. Lukhman, 18-19",
    "Jalan Hr. Lukhman, 51",
    "Jl. Raya Bogor 2",
    "Jalan Raya Bogor, 42",
    "Komplek Ruko Graha Cibinong",
    "RS Trimitra Cibinong 2",
    "Jalan Raya Bogor, 9",
    "Jalan Asrama Palad, 102",
    "Simpang Cikaret 2",
    "Jalan Raya Cikaret, 3",
    "Jalan Raya Cikaret, 4",
    "Jalan Raya Cikaret, 62-63",
    "Jl. Puri Nirwana III Barat",
    "Nirwana Estate",
    "GANG H. Saiyan",
    "Jalan Raya Cikaret, 3",
    "Seberang GANG Berkah",
    "Jalan Raya Cikaret, 11",
    "GANG Swadaya",
    "Jalan Raya Cikaret, 3",
    "Jalan Raya Cikaret, 33",
    "Jalan Raya Cikaret, 5",
    "Seberang SDN Cikaret 01",
    "Jalan Raya Cikaret, 42",
    "Alfamidi Al-Falah",
    "Jalan Al-Falah, 17",
    "Jalan Al~Falah Cikaret, 2",
    "Sekolah Al-Falah",
    "Jl. Abdul Gani II Barat",
    "Jalan Haji Abdul Gani II, 22b",
    "Perum Griya Kali Baru",
    "Jalan Haji Abdul Gani II, 22b",
    "Jalan Haji Abdul Gani II, 22b",
    "Jl. Ar Ridho",
    "Jalan Haji Abdul Gani II",
    "Jalan Haji Abdul Gani II",
    "Jalan Haji Abdul Gani II, 23",
    "Kp. Bulak"
  ];
}

function ambilUrutanLokasi66() {
  return [
    "Pasar Cibinong 1",
    "Jalan Raya Mayor Oking 28",
    "Jalan Raya Mayor Oking 27",
    "Jl. Mayor Oking",
    "Jalan Raya Mayor Oking 26",
    "Jalan Raya Mayor Oking 25",
    "Jalan Raya Mayor Oking 24",
    "Jalan Raya Mayor Oking 23",
    "Jalan Raya Mayor Oking 22",
    "Jalan Raya Mayor Oking 21",
    "Jalan Raya Mayor Oking 20",
    "Jalan Raya Mayor Oking 19",
    "Jalan Raya Kranggan 02",
    "Jalan Raya Kranggan 76",
    "Jalan Raya Kranggan 109",
    "Jalan Raya Kranggan 12",
    "Jalan Kranggan Gunung Putru 10",
    "Jalan Raya Kranggan 134",
    "Jalan Raya Kranggan 10",
    "Jalan Raya Kranggan 55",
    "Jalan Raya Kranggan 147",
    "Jalan Raya Kranggan 147 - 148",
    "Jalan Raya Kranggan 3",
    "Jalan Raya Kranggan 6",
    "Jalan Raya Kranggan 27",
    "Perum Gunung Putri Permai 1"
  ];
}

function ambilUrutanLokasi38() {
  return [
    "Terminal Cibinong",
    "Jalan Raya Bogor 1",
    "Jalan Raya Mayor Oking 30",
    "Jalan Raya Mayor Oking 29",
    "Jalan Raya Mayor Oking 28",
    "Jalan Raya Mayor Oking 27",
    "Jl. Mayor Oking",
    "Jalan Raya Mayor Oking 26",
    "Jalan Raya Mayor Oking 25",
    "Jalan Raya Mayor Oking 24",
    "Jalan Raya Mayor Oking 23",
    "Jalan Raya Mayor Oking 22",
    "Jalan Raya Mayor Oking 21",
    "Jalan Raya Mayor Oking 20",
    "Jalan Raya Mayor Oking 19",
    "Jalan Raya Mayor Oking 18",
    "Jalan Raya Mayor Oking 17",
    "Jalan Raya Mayor Oking 16",
    "Citeureup",
    "Jalan Raya Mayor Oking 60",
    "SMA Indocement",
    "Jalan Baru Puspa Negara 27",
    "SDN Puspanegara",
    "Jalan Raya Kamurang 1",
    "Jalan Mayor Oking Citeureup 7",
    "Jalan Raya Kamurang 31",
    "Jalan Raya Kamurang 31",
    "Jalan Mayor Oking Citeureup 7",
    "Jalan Mayor Oking Citeureup",
    "Jalan Mayor Oking Citeureup",
    "Jalan Mayor Oking Citeureup",
    "Jalan Mayor Oking Citeureup",
    "Jalan Mayor Oking Citeureup",
    "Jalan Raya Gunung Putri 78",
    "Jalan Raya Gunung Putri 78",
    "Jalan Raya Gunung Putri 78",
    "Jalan Raya Gunung Putri 61",
    "Jalan Raya Gunung Putri 10",
    "Jalan Mayor Oking Jayaatmaja 71",
    "Jalan Mayor Oking Jayaatmaja 71",
    "Jalan Raya Gunung Putri 11a",
    "Jalan Raya Gunung Putri 171b",
    "Jalan Raya Gunung Putri 176",
    "Jalan Raya Gunung Putri 121",
    "Jalan Raya Gunung Putri 39",
    "Jalan Raya Gunung Putri 230",
    "Jalan Raya Gunung Putri 117",
    "Jalan Raya Gunung Putri 36",
    "Jalan Raya Gunung Putri 71",
    "Jalan Raya Gunung Putri 65",
    "Jalan Raya Gunung Putri 77",
    "Jalan Tlajung Udik 242a",
    "Jalan Tlajung Udik 242a",
    "Jalan Tlajung Udik 247",
    "Jalan Tlajung Udik 15",
    "Jalan Tlajung Udik 279",
    "Jalan Tlajung Udik 279",
    "Jalan Tlajung Udik 404",
    "Jalan Tlajung Udik 404",
    "Jalan Tlajung Udik 30",
    "Jalan Tlajung Udik 30",
    "Jalan Tlajung Udik 907",
    "Simpang Tanjung Gn. Putri 1",
    "Jalan Raya Wanaherang 29",
    "Jalan Raya Wanaherang",
    "Jalan Raya Wanaherang",
    "Jalan Mercedes Benz 7",
    "Jalan Raya Wanaherang 59",
    "Royal Stone",
    "Jalan Mercedes Benz 60",
    "Jalan Mercedes Benz 56",
    "Mushola AL Islah",
    "Jalan Mercedes Benz 56",
    "Jalan Mercedes Benz 167",
    "Jalan Mercedes Benz 167",
    "Jalan Mercedes Benz 167",
    "Jalan Mercedes Benz 69",
    "Jalan Mercedes Benz 219",
    "Seberang SDN 01 Ciracas",
    "Jalan Mercedes Benz 32",
    "Jalan Pembangunan",
    "Jalan Mercedes Benz 23",
    "Jalan Mercedes Benz 257",
    "Gunung Putri Square",
    "Jalan Mercedes Benz 21",
    "Jalan Mercedes Benz 21",
    "Seberang Polsek Gunung Putri",
    "Jalan Mercedes Benz 205",
    "Jalan Mercedes Benz 205",
    "Jalan Mercedes Benz 205",
    "Jalan Mercedes Benz 205",
    "Perum Papabri",
    "Jalan Mercedes Benz 205",
    "Jalan Raya Cikuda Wanaherang 21",
    "Jalan Raya Cikuda Wanaherang 21",
    "Jalan Raya Cikuda Wanaherang 15",
    "Jalan Raya Cikuda Wanaherang 25",
    "Jalan Raya Cikuda Wanaherang",
    "Jalan Raya Cikuda Wanaherang 41",
  ];
}

/* ======================================================
   TAMPILKAN DETAIL TRAYEK SAAT GARIS DIKLIK
====================================================== */

function pasangDetailTrayek(routeLayer, data, nomorTrayek) {
    if (!routeLayer || !data) {
        console.error('Layer atau data trayek tidak tersedia.');
        return;
    }

    const panel = buatPanelDetailTrayek();

    // Hilangkan popup lama agar klik membuka panel detail.
    routeLayer.eachLayer(function (featureLayer) {
        if (featureLayer.unbindPopup) {
            featureLayer.unbindPopup();
        }
    });

    const panjangKm = hitungPanjangTrayek(data);

    // Gunakan daftar lokasi jika fungsi tersedia.
let lokasi = [];
try {
    if (
        nomorTrayek === '35' &&
        typeof ambilUrutanLokasi35 === 'function'
    ) {
        lokasi = ambilUrutanLokasi35();

    } else if (
        nomorTrayek === '71' &&
        typeof ambilUrutanLokasi71 === 'function'
    ) {
        lokasi = ambilUrutanLokasi71();

    } else if (
        nomorTrayek === '72' &&
        typeof ambilUrutanLokasi72 === 'function'
    ) {
        lokasi = ambilUrutanLokasi72();

    } else if (
        nomorTrayek === '66' &&
        typeof ambilUrutanLokasi66 === 'function'
    ) {
        lokasi = ambilUrutanLokasi66();

    } else if (
        nomorTrayek === '38' &&
        typeof ambilUrutanLokasi38 === 'function'
    ) {
        lokasi = ambilUrutanLokasi38();

    } else {
        lokasi = typeof ambilUrutanLokasi === 'function'
            ? (ambilUrutanLokasi(data) || [])
            : [];
    }

} catch (error) {
    console.error('Gagal mengambil urutan lokasi:', error);
}

    // Hindari memasang event klik berulang.
    routeLayer.off('click');

    routeLayer.on('click', function () {
        panel.replaceChildren();

        const header = document.createElement('div');
        header.className = 'detail-header';

        const judul = document.createElement('div');

        const title = document.createElement('h3');
        title.textContent = `Detail Trayek ${nomorTrayek}`;

        const subtitle = document.createElement('div');
        subtitle.className = 'detail-subtitle';
        subtitle.textContent = 'Informasi rute angkutan umum';

        judul.append(title, subtitle);

        const close = document.createElement('button');
        close.className = 'detail-close';
        close.type = 'button';
        close.textContent = '×';
        close.addEventListener('click', function () {
            panel.style.display = 'none';
        });

        header.append(judul, close);

        const body = document.createElement('div');
        body.className = 'detail-body';

        function tambahBaris(label, value) {
            const row = document.createElement('div');
            row.className = 'detail-row';

            const labelEl = document.createElement('div');
            labelEl.className = 'detail-label';
            labelEl.textContent = label;

            const valueEl = document.createElement('div');
            valueEl.className = 'detail-value';
            valueEl.textContent = value;

            row.append(labelEl, valueEl);
            body.appendChild(row);
        }

        tambahBaris('Jenis', 'Angkutan Umum');
        tambahBaris(
            'Panjang rute',
            `${panjangKm.toFixed(2).replace('.', ',')} km`
        );

        const section = document.createElement('div');
        section.className = 'detail-section-title';
        section.textContent = 'Urutan lokasi perjalanan';
        body.appendChild(section);

        const list = document.createElement('ol');
        list.className = 'detail-route-list';

        if (lokasi.length > 0) {
            lokasi.forEach(function (nama) {
                const item = document.createElement('li');
                item.textContent = nama;
                list.appendChild(item);
            });
        } else {
            const item = document.createElement('li');
            item.textContent =
                'Daftar lokasi belum tersedia untuk trayek ini.';
            list.appendChild(item);
        }

        body.appendChild(list);

        const button = document.createElement('button');
        button.className = 'detail-show-route';
        button.type = 'button';
        button.textContent = '⌖ Tampilkan Jalur di Peta';

        button.addEventListener('click', function () {
            if (!map.hasLayer(routeLayer)) {
                routeLayer.addTo(map);
            }

            const bounds = routeLayer.getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds, {
                    padding: [30, 30],
                    maxZoom: 15
                });
            }
        });

        body.appendChild(button);
if (nomorTrayek === '72') {
    const tombolTukar = document.createElement('button');

    tombolTukar.type = 'button';
    tombolTukar.className = 'detail-show-route';
    tombolTukar.textContent = '⇄ Tukar Arah Trayek';

    tombolTukar.addEventListener('click', function () {
        tukarArahTrayek72();
    });

    body.appendChild(tombolTukar);
}
        panel.append(header, body);

        panel.style.display = 'flex';
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const tombol = document.getElementById('toggleSidebar');
    const layout = document.querySelector('.main-grid');
    const ikon = document.getElementById('toggleSidebarIcon');

    if (!tombol || !layout) {
        console.warn('Tombol sidebar atau layout tidak ditemukan.');
        return;
    }

    tombol.addEventListener('click', function () {
        const tertutup = layout.classList.toggle('sidebar-collapsed');

        tombol.setAttribute('aria-expanded', String(!tertutup));
        tombol.setAttribute(
            'aria-label',
            tertutup ? 'Buka sidebar' : 'Tutup sidebar'
        );
        tombol.title = tertutup ? 'Buka sidebar' : 'Tutup sidebar';

        if (ikon) {
            ikon.textContent = tertutup ? '☷' : '☰';
        }

        // Sesuaikan ukuran peta setelah layout berubah
        setTimeout(function () {
            if (typeof map !== 'undefined' && map) {
                map.invalidateSize();
            }
        }, 300);
    });
});

/* ============================================================
   46. JALANKAN
   ============================================================ */

init();