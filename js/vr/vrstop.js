/* 
vrStop
sSpace 2015
*/

STOP = function() {

	var parameters = ( function () {
		var parameters = {};
		var parts = window.location.search.substr( 1 ).split( '&' );
		for ( var i = 0; i < parts.length; i ++ ) {
			var parameter = parts[ i ].split( '=' );
			parameters[ parameter[ 0 ] ] = parameter[ 1 ];
		}
		return parameters;
	} )();


	var camera, scene, renderer;
	var controls, effect, vrEffect;
	var geometry, material, cube;
	var cursor;

	var src = {

		item: {

			stop: '../images/uikit/elmt_stop.svg'
		}

	};


	/*
	INIT
	--
	*/

	function init() {

		renderer = new THREE.WebGLRenderer( { alpha: true, antialiasing: true } );
		renderer.autoClear = false;
		renderer.sortObjects = false;
		renderer.setClearColor( 0x000000, 0 );

		var wip = document.querySelector('#wip');
		var render = renderer.domElement;

		wip.appendChild( render );
		hide( wip );

		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
		cursor = new VRCursor();

		cursor.ready.then(function() {
			scene.add(cursor.layout);
			cursor.init(renderer.domElement, camera, scene);
			cursor.enable();
		});

		setRenderMode(VRClient.renderModes.vr);

		effect.setSize( window.innerWidth, window.innerHeight );

		window.addEventListener( 'resize', onWindowResize, false );

		function setRenderMode(mode) {
			var modes = VRClient.renderModes;
			if (mode == modes.mono) {
				camera.position.z = 0.0001;
				controls = new THREE.OrbitControls( camera );
				controls.noZoom = true;
				effect = renderer;
				cursor.setMode('mono');
				cursor.hide();

			} else if (mode == modes.stereo) {
				controls = new THREE.DeviceOrientationControls( camera );
				effect = new THREE.StereoEffect( renderer );
				cursor.setMode('centered');
				cursor.disable();

			} else if (mode == modes.vr) {
				controls = new THREE.VRControls( camera );
				effect = new THREE.VREffect( renderer );
				cursor.setMode('centered');
				cursor.show();
			}

			effect.setSize( window.innerWidth, window.innerHeight );
		}

		// handle render mode changes from VR client and set appropriate renderer and control for mode.
		VRClient.onRenderModeChange = setRenderMode;

		VRClient.onZeroSensor = function() {
			controls.zeroSensor();
		}

		VRClient.onBlur = function() {
			cursor.disable();
		}

		VRClient.onFocus = function() {
			cursor.enable();
		}

		var light = new THREE.DirectionalLight( 0xffffff, 0.15 );
		light.position.set( 100, 110, 150 );
		scene.add( light );

		// Announce to Javris that everything is ready to go and we can reveal content.
		setTimeout(function() {
			VRClient.ready();
		}, 1000);

	}


	/*
	BUILD VRBOARD
	--
	*/

	function makeAlert() {

		//camera.position.set(0, 0, 0);

		// background
		var geometry = new THREE.SphereGeometry( 1000, 60, 60 );
		geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );
		var material = new THREE.MeshBasicMaterial( {
			color: 0xEE524B,
			tranparent: true,
			opacity: 0.9,
		});
		var bg = new THREE.Mesh( geometry, material );

		scene.add( bg );

		// alert
		function sop() {

			var item = makeItemLayout( src.item.stop, 86, 52, 0, 0, 0, 0, 0, 0 );

			var stop = new THREE.Mesh(
				new THREE.BoxGeometry( 86, 52, 0.1, 1, 1 ),
				new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false })
			);

			stop.add( item );

			stop.position.set( 0, 0, -40 );
			bend( stop, 60 );
			
			return menu;

		}

		scene.add( sop() );

	}


	/*
	LAUNCH
	--
	*/

	function onWindowResize() {

		var innerWidth = window.innerWidth;
		var innweHeight =  window.innerHeight;
		camera.aspect = innerWidth / innweHeight;
		camera.updateProjectionMatrix();

		effect.setSize( innerWidth, innweHeight );

	}


	function animate() {

		requestAnimationFrame( animate );
		render();
		TWEEN.update();

	}


	function render() {

		if ( controls ) {
			controls.update();
		}

		cursor.update();

		effect.render( scene, camera );

	}

	init();
	makeAlert();
	animate();

}