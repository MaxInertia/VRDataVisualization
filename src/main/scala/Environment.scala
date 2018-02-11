import data.CSVParser
import js.three.SceneExt
import org.scalajs.{threejs => THREE}
import org.scalajs.dom
import org.scalajs.dom.ext.LocalStorage
import org.scalajs.threejs.ShaderMaterial
import plots._

/**
  * Created by Dorian Thiessen on 2018-01-11.
  */
class Environment(val scene: THREE.Scene, val camera: THREE.PerspectiveCamera, val renderer: THREE.WebGLRenderer) {
  /** Regions are represent positions in the scene,
    * used to anchor multiple objects to one another */
  val regions: Array[THREE.Object3D] = Array(
      new THREE.Object3D(),
      new THREE.Object3D())
  regions.foreach(r => scene.add(r))

  def render(): Unit = renderer.render(scene, camera)
}

object Environment {

  object Color {
    val BLUE_HUE_SHIFT: Double = 0.5
    val RED_HUE_SHIFT: Double = 0.01
  }

  def setup(container: dom.Element): Environment = {
    println("Environment Setup Started...")

    // Create Camera; This is the perspective through which the user views the scene.
    val camera = new THREE.PerspectiveCamera(
      65,  // Field of view
      dom.window.innerWidth / dom.window.innerHeight, // Aspect Ratio
      0.01, // Nearest distance visible
      20000) // Farthest distance visible

    // Create Renderer
    val renderer = new THREE.WebGLRenderer()
    renderer.setSize(dom.window.innerWidth, dom.window.innerHeight)
    renderer.devicePixelRatio = dom.window.devicePixelRatio

    // Create Scene & populate it with plots and such!
    val scene = new THREE.Scene()
    //scene.background = new THREE.Color(0x333333)
    scene.add(camera)
    scene.add(makeLight())
    container.appendChild(renderer.domElement)

    val env: Environment = new Environment(scene, camera, renderer)
    env.regions(0).position.set(-1.1, 0, -2) // region on the left
    env.regions(1).position.set( 1.1, 0, -2) // region on the right
    addPlots(env.regions(0), env.regions(1)) // Add Plots to region 0 and 1

    println("Environment complete.")
    env
  }


  def makeLight(): THREE.Light = {
    var light = new THREE.DirectionalLight(0xffffff)
    light.position.set(1, 1, 1).normalize()
    light
  }
  }


  /**
    * Add Plots to the Scene
    * @param region1 The object3D to place the
    * @param region2 The environments instance of THREE.Scene
    */
  def addPlots(region1: THREE.Object3D, region2: THREE.Object3D): Unit = {
    // create Shadow Manifolds and Time Series
    lazy val (sm1, ts1) = createPlots("SM1_timeSeries", Color.RED_HUE_SHIFT)
    lazy val (sm2, ts2) = createPlots("SM2_timeSeries", Color.BLUE_HUE_SHIFT)

    if(sm1 != null) {
      region1.add(sm1(0))
      println("Added SM1 to the scene")

      val axes = CoordinateAxes3D.create(length = 1, centeredOrigin = true)
      region1.add(axes)
    } else println("WARNING: The SM1 is null!")

    if(sm2 != null) {
      region2.add(sm2(0))
      println("Added SM2 to the scene")

      val axes = CoordinateAxes3D.create(length = 1, centeredOrigin = false)
      region2.add(axes)
    } else println("WARNING: The SM2 is null!")
  }


  /**
    * Creates a Shadow Manifold and Time Series for every column of one of the input CSV files.
    * Accesses the required data from localStorage.
    * @return A 2Tuple of 2Tuples, each containing the Array of SM's and TS's produced from the input CSVs.
    *         Each inner-2Tuple corresponds to a
    */
  def createPlots(localStorageID: String, hue: Double): (Array[ShadowManifold], Array[TimeSeries]) = {
    val timeSeries = LocalStorage(localStorageID).map(CSVParser.parse)
    if(timeSeries.isEmpty) return null
    (ShadowManifold.createSet(timeSeries.get, hue), null) // TODO: replace null with createTS(timeSeries)
  }

  
  def createTS(timeSeries: Option[String]): Array[TimeSeries] = ??? // TODO: Implement TimeSeries class ('2D' plot)

}