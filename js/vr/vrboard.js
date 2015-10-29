/* 
vrBoard
sSpace 2015
*/

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
var icons;
var iconsArray = [];
var userHeight = -1.65;

var clock = new THREE.Clock();
var slow, quick;

var vrboard = document.querySelector( '#vrBoard' );
var vrmenu = document.querySelector( '#vrMenu' );
var wip = document.querySelector( '#wip' );

var particles = [];
var card = [ '../src/card.mp3', '../src/card.ogg' ];
var cardR = [ '../src/card_r.mp3', '../src/card_r.ogg' ];
var item = [ '../src/item.mp3', '../src/item.ogg' ];

var vraiia = {

	bg: {
		bydefault: '../images/uikit/iso_field_1.svg',
		fill: '../images/uikit/iso_field_2.svg',
		test: '../images/uikit/test.jpg',
		louvre: '../images/uikit/louvre.jpg',
		puy: '../images/uikit/puydesancy.jpg',
		strie: '../images/uikit/iso_field_3.svg',
		tintamarre: '../images/uikit/tintamarre.jpg'
	},

	cosmos: {
		bydefault: '../images/vrboard/cosmos.png',
		here: '../images/vrboard/elmt_here.svg'
	},

	welcome: {
		bydefault: '../images/vrboard/elmt_welcome.svg'
	},

	profil: {
		bydefault: '../images/vrboard/elmt_profil.svg'
	},

	clock: {
		minutes: '../images/vrboard/elmt_minutes_sprt.svg',
		seconds: '../images/vrboard/elmt_seconds_sprt.svg',
		oclock: '../images/vrboard/elmt_hrs_date.svg'
	},

	navigation: {
		menu: '../images/vrboard/elmt_bouton_menu.svg',
		leave: '../images/vrboard/elmt_bouton_leave.svg'
	},

	controls: {
		bydefault: '../images/uikit/elmt_controls.svg'
	},

	post: {
		wrap: '../images/vrboard/elmt_wr_pst.svg',
		add: '../images/vrboard/elmt_ajt_pst.svg',
		del: '../images/vrboard/elmt_rtr_pst.svg',
		pstDefault1: '../images/vrboard/elmt_pst_1.svg',
		pstDefault2: '../images/vrboard/elmt_pst_2.svg',
		micro: '../images/vrboard/elmt_micro_pst.svg'
	},

	system: {
		wrap: '../images/vrboard/elmt_wr_sys.svg',
		profil: '../images/uikit/elmt_profil.svg',
		perso: '../images/uikit/elmt_perso.svg',
		about: '../images/uikit/elmt_about.svg',
		help: '../images/uikit/elmt_help.svg'
	},

	box: {
		mail1: '../images/vrboard/elmt_wr_vrbox_1.svg',
		mail2: '../images/vrboard/elmt_wr_vrbox_2.svg',
		mail3: '../images/vrboard/elmt_wr_vrbox_3.svg',
		mail4: '../images/vrboard/elmt_wr_vrbox_4.svg',
		archiv: '../images/vrboard/elmt_archive_vrbox.svg',
		adjourn: '../images/vrboard/elmt_adjourn_vrbox.svg',
		spam: '../images/vrboard/elmt_spam_vrbox.svg',
		plus: '../images/vrboard/elmt_plus_vrbox.svg',
	},

	schedule: {
		wrap: '../images/vrboard/elmt_wr_vrschedule.svg',
		plus: '../images/vrboard/elmt_plus_vrschedule.svg',
		marker: '../images/vrboard/elmt_mark_vrschedule.svg'
	},

	task: {
		wrap: '../images/vrboard/elmt_wr_vrtask.svg',
		plus: '../images/vrboard/elmt_plus_vrschedule.svg',
		ok: '../images/vrboard/elmt_checkok_vrtask.svg',
		ko: '../images/vrboard/elmt_checko_vrtask.svg',
		active1: '../images/vrboard/elmt_vrtask_1.svg',
		active2: '../images/vrboard/elmt_vrtask_2.svg',
		active3: '../images/vrboard/elmt_vrtask_3.svg',
		inactive1: '../images/vrboard/elmt_vrtask_1_inactive.svg',
		inactive2: '../images/vrboard/elmt_vrtask_2_inactive.svg',
		inactive3: '../images/vrboard/elmt_vrtask_3_inactive.svg'
	}

};


