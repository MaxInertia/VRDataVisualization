/**
 * @author mrdoob / http://mrdoob.com
 * @author stewdio / http://stewd.io
 * @author maxinertia (Vive -> Oculus) - WIP: Incomplete
 */

THREE.OculusController = function ( id ) {

    THREE.Object3D.call( this );

    var scope = this;
    var gamepad;

    var axes = [ 0, 0 ];
    var thumbRestTouched = false;
    var thumbStickTouched = false;
    var buttonOnePressed = false; // X or A
    var buttonTwoPressed = false; // Y or B
    var indexTriggerChanged = false;
    var gripTriggerChanged = false;

    // Names of buttons (should be constants...)
    var thumbRest = 'thumbRest';
    var thumbStick = 'thumbStick';
    var buttonOne; // X or A // Press and Touch?
    var buttonTwo; // Y or B // Press and Touch?
    var indexTrigger = 'indexTrigger';
    var gripTrigger = 'gripTrigger';

    // Names of events (should also be constants...)
    var Events = {
        buttonOne_On: 'buttonOne_on',
        buttonOne_Off: 'buttonOne_off',
        buttonTwo_On: 'buttonTwo_on',
        buttonTwo_Off: 'buttonTwo_off',
        thumbRestTouch_On: 'thumbRestTouch_on',
        thumbRestTouch_Off: 'thumbRestTouch_off',
        thumbStickTouch_On: 'thumbStickTouch_on',
        thumbStickTouch_Off: 'thumbStickTouch_off',
        indexTrigger_ValueChanged: 'indexTrigger_valueChanged',
        gripTrigger_ValueChanged: 'gripTrigger_valueChanged',
        thumbStick_ValueChanged: 'thumbStick_valueChanged'
    };

    function findGamepad( id ) {
        var gamepads = navigator.getGamepads && navigator.getGamepads();

        // Iterate across gamepads as the Oculus Controllers may not be in position 0 and 1.
        for ( var i = 0; i < gamepads.length; i ++ ) {
            var gamepad = gamepads[ i ];

            if ( gamepad && ( gamepad.id.startsWith( 'Oculus Touch' ) || gamepad.id === 'OpenVR Gamepad'  || gamepad.id.startsWith( 'Spatial Controller' ) ) ) {
                if ( i === id ) return gamepad;
            }
        }
    }

    this.matrixAutoUpdate = false;
    this.standingMatrix = new THREE.Matrix4();

    this.getGamepad = function () {
        return gamepad;
    };

    /** Returns whether a given buttons state has changed */
    this.getButtonState = function ( button ) {
        if ( button === buttonOne ) return buttonOnePressed;
        if ( button === buttonTwo ) return buttonTwoPressed;
        if ( button === thumbRest ) return thumbRestTouched;
        if ( button === thumbStick ) return thumbStickTouched;
        //TODO: Return trigger values
        //if ( button === gripTrigger ) return gripTriggerChanged;
        //if ( button === indexTrigger ) return indexTriggerChanged;
    };

    this.update = function () {

        gamepad = findGamepad( id );
        if ( gamepad !== undefined && gamepad.pose !== undefined ) {

            if ( gamepad.pose === null ) return; // No user action yet

            // Position and orientation.
            var pose = gamepad.pose;

            if ( pose.position !== null ) scope.position.fromArray( pose.position );
            if ( pose.orientation !== null ) scope.quaternion.fromArray( pose.orientation );

            scope.matrix.compose( scope.position, scope.quaternion, scope.scale );
            scope.matrix.premultiply( scope.standingMatrix );
            scope.matrixWorldNeedsUpdate = true;
            scope.visible = true;

            // ThumbStick axes // TODO: Confirm this is the same on Oculus

            if ( axes[ 0 ] !== gamepad.axes[ 0 ] || axes[ 1 ] !== gamepad.axes[ 1 ] ) {
                axes[ 0 ] = gamepad.axes[ 0 ]; //  X axis: -1 = Left, +1 = Right.
                axes[ 1 ] = gamepad.axes[ 1 ]; //  Y axis: -1 = Bottom, +1 = Top.
                scope.dispatchEvent( { type: Events.thumbStick_ValueChanged, axes: axes } );
            }

            //TODO: Include Controller name in name of dispatched event

            // Buttons

            /* TODO: Determine the index at which each button is stored in gamepad.buttons (replace the '?'s)
            
            if ( buttonOnePressed !== gamepad.buttons[ ? ].pressed ) {
                buttonOnePressed = gamepad.buttons[ ? ].pressed;
                scope.dispatchEvent( { type: buttonOnePressed ? Events.buttonOne_On : Events.buttonOne_Off } );
            }

            if ( buttonTwoPressed !== gamepad.buttons[ ? ].pressed ) {
                buttonTwoPressed = gamepad.buttons[ ? ].pressed;
                scope.dispatchEvent( { type: buttonTwoPressed ? Events.buttonTwo_On : Events.buttonTwo_Off } );
            }

            // Triggers

            if ( indexTriggerChanged !== gamepad.buttons[ ? ].pressed ) {
                indexTriggerChanged = gamepad.buttons[ ? ].pressed;
                scope.dispatchEvent( { type: Events.indexTrigger_ValueChanged, value: buttons[ ? ].value } );
            }

            if ( gripTriggerChanged !== gamepad.buttons[ ? ].pressed ) {
                gripTriggerChanged = gamepad.buttons[ ? ].pressed;
                scope.dispatchEvent( { type: Events.gripTrigger_ValueChanged, value: buttons[ ? ].value } );
            }*/

        } else {
            scope.visible = false;
        }
    };
};

THREE.OculusController.prototype = Object.create( THREE.Object3D.prototype );
THREE.OculusController.prototype.constructor = THREE.OculusController;
