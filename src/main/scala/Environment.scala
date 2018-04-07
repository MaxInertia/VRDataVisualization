import js.three.{IntersectionExt, RaycasterParametersExt, SceneExt, VREffect}
import org.scalajs.{threejs => THREE}
import org.scalajs.dom
import plots._
import resources._

/**
  * Created by Dorian Thiessen on 2018-01-11.
  */
class Environment(val scene:    THREE.Scene,
                  val camera:   THREE.PerspectiveCamera,
                  val renderer: THREE.WebGLRenderer,
                  val vrEffect: VREffect) {

  /** Regions are represent positions in the scene,
    * used to anchor multiple objects to one another */
  private object Regions {
    private var regions: Array[THREE.Object3D] = Array()
    def apply(): Array[THREE.Object3D] = regions
    def apply(i: Int): THREE.Object3D = regions(i)

    def add(newRegion: THREE.Object3D): Unit = {
      regions = regions :+ newRegion
      scene.add(newRegion)
      reposition()
    }

    def update(regionID: Int, plotID: Int): Unit = {
      // Remove current plot if region is not empty
      if(active(regionID) != DNE) regions(regionID)
        .remove(plots3D(regionID % 2).get(active(regionID)).points)
      // Add the requested plot to the region
      regions(regionID).add(plots3D(regionID % 2).get(plotID).points)
    }

    private def reposition(): Unit = Regions().length match {
      case 1 =>
        regions(0).position.set(0, 0, -2) // north
      case 2 =>
        regions(0).position.set(-1.1, 0, -2) // north west
        regions(1).position.set(1.1,  0, -2) // north east
      case 3 =>
        regions(0).position.set(-2.1, 0, -2) // north west
        regions(1).position.set(0,    0, -2) // north
        regions(2).position.set(2.1,  0, -2) // north east
      case 4 =>
        regions(0).position.set(-2.7, 0, -2) // north west
        regions(1).position.set(-1.1, 0, -2) // north-north west
        regions(2).position.set(1.1,  0, -2) // north-north east
        regions(3).position.set(2.7,  0, -2) // north east
    }
  }

  val plots3D: Array[Option[Array[ShadowManifold]]] = Array(None, None, None) // TODO: Use Option?

  /** Index of the active plots in each region */
  var active: Array[Int] = Array()

  /**
    * Returns the ShadowManifold that is currently visible in the specified region
    * @param regionID The region the plot belongs to. (either 0 or 1)
    * @return The Shadow Manifold
    */
  @inline def get3DPlot(regionID: Int): ShadowManifold = plots3D(regionID).get(active(regionID))

  def nextPlot(regionID: Int) : Unit = {
    if(active.length <= regionID) loadPlot(regionID, 0)
    else loadPlot(regionID, (active(regionID) + 1) % plots3D.length)
  }

  /**
    * Swaps out the currently visible plot for the specified plot.
    * @param regionID Which region the plot belongs to. (either 0 or 1)
    * @param plotID The index of the plot in plots3D.
    */
  def loadPlot(regionID: Int, plotID: Int): Unit = {
    if(regionID > Regions().length) {
      dom.console.log(s"USER ERROR: There are only ${Regions().length} regions, cannot load plot into region $regionID.")
      dom.console.log(s"Use loadPlot(${Regions().length}, $plotID) to create a new region containing that plot!")
      return
    }

    // Increase the number of available regions, place requested plot inside
    if(regionID == Regions().length) {
      Regions.add(new THREE.Object3D)
      active = active :+ plotID
    }

    Regions.update(regionID, plotID) // Add requested plot
    active(regionID) = plotID // Update active plot index
  }

  def render(): Unit = {
    //if (VR.isPresenting()) {
    vrEffect.render(scene, camera)
    //} else {
    renderer.render(scene, camera)
    //}
    // TODO: Find a better way to ignore points while waiting for the texture to be loaded
    if(Plot.myTextures(0) != null && Plot.myTextures(1) != null) mousePointSelection()
  }

  val rayCaster: THREE.Raycaster = new THREE.Raycaster()
  // TODO: Determine how to appropriately scale rayCaster threshold with point size
  rayCaster.params.asInstanceOf[RaycasterParametersExt].Points.threshold = 0.015
  val DNE: Int = -248
  val SELECTIONS: Array[Int] = Array(DNE, DNE)

  // TODO: Make pointSelection a method in Plot?
  def mousePointSelection(): Unit = {
    // Retrieve intersections
    // TODO: Create method that returns the appropriate rayCaster (which depends on the users input method)
    rayCaster.setFromCamera(Controls.getMouse, camera)
    val intersects: Array[scalajs.js.Array[THREE.Intersection]] = Array(
      rayCaster.intersectObject(get3DPlot(0).points),
      rayCaster.intersectObject(get3DPlot(1).points))
    for(i <- 0 to 1) { // For each plot
      if(intersects(i).length > 0) { // If currently selecting point on current plot.
        if(SELECTIONS(i) != DNE) { // If previous selection exists, request plots deselect them.
          get3DPlot(0).deselect(SELECTIONS(i))
          get3DPlot(1).deselect(SELECTIONS(i))
        }
        // Request plots update selections.
        SELECTIONS(i) = intersects(i)(0).asInstanceOf[IntersectionExt].index
        // TODO: Generalize selection, have SM override selection behavior and take as arg the other SM
        // Basically don't assume we're dealing with shadow manifolds.
        get3DPlot(0).select(SELECTIONS(i))
        get3DPlot(1).select(SELECTIONS(i))
      }
    }
  }
}

