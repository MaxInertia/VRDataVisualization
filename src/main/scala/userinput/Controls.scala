package userinput

import org.scalajs.dom.document
import org.scalajs.{dom, threejs => THREE}
import window.Window
import env.Environment
import facades.three.IFThree._

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

  def update(timeStamp: Double): Unit = {
    fp.update(timeStamp)
    vr.update()
  }
}

object Controls {
  private var instance: Controls = _

  type RayCaster = THREE.Raycaster
  private val rayCaster: RayCaster = new RayCaster()
  rayCaster.params.asInstanceOf[RaycasterParametersExt].Points.threshold = 0.015

  def getSelectionRaycaster(camera: => THREE.PerspectiveCamera): RayCaster = {
    // If using mouse
    rayCaster.setFromCamera(getMouse, camera)
    // TODO: if using Oculus
    // ...
    // TODO: If using mobile (neither Oculus or Mouse available)
    // ...
    rayCaster
  }

  def getMouse: THREE.Vector2 = instance.mouse

  def setup(env: Environment): Controls = {
    dom.console.log("Controls Setup...")
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
    dom.console.log("Reached the 'vr controller connected' event listener adding")
    dom.window.addEventListener("vr controller connected", (event: SomeEvent) => {
      dom.console.log("CONTROLLER CONENCTED")
      val controller: VRController = event.detail.asInstanceOf[VRController]

      if(controller.name == OculusControllerRight.name) {
        OculusControllerRight.setup(controller)
        controls.controllers(1) = controller
        env.scene.add(controller)

      } else if(controller.name == OculusControllerLeft.name) {
        OculusControllerLeft.setup(controller)
        controls.controllers(0) = controller
        env.scene.add(controller)

      } else
        println("[Controls]\t Unknown controller passed on event: \"vr controller connected\"")
    })

    // Other Controls
    // TODO: Only initialize fpControls and mouse if no VR Headset detected
    controls.fp = new FirstPersonVRControls(env.camera, env.scene)
    controls.mouse = new THREE.Vector2()
    Window.setupMouseEventListener(controls.mouse)
    //Window.setupControllerConnectionEventListener()
    controls
  }
}
