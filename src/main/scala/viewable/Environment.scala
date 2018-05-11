package viewable

import facades.Dat
import facades.IFThree._
import math.Stats
import org.scalajs.dom
import org.scalajs.threejs.{Colors => _, _}
import resources._
import userinput.{Controls, Interactions}
import util.Log
import viewable.displays.PlaneDisplay
import viewable.plots._
import window.Window

import scala.collection.mutable
import scala.scalajs.js
import scala.util.{Failure, Success}
import scala.scalajs.js.JSConverters._

/**
  * Serves as a wrapper for the Three.js Scene, PerspectiveCamera, and WebGLRenderer.
  * Provides methods for the insertion, removal, and updating of scene contents.
  * TODO: Insertion and removal via addition and removal of regions (Env should contain the list of regions)
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

  // -- VR GUIs!

  val displays: mutable.MutableList[PlaneDisplay] = mutable.MutableList()

  // ------ Plot stuff

  private val plots3D: Array[Option[Array[Plot]]] = Array(None, None)

  /*def getPlot(regionID: Int, plotID: Int): Plot = plots3D(regionID % 2).get(plotID)

  def nextPlot(regionID: Int) : Unit = {
    //if(active.length <= regionID) loadPlot(regionID, 0)
    //else loadPlot(regionID, (active(regionID) + 1) % plots3D(regionID % 2).get.length)
  }*/

  // ----- Rendering!

  def render(): Unit = {
    val maybeRC: Option[Raycaster] = Controls.getSelectionRayCaster(camera)
    if(maybeRC.nonEmpty) {
      // TODO: Still find a better way to ignore points while waiting for the texture to be loaded
      if (Regions.numOccupied() >= 1) {
        pointHighlighting(maybeRC.get)
      }
    }

    renderer.render(scene, camera)
  }

  // TODO: pointHighlighting is a user interaction, and the Environment should be ignorant of those

  def pointHighlighting(rayCaster: Raycaster): Unit = {
    // For every region (each of which contains a plot)
    for(region <- Regions.getNonEmpties) {
      if(region.plot.nonEmpty) {
        // Get the active plot in this )
        val plot = region.plot.get
        // Retrieve intersections on an available ray caster
        val intersects: scalajs.js.Array[Intersection] = rayCaster.intersectObject(plot.getPoints)
        // If not intersections exist, don't initiate an interaction
        if (intersects.nonEmpty) {
          // Apply highlighting to the first point intersected
          Interactions.on(plot, intersects)
        }
      }
    }
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
  // Is this a bad way to do it? The alternative is to retain all original
  // AND updated points which won't be feasible for large datasets..
  type ColumnWStats = (String, Array[Double], Double, Double)

  /**
    * Prepares raw data for being turned into points then plotted
    * @param localStorageID ID of data in browser storage // TODO: This should be generalized to DataSource
    * @return Preprocessed data, ready to be turned into points and plotted!
    */
  def prepareData(localStorageID: String): Array[ColumnWStats] = {
    val timeSeries = BrowserStorage.timeSeriesFromCSV(localStorageID)
    if (timeSeries.isEmpty) Array()
    else timeSeries.get.map{ case (id, vs) =>
      val (stanValues, stanDev, mean) = Stats.standardize(vs)
      (id, stanValues, stanDev, mean)
    }
  }

  /**
    * Initiates setup for the Environment.
    *
    * The Environment includes:
    * - the perspective camera,
    * - the renderer,
    * - and the scene.
    *
    * Setup involves:
    * - initializing camera, scene, and renderer,
    * - loading required resources (ex: The texture for points,
    *                                   and data used for point positions.)
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
    instance = env
    //Dat.createGUI()

    // Load texture for plots
    val loadTexture = Res.loadPointTexture(1) // TODO: The texture should be an option
    import scala.concurrent.ExecutionContext.Implicits.global
    loadTexture andThen {
      case Success(texture) => plot(env)
      case Failure(err) =>
        Log("Failed to load the texture!")
        err.printStackTrace()
    }

    //env.scene.add(DatGui.instance.asInstanceOf[Object3D])
    env
  }

  def plot(env: Environment, plotNum: Int = 0): Unit = {
    val columnSetWithStats: Array[ColumnWStats] = prepareData(localStorageID = s"SM${plotNum + 1}_timeSeries")
    val stats: Array[(Double, Double)] = columnSetWithStats.map{ case (_, _, sd, m) => (sd, m) }
    val columnSet: Array[Column] = columnSetWithStats.map{ case (n, d, _, _) => (n, d) }
    if(columnSet.nonEmpty) {
      val scatterPlot: Plot = ScatterPlot(columnSet, stats, 1, Colors.BLUE_HUE_SHIFT)

      // The following three lines use Scene, Environment AND Regions...
      env.plots3D(plotNum) = Some(Array(scatterPlot)) // Currently we assume we're only generating one.
      val maybeNewRegion = Regions.add(env.plots3D(plotNum).get(0))
      if(maybeNewRegion.nonEmpty) env.scene.add(maybeNewRegion.get.object3D)

      // Attempts to load more data
      if(plotNum == 0) plot(env, plotNum+1)
      // Recursive call above should work without the conditional since columnSet SHOULD be None
      // in the recursive call. It works when terminating on plotNum = 1 (when only one dataset is provided)
    } else if( plotNum == 0 && columnSet.isEmpty) {
      Log("No data was found in the browsers LocalStorage! Unable to create plots.")
    } else {
      Log(s"Was able to create $plotNum plots!")
    }
  }

  /**
    * Creates the renderer.
    * @return THREE.WebGLRenderer instance
    */
  private def makeRenderer(): WebGLRenderer = {
    val renderer = new WebGLRenderer().asInstanceOf[WebGLRendererExt]
    renderer.setSize(Window.width, Window.height)
    renderer.devicePixelRatio = Window.devicePixelRatio
    renderer.vr.enabled = false
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

    def addRoof(height: Double) { // TODO: Seem unable to cast light on the roof?
      val material = new MeshLambertMaterial()
      material.color = new Color(0xffffff)
      val roofGeometry = new PlaneGeometry(6, 6, 32)
      val roof = new Mesh(roofGeometry, material)
      roof.translateY(height)
      roof.rotateX(3.1415 / 2)
      // Add same grid on floor
      val roofGrid: GridHelper = new GridHelperExt(6, 6, Colors.Black, Colors.Black)
      roofGrid.position.setY(height - delta)
      scene.add(roofGrid)
      scene.add(roof)
    }

    def addFloor(): Unit = {
      val floorMaterial = new MeshLambertMaterial()
      floorMaterial.color = new Color(0xffffff)
      val floorGeometry = new PlaneGeometry( 6, 6, 32 )
      val floor = new Mesh(floorGeometry, floorMaterial)
      floor.receiveShadow = false
      floor.rotateX(-3.1415/2)
      // Add 6x6m grid broken into 36 sections
      val floorGrid: GridHelper = new GridHelperExt(6, 6, Colors.Black, Colors.Black)
      floorGrid.position.setY(0.001)
      floorGrid.material.linewidth = 2.0
      scene.add(floorGrid)
      scene.add(floor)

      /*var boxMaterial = new MeshLambertMaterial()
      var boxGeometry = new CubeGeometry(1, 0.35, 1)
      def addCornerCubes(x: Double, y: Double, z: Double) {
        var boxGeo = new CubeGeometry(1, y, 1)
        var cube = new Mesh(boxGeo, boxMaterial)
        cube.castShadow = true
        cube.receiveShadow = true
        cube.position.set(x, y/2, z)
        scene.add(cube)
      }
      addCornerCubes(2.5, 0.35, 2.5)
      addCornerCubes(-2.5, 0.35, 2.5)
      addCornerCubes(-2.5, 0.35, -2.5)
      addCornerCubes(2.5, 0.35, -2.5)

      addCornerCubes(2.5, 0.25, 1.5)
      addCornerCubes(-2.5, 0.25, 1.5)
      addCornerCubes(-2.5, 0.25, -1.5)
      addCornerCubes(2.5, 0.25, -1.5)

      addCornerCubes(1.5, 0.25, 2.5)
      addCornerCubes(-1.5, 0.25, 2.5)
      addCornerCubes(-1.5, 0.25, -2.5)
      addCornerCubes(1.5, 0.25, -2.5)*/
    }

    val floorLight = makeLight(3, 0)
    scene.add(floorLight)
    addFloor()
    //addRoof(6)
    scene
  }

  def makeLight(yPos: Double, xOrientation: Double): Light = {
    val spotlight = new SpotLight(0xffffff, 0.5)
    spotlight.distance = 10
    spotlight.castShadow = true
    spotlight.position.set(0, yPos, 0)
    spotlight.rotateX(xOrientation)
    spotlight
  }
}