/*
INIT
--
*/


function init() {

	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
	renderer.autoClear = false;
	renderer.setClearColor( 0x000000 );

	var vrboard = document.querySelector('#vrBoard');
	var render = renderer.domElement;

	vrboard.appendChild( render );
	hide( vrboard );

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
			// controls = new THREE.DeviceOrientationControls( camera );
			controls = new THREE.VRControls( camera );
			effect = new THREE.StereoEffect( renderer );
			//cursor.setMode('centered');
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

function makeVRBoard() {

	// background
	// scene.fog = new THREE.Fog( 0x6ab5db, 30, 300 );
	var geometry = new THREE.SphereGeometry( 6000, 60, 60 );
	var material = new THREE.MeshBasicMaterial( {
		color: 0xffffff,
	});

	var bg = new THREE.Mesh( geometry, material );
	scene.add( bg );

	makeParticles();


	// cosmos
	var cosmos = makeCylinderLayout( vraiia.cosmos.bydefault, 360, 1, THREE.NormalBlending);
	cosmos.position.set( 0, 30, 0 );
	scene.add( cosmos );


	// here
	var loc = makeItemLayout( vraiia.cosmos.here, 59.3, 21.8, 0, 0, 0, 0, 0, 0 );

	var here = new THREE.Mesh(
		new THREE.BoxGeometry( 59.3, 21.8, 0.1, 1, 1 ),
		new THREE.MeshBasicMaterial({ color: 0xffffff, transparent:true, opacity: 0, depthTest: false})
	);

	here.add( loc );
	here.position.set( -50, 85, -90 );
	here.rotation.set(0, Math.radians( 30 ), 0 );
	bend( here, 50 );

	scene.add( here );


	// profil
	function profil() {

		var avatar = makeItemLayout( vraiia.profil.bydefault, 41, 8, 0, 0, 1, 0, 0, 0 );

		var profil = new THREE.Mesh(
			new THREE.BoxGeometry( 52, 8, 0.1, 1, 1 ),
			new THREE.MeshBasicMaterial({ color: 0xffffff, transparent:true, opacity: 0, depthTest: false})
		);

		profil.add( avatar );

		profil.position.set( -43.3, 34, -25 );
		profil.rotation.set( 0, Math.radians( 60 ), 0 );

		// events
		makeInteraction( profil, -43.3, -25, 250 );

		/*profil.addEventListener( 'mouseover', function(){
			VRSound( card, 'swooch' );
		});

		profil.addEventListener( 'mouseout', function(){
			VRSound( cardR, 'swoochR' );
		})*/

		error( profil );

		return profil;
	}


	// time
	function time() {

		var minutesTexture = new THREE.ImageUtils.loadTexture( vraiia.clock.minutes );
		var secondsTexture = new THREE.ImageUtils.loadTexture( vraiia.clock.seconds );

		slow = new textureAnimator( minutesTexture, 60, 1, 60, 60);
		quick = new textureAnimator( secondsTexture, 24, 1, 24, 2.5);

		var minutes = new THREE.Mesh(
			new THREE.PlaneGeometry( 8, 8, 20, 1 ),
			new THREE.MeshBasicMaterial({
				transparent: true, 
				opacity: 1, 
				side: THREE.DoubleSide, 
				map: minutesTexture
			})
		);

		var seconds = new THREE.Mesh(
			new THREE.PlaneGeometry( 8, 8, 20, 1 ),
			new THREE.MeshBasicMaterial({
				transparent: true, 
				opacity: 1, 
				side: THREE.DoubleSide, 
				map: secondsTexture
			})
		);

		var clock = new THREE.Mesh(
			new THREE.PlaneGeometry( 17, 8, 20, 1 ),
			new THREE.MeshBasicMaterial({
				transparent: true, 
				opacity: 1, 
				side: THREE.DoubleSide, 
				map: THREE.ImageUtils.loadTexture( vraiia.clock.oclock )
			})
		);

		minutes.position.set( -23.5, 0, 1 );
		seconds.position.set( -13.5, 0, 1 );
		clock.position.set( 19.5, 0, 1 );

		var time = new THREE.Mesh(
			new THREE.BoxGeometry( 56, 8, 0.1, 1, 1 ),
			new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false})
		);

		time.add( minutes, seconds, clock );

		time.position.set( 47.3, 34, -16.3 );
		time.rotation.set( 0, Math.radians( -71 ), 0 );

		// events
		makeInteraction( time, 47.3, -16.3, 250 );

		/*time.addEventListener( 'mouseover', function(){
			VRSound( card, 'swooch' );
		});

		time.addEventListener( 'mouseout', function(){
			VRSound( cardR, 'swoochR' );
		})*/

		error( time );

		return time;

	}


	// navigation
	function navigation() {

		var menu = makeItemLayout ( vraiia.navigation.menu, 8, 8, -5, 0, 1, 0, 0, 0);
		var leave = makeItemLayout( vraiia.navigation.leave, 8, 8, 5, 0, 1, 0, 0, 0);

		var navigation = new THREE.Mesh(
			new THREE.BoxGeometry( 18, 8, 0.1, 1, 1 ),
			new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false })
		);

		navigation.add( menu, leave );

		navigation.position.set( 0, 34, -50 );
		navigation.updateMatrixWorld;
		// bend( navigation, 30 );

		// guides
		menuC = neoPos( navigation, menu );
		leaveC = neoPos( navigation, leave );

		// events
		makeInteraction( navigation, 0, -50, 250 );
		makeInteractionItem( navigation, menu, 1.25, menuC, 0, -50, 250 );
		makeInteractionItem( navigation, leave, 1.25, leaveC, 0, -50, 250 );

		leaveC.addEventListener( 'click', function() {
			window.location = '/';
		});

		menuC.addEventListener( 'click', function() {
			show( vrmenu );	
		})

		return navigation;

	}
	
	
	// welcome
	function welcome() {

		var controls = makeItemLayout( vraiia.welcome.bydefault, 56, 52, 0, 0, 1, 0, 0, 0 );

		var welcome = new THREE.Mesh(
			new THREE.BoxGeometry( 56, 52, 0.1, 1, 1 ),
			new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false })
		)

		welcome.add( controls );

		welcome.position.set( 0, 0, -50 );
		// bend( welcome, 60 );
		
		// events
		makeInteraction( welcome, 0, -50, 250 );

		/*welcome.addEventListener( 'mouseover', function(){
			VRSound( card, 'swooch' );
		});

		welcome.addEventListener( 'mouseout', function(){
			VRSound( cardR, 'swoochR' );
		})*/
		
		return welcome;

	}


	// controls
	function controls() {

		var buttons = makeItemLayout( vraiia.controls.bydefault, 176, 10.1, 0, 0, 0, 0, 0, 0 );

		var controls = new THREE.Mesh(
			new THREE.BoxGeometry( 176, 10.1, 0.1, 1, 1 ),
			new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false })
		)

		controls.add( buttons );

		controls.position.set( 0, -35, -50 );

		bend( controls, 50 );

		return controls;

	}


	// post-it
	function postIt() {

		var wrap = makeItemLayout( vraiia.post.wrap, 56, 47, 0, 2.5, 0, 0, 0, 0 );
		var add = makeItemLayout( vraiia.post.add, 28, 5, -14, -23.5, 0, 0, 0, 0 );
		var del = makeItemLayout( vraiia.post.del, 28, 5, 14, -23.5, 0, 0, 0, 0 );
		var pst1 = makeItemLayout( vraiia.post.pstDefault1, 24, 17.25, -13, 14, 1, 0, 0, 0 );

		var message = makeItemLayout( vraiia.post.pstDefault2, 24, 17, 0, 2.5, 1, 0, 0, 0 );
		var micro = makeItemLayout( vraiia.post.micro, 24, 5, 0, -8.5, 1, 0, 0, 0 );

		var pst2 = new THREE.Mesh(
			new THREE.BoxGeometry( 24, 22, 0.1, 1, 1 ),
			new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false })
		);

		pst2.add( message );
		pst2.add( micro );
		pst2.position.set( 12.5, 11, 1 );

		var postIt = new THREE.Mesh(
			new THREE.BoxGeometry( 56, 52, 0.1, 1, 1 ),
			new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false })
		);

		postIt.add( wrap, add, del, pst1, pst2 );

		postIt.position.set( 47.3, 0, -16.3 );
		postIt.rotation.set( 0, Math.radians( -71 ), 0 );
		// bend( postIt, 60 )

		// guides
		addC = neoPos( postIt, add );
		delC = neoPos( postIt, del );

		pst1C = neoPos( postIt, pst1 );
		pst2C = neoPos( postIt, pst2 );

		// event
		makeInteraction( postIt, 47.3, -16.3, 250 );

		makeInteractionItem( postIt, pst1, 1.1, pst1C, 47.3, -16.3, 250 );
		makeInteractionItem( postIt, pst2, 1.1, pst2C, 47.3, -16.3, 250 );	

		makeInteractionButton( postIt, add, addC, 47.3, -16.3, 250);
		makeInteractionButton( postIt, del, delC, 47.3, -16.3, 250);

		error( addC );
		error( delC );
		error( pst1C );
		error( pst2C );

		return postIt;

	}


	// system
	function system() {

		// background
		var background = makeSphere( vraiia.bg.bydefault, 5000 );
		background.renderDepth = -1;

		var wrap = makeItemLayout( vraiia.system.wrap, 41, 52, 0, 0, 1, 0, 0, 0 );
		var edit = makeItemLayout( vraiia.system.profil, 16.5, 16, -10, 15, 2, 0, 0, 0 );
		var perso = makeItemLayout( vraiia.system.perso, 16.5, 16, 10, 15, 2, 0, 0, 0 );
		var about = makeItemLayout( vraiia.system.about, 16.5, 16, -10, -3, 2, 0, 0, 0 );
		var help = makeItemLayout( vraiia.system.help, 16.5, 16, 10, -3, 2, 0, 0, 0 );

		var sys = new THREE.Mesh(
			new THREE.BoxGeometry( 41, 52, 0.1, 1, 1 ),
			new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false })
		);

		sys.add( wrap, edit, perso, about, help );

		sys.position.set( 36.6, 0, 34.1 );
		sys.rotation.set( 0, Math.radians( -133 ), 0 );
		// bend( sys, 60 );

		// guides
		editC = neoPos( sys, edit );
		persoC = neoPos( sys, perso );
		aboutC = neoPos( sys, about );
		helpC = neoPos( sys, help );

		// events
		makeInteraction( sys, 36.6, 34.1, 250 );

		makeInteractionItem( sys, edit, 1.10, editC, 36.6, 34.1, 250 );
		makeInteractionItem( sys, perso, 1.10, persoC, 36.6, 34.1, 250 );
		makeInteractionItem( sys, about, 1.10, aboutC, 36.6, 34.1, 250 );
		makeInteractionItem( sys, help, 1.10, helpC, 36.6, 34.1, 250 );

		var toggle = 0;

		persoC.addEventListener( 'click', function( e ) {

			function fadeIn() {
				new TWEEN.Tween( background.material )
				.to({ opacity: 1}, 1000)
				.start();
			}

			if ( toggle == 0 ) {

				new TWEEN.Tween( background.material )
					.to( { opacity: 0 }, 1000 )
					.onComplete( function() {
						background.material.map = THREE.ImageUtils.loadTexture( vraiia.bg.fill, THREE.UVMapping, fadeIn);
					})
					.start();

				toggle = 1;

			} else if ( toggle == 1 ) {

				new TWEEN.Tween( background.material )
					.to( { opacity: 0 }, 1000 )
					.onComplete( function() {
						background.material.map = THREE.ImageUtils.loadTexture( vraiia.bg.test, THREE.UVMapping, fadeIn);
					})
					.start();

				toggle = 2;

			} else if ( toggle == 2 ) {

				new TWEEN.Tween( background.material )
					.to( { opacity: 0 }, 1000 )
					.onComplete( function() {
						background.material.map = THREE.ImageUtils.loadTexture( vraiia.bg.puy, THREE.UVMapping, fadeIn);
					})
					.start();

				toggle = 3;

			} else if ( toggle == 3 ) {

				new TWEEN.Tween( background.material )
					.to( { opacity: 0 }, 1000 )
					.onComplete( function() {
						background.material.map = THREE.ImageUtils.loadTexture( vraiia.bg.strie, THREE.UVMapping, fadeIn);
					})
					.start();

				toggle = 4;

			} else if( toggle == 4) {

				new TWEEN.Tween( background.material )
					.to( { opacity: 0 }, 1000 )
					.onComplete( function() {
						background.material.map = THREE.ImageUtils.loadTexture( vraiia.bg.tintamarre, THREE.UVMapping, fadeIn);
					})
					.start();

				toggle = 5;

			} else {

				new TWEEN.Tween( background.material )
					.to( { opacity: 0 }, 1000 )
					.onComplete( function() {
						background.material.map = THREE.ImageUtils.loadTexture( vraiia.bg.bydefault, THREE.UVMapping, fadeIn);
					})
					.start();

				toggle = 0;

			}

		});

		error( editC );
		error( helpC );

		return sys;

	}


	// vrBox
	function vrBox() {

		var wrap = makeItemLayout( vraiia.box.mail1, 41, 47, 0, 2.5, 0, 0, 0, 0 );
		var archive = makeItemLayout( vraiia.box.archiv, 10.25, 5, -15.35, -23.5, 0, 0, 0, 0 );
		var adjourn = makeItemLayout( vraiia.box.adjourn, 10.25, 5, -5.1, -23.5, 0, 0, 0, 0 );
		var spam = makeItemLayout( vraiia.box.spam, 10.25, 5, 5.1, -23.5, 0, 0, 0, 0 );
		var plus = makeItemLayout( vraiia.box.plus, 10.25, 5, 15.35, -23.5, 0, 0, 0, 0 );

		var vBox = new THREE.Mesh(
			new THREE.BoxGeometry( 41, 52, 0.1, 1, 1 ),
			new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false })
		);

		vBox.add( wrap, archive, adjourn, spam, plus );

		vBox.position.set( -43.3, 0, -25 );
		vBox.rotation.set( 0, Math.radians( 60 ), 0 );

		// guides
		archiveC = neoPos( vBox, archive );
		adjournC = neoPos( vBox, adjourn );
		spamC = neoPos( vBox, spam );
		plusC = neoPos( vBox, plus );

		// events
		makeInteraction( vBox, -43.3, -25, 250 );

		makeInteractionButton( vBox, archive, archiveC,-43.3, -25, 250);
		makeInteractionButton( vBox, adjourn, adjournC, -43.3, -25, 250);
		makeInteractionButton( vBox, spam, spamC, -43.3, -25, 250);
		makeInteractionButton( vBox, plus, plusC, -43.3, -25, 250);

		var toggle = 0;

		archiveC.addEventListener( 'click', function() {

			if( toggle == 0 ) {

				wrap.material.map = THREE.ImageUtils.loadTexture( vraiia.box.mail2 );
				toggle = 1;

			} else if( toggle == 1 ) {

				wrap.material.map = THREE.ImageUtils.loadTexture( vraiia.box.mail3 );
				toggle = 2;

			} else if( toggle == 2 ) {

				wrap.material.map = THREE.ImageUtils.loadTexture( vraiia.box.mail4 );
				toggle = 3;

			} else {

				wrap.material.map = THREE.ImageUtils.loadTexture( vraiia.box.mail1 );
				toggle = 0;

			}

		});

		adjournC.addEventListener( 'click', function() {

			if( toggle == 0 ) {

				wrap.material.map = THREE.ImageUtils.loadTexture( vraiia.box.mail2 );
				toggle = 1;

			} else if( toggle == 1 ) {

				wrap.material.map = THREE.ImageUtils.loadTexture( vraiia.box.mail3 );
				toggle = 2;

			} else if( toggle == 2 ) {

				wrap.material.map = THREE.ImageUtils.loadTexture( vraiia.box.mail4 );
				toggle = 3;

			} else {

				wrap.material.map = THREE.ImageUtils.loadTexture( vraiia.box.mail1 );
				toggle = 0;

			}

		});

		spamC.addEventListener( 'click', function() {

			if( toggle == 0 ) {

				wrap.material.map = THREE.ImageUtils.loadTexture( vraiia.box.mail2 );
				toggle = 1;

			} else if( toggle == 1 ) {

				wrap.material.map = THREE.ImageUtils.loadTexture( vraiia.box.mail3 );
				toggle = 2;

			} else if( toggle == 2 ) {

				wrap.material.map = THREE.ImageUtils.loadTexture( vraiia.box.mail4 );
				toggle = 3;

			} else {

				wrap.material.map = THREE.ImageUtils.loadTexture( vraiia.box.mail1 );
				toggle = 0;

			}

		});

		error( plusC );

		return vBox

	}


	// vrSchedule
	function vrSchedule() {

		var wrap = makeItemLayout( vraiia.schedule.wrap, 41, 47, 0, 2.5, 0, 0, 0, 0 );
		var plus = makeItemLayout( vraiia.schedule.plus, 41, 5, 0, -23.5, 0, 0, 0, 0 );
		var mark = makeItemLayout( vraiia.schedule.marker, 43.41, 1.4, 0, 18, 1, 0, 0, 0 );

		var vSchedule = new THREE.Mesh(
			new THREE.BoxGeometry( 41, 52, 0.1, 1, 1 ),
			new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false })
		);

		vSchedule.add( wrap, plus, mark );

		vSchedule.position.set( -47.3, 0, 16.3 );
		vSchedule.rotation.set( 0, Math.radians( 109 ), 0 );

		// guides
		plusC = neoPos( vSchedule, plus );

		// events
		makeInteraction( vSchedule, -47.3, 16.3, 250 );

		makeInteractionButton( vSchedule, plus, plusC, -47.3, 16.3, 250 );

		error( plusC );

		return vSchedule;

	}


	// vrTask
	function vrTask() {

		var wrap = makeItemLayout( vraiia.task.wrap, 41, 47, 0, 2.5, 0, 0, 0, 0 );
		var plus = makeItemLayout( vraiia.task.plus, 41, 5, 0, -23.5, 0, 0, 0, 0 );

		for( var i = 1; i <= 3; i++ ) {
			window[ 'check' + i ] = makeItemLayout( vraiia.task.ko, 2, 2, -14.5, 2.5, 0, 0, 0, 0 );
			window[ 'text' + i ] = makeItemLayout( '../images/vrboard/elmt_vrtask_'+ i +'.svg', 26, 7, 5.5, 0, 0, 0, 0, 0 );

			window[ 'task' + i ] = new THREE.Mesh(
				new THREE.BoxGeometry( 36.5, 7, 1, 1, 1 ),
				new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false })
			);

			window[ 'task' + i ].add( window[ 'check' + i ], window[ 'text' + i ] );
		}
		
		task1.position.set( 0, 15.25, 1 );
		task2.position.set( 0, 5.25, 1 );
		task3.position.set( 0, -4.75, 1 );

		var vTask = new THREE.Mesh(
			new THREE.BoxGeometry( 41, 52, 0.1, 1, 1 ),
			new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false })
		);

		vTask.add( wrap, plus, task1, task2, task3 );

		vTask.position.set( -18.7, 0, 46.4 );
		vTask.rotation.set( 0, Math.radians( 158 ), 0 );

		// guides
		plusC = neoPos( vTask, plus );
		check1C = neoPos( vTask, check1 );
		check2C = neoPos( vTask, check2 );
		check3C = neoPos( vTask, check3 );

		// events
		makeInteraction( vTask, -18.7, 46.4, 250 );

		makeInteractionButton( vTask, plus, plusC, -18.7, 46.4, 250);

		makeInteractionItem( vTask, check1, 1.75, check1C, -18.7, 46.4, 250 );
		makeInteractionItem( vTask, check2, 1.75, check2C, -18.7, 46.4, 250 );
		makeInteractionItem( vTask, check3, 1.75, check3C, -18.7, 46.4, 250 );

		var toggle1 = 0;
		var toggle2 = 0;
		var toggle3 = 0;

		check1C.addEventListener( 'click', function() {

			if( toggle1 == 0 ) {

				check1.material.map = THREE.ImageUtils.loadTexture( vraiia.task.ok );
				text1.material.map = THREE.ImageUtils.loadTexture( vraiia.task.inactive1 );
				toggle1 = 1;

			} else {

				check1.material.map = THREE.ImageUtils.loadTexture( vraiia.task.ko );
				text1.material.map = THREE.ImageUtils.loadTexture( vraiia.task.active1 );
				toggle1 = 0;

			}

		});

		check2C.addEventListener( 'click', function() {

			if( toggle2 == 0 ) {

				check2.material.map = THREE.ImageUtils.loadTexture( vraiia.task.ok );
				text2.material.map = THREE.ImageUtils.loadTexture( vraiia.task.inactive2 );
				toggle2 = 1;

			} else {

				check2.material.map = THREE.ImageUtils.loadTexture( vraiia.task.ko );
				text2.material.map = THREE.ImageUtils.loadTexture( vraiia.task.active2 );
				toggle2 = 0;

			}

		});

		check3C.addEventListener( 'click', function() {

			if( toggle3 == 0 ) {

				check3.material.map = THREE.ImageUtils.loadTexture( vraiia.task.ok );
				text3.material.map = THREE.ImageUtils.loadTexture( vraiia.task.inactive3 );
				toggle3 = 1;

			} else {

				check3.material.map = THREE.ImageUtils.loadTexture( vraiia.task.ko );
				text3.material.map = THREE.ImageUtils.loadTexture( vraiia.task.active3 );
				toggle3 = 0;

			}

		});

		error( plusC );

		return vTask;

	}

	scene.add( profil() );
	scene.add( time() );
	scene.add( navigation() );
	scene.add( welcome() );
	scene.add( controls() );
	scene.add( postIt() );
	scene.add( system() );
	scene.add( vrBox() );
	scene.add( vrSchedule() );
	scene.add( vrTask() );

}


