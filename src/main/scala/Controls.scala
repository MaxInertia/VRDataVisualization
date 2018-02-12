import js.three.{FirstPersonVRControls, VRController, VRControls}
import org.scalajs.dom.{document, raw}
import org.scalajs.{threejs => THREE}

/**
  * Created by Dorian Thiessen on 2018-01-13.
  */
class Controls {
  var vr: VRControls = _
  var fp: FirstPersonVRControls = _
  var mouse: THREE.Vector2 = _
  // Oculus Controllers; [0: Left, 1: Right]
  var controllers: Array[VRController] = Array(null, null)


  def update(timeStamp: Double): Unit = {
    vr.update()
    fp.update(timeStamp)
  }
}

object Controls {
  def setup(env: Environment): Controls = {
    println("Controls Setup...")
    val controls = new Controls()

    // Oculus & Headset Controls
    controls.vr = new VRControls(env.camera)
    document.addEventListener("vr controller connected", (event: raw.CustomEvent) => {
      val controller: VRController = event.detail.asInstanceOf[VRController]

      if(controller.name == OculusControllerRight.name) {
        OculusControllerRight.setup(controller)
        controls.controllers(1) = controller

      } else if(controller.name == OculusControllerLeft.name) {
        OculusControllerLeft.setup(controller)
        controls.controllers(0) = controller

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
