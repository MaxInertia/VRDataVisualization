package env

import facades.three.IFThree._
import org.scalajs.{threejs => THREE}
import org.scalajs.dom

import scala.util.{Failure, Success}
import math.Stats
import plots._
import resources._
import userinput.{Controls, Interactions}
import window.Window
import resources.Res.Texture
import Environment.{PerspectiveCamera, Scene, WebGLRenderer}
import userinput.Controls.{RayCaster, rayCaster}
import util.Log

/**
  * Created by Dorian Thiessen on 2018-01-11.
  */
class Environment(val scene: Scene,
                  val camera: PerspectiveCamera,
                  val renderer: WebGLRenderer) {

  /** Used to group multiple objects in the environment
    * that should always move and rotate together */
  type Group = THREE.Object3D // TODO: Use THREE.Group? Not in facade.

  /** Regions are represent positions in the scene,
    * used to anchor multiple objects to one another */
  private object Regions {
    var regions: Array[Group] = Array()
    def apply(): Array[Group] = regions
    def apply(i: Int): Group = regions(i)

    def add(newRegion: Group): Unit = {
      Log(s"Adding region #${regions.length}")
      regions = regions :+ newRegion
      scene.add(newRegion)
      reposition()
    }

    def update(regionID: Int, plotID: Int): Unit = {
      // Remove current plot if region is not empty
      if(active(regionID) != DNE) regions(regionID)
        .remove(getPlot(regionID % 2, active(regionID)).getPoints)
      // Add the requested plot to the region
      regions(regionID).add(getPlot(regionID % 2,plotID).getPoints)
    }

    def reposition(): Unit = Regions().length match {
      case 1 =>
        regions(0).position.set(0, 1, -2) // north
      case 2 =>
        regions(0).position.set(-0.6, 1, -1) // north west
        regions(1).position.set(0.6,  1, -1) // north east
      case 3 =>
        regions(0).position.set(-2.1, 1, -2) // north west
        regions(1).position.set(0,    1, -2) // north
        regions(2).position.set(2.1,  1, -2) // north east
      case 4 =>
        regions(0).position.set(-2.7, 1, -2) // north west
        regions(1).position.set(-1.1, 1, -2) // north-north west
        regions(2).position.set(1.1,  1, -2) // north-north east
        regions(3).position.set(2.7,  1, -2) // north east
    }
  }

  def getRegions: Array[Group] = Regions.regions
  def repositionRegions(): Unit = Regions.reposition()

  private val plots3D: Array[Option[Array[Plot]]] = Array(None, None)

  /** Index of the active plots in each region */
  var active: Array[Int] = Array()

  val DNE: Int = -248 // Does Not Exist

  /**
    * Returns the Plot that is currently visible in the specified region
    * @param regionID The region the plot belongs to. (either 0 or 1)
    * @return The Shadow Manifold
    */
  def getActivePlot(regionID: Int): Plot = plots3D(regionID).get(active(regionID))
  def getPlot(regionID: Int, plotID: Int): Plot = plots3D(regionID).get(plotID)

  def nextPlot(regionID: Int) : Unit = {
    if(active.length <= regionID) loadPlot(regionID, 0)
    else loadPlot(regionID, (active(regionID) + 1) % plots3D(regionID).get.length)
  }

  /**
    * Swaps out the currently visible plot for the specified plot.
    * @param regionID Which region the plot belongs to. (either 0 or 1)
    * @param plotID The index of the plot in plots3D.
    */
  def loadPlot(regionID: Int, plotID: Int): Unit = {
    if(regionID > Regions().length) {
      Log(s"USER ERROR: There are only ${Regions().length} regions, cannot load plot into region $regionID.")
      Log(s"Use loadPlot(${Regions().length}, $plotID) to create a new region containing that plot!")
      return
    }

    // Increase the number of available regions, place requested plot inside
    if(regionID == Regions().length) {
      Regions.add(new Group)
      active = active :+ plotID
    }

    Regions.update(regionID, plotID) // Add requested plot
    active(regionID) = plotID // Update active plot index
  }

  def addPlots(regionID: Int, plots: Option[Array[Plot]]): Unit = {
    Log(s"Added plots to region #$regionID")
    plots3D(regionID) = plots
  }

  def render(): Unit = {
    val maybeRC: Option[THREE.Raycaster] = Controls.getSelectionRayCaster(camera)
    if(maybeRC.nonEmpty) {
      // TODO: Still find a better way to ignore points while waiting for the texture to be loaded
      if (Regions().length >= 2) pointSelection(maybeRC.get)
    }
    renderer.render(scene, camera)
  }

  def pointSelection(rayCaster: RayCaster): Unit = {
    // Retrieve intersections on the available inputs ray caster
    val intersects: Array[scalajs.js.Array[THREE.Intersection]] = Array(
      rayCaster.intersectObject(getActivePlot(0).getPoints),
      rayCaster.intersectObject(getActivePlot(1).getPoints))

    val plot1 = getActivePlot(0)
    val plot2 = getActivePlot(1)
    var (results1, results2)= ((-1, -1), (-1, -1))
    // Intersections with the first plot
    if(intersects(0).nonEmpty) results1 = Interactions.on(plot1, intersects(0))
    // Intersections with the second plot
    if(intersects(1).nonEmpty) results2 = Interactions.on(plot2, intersects(1))

    // TODO: This may be specific use case for SM, not general
    // Selecting point in opposing plot
    val (rem1, add1) = (results1._1, results1._2)
    val (rem2, add2) = (results2._1, results2._2)
    if(rem1 != -1) plot2.deselect(rem1)
    if(add1 != -1) plot2.select(add1)
    if(rem2 != -1) plot1.deselect(rem2)
    if(add2 != -1) plot1.select(add2)
  }
}

