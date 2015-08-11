/* 
VR Templates
sSpace 2015
*/

var scene = new THREE.Scene();

var geometry, material, cube;
var clock = new THREE.Clock();

var card = [ '../sources/card.mp3', '../sources/card.ogg' ];
var cardR = [ '../sources/card_r.mp3', '../sources/card_r.ogg' ];
var item = [ '../sources/item.mp3', '../sources/item.ogg' ];


/*
CAMBER ELEMENTS
--
*/

function bend( group, amount, multiMaterialObject ) {

	function bendVertices( mesh, amount, parent ) {

		var vertices = mesh.geometry.vertices;

		if (!parent) {
			parent = mesh;
		}

		for (var i = 0; i < vertices.length; i++) {
			var vertex = vertices[i];

			// apply bend calculations on vertexes from world coordinates
			parent.updateMatrixWorld();

			var worldVertex = parent.localToWorld(vertex);

			var worldX = Math.sin( worldVertex.x / amount) * amount;
			var worldZ = - Math.cos( worldVertex.x / amount ) * amount;
			var worldY = worldVertex.y 	;

			// convert world coordinates back into local object coordinates.
			var localVertex = parent.worldToLocal(new THREE.Vector3(worldX, worldY, worldZ));
			vertex.x = localVertex.x;
			vertex.z = localVertex.z+amount;
			vertex.y = localVertex.y;
		};

		mesh.geometry.computeBoundingSphere();
		mesh.geometry.verticesNeedUpdate = true;

	}

	for ( var i = 0; i < group.children.length; i ++ ) {


		var element = group.children[ i ];

		if (element.geometry.vertices) {
			if (multiMaterialObject) {
				bendVertices( element, amount, group);
			} else {
				bendVertices( element, amount);
			}
		}

	}

}


/*
SOUNDS
--
*/

function VRSound( sources, classCSS ) {

	var container = document.querySelector( '.audio' );

	var audio = document.createElement( 'audio' );

	for ( var i = 0; i < sources.length; i ++ ) {
		var source = document.createElement( 'source' );
		source.src = sources[ i ];
		audio.appendChild( source );
	}

	this.position = new THREE.Vector3();
	this.audio = audio;
	audio.classList.add(classCSS);
	container.appendChild( audio );

	this.audio.play();

	// window.setInterval( function(){ noVRSound()}, 10000);

}


function noVRSound() {

	var container = document.querySelector( '.audio' )

	container.innerHTML = " &nbsp; ";

}


/*
TEMPLATES
--
*/

function makeSphere( src, size ) {

	var geometry = new THREE.SphereGeometry( size , 60, 60 );
	geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );
	var material = new THREE.MeshBasicMaterial( {
		transparency: true,
		opacity: 1,
		side: THREE.DoubleSide,
		map: THREE.ImageUtils.loadTexture( src, THREE.UVMapping ),
		fog: false
	} );

	var mesh = new THREE.Mesh( geometry, material );
	// mesh.material.transparent = true;
	scene.add( mesh );

	return mesh;

}


function makeCylinderLayout( src, circumference, opacity, blending ){

	var radius = circumference / 3.14 / 2;
	var height = circumference / 4;
	var geometry = new THREE.CylinderGeometry( radius, radius, height, 60, 1, true );
	var material = new THREE.MeshBasicMaterial({
		transparent: true,
		opacity: 1,
		side: THREE.DoubleSide, 
		map: THREE.ImageUtils.loadTexture( src ),
		blending: blending 
	} );
	var mesh = new THREE.Mesh( geometry, material );
	mesh.geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );

	return mesh;

}


function makeItemLayout( src, width, height, xPos, yPos, zPos, xRot, yRot, zRot ){

	var geometry = new THREE.PlaneGeometry( width, height, 20, 1 );
	var material = new THREE.MeshBasicMaterial({ 
		transparent: true, 
		opacity: 1, 
		side: THREE.DoubleSide, 
		map: THREE.ImageUtils.loadTexture( src )
	} );
	var mesh = new THREE.Mesh( geometry, material );
	mesh.position.set( xPos, yPos, zPos );
	mesh.rotation.set( xRot, yRot, zRot );

	return mesh;

}


