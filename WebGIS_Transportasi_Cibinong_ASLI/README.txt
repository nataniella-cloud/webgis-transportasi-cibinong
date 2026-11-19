# WebGIS Transportasi Cibinong

Prototype WebGIS dengan tampilan menyerupai referensi yang diberikan.

## Cara menjalankan di VSCode

1. Extract folder/project.
2. Buka folder `webgis_transportasi_cibinong` di VSCode.
3. Install extension **Live Server**.
4. Klik kanan `index.html`.
5. Pilih **Open with Live Server**.

Internet diperlukan untuk:
- basemap OpenStreetMap
- library Leaflet
- Font Awesome
- gambar contoh

## File
- `index.html` = struktur halaman
- `style.css` = desain/tampilan
- `script.js` = peta, layer, pencarian, popup, analisis demo

## Mengganti data dengan data GIS asli

Data contoh di `script.js` dapat diganti dengan GeoJSON hasil QGIS/ArcGIS.

Contoh:
```javascript
fetch('data/jalan_arteri.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: '#ed554e',
        weight: 4
      },
      onEachFeature: function(feature, layer) {
        layer.bindPopup(
          `<b>${feature.properties.NAMA_RUAS}</b>`
        );
      }
    }).addTo(layerGroups.arteri);
  });
```

Sebaiknya buat folder:
`data/`

lalu masukkan:
- batas_kecamatan.geojson
- jalan_arteri.geojson
- jalan_kolektor.geojson
- jalan_lokal.geojson
- jalan_lingkungan.geojson
- terminal.geojson
- stasiun.geojson
- halte.geojson


## Data administrasi asli
File `data/batas_cibinong.geojson` dibuat dari shapefile `Cibinong.shp`
yang diberikan pengguna. WebGIS sekarang memakai geometri tersebut untuk
batas administrasi Cibinong dan otomatis melakukan zoom ke extent data.

Jika ingin mengganti data lagi, cukup ganti file GeoJSON di folder `data`
dan sesuaikan nama file pada `script.js`.
