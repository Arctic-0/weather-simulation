
'use strict';

SIM.Model.wind = (function () {

  var 
    self,     
    model = {
      obj:     new THREE.Object3D(),
      sectors: [],
      step:   function () {
        H.each(model.sectors, (_, sec) => sec.step() )
      },
    };

  return self = {
    convLL: function (lat, lon, alt) {return TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, alt); },
    convV3: function (v3, alt) { return TOOLS.vector3ToLatLong(v3, CFG.earth.radius + alt); },
    clampScale: function (x, xMin, xMax, min, max) {
        var val= (max-min)*(x-xMin)/(xMax-xMin)+min;
        return val < min ? min : val > max ? max : val;
    },
    colorTableAlpha: function (c, alpha){
        return (
            c === 0 ? 'rgba(170, 102, 170, ' + alpha + ')' :
            c === 1 ? 'rgba(206, 155, 229, ' + alpha + ')' :
            c === 2 ? 'rgba(108, 206, 226, ' + alpha + ')' :
            c === 3 ? 'rgba(108, 239, 108, ' + alpha + ')' :
            c === 4 ? 'rgba(237, 249, 108, ' + alpha + ')' :
            c === 5 ? 'rgba(251, 202,  98, ' + alpha + ')' :
            c === 6 ? 'rgba(251, 101,  78, ' + alpha + ')' :
            c === 7 ? 'rgba(204,  64,  64, ' + alpha + ')' :
                'black'
        );
    },
    create: function (cfg, datagramm) {
      
      TIM.step('Model.wind.in');

      var t0 = Date.now(), i, j, lat, lon, col, vec3, latlon, tmp2m,

        multiline, positions, widths, colors, latlonsStart, 

        radius    = CFG.earth.radius, 
        spherical = new THREE.Spherical(),

        length = TRAIL_LEN,
        amount = TRAIL_NUM,
        factor = 0.0003,                       // TODO: proper Math
        alt    = cfg.radius - radius,      // 0.001

      end;

      H.each(cfg.sim.sectors, (_, sector)  => {

        latlonsStart = TOOLS.createLatLonsSectorRandom(sector, amount); 

        positions = new Array(amount).fill(0).map( () => []);
        colors    = new Array(amount).fill(0).map( () => []);
        widths    = new Array(amount).fill(0).map( () => []);

        for (i=0; i<amount; i++) {

          lat   = latlonsStart[i][0];
          lon   = latlonsStart[i][1];

          for (j=0; j<length; j++) {

            vec3 = self.convLL(lat, lon, alt);

            tmp2m = datagramm.tmp2m.linearXY(0, lat, lon) - 273.15;
            col = ~~self.clampScale(tmp2m, -40, +30, 0, 7);
            col = self.colorTableAlpha(col, 1.0);

            positions[i].push(vec3);
            colors[i].push(new THREE.Color(col));
            widths[i].push(1.0);

            spherical.setFromVector3(vec3);
            spherical.theta += datagramm.ugrd10m.linearXY(0, lat, lon) * factor; // east-direction
            spherical.phi   -= datagramm.vgrd10m.linearXY(0, lat, lon) * factor; // north-direction
            vec3.setFromSpherical(spherical).clone();
            
            latlon = self.convV3(vec3, alt);
            lat = latlon.lat;
            lon = latlon.lon;

          }

        }

        multiline = new Multiline (
          positions, 
          colors, 
          widths, 
          cfg
        );

        model.obj.add(multiline.mesh);
        model.sectors.push(multiline);

      });

      TIM.step('Model.wind.out');

      return model;

    },
  };


}());