function textureAnimator( texture, tilesHoriz, tilesVert, numTiles, tileDispDuration ) {	
		
	this.tilesHorizontal = tilesHoriz;
	this.tilesVertical = tilesVert;

	this.numberOfTiles = numTiles;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
	texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );

	this.tileDisplayDuration = tileDispDuration;

	this.currentDisplayTime = 0;

	this.currentTile = 0;
		
	this.update = function( milliSec ) {
		this.currentDisplayTime += milliSec;
		while (this.currentDisplayTime > this.tileDisplayDuration) {
			this.currentDisplayTime -= this.tileDisplayDuration;
			this.currentTile++;
			if (this.currentTile == this.numberOfTiles)
				this.currentTile = 0;
			var currentColumn = this.currentTile % this.tilesHorizontal;
			texture.offset.x = currentColumn / this.tilesHorizontal;
			var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
			texture.offset.y = currentRow / this.tilesVertical;
		}
	};

}		


function makeInteractionItem( parent, child, value, guide, xVal, zVal, duration )  {

	guide.addEventListener( 'mouseover', function( e ) {

		new TWEEN.Tween( child.scale )
			.to( { x: value, y: value, z: 1 }, duration )
			.easing( TWEEN.Easing.Cubic.Out )
			.start();

		new TWEEN.Tween( parent.position )
			.to( { x: xVal * 0.85, y: parent.position.y, z: zVal * 0.85 }, duration )
			.easing( TWEEN.Easing.Cubic.Out )
			.start();

		// VRSound( item, 'took' );

	});

	guide.addEventListener( 'mouseout', function( e ) {

		new TWEEN.Tween( child.scale )
			.to( { x: 1, y: 1, z: 1 }, duration )
			.easing( TWEEN.Easing.Cubic.Out )
			.start();

		new TWEEN.Tween( parent.position )
			.to( { x: xVal, y: parent.position.y, z: zVal }, duration )
			.easing( TWEEN.Easing.Cubic.Out )
			.start();

	});

}


function makeInteractionButton( parent, child, guide, xVal, zVal, duration ) {

	guide.addEventListener( 'mouseover', function( e ) {

		new TWEEN.Tween( child.position )
			.to( { x: child.position.x, y: child.position.y, z: 3 }, duration )
			.easing( TWEEN.Easing.Cubic.Out )
			.start();

		new TWEEN.Tween( parent.position )
			.to( { x: xVal * 0.85, y: parent.position.y, z: zVal * 0.85 }, duration )
			.easing( TWEEN.Easing.Cubic.Out )
			.start();

		// VRSound( item, 'took' );

	});

	guide.addEventListener( 'mouseout', function( e ) {

		new TWEEN.Tween( child.position )
			.to( { x: child.position.x, y: child.position.y, z: 0 }, duration )
			.easing( TWEEN.Easing.Cubic.Out )
			.start();

		new TWEEN.Tween( parent.position )
			.to( { x: xVal, y: parent.position.y, z: zVal  }, duration )
			.easing( TWEEN.Easing.Cubic.Out )
			.start();


	});

}


function makeInteraction( parent, xVal, zVal, duration ) {

	parent.addEventListener( 'mouseover', function( e ) {
		
		//VRSound( card, 'swoof' );

		new TWEEN.Tween( parent.position )
			.to( { x: xVal * 0.85, y: parent.position.y, z: zVal * 0.85 }, duration )
			.easing( TWEEN.Easing.Cubic.Out )
			.start();

	});

	parent.addEventListener( 'mouseout', function( e ) {
		
		//VRSound( cardR, 'swoofR' );

		new TWEEN.Tween( parent.position )
			.to( { x: xVal, y: parent.position.y, z: zVal }, duration )
			.easing( TWEEN.Easing.Cubic.Out )
			.start();

	});

}


function error( item ) {

	var wip = document.querySelector( '#wip' );

	item.addEventListener( 'click', function( e ) {
		
		show( wip );
		
	});

}


function neoPos( parent, child ) {

	scene.updateMatrixWorld();
	parent.updateMatrixWorld();

	var vector = new THREE.Vector3();
	var euler = new THREE.Euler();
	vector.setFromMatrixPosition( child.matrixWorld );
	euler.setFromRotationMatrix( child.matrixWorld );
	child.updateMatrixWorld;

	var guides = new THREE.Mesh( child.geometry, new THREE.MeshBasicMaterial({
													color: 0xffffff,
													transparent:true,
													opacity: 0
												}));
	guides.position.set( vector.x, vector.y, vector.z );
	guides.rotation.set( euler.x, euler.y, euler.z );

	guides.updateMatrixWorld;

	var x = parent.position.x - ( parent.position.x * 0.84 );
	var z = parent.position.z - ( parent.position.z * 0.84 );

	guides.position.x -= x;
	guides.position.z -= z;

	scene.add( guides );

	return guides;

}


Math.radians = function( degrees ) {

  return degrees * Math.PI / 180;

}

function show( el ) {

	el.classList.remove('hide');
	

}


function hide( el ) {

	el.classList.add('hide');

}