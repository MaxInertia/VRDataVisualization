import js.three.{FirstPersonVRControls, VRControls}
import org.scalajs.{threejs => THREE}

/**
  * Created by Dorian Thiessen on 2018-01-13.
  */
class Controls {
  var vr: VRControls = _
  var fp: FirstPersonVRControls = _
  var mouse: THREE.Vector2 = _

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

    // Other Controls
    // TODO: Only initialize fpControls and mouse if no VR Headset detected
    controls.fp = new FirstPersonVRControls(env.camera, env.scene)
    controls.mouse = new THREE.Vector2()
    Window.setupMouseEventListener(controls.mouse)
    controls
  }
}
