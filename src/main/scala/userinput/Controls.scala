package userinput

import org.scalajs.{dom, threejs => THREE}
import window.Window
import env.Environment
import facades.Dat
import facades.IFThree._
import util.Log

/**
  * An abstraction over the users method of input.
  * Created by Dorian Thiessen on 2018-01-13.
  */
class Controls {

  var vr: VRControls = _

  var fp: FirstPersonVRControls = _
  var mouse: THREE.Vector2 = _

  // Oculus Controllers; [0: Left, 1: Right]
  var controllers: Array[VRController] = Array(null, null)

  def controllerConnected: Boolean = controllers(0) != null || controllers(1) != null

  def update(timeStamp: Double): Unit = {
    // TODO: How is this replaced? Removal breaks rotation of camera via click and drag
    vr.update()

    VRControllerManager.update()
    if(controllers(0) != null) {
      controllers(0).update()
      OculusControllerLeft.update()
    }
    if(controllers(1) != null) {
      controllers(1).update()
      OculusControllerRight.update()
    }

    // TODO: Have fp.update disabled when pressing 'ENTER VR' if headset is connected (and enabled on exiting VR)
    if (!controllerConnected) fp.update(timeStamp)
  }
}

object Controls {
  private var instance: Controls = _

  type RayCaster = THREE.Raycaster
  private val rayCaster: RayCaster = new RayCaster() // Used for the mouse
  rayCaster.params.asInstanceOf[RaycasterParametersExt].Points.threshold = 0.015

  def getSelectionRayCaster(camera: => THREE.PerspectiveCamera): Option[RayCaster] = {
    if(!instance.controllerConnected) {
      // No Oculus Controllers connected, assume using mouse
      rayCaster.setFromCamera(getMouse, camera)
      Some(rayCaster)
    } else {
      // Return direction a controller is pointing (if activated)
      OculusControllers.getActiveRayCaster
    }
    // TODO: Mobile devices?
  }

  def getMouse: THREE.Vector2 = instance.mouse

  def setup(env: Environment): Controls = {
    Log("Controls Setup...")
    val controls = new Controls()
    instance = controls

    // Oculus & Headset Controls

    /* // TODO: Convert to Scala
    var vrDisplay = null;
    navigator.getVRDisplays().then(function(displays) {
      if (displays.length > 0) {
        vrDisplay = displays[0];
        // Kick off the render loop.
        vrDisplay.requestAnimationFrame(animate);
      }
    });*/

    controls.vr = new VRControls(env.camera)

    // TODO: What if this event is fired before reaching this point? Can it miss it? Possibly add a listener earlier.
    // OR remove VRController.js and manually handle controller retrieval and state updates...
    dom.window.addEventListener("vr controller connected", (event: SomeEvent) => {
      val controller: VRController = event.detail.asInstanceOf[VRController]

      if(controller.name == OculusControllerRight.name) {
        OculusControllerRight.setup(controller)
        controls.controllers(1) = controller
        env.fakeOrigin.add(controller)

      } else if(controller.name == OculusControllerLeft.name) {
        OculusControllerLeft.setup(controller)
        controls.controllers(0) = controller
        env.fakeOrigin.add(controller)

      } else
        Log("[Controls]\t Unknown controller passed on event: \"vr controller connected\"")
    })

    // Other Controls

    controls.fp = new FirstPersonVRControls(env.camera, env.scene)
    controls.mouse = new THREE.Vector2()
    Window.setupEventListener_MouseMove(controls.mouse)
    Window.setupEventListener_MouseDoubleClick(controls.mouse, env)

    Dat.GUIVR.enableMouse(env.camera)

    controls
  }
}
