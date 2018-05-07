package env

import facades.IFThree._
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
import facades.Dat
import userinput.Controls.RayCaster
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

  // This will be the parent of the controllers
  // Fixes the issue where the controllers are in the floor
  val fakeOrigin: Group = new Group
  fakeOrigin.position.set(0, 1.6, 0)
  scene.add(fakeOrigin)

  var datgui: Dat.GUIVR = _

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
        regions(0).position.set(-1, 1, -1) // north west
        regions(1).position.set(1, 1, -1)  // north east
      case 3 =>
        regions(0).position.set(-1, 1, -1) // north west
        regions(1).position.set(1, 1, -1)  // north east
        regions(2).position.set(-2, 1, 0)  // west
      case 4 =>
        regions(0).position.set(-1, 1, -1) // north west
        regions(1).position.set(1, 1, -1)  // north east
        regions(2).position.set(-2, 1, 0)  // west
        regions(3).position.set(2, 1, 0)   // east
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
  def getActivePlot(regionID: Int): Plot = plots3D(regionID % 2).get(active(regionID))
  def getPlot(regionID: Int, plotID: Int): Plot = plots3D(regionID % 2).get(plotID)

  def nextPlot(regionID: Int) : Unit = {
    if(active.length <= regionID) loadPlot(regionID, 0)
    else loadPlot(regionID, (active(regionID) + 1) % plots3D(regionID % 2).get.length)
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
      if (Regions().length >= 2) {
        /*// Cause points to pulsate; requires adding u_time to Points.uniforms, and changing shaders in index.html
        def pulsate(region: Int, rate: Double): Unit = {
          val material = getActivePlot(region).getPoints.material.asInstanceOf[THREE.ShaderMaterial]
          val utime = material.uniforms.asInstanceOf[Uniform].u_time.asInstanceOf[UTime]
          utime.value = utime.value + rate.toFloat
        }
        pulsate(0, 0.1)
        pulsate(1, 0.1)*/

        pointHighlighting(maybeRC.get)
      }
    }

    renderer.render(scene, camera)
  }

  def pointHighlighting(rayCaster: RayCaster): Unit = {
    // For every region (each of which contains a plot)
    for(region <- getRegions.indices) {

      // Get the active plot in this region
      val plot = getActivePlot(region)

      // Retrieve intersections on an available ray caster
      val intersects: scalajs.js.Array[THREE.Intersection] =
        rayCaster.intersectObject(plot.getPoints)

      // If not intersections exist, don't initiate an interaction
      if(intersects.nonEmpty) {

        // Apply highlighting to the first point intersected
        Interactions.on(plot, intersects)
      }
    }
  }

  def selectAllHighlightedPoints(): Unit = { // TODO: Only select the current point intersected
    for(r <- getRegions.indices) {
      val plot = getActivePlot(r)
      if(plot.highlighted.nonEmpty) {
        dom.console.log(s"Plot $r saving point ${plot.highlighted}")
        plot.savedSelections += plot.highlighted.get
        plot.highlighted = None
      } else {
        dom.console.log(s"Plot $r has a selection of -1")
      }
    }
  }

  def clearSelections(): Unit = {
    for(r <- getRegions.indices) {
      val plot = getActivePlot(r)
      if(plot.highlighted.nonEmpty) {
        plot.savedSelections += plot.highlighted.get
        plot.highlighted = None
      }
    }
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

    val gui = makeDatGUI()
    gui.position.set(0,1,0)
    env.datgui = gui
    scene.add(gui)

    env
  }

  def makeDatGUI(): Dat.GUIVR = {
    Log.show("Creating DATGUI!")
    val gui = Dat.GUIVR.create("Empty Gui")
    gui
  }

  // TODO: Default should be scatterplot, whose axes can be selected by the user from data columns
  def makePlots(env: Environment, texture: Texture): Unit = { // Not happy with this method
    def makeSingle(texture: Texture, plotNumber: Int, storageID: String, hue: Double): Unit = {
      // Create the plot
      val sm = createSMPlots(storageID, hue, 1)
      if (sm.isEmpty) return
      env.addPlots(plotNumber, sm)
      env.loadPlot(regionID = plotNumber, plotID = 0)
      val axes = CoordinateAxes3D.create(1, color = Colors.White, centeredOrigin = true, planeGrids = true)
      env.Regions(plotNumber).add(axes) // Add coordinate axes (TEMPORARY)
    }
    makeSingle(texture, 0, "SM1_timeSeries", Colors.BLUE_HUE_SHIFT)
    makeSingle(texture, 1, "SM2_timeSeries", Colors.RED_HUE_SHIFT)
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
    //renderer.shadowMap.enabled = true
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
  private def makeScene(): Scene = { // TODO: Make a SceneBuilder?
    val scene = new Scene()
    scene.background = new THREE.Color(0x111111) // <- dark gray. Use 0x7EC0EE for light blue

    val delta = 0.001 // distance of grid from planes

    def addRoof(height: Double) { // TODO: Seem unable to cast light on the roof?
      val material = new THREE.MeshLambertMaterial()
      material.color = new THREE.Color(0xffffff)
      val roofGeometry = new THREE.PlaneGeometry(6, 6, 32)
      val roof = new THREE.Mesh(roofGeometry, material)
      roof.translateY(height)
      roof.rotateX(3.1415 / 2)
      // Add same grid on floor
      val roofGrid: THREE.GridHelper = new GridHelperExt(6, 6, Colors.Black, Colors.Black)
      roofGrid.position.setY(height - delta)
      scene.add(roofGrid)
      scene.add(roof)
    }

    def addFloor(): Unit = {
      val floorMaterial = new THREE.MeshLambertMaterial()
      floorMaterial.color = new THREE.Color(0xffffff)
      val floorGeometry = new THREE.PlaneGeometry( 6, 6, 32 )
      val floor = new THREE.Mesh(floorGeometry, floorMaterial)
      floor.receiveShadow = true
      floor.rotateX(-3.1415/2)
      // Add 6x6m grid broken into 36 sections
      val floorGrid: THREE.GridHelper = new GridHelperExt(6, 6, Colors.Black, Colors.Black)
      floorGrid.position.setY(0.001)
      floorGrid.material.linewidth = 2.0
      scene.add(floorGrid)
      scene.add(floor)

      var boxMaterial = new THREE.MeshLambertMaterial()
      var boxGeometry = new THREE.CubeGeometry(1, 0.35, 1)
      def addCornerCubes(x: Double, y: Double, z: Double) {
        var boxGeo = new THREE.CubeGeometry(1, y, 1)
        var cube = new THREE.Mesh(boxGeo, boxMaterial)
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
      addCornerCubes(1.5, 0.25, -2.5)
    }

    val floorLight = makeLight(3, 0)
    scene.add(floorLight)

    /*val dLight = new THREE.DirectionalLight(intensity = 0.2)
    dLight.rotateX(-3.1415/2)
    dLight.translateZ(5)
    dLight.castShadow = true
    scene.add(dLight)*/

    //val roofLight = makeLight(0.4, 3.1415)
    //scene.add(roofLight)

    addFloor()
    addRoof(6)
    scene
  }

  def makeLight(yPos: Double, xOrientation: Double): THREE.Light = {
    val spotlight = new THREE.SpotLight(0xffffff, 0.5)
    spotlight.distance = 10
    spotlight.castShadow = true
    spotlight.position.set(0, yPos, 0)
    spotlight.rotateX(xOrientation)
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

  def createScatterPlot(localStorageID: String, hue: Double, textureIndex: Int): Option[Array[Plot]] = {
    val csvData = BrowserStorage.timeSeriesFromCSV(localStorageID)
    if (csvData.isEmpty) None
    else {
      // Standardize the values
      val standardizedData = csvData.get.map { case (id, vs) => (id, Stats.standardize(vs)) }

      var plots: Array[ScatterPlot] = Array()
      var i = 0
      for ((id, data) <- standardizedData) {
        /*val points = PointsBuilder()
          .withXS(data)
          .withYS(data)
          .withZS(data)
          .usingHue(Some(hue))
          .usingTexture(textureIndex)
          .build3D()
        plots = plots :+ ScatterPlot(id, hue, points, hue)
        */
        i += 1
      }

      Some(plots.asInstanceOf[Array[Plot]])
    }
  }

  implicit def toSceneExt(scene: THREE.Scene): SceneExt = scene.asInstanceOf[SceneExt]
}
