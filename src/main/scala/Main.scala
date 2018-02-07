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

  @JSExportTopLevel("CCMVR.init")
  def init(): Unit = {
    println("init called.")

    // Setup the Environment (Scene, Camera, Renderer) and the Controls (Mouse, Oculus Controllers and Headset)
    val container = dom.document.getElementById("scene-container")
    val env = Environment.setup(container)
    Window.setupEventListeners(env.camera, env.renderer) // Setup event listeners on the Window
    val controls = Controls.setup(env)

    // Add FPS stats to the Window
    val stats = new Stats()
    container.appendChild(stats.dom)

    def animate(timeStamp: Double): Unit = {
      dom.window.requestAnimationFrame(animate)
      controls.update(timeStamp)
      env.render()
      stats.update()
    }

    animate(0) // Trigger the animation cycle
  }
}
