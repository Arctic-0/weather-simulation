
SIM.Models.wind = (function () {

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
    latlon2color: function (datagramm, lat, lon) {

      var tmp2m = datagramm.tmp2m.linearXY(0, lat, lon) - 273.15;
      var col   = ~~self.clampScale(tmp2m, -40, +30, 0, 7);

      return new THREE.Color(self.colorTableAlpha(col, 1.0));

    },
    create: function (cfg, datagramm) {
      
      TIM.step('Model.wind.in');

      var t0 = Date.now(), i, j, u, v, width, speed, lat, lon, color, vec3, latlon, tmp2m,

        multiline, positions, widths, colors, seeds, 

        spherical = new THREE.Spherical(),
        length   = cfg.length,
        amount   = NaN,
        factor   = 0.0003,                       // TODO: proper Math
        alt      = cfg.radius - CFG.earth.radius,      // 0.001
        pool     = SIM.coordsPool.slice(cfg.amount * cfg.sim.sectors.length),

      end;

      H.each(cfg.sim.sectors, (_, sector)  => {

        seeds   = pool.filter(sector).slice(0, cfg.amount);
        amount  = seeds.length; 

        positions = new Array(amount).fill(0).map( () => []);
        colors    = new Array(amount).fill(0).map( () => []);
        widths    = new Array(amount).fill(0).map( () => []);

        for (i=0; i<amount; i++) {

          lat  = seeds[i].lat;
          lon  = seeds[i].lon;
          vec3 = self.convLL(lat, lon, alt);

          for (j=0; j<length; j++) {

            u = datagramm.ugrd10m.linearXY(0, lat, lon);
            v = datagramm.vgrd10m.linearXY(0, lat, lon);

            speed = Math.hypot(u, v);
            color = self.latlon2color(datagramm, lat, lon);
            width = self.clampScale(speed, 0, 30, 0.4, 1.4);

            positions[i].push(vec3);
            colors[i].push(color);
            widths[i].push(width);

            spherical.setFromVector3(vec3);
            spherical.theta += u * factor; // east-direction
            spherical.phi   -= v * factor; // north-direction
            vec3 = vec3.setFromSpherical(spherical).clone();
            
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