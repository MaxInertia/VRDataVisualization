package viewable

import facades.IFThree._
import org.scalajs.dom
import org.scalajs.threejs._
import resources._
import controls.{Interactions, Laser}
import viewable.displays.ColumnPicker
import viewable.plots._
import window.Window

import scala.scalajs.js.JSConverters._
import scala.scalajs.js.typedarray.Float32Array

/**
  * Serves as a wrapper for the Three.js Scene, PerspectiveCamera, and WebGLRenderer.
  * Provides methods for the insertion, removal, and updating of scene contents.
  *
  * TODO: Insertion and removal via addition and removal of regions (Env should contain the list of regions)
  *
  * Created by Dorian Thiessen on 2018-01-11.
  */
class Environment(val scene: Scene,
                  val camera: PerspectiveCamera,
                  val renderer: WebGLRenderer) {

  // This will be the parent of the controllers
  // Fixes the issue where the controllers are in the floor
  val fakeOrigin: Group = new Group
  fakeOrigin.position.set(0, 1.6, 0)
  scene.add(fakeOrigin)

  // -- VR GUIs! (implementation pending)

  //val displays: mutable.MutableList[PlaneDisplay] = mutable.MutableList()

  // ------ Plot stuff

  private val plots3D: Array[Option[Array[Plot]]] = Array(None, None, None, None)

  def plot(data: Array[Data], pointColor: Double = Colors.BLUE_HUE_SHIFT, plotNum: Int = 0): Unit = {
    if(data.isEmpty) return
    val scatterPlot: ScatterPlot = ScatterPlot(data, Res.getLastLoadedTextureID, pointColor)

    val columnPicker = ColumnPicker.init(scatterPlot.getColumnNames)
    scene.add(columnPicker)

    // The following three lines use Scene, Environment AND Regions...
    plots3D(plotNum) = Some(Array(scatterPlot)) // Currently we assume we're only generating one.
    val maybeNewRegion = Regions.add(plots3D(plotNum).get(0))
    if(maybeNewRegion.nonEmpty) scene.add(maybeNewRegion.get.object3D)
  }

  // ----- Rendering!

  def render(): Unit = {
    val maybeRC: Option[Laser] = controls.getSelectionRayCaster(camera)
    if(maybeRC.nonEmpty) {
      if (Regions.numOccupied() >= 1) {
        hoverAction(maybeRC.get)
      }
    }
    //Actions.update(maybeRC)
    Regions.update()
    renderer.render(scene, camera)
  }

  // TODO: pointHighlighting is a user interaction, and the Environment should be ignorant of those?

  def hoverAction(laser: Laser): Unit = {
    var ids: (Option[Int], Int) = (None, 0)

    // # Point Highlighting
    val regions = Regions.getNonEmpties
    // For every region (each of which contains a plot)
    for(index <- regions.indices) {
      val region = regions(index)
      if(region.plot.nonEmpty) {
        // Get the active plot in this region
        val plot = region.plot.get
        // Retrieve intersections on an available ray caster
        val intersects: scalajs.js.Array[Intersection] = laser.rayCaster.intersectObject(plot.getPoints)
        // If intersections exist apply interaction behaviour
        if (intersects.nonEmpty) {
          // Apply highlighting to the first point intersected if it's visible
          val interactionFound = Interactions.on(plot, intersects)
          if(interactionFound) {
            // Shrink laser so endpoint is on the intersected point
            laser.updateLengthScale(intersects(0).distance)
            return
          } // else that point was not visible, continue...
        }
      }
    }

    // # ColumnPicker hovering
    val interactionFound = ColumnPicker.interactionCheck(laser)

    // Restore laser to full length
    if(!interactionFound) laser.updateLengthScale(5)

  }

  def selectAllHighlightedPoints(): Unit = { // TODO: Only select the current point highlighted
    for(r <- Regions.getNonEmpties) {
      if(r.plot.nonEmpty) {
        val plot = r.plot.get
        if (plot.highlighted.nonEmpty) {
          dom.console.log(s"Plot $r saving point ${plot.highlighted}")
          plot.savedSelections += plot.highlighted.get
          plot.highlighted = None
        } else {
          dom.console.log(s"Plot $r has a selection of -1")
        }
      }
    }
  }

  def clearSelections(): Unit = {
    for(r <- Regions.getNonEmpties) {
      if(r.plot.nonEmpty) {
        val plot = r.plot.get
        if(plot.highlighted.nonEmpty) {
          plot.savedSelections += plot.highlighted.get
          plot.highlighted = None
        }
      }
    }
  }
}