object Environment {

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

    val camera: THREE.PerspectiveCamera = makeCamera()
    val (renderer, vrEffect) = makeRendererAndVREffect()
    container.appendChild(renderer.domElement)

    val scene: THREE.Scene = makeScene()
    scene.add(camera)
    scene.add(makeLight())

    val env: Environment = new Environment(scene, camera, renderer, vrEffect)

    // TODO: Create a PlotBuilder to hide all Plot creation details
    def drawPlot1(texture: THREE.Texture): Unit = drawPlot(texture, 0)
    def drawPlot2(texture: THREE.Texture): Unit = drawPlot(texture, 1)
    def drawPlot(texture: THREE.Texture, plotNumber: Int): Unit = {
      dom.console.log(texture.anisotropy)
      texture.anisotropy = 4
      Plot.myTextures(plotNumber) = texture
      // Add plots to the env
      if(plotNumber == 0) {
        val sm1 = createSMPlots("SM1_timeSeries", Color.RED_HUE_SHIFT, plotNumber) // TODO: Split off steps that do not require the texture
        if(sm1.isEmpty) return
        env.plots3D(0) = sm1
      } else {
        val sm2 = createSMPlots("SM2_timeSeries", Color.BLUE_HUE_SHIFT, plotNumber)
        if(sm2.isEmpty) return
        env.plots3D(1) = sm2
      }
      env.loadPlot(regionID = plotNumber, plotID = 0)
      val axes = CoordinateAxes3D.create(1, centeredOrigin = true, color = Color.WHITE)
      env.Regions(plotNumber).add(axes) // Add coordinate axes (TEMPORARY)
    }
    Res.loadPointTexture(drawPlot1, 0)
    Res.loadPointTexture(drawPlot2, 1)

    env
  }

  /**
    * Creates the renderer.
    * @return THREE.WebGLRenderer instance
    */
  private def makeRendererAndVREffect(): (THREE.WebGLRenderer, VREffect) = {
    val renderer = new THREE.WebGLRenderer()
    renderer.setSize(Window.width, Window.height)
    renderer.devicePixelRatio = Window.devicePixelRatio
    // Applies renderer to VR display (if available)
    val vrEffect = new VREffect(renderer)
    vrEffect.setSize(Window.width, Window.height)
    (renderer, vrEffect)
  }

  /**
    * Creates the camera, the perspective through which the user views the scene.
    * @param aspectRatio The aspect ratio of the display area
    * @return THREE.PerspectiveCamera instance
    */
  private def makeCamera(aspectRatio: Double = Window.aspectRatio): THREE.PerspectiveCamera =
    new THREE.PerspectiveCamera(
      65,          // Field of view
      aspectRatio, // Aspect Ratio
      0.01,        // Nearest distance visible
      20000        // Farthest distance visible
    )

  /**
    * Creates the scene, the space in which objects can be placed for viewing.
    * @return THREE.Scene instance
    */
  private def makeScene(): THREE.Scene = {
    val scene = new THREE.Scene()
    scene.background = new THREE.Color(Color.BLACK)
    scene
  }

  def makeLight(): THREE.Light = {
    val light = new THREE.DirectionalLight(Color.WHITE)
    light.position.set(1, 1, 1).normalize()
    light
  }

  /**
    * Add coordinate axes to the plot in this region
    * @param region The region of space in the scene to add the axes to
    */
  def addAxes(region: THREE.Object3D, length: Int, centeredOrigin: Boolean, color: Int): Unit = {
    val axes = CoordinateAxes3D.create(length, centeredOrigin, color)
    region.add(axes)
  }

  def createSMPlots(localStorageID: String, hue: Double, textureIndex: Int): Option[Array[ShadowManifold]] = {
    val timeSeries = BrowserStorage.timeSeriesFromCSV(localStorageID)
    if (timeSeries.isEmpty) None
    else Some(ShadowManifold.createSet(timeSeries.get, hue, textureIndex))
  }

  def createTS(timeSeries: Option[String]): Array[TimeSeries] = ??? // TODO: Implement TimeSeries class ('2D' plot)

  implicit def convertScene(scene: THREE.Scene): SceneExt = scene.asInstanceOf[SceneExt]

}
