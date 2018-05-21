var w = window.innerWidth
let lon = -39.603722
let lat = -65.381592
zoom = 4
var map = L.map('map', {
  doubleClickZoom: false,
  attributionControl: false,
  fadeAnimation: true,
  zoomAnimation: true,
  zoomControl: false,
}).setView([lon, lat], 4)

map.scrollWheelZoom.disable()
map.dragging.disable()
// Add base layer
L.tileLayer('').addTo(map)

// Initialize Carto
var client = new carto.Client({
  apiKey: 'bd0f2377f89fab680d1b5db0df8bb3e4a7fac691',
  username: 'modernizacion',
})

// Initialze source data
var provinciasSource = new carto.source.SQL(
  'SELECT * FROM modernizacion.datos_final_final_maraton_2'
)

// Create style for the data
var provinciasStyle = new carto.style.CartoCSS(`
    #layer {
      polygon-fill: ramp([be], (#0D585F, #337F7F, #63A6A0, #9CCDC1, #E4F1E1), quantiles);
    }
    #layer::outline {
      line-width: 0;
      line-color: #FFFFFF;
      line-opacity: 0.5;
    }
  `)

// Add style to the data
var provincias = new carto.layer.Layer(provinciasSource, provinciasStyle, {
  featureClickColumns: ['cartodb_id', 'provincias', 'agricultura', 'comercial'],
})

// SET QUERY
// internacional.addEventListener('click', d => {
//   source.setQuery(
//     "WITH lines as( SELECT a.clasificacion_vuelo, a.cuenta_de_origen_oaci, a.origen_oaci, a.destino_oaci, a.cartodb_id, a.origen_oaci || '-' || a.destino_oaci as route, ST_Segmentize( ST_Makeline( cdb_latlng(a.origen_lat,a.origen_lon), cdb_latlng(a.destino_lat,a.destino_lon))::geography, 100000 )::geometry as the_geom FROM modernizacion.rutas2017 a WHERE clasificacion_vuelo = 'Internacional' ) SELECT *, case when ST_XMax(the_geom) - ST_XMin(the_geom) <= 180 then ST_Transform(the_geom,3857) when ST_XMax(the_geom) - ST_XMin(the_geom) > 180 then ST_Transform(ST_Difference(ST_Shift_Longitude(the_geom), ST_Buffer(ST_GeomFromText('LINESTRING(180 90, 180 -90)',4326), 0.00001)),3857) end as the_geom_webmercator FROM lines"
//   )
//   map.panTo(new L.LatLng(4.603722, -65.381592))
//   setTimeout(function() {
//     map.setZoom(3)
//   }, 1000)
// })

// Add the data to the map as a layer
client.addLayer(provincias)
client.getLeafletLayer().addTo(map)
map.setZoom(zoom)
//add zoom control with your options
// L.control
//   .zoom({
//     position: 'bottomleft',
//   })
//   .addTo(map)

const provinciasPopup = L.popup({ closeButton: false })
provincias.on('featureClicked', featureEvent => {
  // console.log(featureEvent.data)
  let provincia = featureEvent.data.provincias
  let agricultura = featureEvent.data.agricultura
  let comercial = featureEvent.data.comercial

  provinciasPopup.setLatLng(featureEvent.latLng)
  map.panTo(provinciasPopup.getLatLng())
  provinciasPopup.setContent(`
    <h2>${provincia}</h2>
    <h4>Agricultura: ${agricultura}</h4>
    <h4>Comercial: ${comercial}</h4>
    <div id="chart"></div>
  `)
  // document.getElementById('info-window').innerHTML = `
  //   <h2>${provincia}</h2>
  //   <p><strong>Agricultura:</strong> ${agricultura}</p>
  //   <p><strong>Comercial:</strong> ${comercial}</p>
  // `
  setTimeout(() => {
    buildChart(featureEvent.data)
    provinciasPopup._updateLayout()
  }, 20)

  provinciasPopup.openOn(map)
})

function buildChart(data) {
  console.log(data)
  d3
    .select('#chart')
    .append('svg')
    .append('rect')
    .attr('width', function() {
      return data.cartodb_id * 10
    })
    .attr('height', 20)
    .style('fill', '#67a7a1')
}
