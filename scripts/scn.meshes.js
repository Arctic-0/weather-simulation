
SCN.Meshes = {

  calculate:  function (name, cfg) { return SCN.Meshes[name](cfg) },
  
  sector: function (cfg, callback) {

    /*
          + - + - +
          |       |
          +   +   +
          |       |
          + - + - +
    */

    var 
      MAX_RANGE = 1000,
      mesh, range, 
      reso      = cfg.resolution,
      geometry  = new THREE.BufferGeometry(),
      material  = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors }),
      mesh      = new THREE.Line( geometry, material ),
      positions = new Float32Array( MAX_RANGE * 3 ),
      colors    = new Float32Array( MAX_RANGE * 3 ),
      toVec3    = function (lat, lon) {
        return TOOLS.latLongToVector3(lat, lon, CFG.earth.radius, cfg.altitude);
      }
    ;

    geometry.addAttribute( 'color',    new THREE.BufferAttribute( colors,    3 ) );
    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

    updateSector(cfg.sector);

    mesh.updateSector = updateSector;

    return mesh;

    function updateSector (sector) {

      var 
        v3, 
        pos  = 0,
        lat0 = sector[0],
        lon0 = sector[1],
        lat1 = sector[2],
        lon1 = sector[3],
        width     = (Math.abs(lon1 - lon0) + 1) * reso,
        height    = (Math.abs(lat1 - lat0) + 1) * reso,
        lons      = TOOLS.flatten([
          H.linspace(lon0, lon1, width),
          H.linspace(lon1, lon1, height - 2),
          H.linspace(lon1, lon0, width),
          H.linspace(lon0, lon0, height - 2),
          [lon0]
        ]),
        lats      = TOOLS.flatten([
          H.linspace(lat0, lat0, width),
          H.linspace(lat0, lat1, height -2),
          H.linspace(lat1, lat1, width),
          H.linspace(lat1, lat0, height -2),
          [lat0]
        ])
      ;

      H.zip(lats, lons, (lat, lon) => {

        v3 = toVec3(lat, lon);

        positions[pos + 0] = v3.x;
        positions[pos + 1] = v3.y;
        positions[pos + 2] = v3.z;
        
        colors[pos + 0] = 0.9;
        colors[pos + 1] = 0.9;
        colors[pos + 2] = 0.3;
        
        pos += 3;

      });

      geometry.setDrawRange(0, lats.length);
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      geometry.computeBoundingSphere();

    }

    // function onBeforeRender () {

    // }

  },

  graticule: function (cfg, callback) {

    /*
          + - + - +
          |   |   |
          + - + - +
          |   |   |
          + - + - +
    */

    var 
      lats      = H.linspace(-180, 180, 37),
      lons      = H.linspace( -90,  90, 19),

      container = new THREE.Object3D(),

      gratGeo   = new THREE.Geometry(),
      gratMat   = new THREE.LineBasicMaterial(
        Object.assign(cfg.material, {
          //
        })
      ),
      
      graticule =  new THREE.LineSegments(gratGeo, gratMat),

      axisMat   = new THREE.LineBasicMaterial({color: 0xffffff}),
      axisGeo   = new THREE.Geometry(),
      axis      = new THREE.Line( axisGeo, axisMat ),

      pntrMat   = new THREE.LineBasicMaterial({color: 0xffff00}),
      pntrGeo   = new THREE.Geometry(),
      pntr      = new THREE.Line( pntrGeo, pntrMat ),
      pointer   = new THREE.Vector3(),

      sunMat    = new THREE.LineBasicMaterial({color: 0xff0000}),
      sunGeo    = new THREE.Geometry(),
      sun       = new THREE.Line( sunGeo, sunMat ),

      toVec3   = function (lat, lon) {
        return TOOLS.latLonRadToVector3(lat, lon, cfg.radius);
      }
    ;

    // calc parallels, 
    H.each(lats.slice(0, -1), (iLat, lat) => {
      H.each(lons.slice(0, -1), (iLon, lon) => {

        var 
          lat0 = lat,
          lat1 = lats[~~iLat + 1],
          lon0 = lon,
          lon1 = lons[~~iLon + 1],
          v1   = toVec3(lat0, lon0),
          v2   = toVec3(lat0, lon1),
          v3   = toVec3(lat0, lon0),
          v4   = toVec3(lat1, lon0);

      gratGeo.vertices.push(v1, v2, v3, v4);

      });
    });

    // earth rotation axis
    axisGeo.vertices.push(
      new THREE.Vector3( 0,  1.5, 0 ),
      new THREE.Vector3( 0, -1.5, 0 )
    );

    // mouse pointer
    pntrGeo.vertices.push(
      new THREE.Vector3( 0,    0, 0 ),
      new THREE.Vector3( 2,    2, 2 )
    );

    // sun pointer
    sunGeo.vertices.push(
      new THREE.Vector3( 0,    0, 0 ),
      new THREE.Vector3( 0,    0, 0 )
    );

    sun.name       = 'sun';
    pntr.name      = 'pointer';
    axis.name      = 'axis';
    graticule.name = 'graticule';

    container.add(sun, pntr, axis, graticule);

    graticule.onBeforeRender = function () {

      pointer.copy(IFC.pointer.intersect).normalize().multiplyScalar(1.2);

      pntrGeo.vertices[1] = pointer;
      pntrGeo.verticesNeedUpdate = true;

      sunGeo.vertices[1] = SIM.sunPosition;
      sunGeo.verticesNeedUpdate = true;

    };

    return container;

  },

};
