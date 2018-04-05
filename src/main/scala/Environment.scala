import data.CSVParser
import js.three.{IntersectionExt, RaycasterParametersExt, SceneExt, VREffect}
import org.scalajs.{threejs => THREE}
import org.scalajs.dom
import org.scalajs.dom.ext.LocalStorage
import plots._

/**
  * Created by Dorian Thiessen on 2018-01-11.
  */
class Environment(val scene:    THREE.Scene,
                  val camera:   THREE.PerspectiveCamera,
                  val renderer: THREE.WebGLRenderer,
                  val vrEffect: VREffect) {

  /** Regions are represent positions in the scene,
    * used to anchor multiple objects to one another */
  val regions: Array[THREE.Object3D] = Array(
      new THREE.Object3D(),
      new THREE.Object3D())
  regions.foreach(r => scene.add(r))

  val plots3D: Array[Array[ShadowManifold]] = Array(null, null) // TODO: Use Option?

  /** Index of the active plots in each region */
  val active: Array[Int] = Array(-1, -1)

  /**
    * Returns the ShadowManifold that is currently visible in the specified region
    * @param regionID The region the plot belongs to. (either 0 or 1)
    * @return The Shadow Manifold
    */
  @inline def get3DPlot(regionID: Int): ShadowManifold = plots3D(regionID)(active(regionID))

  /**
    * Swaps out the currently visible plot for the specified plot.
    * @param regionID Which region the plot belongs to. (either 0 or 1)
    * @param plotID The index of the plot in plots3D.
    */
  def loadPlot(regionID: Int, plotID: Int): Unit = {
    if(active(regionID) != -1)  // Remove current plot if region is not empty
      regions(regionID).remove( plots3D(regionID)(active(regionID)).points )
    regions(regionID).add( plots3D(regionID)(plotID).points ) // Add requested plot
    active(regionID) = plotID // Update active plot index
    //plots3D(regionID)(plotID).points.matrixAutoUpdate = false
  }

  def render(): Unit = {
    //if (VR.isPresenting()) {
    vrEffect.render(scene, camera)
    //} else {
    renderer.render(scene, camera)
    //}
    // TODO: Find a better way to ignore points while waiting for the texture to be loaded
    if(Plot.myTexture != null) mousePointSelection()
  }

  val rayCaster: THREE.Raycaster = new THREE.Raycaster()
  // TODO: Determine how to appropriately scale rayCaster threshold with point size
  rayCaster.params.asInstanceOf[RaycasterParametersExt].Points.threshold = 0.015
  val NONE: Int = -248
  val SELECTIONS: Array[Int] = Array(NONE, NONE)

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
        if(SELECTIONS(i) != NONE) { // If previous selection exists, request plots deselect them.
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
    dom.console.log("Environment Setup Started...")

    val camera: THREE.PerspectiveCamera = makeCamera()
    val (renderer, vrEffect) = makeRendererAndVREffect()
    container.appendChild(renderer.domElement)

    val scene: THREE.Scene = makeScene()
    scene.add(camera)
    scene.add(makeLight())

    val env: Environment = new Environment(scene, camera, renderer, vrEffect)
    env.regions(0).position.set(-1.1, 0, -2) // region on the left
    env.regions(1).position.set( 1.1, 0, -2) // region on the right

    def drawPlots(texture: THREE.Texture): Unit = {
        Plot.myTexture = texture
        // Add plots to the env
        //val (sm1, ts1) = createPlots("SM1_timeSeries", 0x880000)//Color.RED_HUE_SHIFT)
        //val (sm2, ts2) = createPlots("SM2_timeSeries", 0x000088)//Color.BLUE_HUE_SHIFT)
        val sm1 = createSMPlots("SM1_timeSeries", Color.RED_HUE_SHIFT) // TODO: Split off steps that do not require the texture
        val sm2 = createSMPlots("SM2_timeSeries", Color.BLUE_HUE_SHIFT)
        env.plots3D(0) = sm1
        env.plots3D(1) = sm2
        env.loadPlot(regionID = 0, plotID = 0) // TODO: Dynamic region count?
        env.loadPlot(regionID = 1, plotID = 0)
    }
    Resources.loadPointTexture(drawPlots)

    // Add coordinate axes
    addAxes(env.regions(0), 1, centeredOrigin = false)
    addAxes(env.regions(1), 1, centeredOrigin = true)
    dom.console.log("Environment prepared.")
    env
  }

  /**
    * Creates the renderer.
    * @return THREE.WebGLRenderer instance
    */
  private def makeRendererAndVREffect(): (THREE.WebGLRenderer, VREffect) = {
    val renderer = new THREE.WebGLRenderer()
    renderer.setSize(dom.window.innerWidth, dom.window.innerHeight)
    renderer.devicePixelRatio = dom.window.devicePixelRatio
    // Applies renderer to VR display (if available)
    val vrEffect = new VREffect(renderer)
    vrEffect.setSize(dom.window.innerWidth, dom.window.innerHeight)
    (renderer, vrEffect)
  }

  /**
    * Creates the camera, the perspective through which the user views the scene.
    * @return THREE.PerspectiveCamera instance
    */
  private def makeCamera(): THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
      65,  // Field of view
      dom.window.innerWidth / dom.window.innerHeight, // Aspect Ratio
      0.01, // Nearest distance visible
      20000) // Farthest distance visible

  /**
    * Creates the scene, the space in which objects can be placed for viewing.
    * @return THREE.Scene instance
    */
  private def makeScene(): THREE.Scene = {
    val scene = new THREE.Scene()
    scene.background = new THREE.Color(Color.GRAY)
    scene
  }

  def makeLight(): THREE.Light = {
    var light = new THREE.DirectionalLight(Color.WHITE)
    light.position.set(1, 1, 1).normalize()
    light
  }

  /**
    * Add coordinate axes to the plot in this region
    * @param region The region of space in the scene to add the axes to
    */
  def addAxes(region: THREE.Object3D, length: Int, centeredOrigin: Boolean): Unit = {
    val axes = CoordinateAxes3D.create(length, centeredOrigin)
    region.add(axes)
  }

  /**
    * Creates a Shadow Manifold and Time Series for every column of one of the input CSV files.
    * Accesses the required data from localStorage.
    * @return A 2Tuple of 2Tuples, each containing the Array of SM's and TS's produced from the input CSVs.
    *         Each inner-2Tuple corresponds to a
    */
  /*def createPlots(localStorageID: String, hue: Double): (Array[ShadowManifold], Array[TimeSeries]) = {
    val timeSeries = LocalStorage(localStorageID).map(CSVParser.parse)
    if(timeSeries.isEmpty) null
    else (ShadowManifold.createSet(timeSeries.get, hue), TimeSeries.createSet(timeSeries.get, hue)) // TODO: replace null with createTS(timeSeries)
  }*/

  def createSMPlots(localStorageID: String, hue: Double): Array[ShadowManifold] = {
    val timeSeries = LocalStorage(localStorageID).map(CSVParser.parse)
    if (timeSeries.isEmpty) null // TODO: Again, Option?
    else ShadowManifold.createSet(timeSeries.get, hue)
  }

  def createTS(timeSeries: Option[String]): Array[TimeSeries] = ??? // TODO: Implement TimeSeries class ('2D' plot)

  implicit def convertScene(scene: THREE.Scene): SceneExt = scene.asInstanceOf[SceneExt]

}
