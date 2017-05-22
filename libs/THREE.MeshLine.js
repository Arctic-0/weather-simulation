;(function() {

  "use strict";

  var THREE = this.THREE

  function MeshLine() {

    this.counters  = [];
    this.geometry  = new THREE.BufferGeometry();
    this.indices   = [];
    this.next      = [];
    this.positions = [];
    this.previous  = [];
    this.side      = [];
    this.uvs       = [];
    this.width     = [];

    this.widthCallback = null;

  }

  MeshLine.prototype.setGeometry = function( g, callback ) {

    var j, v, c;

    this.widthCallback = callback;

    this.positions = [];
    this.counters  = [];

    if( g instanceof THREE.Geometry ) {
      for( j = 0; j < g.vertices.length; j++ ) {

        v = g.vertices[ j ];
        c = j / g.vertices.length;

        this.positions.push( v.x, v.y, v.z );
        this.positions.push( v.x, v.y, v.z );
        this.counters.push(c);
        this.counters.push(c);

      }
    }

    if( g instanceof THREE.BufferGeometry ) {
      // read attribute positions ?
    }

    if( g instanceof Float32Array || g instanceof Array ) {
      for( j = 0; j < g.length; j += 3 ) {
        c = j/g.length;
        this.positions.push( g[ j ], g[ j + 1 ], g[ j + 2 ] );
        this.positions.push( g[ j ], g[ j + 1 ], g[ j + 2 ] );
        this.counters.push(c);
        this.counters.push(c);
      }
    }

    this.process();

  }

  MeshLine.prototype.compareV3 = function( a, b ) {

    var aa = a * 6, ab = b * 6;

    return (
      ( this.positions[ aa     ] === this.positions[ ab     ] ) && 
      ( this.positions[ aa + 1 ] === this.positions[ ab + 1 ] ) && 
      ( this.positions[ aa + 2 ] === this.positions[ ab + 2 ] )
    );

  }

  MeshLine.prototype.copyV3 = function( a ) {

    var aa = a * 6;
    return [ this.positions[ aa ], this.positions[ aa + 1 ], this.positions[ aa + 2 ] ];

  }

  MeshLine.prototype.process = function() {

    var j, v, n, w, l = this.positions.length / 6;

    this.indices  = [];
    this.next     = [];
    this.previous = [];
    this.side     = [];
    this.uvs      = [];
    this.width    = [];

    for( j = 0; j < l; j++ ) {
      this.side.push(  1 );
      this.side.push( -1 );
    }

    for( j = 0; j < l; j++ ) {
      w = this.widthCallback ? this.widthCallback( j / ( l -1 ) ) : 1;
      this.width.push( w );
      this.width.push( w );
    }

    for( j = 0; j < l; j++ ) {
      this.uvs.push( j / ( l - 1 ), 0 );
      this.uvs.push( j / ( l - 1 ), 1 );
    }

    if( this.compareV3( 0, l - 1 ) ){
      v = this.copyV3( l - 2 );
    } else {
      v = this.copyV3( 0 );
    }

    this.previous.push( v[ 0 ], v[ 1 ], v[ 2 ] );
    this.previous.push( v[ 0 ], v[ 1 ], v[ 2 ] );

    for( j = 0; j < l - 1; j++ ) {
      v = this.copyV3( j );
      this.previous.push( v[ 0 ], v[ 1 ], v[ 2 ] );
      this.previous.push( v[ 0 ], v[ 1 ], v[ 2 ] );
    }

    for( j = 1; j < l; j++ ) {
      v = this.copyV3( j );
      this.next.push( v[ 0 ], v[ 1 ], v[ 2 ] );
      this.next.push( v[ 0 ], v[ 1 ], v[ 2 ] );
    }

    if( this.compareV3( l - 1, 0 ) ){
      v = this.copyV3( 1 );
    } else {
      v = this.copyV3( l - 1 );
    }

    this.next.push( v[ 0 ], v[ 1 ], v[ 2 ] );
    this.next.push( v[ 0 ], v[ 1 ], v[ 2 ] );

    for( j = 0; j < l - 1; j++ ) {
      n = j + j;
      this.indices.push( n, n + 1, n + 2 );
      this.indices.push( n + 2, n + 1, n + 3 );
    }

    if (!this.attributes) {
      this.attributes = {
        counters: new THREE.BufferAttribute( new Float32Array( this.counters ), 1 ),
        index:    new THREE.BufferAttribute( new Uint16Array(  this.indices ), 1 ),
        next:     new THREE.BufferAttribute( new Float32Array( this.next ), 3 ),
        position: new THREE.BufferAttribute( new Float32Array( this.positions ), 3 ),
        previous: new THREE.BufferAttribute( new Float32Array( this.previous ), 3 ),
        side:     new THREE.BufferAttribute( new Float32Array( this.side ), 1 ),
        uv:       new THREE.BufferAttribute( new Float32Array( this.uvs ), 2 ),
        width:    new THREE.BufferAttribute( new Float32Array( this.width ), 1 ),
      }

    } else {
      this.attributes.index.copyArray(   new Uint16Array( this.indices));
      this.attributes.next.copyArray(    new Float32Array(this.next));
      this.attributes.position.copyArray(new Float32Array(this.positions));
      this.attributes.previous.copyArray(new Float32Array(this.previous));
      this.attributes.side.copyArray(    new Float32Array(this.side));
      this.attributes.uv.copyArray(      new Float32Array(this.uvs));
      this.attributes.width.copyArray(   new Float32Array(this.width));

      [
        'index',
        'next',
        'position',
        'previous',
        'side',
        'uv',
        'width',
      ].forEach(attr => this.attributes[attr].needsUpdate = true);

     }

    this.geometry.addAttribute( 'counters', this.attributes.counters );
    this.geometry.addAttribute( 'next',     this.attributes.next );
    this.geometry.addAttribute( 'position', this.attributes.position );
    this.geometry.addAttribute( 'previous', this.attributes.previous );
    this.geometry.addAttribute( 'side',     this.attributes.side );
    this.geometry.addAttribute( 'uv',       this.attributes.uv );
    this.geometry.addAttribute( 'width',    this.attributes.width );

    this.geometry.setIndex( this.attributes.index );

  }

  function memcpy (src, srcOffset, dst, dstOffset, length) {

    var i

    src = src.subarray || src.slice ? src : src.buffer
    dst = dst.subarray || dst.slice ? dst : dst.buffer

    src = srcOffset ? src.subarray ?
    src.subarray(srcOffset, length && srcOffset + length) :
    src.slice(srcOffset, length && srcOffset + length) : src

    if (dst.set) {
      dst.set(src, dstOffset)
    } else {
      for (i=0; i<src.length; i++) {
        dst[i + dstOffset] = src[i]
      }
    }

    return dst
  }

  /**
   * Fast method to advance the line by one position.  The oldest position is removed.
   * @param position
   */
  MeshLine.prototype.advance = function(position) {

    var positions = this.attributes.position.array;
    var previous = this.attributes.previous.array;
    var next = this.attributes.next.array;
    var l = positions.length;

    // PREVIOUS
    memcpy( positions, 0, previous, 0, l );

    // POSITIONS
    memcpy( positions, 6, positions, 0, l - 6 );

    positions[l - 6] = position.x;
    positions[l - 5] = position.y;
    positions[l - 4] = position.z;
    positions[l - 3] = position.x;
    positions[l - 2] = position.y;
    positions[l - 1] = position.z;

      // NEXT
    memcpy( positions, 6, next, 0, l - 6 );

    next[l - 6]  = position.x;
    next[l - 5]  = position.y;
    next[l - 4]  = position.z;
    next[l - 3]  = position.x;
    next[l - 2]  = position.y;
    next[l - 1]  = position.z;

    this.attributes.position.needsUpdate = true;
    this.attributes.previous.needsUpdate = true;
    this.attributes.next.needsUpdate     = true;

  };

  // uniforms: a list of variables that are shared by both the vertex and the fragment shader.

  // http://stackoverflow.com/questions/21532197/shift-texture-on-sphere-three-js


  function MeshLineMaterial( parameters ) {

    var vertexShaderSource = [

      'precision highp float;',

      'attribute float counters;',
      'attribute float side;',
      'attribute float width;',
      'attribute vec2  uv;',
      'attribute vec3  next;',
      'attribute vec3  position;',
      'attribute vec3  previous;',

      'uniform mat4  projectionMatrix;',
      'uniform mat4  modelViewMatrix;',
      'uniform vec2  resolution;',
      'uniform float lineWidth;',
      'uniform vec3  color;',
      'uniform float opacity;',
      
      'varying vec2  vUV;',
      'varying vec4  vColor;',
      'varying float vCounters;',

      'vec2 fix( vec4 i, float aspect ) {',

      '    vec2 res = i.xy / i.w;',
      '    res.x *= aspect;',
      '    return res;',

      '}',

      'void main() {',

      '    vUV = uv;',
      '    vColor = vec4( color, opacity );',
      '    vCounters = counters;',

      '    float aspect = resolution.x / resolution.y;',

      '    mat4 m = projectionMatrix * modelViewMatrix;',

      '    vec4 finalPosition = m * vec4( position, 1.0 );',
      '    vec4 prevPos = m * vec4( previous, 1.0 );',
      '    vec4 nextPos = m * vec4( next, 1.0 );',

      '    vec2 currP = fix( finalPosition, aspect );',
      '    vec2 prevP = fix( prevPos, aspect );',
      '    vec2 nextP = fix( nextPos, aspect );',

      '    float w = 1.8 * lineWidth * width;',

      '    vec2 dir;',
      '    vec2 dir1;',
      '    vec2 dir2;',
      '    vec2 normal;',
      '    vec4 offset;',

      '    if      ( nextP == currP ) dir = normalize( currP - prevP );',
      '    else if ( prevP == currP ) dir = normalize( nextP - currP );',
      '    else {',
      '        dir1 = normalize( currP - prevP );',
      '        dir2 = normalize( nextP - currP );',
      '        dir  = normalize( dir1 + dir2 );',
      '    }',

      '    normal = vec2( -dir.y, dir.x );',
      '    normal.x /= aspect;',
      '    normal *= lineWidth * width;',

      '    offset = vec4( normal * side, 0.0, 1.0 );',
      '    finalPosition.xy += offset.xy;',

      '    gl_Position = finalPosition;',

      '}' 
    
    ];

    var fragmentShaderSource = [

      'precision mediump float;',

      'uniform sampler2D alphaMap;',
      'uniform vec2  repeat;',

      'uniform float pointer;',
      'uniform float section;',

      'varying vec2  vUV;',
      'varying vec4  vColor;',
      'varying float vCounters;',

      'void main() {',

      '    vec4  color   = vColor;',
      '    float counter = vCounters  ;',

      '    color.a *= texture2D( alphaMap, vUV * repeat ).a;',

      // '    if (counter > pointer ) color.a = 0.0;',
      // '    if (counter < (pointer - section) ) color.a = 0.0;',

      // '    if (counter > pointer )             discard;',
      // '    if (counter < (pointer - section) ) discard;',

      '    gl_FragColor    = color;',


      '}' 

    ];

    function check( v, d ) {
      return v === undefined ? d : v;
    }

    THREE.Material.call( this );

    parameters = parameters || {};

    this.alphaMap        = check( parameters.alphaMap,    null );
    this.color           = check( parameters.color,       new THREE.Color( 0xffffff ) );
    this.dashArray       = check( parameters.dashArray,   [] );
    this.lineWidth       = check( parameters.lineWidth,   1 );
    this.opacity         = check( parameters.opacity,     1 );
    this.repeat          = check( parameters.repeat,      new THREE.Vector2( 1, 1 ) );
    this.resolution      = check( parameters.resolution,  new THREE.Vector2( 1, 1 ) );

    this.head            = check( parameters.head,        0 );
    this.pointer         = check( parameters.pointer,        0 );
    this.section         = check( parameters.section,        0 );

    var material = new THREE.RawShaderMaterial( {
      uniforms:{
        lineWidth:        { type: 'f',  value: this.lineWidth },
        alphaMap:         { type: 't',  value: this.alphaMap },
        color:            { type: 'c',  value: this.color },
        opacity:          { type: 'f',  value: this.opacity },
        resolution:       { type: 'v2', value: this.resolution },
        repeat:           { type: 'v2', value: this.repeat },

        head:             { type: 'f',  value: this.head },
        pointer:          { type: 'f',  value: this.pointer },
        section:          { type: 'f',  value: this.section },

      },
      vertexShader:   vertexShaderSource.join( '\r\n' ),
      fragmentShader: fragmentShaderSource.join( '\r\n' )
    });

    delete parameters.lineWidth;
    delete parameters.alphaMap;
    delete parameters.color;
    delete parameters.opacity;
    delete parameters.resolution;
    delete parameters.repeat;

    delete parameters.head;
    delete parameters.pointer;
    delete parameters.section;

    material.type = 'MeshLineMaterial';

    // blending, depthTest, side, transparent
    material.setValues( parameters );

    return material;

  };

  MeshLineMaterial.prototype = Object.create( THREE.Material.prototype );
  MeshLineMaterial.prototype.constructor = MeshLineMaterial;

  MeshLineMaterial.prototype.copy = function ( source ) {

    THREE.Material.prototype.copy.call( this, source );

    this.alphaMap       = source.alphaMap;
    this.color.copy(      source.color );
    this.lineWidth      = source.lineWidth;
    this.opacity        = source.opacity;
    this.repeat.copy(     source.repeat );
    this.resolution.copy( source.resolution );

    return this;
  
  };

  window.MeshLine = MeshLine;
  window.MeshLineMaterial = MeshLineMaterial;

}).call(this);

