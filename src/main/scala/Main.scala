import js.Stats
import js.three.VREffect
import org.scalajs.{threejs => THREE}
import org.scalajs.dom
import org.scalajs.dom.ext.LocalStorage
import plots.{ShadowManifold, TimeSeries}

import scala.scalajs.js.annotation.JSExportTopLevel

/**
  * Created by Dorian Thiessen on 2018-01-05.
  */
object Main {

  var controls: Controls = _
  var effect: VREffect = _
  var env: Environment = _
  var stats: Stats = _

  var vrDisplay

  @JSExportTopLevel("CCMVR.init")
  def init(): Unit = {
    println("init called.")

    // Setup the Environment (Scene, Camera, Renderer) and the Controls (Mouse, Oculus Controllers and Headset)
    val container = dom.document.getElementById("scene-container")
    env = Environment.setup(container)
    Window.setupEventListeners(env.camera, env.renderer) // Setup event listeners on the Window
    controls = Controls.setup(env)

    effect = new VREffect(env.renderer)
    effect.setSize(dom.window.innerWidth, dom.window.innerHeight)

    // Add FPS stats to the Window
    stats = new Stats()
    container.appendChild(stats.dom)

    //animateVR = animate
    animate(0) // Trigger the animation cycle
  }

  @JSExportTopLevel("CCMVR.animate")
  def animate(timeStamp: Double): Unit = {
    dom.window.requestAnimationFrame(animate)
    controls.update(timeStamp)
    stats.update()
    effect.render(env.scene, env.camera)
    env.render()
  }

  //@JSExportTopLevel("CCMVR.animate")
  //var animateVR: Double => Unit = (_) => println("empty animate called!")
}
