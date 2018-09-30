import facade.Dat
import facade.IFThree.{Font, FontLoader, SomeEvent, VRController}
import org.scalajs.dom
import org.scalajs.dom.MouseEvent
import org.scalajs.threejs.Renderer
import resources.{FileAsText, Res}
import util.Log
import vrdv.input.{Connect, mouse, oculus}
import vrdv.input.oculus.{Input, OculusController, OculusControllerLeft, OculusControllerRight}
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

  /**
   * Oculus Controllers; [0: Left, 1: Right]
   */
  var controllers: Array[OculusController] = Array(null, null)

  /** --------------------------------
   * The applications main entry point
   * --------------------------------- */
  @JSExportTopLevel("vrdv.start")
  def start(): Unit = {
    // Wraps all changes to the model
    val modelManager: PlotterModelManager = new PlotterModelManager()
    maybeModelManager = Some(modelManager)
    setEventListeners(modelManager)

    // Wraps rendering-specific objects and methods
    val viewContainer = dom.document.getElementById("scene-container")
    val vm = ViewManager(modelManager, viewContainer)
    vm.passRendererTo((renderer: Renderer) ⇒ {
      val (_, camera) = modelManager.getRenderables
      Dat.GUIVR.enableMouse(camera, renderer)
    })

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

  /**
   * Add event listeners for controller connected events.
   * @param mc PlotterModelManager instance
   */
  private def setEventListeners(mc: PlotterModelManager): Unit = {

    mouse.setPMM(mc)
    dom.window.addEventListener("mousemove", (event: MouseEvent) ⇒ mouse.onDocumentMouseMove(event))
    dom.window.addEventListener("click", (event: MouseEvent) ⇒ mouse.onDocumentMouseClick(event))

    dom.window.addEventListener("vr controller connected", (event: SomeEvent) => {
      val controller: VRController = event.detail.asInstanceOf[VRController]
      Log.show(s"Controller Connected: ${controller.name}")

      mc.passInput(new Connect(){vrc = controller})

      if(controller.name == oculus.LeftControllerName)
        controllers(0) = new OculusControllerLeft(controller, mc) // TODO: Handle disconnect here so we can remove these references
      else if(controller.name == oculus.RightControllerName)
        controllers(1) = new OculusControllerRight(controller, mc)
      else {
        Log.show("[Controls]\t Unknown controller passed on event: \"vr controller connected\"")
        Log.show(controller)
      }

      mouse.removePMM()
      dom.window.removeEventListener("mousemove", (event: MouseEvent) ⇒ mouse.onDocumentMouseMove(event))
    })

    // NOTE: This never fires when using VRController to handle controller state queries
    /*Log.show("Adding event listener: Disconnected")
    dom.window.addEventListener(Input.Disconnected, (event: Event) => {     // This is never fired.
      Log.show(s"!!!!!!!!!!! Input.Disconnected (${Input.Disconnected}) EVENT FIRED !!!!!!!!!!!!!!!!!!!!!!")
      Log.show(event)
      //Log.show(s"${controllers(i).name} Disconnecting...")
      //controllers(i).laser.destruct()
      //vrc.remove(controller.controllerMesh)
      //controller.parent.remove(controller)
      //Log.show(s"${controllers(i).name} Disconnected!")
      //controllers(i) = null
    })*/
  }

}
