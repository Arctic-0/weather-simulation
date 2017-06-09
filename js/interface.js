'use strict';

// https://github.com/sindresorhus/screenfull.js/

var IFC = (function () {

  var 
    self,

    $  = document.getElementById.bind(document),
    $$ = document.querySelectorAll.bind(document),

    loader     = $$('.interface img.loader')[0],
    simulator  = $$('.simulator')[0],
    fullscreen = $$('.fullscreen')[0],

    orbitControls, 

    controllers = GUIcontrollers,

    globe = {
      scan:     NaN,   // -1 = tiny globe, 1 = big, 0 = little smaller than screen
      pixels:   NaN,   // 2 * radius
      sector:   []
    },

    screen = {            // canvas actually
      height:   NaN,
      width:    NaN,
      aspect:   NaN,
      diameter: NaN,
    },

    mouse = {
      x:          NaN, 
      y:          NaN, 
      down:       false, 
      button:     NaN,
      intersect:  new THREE.Vector3(0, 0, 0),
      overGlobe:  NaN,
    },

    levels  = {
      '8':  1.2,
      '7':  1.4,
      '6':  1.8,
      '5':  2.6,
      '4':  4.2,
    },

    labels = {
      sun:       $$('.label.sun')[0],
    },

    panels = {
      latlon:    $$('.panel.latlon')[0],

    },

    raycaster = new THREE.Raycaster(),
    marker    = new THREE.Vector3(),

    stats,

    end;

  function vector3ToLatLong (v3) {

    var v = v3.clone().normalize();
    var lon = ((270 + (Math.atan2(v.x , v.z)) * 180 / Math.PI) % 360);

    lon = lon > 180 ? -(360 - lon) : lon;

    return {
      lat: 90 - (Math.acos(v.y))  * 180 / Math.PI,
      lon: lon,
    };

  }

  function formatLatLon (prefix, ll) {
    
    ll.lat = ll.lat < 0 ? 'S ' + Math.abs(ll.lat).toFixed(0) : 'N ' + Math.abs(ll.lat).toFixed(0);
    ll.lon = ll.lon < 0 ? 'E ' + Math.abs(ll.lon).toFixed(0) : 'W ' + Math.abs(ll.lon).toFixed(0);

    return `<strong>${prefix}</strong> ${ ll.lat }, ${ ll.lon }`;

  }


  return self = {
    
    stats,
    mouse,
    screen,
    globe,
    raycaster,
    controllers,
    orbitControls,

    init: function () {

      self.events.resize();

      loader.style.display = 'block';

      // screen.width  = simulator.width;
      // screen.height = simulator.height;

      self.stats = stats = new Stats();
      stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
      fullscreen.appendChild( stats.dom );

      // move gui.dat to fullscreen container
      fullscreen.appendChild($$('div.dg.ac')[0]);

      raycaster.params.Points.threshold = 0.001; // threshold;


    },
    show: function () {

      loader.style.display = 'none';

      $$('.panel.image')[0].style.display = 'block';
      $$('.panel.latlon')[0].style.display = 'block';
      $$('.panel.info')[0].style.display = 'block';
      $$('.panel.test')[0].style.display = 'block';
      $$('.panel.expi')[0].style.display = 'block';
      $$('.interface .labels')[0].style.display = 'block';
      
      $$('canvas.simulator')[0].style.display = 'block';

    },
    activate: function () {

      orbitControls = self.orbitControls = new THREE.OOrbitControls(SCN.camera, SCN.renderer.domElement),

      orbitControls.enabled = true;
        orbitControls.enablePan = false;
        orbitControls.enableDamping = true;
        orbitControls.dampingFactor = 0.88;
        orbitControls.constraint.smoothZoom = true;
        orbitControls.constraint.zoomDampingFactor = 0.2;
        orbitControls.constraint.smoothZoomSpeed = 2.0;
        orbitControls.constraint.minDistance = CFG.minDistance;
        orbitControls.constraint.maxDistance = CFG.maxDistance;

      H.each([

        [simulator, 'mousedown'],
        [simulator, 'mouseup'],
        [simulator, 'mousemove'],
        [simulator, 'mouseenter'],
        [simulator, 'mouseover'],
        [simulator, 'mouseleave'],
        [simulator, 'mouseout'],
        [simulator, 'click'],
        [simulator, 'dblclick'],
        [simulator, 'touchstart'],
        [simulator, 'touchmove'],
        [simulator, 'touchend'],
        [simulator, 'touchcancel'],
        // [document,  'contextmenu'],
        [document,  'keydown'],
        [window,    'orientationchange'],
        [window,    'deviceorientation'],
        [window,    'devicemotion'],
        [window,    'resize'],
      
      ], function (_, e) { 

        e[0].addEventListener(e[1], self.events[e[1]], false) 

      });

    },
    step: function step () {

      TWEEN.update();

      orbitControls.update();

      self.updateMouse();
      self.updateGlobe();

      // GUI infos
      // self.updatePanels();
      // self.updateLabels();

    },
    events: {
      resize: function () {

        screen.width  = SCN.renderer.domElement.width;
        screen.height = SCN.renderer.domElement.height;
        screen.aspect = screen.width / screen.height;
        screen.diameter = Math.hypot(screen.width, screen.height);

      },
      click:   function (event) { 

        // if (!mouse.overGlobe) {GUI.closed = !GUI.closed;}

      },      
      dblclick:   function (event) { 

        if (!mouse.overGlobe) {
          if (screenfull.enabled) {
            screenfull.toggle(fullscreen);
          }        

        } else {
          ANI.insert(0, ANI.library.cam2vector(mouse.intersect, 2))

        }
        
        // console.log('dblclick');

      },
      mousedown:   function (event) { 

        mouse.down = true;
        mouse.button = event.button;
        // console.log('mousedown', event.button, event);

        // TODO: swap buttons, mind orbit drag

        if (mouse.button === 0) {
          SCN.objects.arrowHelper.visible && SCN.objects.arrowHelper.setDirection( mouse.intersect );
          marker.copy(mouse.intersect);
        }

        if (mouse.button === 2) {
          ANI.insert(0, ANI.library.cam2vector(mouse.intersect, 2));
        }


      },
      mouseup:     function (event) { 

        mouse.down = false;
        mouse.button = NaN;

      },
      mousemove:   function (event) { 

        // TODO: not window
        mouse.x =   ( event.clientX / window.innerWidth )  * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

      },
      mouseenter:  function (event) { /* console.log('mouseenter') */ },
      mouseover:   function (event) { /* console.log('mouseover') */ },
      mouseleave:  function (event) { /* console.log('mouseleave') */ },
      mouseout:    function (event) { /* console.log('mouseout') */ },

      contextmenu: function (event) { /* console.log('contextmenu') */ },
      keydown:     function (event) { 

        console.log('IFC.keydown.in', `'${event.key}'`);

        var keys = {
          // ' ': () => doRender = !doRender,
        };

        if (keys[event.key]) {
          keys[event.key]();          
          console.log('IFC.keydown.done', `'${event.key}'`);
        }

      },

      touchstart:  function (event) { /* console.log('touchstart') */ },
      touchmove:   function (event) { /* console.log('touchmove') */ },
      touchend:    function (event) { /* console.log('touchend') */ },
      touchcancel: function (event) { /* console.log('touchcancel') */ },

      devicemotion:      function (event) { /* console.log('devicemotion', event)      */ },
      orientationchange: function (event) { console.log('orientationchange', event)       },
      deviceorientation: function (event) { /* console.log('deviceorientation', event) */ },

    },

    updateGlobe: function () {

      // https://stackoverflow.com/questions/13350875/three-js-width-of-view

      var 
        cam = SCN.camera,
        fov = cam.fov * Math.PI / 180,
        height = 2 * Math.tan( fov / 2 ) * cam.position.length(),
        fraction = CFG.earth.radius * 2 / height
      ;

      globe.pixels = screen.height * fraction;

      globe.scan = (
        globe.pixels > screen.diameter                              ? 1 : // big
        globe.pixels > screen.width || globe.pixels > screen.height ? 0 : // fits
          -1                                                              // tiny
      );

    },
    updateMouse: function () {

      var intersections, intersection, oldMouseOver = mouse.overGlobe;

      raycaster.setFromCamera( mouse, SCN.camera );
      intersections = raycaster.intersectObjects( [SCN.objects.pointer] );

      if (( intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null )) {
        mouse.intersect.copy(intersection.point).normalize();
        mouse.overGlobe = true;

      } else {
        mouse.overGlobe = false;

      }

      if (oldMouseOver !== mouse.overGlobe){
        if (mouse.overGlobe) {
          ANI.insert(0, ANI.library.scaleGLobe(1.0, 800));
          GUI.closed = true;
        } else {
          ANI.insert(0, ANI.library.scaleGLobe(0.94, 800));
          GUI.closed = false;
        }
      }

    },
    updateLabels: function () {

      var 
        cam = SCN.camera,
        convert = TOOLS.vector3toScreenXY,
        camDistance = cam.position.distanceTo(SCN.home),
        sunDistance = cam.position.distanceTo(SIM.vectorSun);

      if (camDistance < sunDistance) {
        SIM.vectorSun && self.updateLabel(labels.sun, {x: -1000, y: -1000});

      } else {
        SIM.vectorSun && self.updateLabel(labels.sun, convert(SIM.vectorSun, width, height));

      }

    },
    updateLabel: function (el, pos) {

      el.style.left = pos.x + 'px';
      el.style.top  = pos.y + 'px';

    },
    updatePanels: function () {

      var 
        cam    = SCN.camera.position,
        marker = SCN.objects.arrowHelper.cone.position,

      end;

      panels.latlon.innerHTML = (
        formatLatLon('C', vector3ToLatLong(cam)) + '<br>' + 
        formatLatLon('M', vector3ToLatLong(marker))
      );


    },




    takeScreenShot: function(){
      // https://developer.mozilla.org/en/DOM/window.open
      var f = self.getFrame('image/png');
      var opts = 'menubar=no,scrollbars=no,location=no,status=no,resizable=yes,innerHeight=' + (f.height/2) + ',innerWidth=' + (f.width/2);
      var win = window.open(f.url, 'screenshot', opts); 
      win.focus();
      console.log('win.open', win, opts);
    },   
    getFrame :  function(mimetype){ 

      var 
        cvs    = SCN.renderer.domElement,
        width  = cvs.width,
        height = cvs.height;

      return {
        width, 
        height,
        url: cvs.toDataURL(mimetype),
        num: SCN.frames, 
      }; 

    },

  };

}());