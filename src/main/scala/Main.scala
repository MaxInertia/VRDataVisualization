import scala.scalajs.js.annotation.{JSExport, JSExportTopLevel}
import org.scalajs.{threejs => THREE}
import org.scalajs.dom
import window.Window
import facades.IFThree._
import org.scalajs.dom.raw.{Event, HTMLCanvasElement}
import org.scalajs.threejs._
import resources.{BrowserStorage, FileAsText, Res}
import util.Log
import viewable.{Colors, Environment, Regions, Text}

import scala.util.{Failure, Success}
import scala.scalajs.js
import js.JSConverters._

/**
  * Created by Dorian Thiessen on 2018-01-05.
  */
@JSExportTopLevel("vrdv")
object Main {
  var env: Environment = _
  var stats: facades.Stats = _

  @JSExportTopLevel("vrdv.init")
  def init(): Unit = {
    // Setup the Environment (Scene, Camera, Renderer)
    val container = dom.document.getElementById("scene-container")
    env = Environment.setup(container)

    dom.document.getElementById("fullscreenButton").addEventListener("onclick", (() => {
      Rendering.enterFullscreen(env.renderer.domElement.asInstanceOf[DomElementExt2])
    }).asInstanceOf[js.Function1[js.Any, _]])

    // Load data provided at setup window
    var dataset = BrowserStorage("SM1_timeSeries").collect()

    val loader = new FontLoader()
    Log.show("FontLoader created.")
    loader.load( "fonts/helvetiker_regular.typeface.json", (font: js.Dynamic) => {
      Log("Font loaded")
      Text.font = font.asInstanceOf[Font]
    }, (prog: js.Dynamic) => {
        Log("Progress...")
        Log.show(prog)
    }, (err: js.Dynamic) => {
        Log.show("Hit error when attempting to load font")
        Log.show(err)
    })

    // Load texture for plots
    val loadTexture = Res.loadPointTexture(1) // TODO: The texture should be an option
    import scala.concurrent.ExecutionContext.Implicits.global
    loadTexture andThen {
      case Success(texture) =>
        Log("Loaded the point texture!")
      //env.plot(dataset, Colors.RED_HUE_SHIFT)
      case Failure(err) =>
        Log.show("Failed to load the texture!")
        err.printStackTrace()
    }

    // Setup Oculus Controls
    Window.setupEventListeners(env.camera, env.renderer)
    controls.setup(env)

    // Add FPS stats to the Window
    stats = new facades.Stats()
    container.appendChild(stats.dom)

    // Append "ENTER VR" Button to DOM
    dom.document.body.appendChild( WEBVR.createButton(env.renderer) )
    Rendering.start(env, stats)
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
  def renderer: Renderer = env.renderer

  @JSExport("scene")
  def scene: Scene = Environment.instance.scene
}
