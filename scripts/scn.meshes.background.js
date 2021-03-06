
SCN.Meshes.background = function (name, cfg, callback) {

  var
    geometry     = new THREE.PlaneBufferGeometry( 1, 1, 1, 1),

    vertexShader = `

      attribute vec3 colors;

      varying   vec2 vUv;  
      varying   vec3 vColor;  

      void main() {
        vUv         = uv;
        vColor      = colors;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `,

    fragmentShader = `

      // Note that for mobiles you'll probably want to replace this by mediump since highp might be slower.

      // precision highp int;
      // precision highp float;

      varying vec3 vColor;  

      uniform float opacity;

      void main() {
        gl_FragColor = vec4(vColor, opacity);
      }
    `,

    material = new THREE.ShaderMaterial( {
      fragmentShader,
      vertexShader,
      uniforms: {
        opacity: {type: 'f', value: 0.999}
      }
    }),

    plane = new THREE.Mesh( geometry, material ),

    updateColors = function (colors) {

      // 0, 1
      // 2, 3

      var 
        pointer = 0, 
        target  = geometry.attributes.colors.array,
        color   = new THREE.Color()
      ;

      colors.forEach( (col) => {

        color.set(col);

        target[pointer++] = color.r;
        target[pointer++] = color.g;
        target[pointer++] = color.b;

      });

      geometry.attributes.colors.needsUpdate = true;

    },
    
    updatePosition = function () {


      var 
        camera = SCN.camera,
        aspect = IFC.geometry.aspect,
        fov    = camera.fov * PI / 180,
        height = 2 * Math.tan(fov / 2) * camera.radius + 2,
        width  = height * aspect,
        factor = 1 / SCN.scene.scale.x
      ;

      plane.position.copy(camera.position.clone().negate().normalize().multiplyScalar(2));
      plane.lookAt(camera.position);
      plane.scale.set(width * factor, height * factor, 1);

    }

  ;

  geometry.addAttribute( 'colors', new THREE.BufferAttribute( new Float32Array( 12 ), 3 ));

  updateColors(cfg.colors);

  plane.updateColors   = updateColors;
  plane.updatePosition = updatePosition;

  callback(name, plane);

};
