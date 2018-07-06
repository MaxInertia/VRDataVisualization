import scala.scalajs.js.annotation.{JSExport, JSExportTopLevel}
import org.scalajs.{threejs => THREE}
import org.scalajs.dom
import userinput.Controls
import window.Window
import facades.IFThree.WEBVR
import org.scalajs.threejs.Scene
import resources.{BrowserStorage, FileAsText, Res}
import util.Log
import viewable.{Colors, Environment, Regions}

import scala.util.{Failure, Success}

/**
  * Created by Dorian Thiessen on 2018-01-05.
  */
@JSExportTopLevel("vrdv")
object Main {

  var controls: Controls = _
  var env: Environment = _
  var stats: facades.Stats = _

  @JSExportTopLevel("vrdv.init")
  def init(): Unit = {

    // Setup the Environment (Scene, Camera, Renderer)
    val container = dom.document.getElementById("scene-container")
    env = Environment.setup(container)

    // Load data provided at setup window
    Log.show("Before loading dataset")
    var dataset1 = BrowserStorage("SM1_timeSeries").collect()
    Log.show("After loading dataset")

    // Load texture for plots
    val loadTexture = Res.loadPointTexture(1) // TODO: The texture should be an option
    import scala.concurrent.ExecutionContext.Implicits.global
    loadTexture andThen {
      case Success(texture) =>
        env.plot(dataset, Colors.RED_HUE_SHIFT)
      case Failure(err) =>
        Log("Failed to load the texture!")
        err.printStackTrace()
    }

    // the Controls (Mouse, Oculus Controllers and Headset)
    Window.setupEventListeners(env.camera, env.renderer)
    controls = Controls.setup(env)

    // Add FPS stats to the Window
    stats = new facades.Stats()
    container.appendChild(stats.dom)

    // Append "ENTER VR" Button to DOM
    // TODO: Make the button unfocusable to prevent it from being highlighted on dblclick
    dom.document.body.appendChild( WEBVR.createButton(env.renderer) )
    dom.window.requestAnimationFrame(animate)
  }

  @JSExportTopLevel("vrdv.animate")
  def animate(timeStamp: Double): Unit = {
    dom.window.requestAnimationFrame(animate)
    if(controls != null) controls.update(timeStamp)
    if(env != null) env.render()
    if(stats != null) stats.update()
  }

  // Load data from VR window
  // Allows loading up to four csv data files (including those added at the setup page)
  @JSExportTopLevel("vrdv.addData")
  def addData(data: String): Unit = {
    val plotNum = Regions.getNonEmpties.length
    if(plotNum == 4) Log.show("Maximum number of files has been reached! Reload page to try other files.")
    else env.plot(FileAsText(data).collect(), Colors.BLUE_HUE_SHIFT, plotNum)
  }

  @JSExport("renderer") // Temporary. renderer currently required in global scope.
  def renderer: THREE.Renderer = env.renderer

  @JSExport("scene")
  def scene: Scene = Environment.instance.scene

}
