import{WebGLRenderer as te}from"./three.module.BEI3Xute.js";import{cp as A,d9 as se,N as ie,b0 as Q,ev as _,fm as D,fw as g,fG as y,bj as E,cO as re,Z as ae,_ as N,fx as d,d as oe,cq as le,eb as ne,a0 as ue,et as he,c9 as fe,eh as ce,W as pe,A as H,e as de,cK as me,aq as ge,es as Z,eu as ve,b3 as be,dd as xe,j as Te,dh as V,bi as _e,cy as U,aJ as k,fJ as Me,eH as B,c1 as Ce,bY as Se,T as we,eN as Re,eO as Pe,ck as W}from"./three.core.Bype9S9P.js";import{seedPoint3D as Ae}from"./lesionFrame.BLYQjSCO.js";const F={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class C{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const ye=new se(-1,1,1,-1,0,1);class Ee extends ie{constructor(){super(),this.setAttribute("position",new Q([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Q([0,2,0,0,2,0],2))}}const Be=new Ee;class z{constructor(e){this._mesh=new A(Be,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,ye)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class Fe extends C{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof _?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=D.clone(e.uniforms),this.material=new _({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new z(this.material)}render(e,t,s){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=s.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class X extends C{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,s){const r=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let a,f;this.inverse?(a=0,f=1):(a=1,f=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),i.buffers.stencil.setFunc(r.ALWAYS,a,4294967295),i.buffers.stencil.setClear(f),i.buffers.stencil.setLocked(!0),e.setRenderTarget(s),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(r.EQUAL,1,4294967295),i.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),i.buffers.stencil.setLocked(!0)}}class De extends C{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class Ne{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const s=e.getSize(new g);this._width=s.width,this._height=s.height,t=new y(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:E}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Fe(F),this.copyPass.material.blending=re,this.clock=new ae}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const t=this.renderer.getRenderTarget();let s=!1;for(let r=0,i=this.passes.length;r<i;r++){const a=this.passes[r];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(r),a.render(this.renderer,this.writeBuffer,this.readBuffer,e,s),a.needsSwap){if(s){const f=this.renderer.getContext(),h=this.renderer.state.buffers.stencil;h.setFunc(f.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),h.setFunc(f.EQUAL,1,4294967295)}this.swapBuffers()}X!==void 0&&(a instanceof X?s=!0:a instanceof De&&(s=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new g);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const s=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(s,r),this.renderTarget2.setSize(s,r);for(let i=0;i<this.passes.length;i++)this.passes[i].setSize(s,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class Ue extends C{constructor(e,t,s=null,r=null,i=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=s,this.clearColor=r,this.clearAlpha=i,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new N}render(e,t,s){const r=e.autoClear;e.autoClear=!1;let i,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:s),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=r}}const ze={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new N(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class M extends C{constructor(e,t=1,s,r){super(),this.strength=t,this.radius=s,this.threshold=r,this.resolution=e!==void 0?new g(e.x,e.y):new g(256,256),this.clearColor=new N(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new y(i,a,{type:E}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let m=0;m<this.nMips;m++){const T=new y(i,a,{type:E});T.texture.name="UnrealBloomPass.h"+m,T.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(T);const b=new y(i,a,{type:E});b.texture.name="UnrealBloomPass.v"+m,b.texture.generateMipmaps=!1,this.renderTargetsVertical.push(b),i=Math.round(i/2),a=Math.round(a/2)}const f=ze;this.highPassUniforms=D.clone(f.uniforms),this.highPassUniforms.luminosityThreshold.value=r,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new _({uniforms:this.highPassUniforms,vertexShader:f.vertexShader,fragmentShader:f.fragmentShader}),this.separableBlurMaterials=[];const h=[6,10,14,18,22];i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let m=0;m<this.nMips;m++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(h[m])),this.separableBlurMaterials[m].uniforms.invSize.value=new g(1/i,1/a),i=Math.round(i/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const w=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=w,this.bloomTintColors=[new d(1,1,1),new d(1,1,1),new d(1,1,1),new d(1,1,1),new d(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=D.clone(F.uniforms),this.blendMaterial=new _({uniforms:this.copyUniforms,vertexShader:F.vertexShader,fragmentShader:F.fragmentShader,premultipliedAlpha:!0,blending:oe,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new N,this._oldClearAlpha=1,this._basic=new le,this._fsQuad=new z(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let s=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(s,r);for(let i=0;i<this.nMips;i++)this.renderTargetsHorizontal[i].setSize(s,r),this.renderTargetsVertical[i].setSize(s,r),this.separableBlurMaterials[i].uniforms.invSize.value=new g(1/s,1/r),s=Math.round(s/2),r=Math.round(r/2)}render(e,t,s,r,i){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();const a=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),i&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=s.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=s.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let f=this.renderTargetBright;for(let h=0;h<this.nMips;h++)this._fsQuad.material=this.separableBlurMaterials[h],this.separableBlurMaterials[h].uniforms.colorTexture.value=f.texture,this.separableBlurMaterials[h].uniforms.direction.value=M.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[h]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[h].uniforms.colorTexture.value=this.renderTargetsHorizontal[h].texture,this.separableBlurMaterials[h].uniforms.direction.value=M.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[h]),e.clear(),this._fsQuad.render(e),f=this.renderTargetsVertical[h];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,i&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(s),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=a}_getSeparableBlurMaterial(e){const t=[],s=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(s*s))/s);return new _({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new g(.5,.5)},direction:{value:new g(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {

					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;

					for ( int i = 1; i < KERNEL_RADIUS; i ++ ) {

						float x = float( i );
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * w;

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new _({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}}M.BlurDirectionX=new g(1,0);M.BlurDirectionY=new g(0,1);const P={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class Le extends C{constructor(){super(),this.isOutputPass=!0,this.uniforms=D.clone(P.uniforms),this.material=new ne({name:P.name,uniforms:this.uniforms,vertexShader:P.vertexShader,fragmentShader:P.fragmentShader}),this._fsQuad=new z(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,s){this.uniforms.tDiffuse.value=s.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},ue.getTransfer(this._outputColorSpace)===he&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===fe?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===ce?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===pe?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===H?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===de?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===me?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===ge&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}const l={RX:1.5,RY:1.15,RZ:1.7};function L(o){return 1-.17*o}function Oe(){return document.documentElement.classList.contains("reading")}function Ge(o,e){const t=document.createElement("canvas");t.width=192,t.height=96;const s=t.getContext("2d"),r=document.documentElement.classList.contains("a11y-dyslexia");s.clearRect(0,0,t.width,t.height),s.fillStyle="rgba(5, 8, 15, 0.66)",s.strokeStyle="rgba(127, 183, 204, 0.4)",s.lineWidth=3,s.beginPath(),s.roundRect(28,28,136,40,8),s.fill(),s.stroke(),s.font=r?"700 26px Arial, sans-serif":"700 26px JetBrains Mono, monospace",s.textAlign="center",s.textBaseline="middle",s.fillStyle=e,s.fillText(o,96,49);const i=new we(t);i.colorSpace=Z;const a=new Re(new Pe({map:i,transparent:!0,opacity:.92,depthTest:!1}));return a.scale.set(.9,.45,1),a.renderOrder=30,a}function Ie(){const o=new B(1,56,40),e=o.attributes.position,t=new d;for(let s=0;s<e.count;s+=1){t.fromBufferAttribute(e,s);const r=t.z,i=L(r);t.x*=l.RX*i,t.y*=l.RY*i,t.z*=l.RZ,e.setXYZ(s,t.x,t.y,t.z)}return o.computeVertexNormals(),o}function Xe(o){const e=o*2-1,t=Math.sqrt(Math.max(0,1-e*e)),s=L(e);return{rx:l.RX*t*s,ry:l.RY*t*s,zNorm:e}}function He(o){return(o*2-1)*l.RZ}function Ze(o){return W.clamp((o/l.RZ+1)/2,0,1)}function We(o){return(o*2-1)*l.RX}function Ye(o){return W.clamp((o/l.RX+1)/2,0,1)}function je(o){const e=o*2-1,t=Math.sqrt(Math.max(0,1-e*e));return{ry:l.RY*t,rz:l.RZ*t,xNorm:e}}function Ke(o){const e=new te({canvas:o,antialias:!0,alpha:!0,powerPreference:"high-performance"});e.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),e.setClearColor(329743,0),e.outputColorSpace=Z,e.toneMapping=H,e.toneMappingExposure=1.15;const t=new ve;t.fog=new be(329743,.05);const s=new xe(42,1,.05,100);s.position.set(0,l.RZ*.55,l.RZ*3.5),s.lookAt(0,0,0),t.add(new Te(2767434,.8));const r=new V(4843263,1.25,40);r.position.set(4,6,8),t.add(r);const i=new V(16742997,.55,40);i.position.set(-6,-3,5),t.add(i);const a=new _e;t.add(a);const f=Ie(),h=new A(f,new U({color:2078408,transparent:!0,opacity:Oe()?.2:.17,roughness:.5,metalness:.02,side:k,depthWrite:!1}));a.add(h);const w=new Me(new B(1,22,14)),m=new Ce(w,new Se({color:3659519,transparent:!0,opacity:.16,depthWrite:!1}));m.scale.set(l.RX,l.RY,l.RZ);{const u=w.attributes.position,n=new d;for(let c=0;c<u.count;c+=1){n.fromBufferAttribute(u,c);const p=L(n.z);u.setXYZ(c,n.x*p,n.y*p,n.z)}m.scale.set(l.RX,l.RY,l.RZ)}a.add(m);const T=new A(new B(1,28,18),new U({color:10405872,transparent:!0,opacity:.12,roughness:.6,side:k,depthWrite:!1}));T.scale.set(l.RX*.5,l.RY*.5,l.RZ*.6),a.add(T);const b=[],Y=[["APEX",new d(0,0,l.RZ+.4),"#9fe7ff"],["BASE",new d(0,0,-l.RZ-.4),"#7fb7cc"],["ANT",new d(0,l.RY+.36,0),"#5b7488"],["POST",new d(0,-l.RY-.36,0),"#5b7488"],["L",new d(l.RX+.34,0,0),"#9fe7ff"],["R",new d(-l.RX-.34,0,0),"#9fe7ff"]];for(const[u,n,c]of Y){const p=Ge(u,c);p.position.copy(n),p.userData.label=u,a.add(p),b.push(p)}const x=new A(new B(.2,20,16),new U({color:16734780,emissive:16726831,emissiveIntensity:1.6,roughness:.4}));x.visible=!1,a.add(x);let v=null,S=null;try{v=new Ne(e),v.addPass(new Ue(t,s)),S=new M(new g(1,1),.72,.5,.62),v.addPass(S),v.addPass(new Le)}catch{v=null,S=null}function j(u){if(!u)return x.visible=!1,new d;const n=Ae(u,l);return x.position.set(n.x,n.y,n.z),x.visible=!0,x.position.clone()}function K(u){for(const n of b)n.visible=(u||n.userData.label==="ANT"||n.userData.label==="POST",u);for(const n of b)n.visible=u}function q(u,n){const c=Math.max(1,Math.floor(u)),p=Math.max(1,Math.floor(n));e.setSize(c,p,!1),s.aspect=c/p,s.updateProjectionMatrix(),v?.setSize(c,p),S?.setSize(c,p)}function J(){v?v.render():e.render(t,s)}function $(){t.traverse(u=>{const n=u,c=u,p=u,O=n.geometry||c.geometry;O&&O.dispose();const R=n.material||c.material||p.material,ee=Array.isArray(R)?R:R?[R]:[];for(const G of ee){const I=G.map;I&&I.dispose(),G.dispose()}}),v?.dispose?.(),e.dispose()}return{renderer:e,scene:t,camera:s,group:a,lesion:x,bloomPass:S,labels:b,setLesion:j,setLabelsVisible:K,resize:q,render:J,dispose:$,GLAND:l}}export{l as GLAND,Ke as createGlandStage,Xe as crossSectionAt,Ze as fractionForZ,je as sagittalCrossSectionAt,Ye as sideForX,We as xForSide,He as zForFraction};