/*
PARTICLES
--
*/

function makeParticle() {

	function randomBetween(min, max) {

	    if (min < 0) {
	        return min + Math.random() * (Math.abs(min)+max);
	    }else {
	        return min + Math.random() * max;
	    }

	}

	var geometry = new THREE.SphereGeometry(0.02, 1, 1);
	geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, randomBetween(-4, -0.5) ) );

	var material = new THREE.MeshBasicMaterial( {
		color: 0xffffff,
		wireframe: true,
		transparent: true,
		opacity: randomBetween(0.1, 0.3),
		side: THREE.DoubleSide } );

	var particle = new THREE.Mesh( geometry, material );

	particle.userData.rotation = {};
	particle.userData.rotation.x = randomBetween(0, 360);
	particle.userData.rotation.y = randomBetween(0, 360);

	return particle;

}


function makeParticles() {

	var mesh = new THREE.Group();
	mesh.position.z = -1;

	var particleCount = 40;

	for (var i = 0; i < particleCount; i++) {
		var p = makeParticle();
		particles.push( p );
		mesh.add( p );
	}

	scene.add( mesh );

}


/*
LAUNCH
--
*/


function oclock() {

	var delta = clock.getDelta();
	
	slow.update(delta);
	quick.update(delta);

}


function onWindowResize() {

	var innerWidth = window.innerWidth;
	var innweHeight =  window.innerHeight;
	camera.aspect = innerWidth / innweHeight;
	camera.updateProjectionMatrix();

	effect.setSize( innerWidth, innweHeight );

}

function animate() {

	for (var i = 0; i < particles.length; i++) {
		var particle = particles[i];

		var rotation = new THREE.Euler( particle.userData.rotation.x - 0.02, particle.userData.rotation.y -= 0.0005, 0 );
		var quat = new THREE.Quaternion().setFromEuler( rotation, true );
		var pivotQuat = new THREE.Quaternion();
		pivotQuat.multiply(quat).normalize();

		particle.setRotationFromQuaternion( quat );
	}

	requestAnimationFrame( animate );
	render();
	oclock();
	TWEEN.update();

}

function render() {

	if (controls) {
		controls.update();
	}

	cursor.update();

	effect.render( scene, camera );

}

init();
makeVRBoard();
animate();