/* 
Launch
sSpace 2015
*/


// LAUNCH
launch = function() {

	var interval; // interval timer for gamepad

	var permissionInstructions = document.querySelector( '#fsPrompt' );

	var enterVRButton = document.querySelector( '#launch' );

	var vrboard = document.querySelector( '#vrBoard' );

	var vrmenu = document.querySelector( '#vrMenu' );

	var audio = document.querySelector( 'audio' );

	var wip = document.querySelector( '#wip' );


	function requestFullscreen( el ) {

		if (el.requestFullscreen) {
			el.requestFullscreen();

		} else if (el.mozRequestFullScreen) {
			el.mozRequestFullScreen();

		} else if (el.webkitRequestFullscreen) {
			el.webkitRequestFullscreen();
		}

	}


	function requestPointerlock( el ) {

		el.requestPointerLock = el.requestPointerLock ||
		el.mozRequestPointerLock ||
		el.webkitRequestPointerLock;

		el.requestPointerLock();

	}


	function onFschange() {

		var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;

		if (!fullscreenElement) {
			hide(permissionInstructions);
			show(enterVRButton);
		}

	}


	function setPermissionPromptedCookie() {

		document.cookie = "fsPrompted=true; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";

	}


	function hasBeenPermissionPrompted() {

		if (document.cookie.indexOf('fsPrompted=true') !== -1) {
			return true;
		} else {
			return false;
		}

	}


	function enterVr(useFullscreen) {

		if (useFullscreen === false) {
			show(enterVRButton)
			VRManager.enableVR({
				fullscreen: false
			});
		} else {
			if (hasBeenPermissionPrompted()) {
				VRManager.enableVR();
			} else {
				setPermissionPromptedCookie();

				show(permissionInstructions)

				requestFullscreen(document.body);

				requestPointerlock(document.body)

				hide(enterVRButton)
			}
		}

	}


	function onkey(event) {

		console.log(toggle)
		console.log(event.keyCode);
		
		switch (event.keyCode) {		

			case 13: // enter f 70
				enterVr( true );
				show(vrboard);
				audio.play()
				break;

			case 16: // shift
				enterVr( false );
				hide(vrboard);
				hide( vrmenu );
				hide( wip );
				audio.pause()
				break;

			case 9: // tab
				hide( wip );
				break;

			case 32: // space	

				if( toggle == 0) {

					show( vrmenu );
					toggle = 1

				} else {

					hide( vrmenu );
					toggle = 0;
				}
				break;

		}

	}

	var toggle = 0;

	window.addEventListener("keydown", onkey, true);

	document.addEventListener('mozfullscreenchange', onFschange);
	document.addEventListener('webkitfullscreenchange', onFschange);
	document.addEventListener('fullscreenchange', onFschange);


	xBoxPad.on('pressed', function(buttons) {

		console.log(buttons);

		if ( buttons.length === 2 ) {

			if ( buttons[0] === 'LT' && buttons[1] === 'RT' ||
			buttons[0] === 'RT' && buttons[1] === 'LT' ) {

				if( toggle == 0) {

					show( vrmenu );
					toggle = 1

				} else {

					hide( vrmenu );
					toggle = 0;
				}
			}

			return;
		}

		if ( buttons.length === 1 && buttons[0] === 'A') {
			document.body.dispatchEvent( new MouseEvent( 'click', {
				'view': window,
				'bubbles': true,
				'cancelable': true
			}));
			return;
		}

		/*if ( buttons.length === 1 && buttons[0] === 'Back' ) {
			VRManager.zeroSensor();
			return;
		};*/

		if ( buttons.length === 1 && buttons[0] === 'Y' ) {
			enterVr( false );
			hide(vrboard);
			hide( vrmenu );
			hide( wip );
			audio.pause();
			return;
		};

		if ( buttons.length === 1 && buttons[0] === 'B' ) {
			hide( wip );
			return;
		};

		if ( buttons.length === 1 && buttons[0] === 'Start' ) {
			enterVr( true );
			show(vrboard);
			audio.play();
			return;
		};

	})

	enterVRButton.addEventListener( 'click', function() {

		enterVr( true );
		show( vrboard );
		audio.play();

	})

}


// LAUNCH
imready = function() {

	launch();

}


$( document ).ready( imready );