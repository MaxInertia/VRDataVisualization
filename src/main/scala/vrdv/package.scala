import facade.IFThree.{Font, FontLoader}
import org.scalajs.dom
import resources.{FileAsText, Res}
import util.Log
import vrdv.input.DeviceConnectionManager
import vrdv.model.PlotterModelManager
import vrdv.obj3D.{CustomColors, Text}
import vrdv.view.ViewManager

import scala.scalajs.js
import scala.scalajs.js.annotation.JSExportTopLevel
import scala.util.{Failure, Success}

/**
  * Virtual Reality Data Visualization
  * @author Dorian Thiessen | MaxInertia
  */
package object vrdv {
  /**
    * Reference to the model manager used when the user adds data
    * via the file-selector button on the application window.
    */
  private var maybeModelManager: Option[PlotterModelManager] = None

  @JSExportTopLevel("vrdv.start")
  def start(): Unit = {
    // Wraps all changes to the model
    val modelManager: PlotterModelManager = new PlotterModelManager()
    maybeModelManager = Some(modelManager)

    // Handles connection/disconnection events for controllers
    new DeviceConnectionManager(modelManager)

    // Wraps rendering-specific objects and methods
    val viewContainer = dom.document.getElementById("scene-container")
    ViewManager(modelManager, viewContainer)

    loadResources()
  }

  /**
    * Load data from file on users device.
    * precondition: File must be a CSV.
    */
  @JSExportTopLevel("vrdv.addData")
  def addData(data: String): Unit = {
    Log.show("[vrdv.addData]")
    if(maybeModelManager.isEmpty) return
    val modelManager = maybeModelManager.get
    if(data.isEmpty) Log.show("  Empty data on plot request")
    else modelManager.plotter.plot2D3D(FileAsText(data).collect(), CustomColors.BLUE_HUE_SHIFT)
  }

  /**
    * Loads resources required on start.
    *  - 1 Font
    *  - 1 Point Texture
    */
  private def loadResources(): Unit = {
    val loader = new FontLoader()
    Log.show("FontLoader created.")
    loader.load( "fonts/helvetiker_regular.typeface.json", (font: js.Dynamic) ⇒ {
      Log("Font loaded")
      Text.font = font.asInstanceOf[Font]
    }, (prog: js.Dynamic) ⇒ {
      Log("Font Loader Progress:")
      Log(prog)
    }, (err: js.Dynamic) ⇒ {
      Log.show("Hit error when attempting to load font")
      Log.show(err)
    })

    // Load texture for plot points
    val loadTexture = Res.loadPointTexture(1) // TODO: The texture should be an option
    import scala.concurrent.ExecutionContext.Implicits.global
    loadTexture andThen {
      case Success(texture) =>
        Log("Loaded the point texture!")
      case Failure(err) =>
        Log.show("Failed to load the texture!")
        err.printStackTrace()
    }
  }



}
