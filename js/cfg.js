/*

  This is an actively composed configuration: 
    values get possibly overwritten (e.g. texture),
    there are function, eval'd later,
    or event handlers,
    if creates globals (e.g PI, TAU)

*/


/* GLOBALS */

const 
  PI      =   Math.PI,
  TAU     =   2 * PI,
  PI2     =   PI / 2,
  RADIUS  =   1.0,    // surface, population
  LEVEL_0 =   0.000,  // population
  LEVEL_1 =   0.001,  // basemaps, snpp, rtopo2
  LEVEL_2 =   0.002,  // sst
  LEVEL_3 =   0.003,  // seaice
  LEVEL_4 =   0.004,  // wind10, tmp2m
  LEVEL_5 =   0.005,  // clouds
  LEVEL_6 =   0.006,  // jetstream
  LEVEL_7 =   0.007   // atmosphere
;

var TIMENOW = moment.utc('2017-06-20 1200', 'YYYY-MM-DD HHmm');

var CFG = {

  isLoaded:         false,

  Title:            'Simulator',

  Camera: {
    cam:            new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1500),
    pos:            new THREE.Vector3(4, 0, 0),         
    minDistance:    RADIUS + 0.2,
    maxDistance:    8,                 
  },

  User: {
    ip:             '',
    country_code:   '',
    country_name:   'Unknown',
    region_code:    '',
    region_name:    '',
    city:           '',
    zip_code:       '',
    time_zone:      '',
    latitude:       0.0,
    longitude:      0.0,
    metro_code:     0,
    loc_detected:   false,
  },

  Device: {

    browser:                   'unknown',
    platform:                  navigator.platform,
    devicePixelRatio:          NaN,

    canMotion:                 false,
    canOrientation:            false,
    canUserProximitry:         false,
    canDeviceProximitry:       false,

    maxVertexUniforms:         NaN,
    max_texture_size:          NaN,
    max_cube_map_texture_size: NaN,

    OES_texture_float:         false,
    OES_texture_float_linear:  false,

  },

  Sim: {
    coordspool : {
      amount:       5e5,
    }
  },

  Hud: {
    opacityLow:  0.5,
    opacityHigh: 0.99,
  },

  BasemapIds: [9, 10, 11, 14],
  defaultBasemap: 'basemaps',     // id = 8

  Faces: ['right', 'left', 'top', 'bottom', 'front', 'back'],

  Textures: {
    
    'transparent.face.512.png':     'images/transparent.face.512.png',

    'arcticio.logo.512.png':        'images/arcticio.logo.white.512.png',
    'red.dot.png':                  'images/red.dot.png',
    'dot.white.128.png':            'images/dot.white.128.png',
    // 'logo.128.png':                 'images/logo.128.png',
    'logo.128.png':                 'images/logo.128.01.png',

    // 'tex2.jpg':                     'images/test/tex2.jpg',
    // 'tex3.jpg':                     'images/test/tex3.jpg',
    // 'tex4.jpg':                     'images/test/tex4.jpg',
    // 'tex5.png':                     'images/test/tex5.png',
    // 'tex6.png':                     'images/test/tex6.png',
    // 'tex7.jpg':                     'images/test/tex7.jpg',

    // Tools
    'hud/fullscreen.png':           'images/hud/fullscreen.png',
    'hud/gear.png':                 'images/hud/gear.1.png',
    // 'hud/graticule.png':            'images/hud/graticule.2.png',
    'hud/graticule.png':            'images/hud/graticule.3.png',
    'hud/hamburger.png':            'images/hud/hamburger.png',
    'hud/info.png':                 'images/hud/info.png',
    'hud/movie.png':                'images/hud/movie.1.png',
    'hud/reload.png':               'images/hud/reload.png',

    // Assets
    'hud/mask.png':                 'images/hud/mask.png',
    'hud/clouds.png':               'images/hud/clouds.png',
    'hud/satellite.png':            'images/hud/satellite.1.png',
    'hud/seaice.png':               'images/hud/seaice.png',
    'hud/snow.png':                 'images/hud/snow.png',
    'hud/space.png':                'images/hud/space.png',
    'hud/sst.png':                  'images/hud/sst.png',
    // 'hud/temperature.png':          'images/hud/temperature.png',
    'hud/temperature.png':          'images/hud/temperature.01.png',
    'hud/rain.png':                 'images/hud/rain.png',
    'hud/population.png':           'images/hud/population.png',

    'oceanmask.4096x2048.grey.png': 'images/spheres/oceanmask.4096x2048.grey.png',

  },

  Lightsets: {
    data: {
      sun:        {intensity: 0.4},
      spot:       {intensity: 0.4},
      ambient:    {intensity: 0.4},
      background: {colors: [ 0x666666, 0x666666, 0x222222, 0x222222 ]},
    },
    snpp: {
      sun:        {intensity: 0.4},
      spot:       {intensity: 0.4},
      ambient:    {intensity: 0.4},
      background: {colors: [ 0x666666, 0x666666, 0x222222, 0x222222 ]},
    },
    normal: {
      sun:        {intensity: 0.0},
      spot:       {intensity: 0.0},
      ambient:    {intensity: 1.0},
      background: {colors: [ 0x666666, 0x666666, 0x222222, 0x222222 ]},
    },
  },

  Sun: {
    radius: 10,
  },

  earth: {
    factor:        6371,
    radius:        RADIUS,
    // radiusOverlay: RADIUS + 0.1,
  },

};
