import scala.scalajs.js.annotation.{JSExport, JSExportTopLevel}
import org.scalajs.{threejs => THREE}
import org.scalajs.dom
import userinput.Controls
import window.Window
import facades.Stats
import facades.IFThree.{WEBVR, WebGLRendererExt}
import viewable.Environment

/**
  * Created by Dorian Thiessen on 2018-01-05.
  */
@JSExportTopLevel("VRDataVisualization")
object Main {

  var controls: Controls = _
  var env: Environment = _
  var stats: Stats = _
  @JSExport("foundVRHeadset")
  var foundVRHeadset: Boolean = false

  @JSExport("init")
  def init(): Unit = {

    // Setup the Environment (Scene, Camera, Renderer) and
    // the Controls (Mouse, Oculus Controllers and Headset)

    val container = dom.document.getElementById("scene-container")
    env = Environment.setup(container)

    // TODO: Make the button unfocusable to prevent it from being highlighted on dblclick
    dom.document.body.appendChild( WEBVR.createButton(env.renderer) )

    if(foundVRHeadset) {
      dom.console.log("Found headset")
      env.renderer.asInstanceOf[WebGLRendererExt].vr.enabled = true
    }

    Window.setupEventListeners(env.camera, env.renderer)
    controls = Controls.setup(env)

    // Add FPS stats to the Window
    stats = new Stats()
    container.appendChild(stats.dom)
  }

  @JSExportTopLevel("animate")
  def animate(timeStamp: Double): Unit = {
    dom.window.requestAnimationFrame(animate)
    if(controls != null) controls.update(timeStamp)
    if(env != null) env.render()
    if(stats != null) stats.update()
  }

  @JSExport("renderer") // Temporary. renderer currently required in global scope.
  def getRenderer: THREE.Renderer = env.renderer

}
