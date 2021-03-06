
'use strict'

try {

  (function () {

    var 
      fun = () => {},
      cvs = window.CanvasRenderingContext2D,
      wgl = (function () {
        var canvas = document.createElement( 'canvas' ); 
        var context = canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' );
        return context;
      }()),
      wrk = !!window.Worker,
      ex0 = true, // testing
      ex1 = wgl.getExtension('OES_texture_float'),
      ex2 = wgl.getExtension('OES_texture_float_linear'),
      tro = (function () {
        try {
          window.postMessage('', '*', [new Float32Array(4).buffer]);
          return true;
        } catch (e) {return false}
      }()),

      cleanup = (function () {
        // no edge
        wgl.getExtension('WEBGL_lose_context') && wgl.getExtension('WEBGL_lose_context').loseContext();
      } ()),

    end;

    const _systemEndianness = (() => {
      const b = new ArrayBuffer(4);
      const a = new Uint32Array(b);
      const c = new Uint8Array(b);
      a[0] = 0xdeadbeef;
      if (c[0] === 0xef) return 'LE';
      if (c[0] === 0xde) return 'BE';
      throw new Error('unknown endianness');
    })();


    // checking for float texture render support 
    function checkFloatSupport () {

      var 
        status, gl,
        renderer = new THREE.WebGLRenderer(),
        scene    = new THREE.Scene(),
        camera   = new THREE.PerspectiveCamera(),

        target = new THREE.WebGLRenderTarget(16, 16, {
          format: THREE.RGBAFormat,
          type: THREE.FloatType
        })
      ;

      renderer.render(scene, camera, target);
      gl = renderer.context;
      status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      gl.getExtension('WEBGL_lose_context').loseContext();

      return status === gl.FRAMEBUFFER_COMPLETE

    }


    if (!( fun && cvs && wgl && ex0 && ex1 && ex2 && wrk && tro /* && checkFloatSupport() */ )) {
      throw('FAILURE'); 
    }

  }())


} catch (e) {console.error('APP NOT SUPPORTED', e)}

// https://github.com/smali-kazmi/detect-mobile-browser


// https://stackoverflow.com/questions/4998278/is-there-a-limit-of-vertices-in-webgl
// GL_OES_element_index_uint max verices ?

// float supp: 
// https://github.com/mrdoob/three.js/issues/9628#issuecomment-245144478