import org.scalajs.{threejs => THREE}
import org.scalajs.dom
import org.scalajs.dom.ext.LocalStorage
import plots.{ShadowManifold, TimeSeries}

/**
  * Created by Dorian Thiessen on 2018-01-11.
  */
class Environment(val scene: THREE.Scene, val camera: THREE.PerspectiveCamera, val renderer: THREE.WebGLRenderer) {
  def render(): Unit = renderer.render(scene, camera)
}

object Environment {

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
    scene.add(camera)
    addPlots(scene)
    addLight(scene)
    container.appendChild(renderer.domElement)

    println("Environment complete.")
    new Environment(scene, camera, renderer)
  }


  def addLight(scene: THREE.Scene): Unit = {
    var light = new THREE.DirectionalLight(0xffffff)
    light.position.set(1, 1, 1).normalize()
    scene.add(light)
  }


  /**
    * Add Plots to the Scene
    * @param scene The environments instance of THREE.Scene
    */
  def addPlots(scene: THREE.Scene): Unit = {
    // create Shadow Manifolds and Time Series
    val (sm1, ts1) = createPlots("SM1_timeSeries")
    val (sm2, ts2) = createPlots("SM2_timeSeries")

    // Add plots to the environment
    if(sm1 != null) {
      scene.add(sm1(0))
      println("Added SM1 to the scene")
    } else println("WARNING: The SM1 is null!")

    if(sm2 != null) {
      scene.add(sm2(1))
      println("Added SM2 to the scene")
    } else println("WARNING: The SM2 is null!")
  }


  /**
    * Creates a Shadow Manifold and Time Series for every column of one of the input CSV files.
    * Accesses the required data from localStorage.
    * @return A 2Tuple of 2Tuples, each containing the Array of SM's and TS's produced from the input CSVs.
    *         Each inner-2Tuple corresponds to a
    */
  def createPlots(localStorageID: String): (Array[ShadowManifold], Array[TimeSeries]) = {
    val timeSeries = LocalStorage(localStorageID)
    (createSM(timeSeries), null) // TODO: replace null with createTS(timeSeries)
  }


  def createSM(timeSeries: Option[String]): Array[ShadowManifold] =
    timeSeries
      .map(data.PreProcessor.process)
      .map{ col => col.map{ case (id, values) => ShadowManifold.create(id, values) }}
      .orNull


  def createTS(timeSeries: Option[String]): Array[TimeSeries] = ??? // TODO: Implement TimeSeries class ('2D' plot)

}