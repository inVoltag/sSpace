/* 
JS Assets
sSpace 2015
*/

// TOP
toTheTop = function() {

	$('.top').on( 'click', function() {

		$('html, body').animate({ scrollTop : 0 }, 250);

	})

}


// VR DETECTION
vrDetection = function() {

	var vrDetected = false;
	var statusText = $( '.vrArea h6' );

	function vrOK( el ) {
		el.css( 'background', '#66CCCC' );
		el.text( 'VR active' )
	};

	function vrKO( el ) {
		el.css( 'background', '#EE524B' );
		el.text( 'VR non active' )
	};

	VRManager.vrReady.then(function() {
	
		// VR detected
		vrDetected = 'true';
		vrOK( statusText );
		$( '#entryArea' ).css( 'display', 'flex' );
		$( '#troubleShArea' ).css( 'display', 'none' );

		}, function() {
		
		// VR NOT detected
		vrDetected = 'false';
		vrKO( statusText );
		$( '#entryArea' ).css( 'display', 'none' );
		$( '#troubleShrea' ).css( 'display', 'flex' );
		$( 'title' ).text( 'Ouups... il semblerait avoir un problème' )

	} );

}


// OPEN MENU
popMenu = function() {

	$( '.opnMenu' ).on( 'click', function() {
		$( '#navMenu' ).addClass( 'evolve' );
	})

	$( '.clsMenu' ).on( 'click', function() {
		$( '#navMenu' ).removeClass( 'evolve' );
	})

}


// LAUNCH
imready = function() {

	popMenu();
	vrDetection();
	toTheTop();
	
}


$( document ).ready( imready );