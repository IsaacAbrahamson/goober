sideways.init(0)
let map = {}
let coords = {}


/*=============================================
=              CREATE NEW DRIVER              =
=============================================*/

document.getElementById('drive').addEventListener('click', async () => {
  let driverOptions = {}

  /*----------  Create request.body with Geolocation and form data  ----------*/
  try {
    const position = await getLocation({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    })
    driverOptions = {
      name: document.querySelector('[name="fullName"]').value,
      email: document.querySelector('[name="email"]').value,
      tractor: document.querySelector('[name="tractor"]').value,
      geometry: {
        type: 'Point',
        coordinates: [position.coords.longitude, position.coords.latitude]
      }
    }
  } catch (err) {
    console.log(err)
    return
  }

  /*----------  POST data to API  ----------*/
  try {
    let res = await fetch('/api/drivers', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(driverOptions)
    })
    let data = await res.json()
    console.log(data)
  } catch (err) {
    console.log(err)
  }
}, false)




/*=============================================
=              FIND NEARBY DRIVER             =
=============================================*/

document.getElementById('ride').addEventListener('click', async () => {
  sideways.moveRight()

  /*----------  Get location of rider  ----------*/
  try {
    const position = await getLocation({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    })
    coords.lat = position.coords.latitude
    coords.lng = position.coords.longitude
  } catch (err) {
    console.log(err)
    return
  }

  /*----------  Find nearby drivers  ----------*/
  try {
    let res = await fetch(`/api/drivers?lng=${coords.lng}&lat=${coords.lat}`)
    let data = await res.json()

    sideways.moveRight()
    createMap(coords, data)
    console.log(data)
  } catch (err) {
    console.log(err)
  }
}, false)




/*=============================================
=                Other buttons                =
=============================================*/

document.getElementById('title').addEventListener('click', () => {
  if (document.getElementById('title').classList.contains('driver-view')) {
    map.setZoom(8)
    map.setCenter(new google.maps.LatLng(coords.lat, coords.lng))
    document.querySelector('.profile').classList.remove('driver-view')
    document.querySelector('.map-container').classList.remove('driver-view')
    document.querySelector('.driver-container').classList.remove('driver-view')
    document.getElementById('title').classList.remove('driver-view')
    document.getElementById('title').innerHTML = 'Click driver to learn more'
  }
})

document.getElementById('ready').addEventListener('click', () => alert('Sorry, you can\'t actually get anywhere with this app :C'))




/*=============================================
=              UTILITY FUNCTIONS              =
=============================================*/

function getLocation(options) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })
}

function createMap(userCoords, drivers) {
  const mapOptions = {
    zoom: 8,
    center: new google.maps.LatLng(userCoords.lat, userCoords.lng),
    styles: [{ "featureType": "all", "elementType": "all", "stylers": [{ "color": "#ff7000" }, { "lightness": "69" }, { "saturation": "100" }, { "weight": "1.17" }, { "gamma": "2.04" }] }, { "featureType": "all", "elementType": "geometry", "stylers": [{ "color": "#cb8536" }] }, { "featureType": "all", "elementType": "labels", "stylers": [{ "color": "#ffb471" }, { "lightness": "66" }, { "saturation": "100" }] }, { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "gamma": 0.01 }, { "lightness": 20 }] }, { "featureType": "all", "elementType": "labels.text.stroke", "stylers": [{ "saturation": -31 }, { "lightness": -33 }, { "weight": 2 }, { "gamma": 0.8 }] }, { "featureType": "all", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "landscape", "elementType": "all", "stylers": [{ "lightness": "-8" }, { "gamma": "0.98" }, { "weight": "2.45" }, { "saturation": "26" }] }, { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "lightness": 30 }, { "saturation": 30 }] }, { "featureType": "poi", "elementType": "geometry", "stylers": [{ "saturation": 20 }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "lightness": 20 }, { "saturation": -20 }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "lightness": 10 }, { "saturation": -30 }] }, { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "saturation": 25 }, { "lightness": 25 }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "lightness": -20 }, { "color": "#ecc080" }] }]
  }

  const mapElement = document.getElementById('map')
  map = new google.maps.Map(mapElement, mapOptions)

  const icons = {
    driver: {
      icon: 'driver.png'
    },
    user: {
      icon: 'user.png'
    }
  }

  const features = [
    {
      position: new google.maps.LatLng(userCoords.lat, userCoords.lng),
      type: 'user'
    }
  ]

  for (let driver of drivers) {
    let driverCoords = driver.obj.geometry.coordinates
    features.push({
      position: new google.maps.LatLng(driverCoords[1], driverCoords[0]),
      type: 'driver',
      dis: driver.dis,
      obj: driver.obj,
    })
  }

  for (let feature of features) {
    let marker = new google.maps.Marker({
      position: feature.position,
      icon: icons[feature.type].icon,
      map: map
    })
    marker.addListener('click', () => {
      displayDriverInfo(feature.dis, feature.obj)
      map.setZoom(15)
      map.setCenter(marker.getPosition())
      document.querySelector('.profile').classList.add('driver-view')
      document.querySelector('.map-container').classList.add('driver-view')
      document.querySelector('.driver-container').classList.add('driver-view')
      document.getElementById('title').classList.add('driver-view')
    })
  }
}

function displayDriverInfo(dis, obj) {
  const nameElem = document.querySelector('.driver-container .name')
  const tractorElem = document.querySelector('.driver-container .tractor')
  const distanceElem = document.querySelector('.driver-container .distance')
  const title = document.getElementById('title')

  nameElem.innerHTML = `<i class="fas fa-user fa-fw"></i> ${obj.name}`
  tractorElem.innerHTML = `<i class="fas fa-taxi fa-fw"></i> ${obj.tractor}`
  distanceElem.innerHTML = `<i class="fas fa-map-marker-alt fa-fw"></i> ${(dis * 0.00062137).toFixed(1)} miles`

  title.innerHTML = '<i class="fas fa-long-arrow-alt-left"></i> Back'
}