object Environment {
  var instance: Environment = _

  type Column = (String, Array[Double])

  /**
    * Initiates setup for the Environment.
    *
    * The Environment includes:
    * - the perspective camera,
    * - the renderer,
    * - and the scene.
    *
    * @param container The dom element in which the renderer will display the environment.
    * @return The environment instance.
    */
  def setup(container: dom.Element): Environment = {
    val camera: PerspectiveCamera = makeCamera()
    val renderer: WebGLRenderer = makeRenderer()
    val scene: Scene = makeScene()
    val env: Environment = new Environment(scene, camera, renderer)
    container.appendChild(renderer.domElement)
    scene.add(camera)
    for(r <- Regions.getNonEmpties) scene.add(r.object3D)
    //for(ip <- Actions.inputPanels) scene.add(ip.object3D)
    instance = env
    env
  }

  /**
    * Creates the renderer.
    * @return THREE.WebGLRenderer instance
    */
  private def makeRenderer(): WebGLRenderer = {
    val renderer = new WebGLRenderer().asInstanceOf[WebGLRendererExt]
    renderer.setSize(Window.width, Window.height)
    renderer.devicePixelRatio = Window.devicePixelRatio
    renderer.vr.enabled = true
    renderer.setClearColor(new Color(0xeebbbb))
    renderer
  }

  /**
    * Creates the camera, the perspective through which the user views the scene.
    * @param aspectRatio The aspect ratio of the display area
    * @return THREE.PerspectiveCamera instance
    */
  private def makeCamera(aspectRatio: Double = Window.aspectRatio): PerspectiveCamera =
    new PerspectiveCamera(
      65,          // Field of view
      aspectRatio, // Aspect Ratio
      0.01,        // Nearest distance visible
      20000        // Farthest distance visible
    )

  /**
    * Creates the scene, the space in which objects can be placed for viewing.
    * @return THREE.Scene instance
    */
  private def makeScene(): Scene = {
    import facades.IFThree.ImplicitConversions._
    val scene = new Scene()
    scene.background = new Color(0x111111) // <- dark gray. Use 0x7EC0EE for light blue

    val delta = 0.001 // distance of grid from planes

    def addFloor(): Unit = {
      val floorMaterial = new MeshLambertMaterial()
      floorMaterial.color = new Color(0xffffff)
      val floorGeometry = new PlaneGeometry( 2, 2, 32 )
      val floor = new Mesh(floorGeometry, floorMaterial)
      floor.receiveShadow = false
      floor.rotateX(-3.1415/2)
      // Add 6x6m grid broken into 36 sections
      val floorGrid: GridHelper = new GridHelperExt(2, 4, Colors.Black, Colors.Black)
      floorGrid.position.setY(0.001)
      floorGrid.material.linewidth = 2.0
      scene.add(floorGrid)
      scene.add(floor)
    }

    val floorLight = makeLight(3, 0)
    scene.add(floorLight)
    addFloor()
    scene
  }

  private def makeLight(yPos: Double, xOrientation: Double): Light = {
    val spotlight = new SpotLight(0xffffff, 0.5)
    spotlight.distance = 10
    spotlight.castShadow = true
    spotlight.position.set(0, yPos, 0)
    spotlight.rotateX(xOrientation)
    spotlight
  }
}