object Environment {
  type Scene = THREE.Scene
  type WebGLRenderer = THREE.WebGLRenderer
  type PerspectiveCamera = THREE.PerspectiveCamera

  var instance: Environment = _

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
    container.appendChild(renderer.domElement)

    val scene: Scene = makeScene()
    scene.add(camera)
    //scene.add(makeLight())

    val env: Environment = new Environment(scene, camera, renderer)
    instance = env

    // Load texture for plots
    val loadTexture = Res.loadPointTexture(1)
    import scala.concurrent.ExecutionContext.Implicits.global
    loadTexture andThen {
      case Success(texture) => makePlots(env, texture)
      case Failure(err) => err.printStackTrace()
    }

    env
  }

  def makePlots(env: Environment, texture: Texture): Unit = { // Not happy with this method
    def makeSingle(texture: Texture, plotNumber: Int, storageID: String, hue: Double): Unit = {
      // Create the plot
      val sm = createSMPlots(storageID, hue, 1)
      if (sm.isEmpty) return
      env.addPlots(plotNumber, sm)
      env.loadPlot(regionID = plotNumber, plotID = 0)
      val axes = CoordinateAxes3D.create(1, color = Color.BLACK, centeredOrigin = true, planeGrids = false)
      env.Regions(plotNumber).add(axes) // Add coordinate axes (TEMPORARY)
    }
    makeSingle(texture, 0, "SM1_timeSeries", Color.BLUE_HUE_SHIFT)
    makeSingle(texture, 1, "SM2_timeSeries", Color.RED_HUE_SHIFT)
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
    val scene = new Scene()
    scene.background = new THREE.Color(0x666666)

    val delta = 0.001 // distance of grid from planes


    def addFloor(): Unit = {
      val floorMaterial = new THREE.MeshLambertMaterial()
      floorMaterial.color = new THREE.Color(0xdddddd)
      val floorGeometry = new THREE.PlaneGeometry( 6, 6, 32 )
      val floor = new THREE.Mesh(floorGeometry, floorMaterial)
      floor.rotateX(-3.1415/2)
      // Add 6x6m grid broken into 36 sections
      val floorGrid: THREE.GridHelper = new THREE.GridHelper(6,6)
      floorGrid.position.setY(0.001)
      scene.add(floorGrid)
      scene.add(floor)
    }

    def addRoof(height: Double) {
      val material = new THREE.MeshBasicMaterial()
      material.color = new THREE.Color(0xbbbbbb)
      val roofGeometry = new THREE.PlaneGeometry(6, 6, 32)
      val roof = new THREE.Mesh(roofGeometry, material)
      roof.translateY(3)
      roof.rotateX(3.1415 / 2)
      // Add same grid on floor
      val roofGrid: THREE.GridHelper = new THREE.GridHelper(6, 6)
      roofGrid.position.setY(height - delta)
      scene.add(roofGrid)
      scene.add(roof)
    }

    val light = makeLight()
    scene.add(light)
    addFloor()
    addRoof(3)
    scene
  }

  def makeLight(): THREE.Light = {
    val spotlight = new THREE.SpotLight(0xffffff, 0.5)
    spotlight.castShadow = true
    spotlight.position.set(0, 2.6, 0)
    spotlight.rotation.set(0,0,0)
    spotlight
  }

  def createSMPlots(localStorageID: String, hue: Double, textureIndex: Int): Option[Array[Plot]] = {
    val timeSeries = BrowserStorage.timeSeriesFromCSV(localStorageID)
    if (timeSeries.isEmpty) None
    else {
      // Standardize the values
      val standardizedData = timeSeries.get.map { case (id, vs) => (id, Stats.standardize(vs)) }

      var plots: Array[ShadowManifold] = Array()
      var i = 0
      for ((id, data) <- standardizedData) {
        val points = PointsBuilder()
          .withXS(data.drop(2))
          .withYS(data.tail)
          .withZS(data)
          .usingHue(Some(hue))
          .usingTexture(textureIndex)
          .build3D()
        plots = plots :+ ShadowManifold(id, points, hue)
        i += 1
      }

      Some(plots.asInstanceOf[Array[Plot]])
    }
  }

  implicit def toSceneExt(scene: THREE.Scene): SceneExt = scene.asInstanceOf[SceneExt]
}
