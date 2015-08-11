/* 
vrMenu
sSpace 2015
*/

QA = function() {

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

	var clock = new THREE.Clock();
	var slow, quick;

	var vrboard = document.querySelector( '#vrBoard' );
	var vrmenu = document.querySelector( '#vrMenu' );
	var wip = document.querySelector( '#wip' );

	var card = [ '../src/card.mp3', '../src/card.ogg' ];
	var cardR = [ '../src/card_r.mp3', '../src/card_r.ogg' ];
	var item = [ '../src/item.mp3', '../src/item.ogg' ];

	var src = {

		item: {

			titlewr: '../images/menu/elmt_title.svg',
			app: '../images/menu/elmt_app.svg',
			sys: '../images/menu/elmt_sys.svg',
			vrbox: ' ../images/uikit/elmt_vrbox.svg',
			vrschedule: ' ../images/uikit/elmt_vrschedule.svg',
			vrtask: ' ../images/uikit/elmt_vrtask.svg',
			profil: '../images/uikit/elmt_profil.svg',
			perso: '../images/uikit/elmt_perso.svg',
			vrboard: '../images/uikit/elmt_vrboard.svg',
			leave: '../images/uikit/elmt_leave.svg',
			close: '../images/uikit/elmt_close.svg'
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

		var menu = document.querySelector('#vrMenu');
		var render = renderer.domElement;

		menu.appendChild( render );
		hide( menu );

		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
		cursor = new VRCursor();

		cursor.ready.then(function() {
			scene.add(cursor.layout);
			cursor.init(renderer.domElement, camera, scene);
			cursor.enable();
		});

		setRenderMode(VRClient.renderModes.mono);

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

	function makeMenu() {

		// background
		var geometry = new THREE.SphereGeometry( 1000, 60, 60 );
		geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );
		var material = new THREE.MeshBasicMaterial( {
			color: 0x333366,
			tranparent: true,
			opacity: 0.9,
		});
		var bg = new THREE.Mesh( geometry, material );

		scene.add( bg );

		// menu
		function quick() {

			var titlewr = makeItemLayout( src.item.titlewr, 116, 5, 0, -23.5, 0, 0, 0, 0 );
			var app = makeItemLayout( src.item.app, 15, 5.5, -50.5, 19.25, 0, 0, 0, 0 );
			var sys = makeItemLayout( src.item.sys, 15, 5.5, 24.5, 19.25, 0, 0, 0, 0 );

			var vrbox = makeItemLayout( src.item.vrbox, 16.5, 16, -33.75, 14, 0, 0, 0, 0);
			var vrschedule = makeItemLayout( src.item.vrschedule, 16.5, 16, -15.25, 14, 0, 0, 0, 0);
			var vrtask = makeItemLayout( src.item.vrtask, 16.5, 16, 3.25, 14, 0, 0, 0, 0);

			var edit = makeItemLayout( src.item.profil, 16.5, 16, 41.25, 14, 0, 0, 0, 0);
			var perso = makeItemLayout( src.item.perso, 16.5, 16, 41.25, -4, 0, 0, 0, 0);

			var vrboard = makeItemLayout( src.item.vrboard, 11, 14.5, -36.5, -9.75, 0, 0, 0, 0);
			var leave = makeItemLayout( src.item.leave, 11, 14.5, -21.5, -9.75, 0, 0, 0, 0);
			var close = makeItemLayout( src.item.close, 11, 14.5, -6.5, -9.75, 0, 0, 0, 0);


			var menu = new THREE.Mesh(
				new THREE.BoxGeometry( 116, 56, 0.1, 1, 1 ),
				new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false })
			);

			menu.add( titlewr, app, sys, vrbox, vrschedule, vrtask, edit, perso, vrboard, leave, close );

			menu.position.set( 0, 0, -40 );
			bend( menu, 60 );

			// var vrboxC = neoPos2( menu, vrbox );
			// var vrscheduleC = neoPos2( menu, vrschedule );
			// var vrtaskC = neoPos2( menu, vrtask );

			// var editC = neoPos2( menu, edit );
			// var persoC = neoPos2( menu, perso );

			// var vrboardC = neoPos2( menu, vrboard );
			// var leaveC = neoPos2( menu, leave );
			// var closeC = neoPos2( menu, close );

			// guides
			var vrboxC = guide( vrbox );
			var vrscheduleC = guide( vrschedule );
			var vrtaskC = guide( vrtask );

			var editC = guide( edit );
			var persoC = guide( perso );

			var vrboardC = guide( vrboard );
			var leaveC = guide( leave );
			var closeC = guide( close );
			vrtaskC.position.x += 0.5; vrtaskC.position.y -= 0.5; 
			closeC.position.x += 1; closeC.position.y -= 1;
			vrboxC.position.z -= 0.1;

			// events
			interaction( vrboxC, vrbox, 1.15, 250 );
			interaction( vrscheduleC, vrschedule, 1.15, 250 );
			interaction( vrtaskC, vrtask, 1.15, 250 );

			interaction( editC, edit, 1.15, 250 );
			interaction( persoC, perso, 1.15, 250 );

			interaction( vrboardC, vrboard, 1.15, 250 );
			interaction( leaveC, leave, 1.15, 250 );
			interaction( closeC, close, 1.15, 250 );

			vrboardC.addEventListener( 'click', function() {
				window.location = '/vrboard'
			});

			leaveC.addEventListener( 'click', function() {
				window.location = "/"
			});

			closeC.addEventListener( 'click', function() {
				hide( vrmenu )
			});

			error( vrboxC );
			error( vrscheduleC );
			error( vrtaskC );
			error( editC );
			error( persoC );

			function guide( child ) {

				var mesh = new THREE.Mesh( child.geometry,
					new THREE.MeshBasicMaterial({
						color: 0xffffff,
						transparent: true,
						opacity: 0
					})
				);

				mesh.position.set( child.position.x, child.position.y, -40.45 );
				scene.add( mesh );

				return mesh;

			}

			function interaction( guide, child, value, duration ) {

				guide.addEventListener( 'mouseover', function( e ) {

					new TWEEN.Tween( child.scale )
						.to( { x: value, y: value, z: 1 }, duration )
						.easing( TWEEN.Easing.Cubic.Out )
						.start();

				});

				guide.addEventListener( 'mouseout', function( e ) {

					new TWEEN.Tween( child.scale )
						.to( { x: 1, y: 1, z: 1 }, duration )
						.easing( TWEEN.Easing.Cubic.Out )
						.start();

				});

			}
			
			return menu;

		}

		scene.add( quick() );

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
		// oclock();
		TWEEN.update();

	}


	/* function oclock() {

		var delta = clock.getDelta();
		
		slow.update(delta);
		quick.update(delta);

	}*/


	function render() {

		if ( controls ) {
			controls.update();
		}

		cursor.update();

		effect.render( scene, camera );

	}

	init();
	makeMenu();
	animate();

}

QA();