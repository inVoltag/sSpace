/*
VRManger
- Fullscreen switching.
- Detection of VR hardware.
*/

window.VRManager = (function() {

  function VRManager(container) {
    var self = this;

    // container is where the whole experience lives.  Fullscreen VR mode is activated on this container.
    self.container = document.querySelector(container);

    // The loader is loads in external content.
    //self.ui = new VRAIIA(self.container.querySelector('#loader'));

    // start a UI into it's own web GL context.
    //self.ui = new VRUi(self.container.querySelector('#ui'));

    // this promise resolves when VR devices are detected.
    self.vrReady = new Promise(function (resolve, reject) {
      if (navigator.getVRDevices) {
        navigator.getVRDevices().then(function (devices) {
          console.log('found ' + devices.length + ' devices');
          for (var i = 0; i < devices.length; ++i) {
            if (devices[i] instanceof HMDVRDevice && !self.hmdDevice) {
              self.hmdDevice = devices[i];
              console.log('found head mounted display device');
            }

            if (devices[i] instanceof PositionSensorVRDevice &&
                devices[i].hardwareUnitId == self.hmdDevice.hardwareUnitId &&
                !self.positionDevice) {
              self.positionDevice = devices[i];
              console.log('found motion tracking devices');
              break;
            }
          }

          if (self.hmdDevice && self.positionDevice) {
            self.vrIsReady = true;
            resolve();
            return;
          }

          reject('no VR devices found!');

        })
      } else {
        reject('no VR implementation found!');
      }
    })

    // listen for fullscreen event changes.
    document.addEventListener('mozfullscreenchange',handleFsChange);

    document.addEventListener('webkitfullscreenchange',handleFsChange)

    function handleFsChange(e) {
      var fullscreenElement = document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement;

      if (fullscreenElement == null) {
        // launch:
        // this needs to be turned back on so we can reset the user back to the 2d landing page.
        self.exitVR();
      }
    };

    self.vrReady
      .then(function() {
          //self.VRstart();
        }, function(){
          console.log('*** VR Not ready')
          //self.NoVRstart();
        });


    //self.ui.start();

  }


  /*
  This runs when user enters VR mode.
  */
  VRManager.prototype.enableVR = function(opts) {

    var self = this;

    self.opts = opts || {};

    // enables fullscreen distortion
    self.opts.fullscreen = self.opts.fullscreen == undefined ? true : false;

    if (self.vrIsReady) {
      // start fullscreen on the container element.
      var container = self.container;

      if (self.opts.fullscreen) {
        if (container.requestFullscreen) {
          container.requestFullscreen({ vrDisplay: self.hmdDevice });
        } else if (container.mozRequestFullScreen) {
          container.mozRequestFullScreen({ vrDisplay: self.hmdDevice });
        } else if (container.webkitRequestFullscreen) {
          container.webkitRequestFullscreen({ vrDisplay: self.hmdDevice });
        }
      }

      // reserve pointer lock for the cursor.
      var bodyEl = document.body;

      bodyEl.requestPointerLock = bodyEl.requestPointerLock ||
        bodyEl.mozRequestPointerLock ||
        bodyEl.webkitRequestPointerLock;

      bodyEl.requestPointerLock();


    } else {
      console.log('no vr mode available');
    }

  };


  VRManager.prototype.exitVR = function() {

    console.log('Exiting VR mode');

  };

  VRManager.prototype.zeroSensor = function () {

    var self = this;
    self.vrReady.then(function () {
      console.log('zeroing sensor');

      // reset sensor on UI
      self.positionDevice.zeroSensor();

    });

  };

  return new VRManager('#container');

})();