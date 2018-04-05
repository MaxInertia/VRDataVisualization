import data.CSVParser
import js.three.{IntersectionExt, RaycasterParametersExt, SceneExt, VREffect}
import org.scalajs.{threejs => THREE}
import org.scalajs.dom
import org.scalajs.dom.ext.LocalStorage
import org.scalajs.threejs.{BufferAttribute, Raycaster}
import plots._

import scala.scalajs.js.typedarray.Float32Array

/**
  * Created by Dorian Thiessen on 2018-01-11.
  */
class Environment(val scene: THREE.Scene,
                  val camera: THREE.PerspectiveCamera,
                  val renderer: THREE.WebGLRenderer,
                  val vrEffect: VREffect) {

  /** Regions are represent positions in the scene,
    * used to anchor multiple objects to one another */
  val regions: Array[THREE.Object3D] = Array(
      new THREE.Object3D(),
      new THREE.Object3D())
  regions.foreach(r => scene.add(r))

  val plots3D: Array[Array[ShadowManifold]] = Array(null, null)

  /** Index of the active plots in each region */
  val active: Array[Int] = Array(-1, -1)

  /**
    * Returns the ShadowManifold that is currently visible in the specified region
    * @param regionID The region the plot belongs to. (either 0 or 1)
    * @return The Shadow Manifold
    */
  def get3DPlot(regionID: Int): ShadowManifold = plots3D(regionID)(active(regionID))

  /**
    * Swaps out the currently visible plot for the specified plot.
    * @param regionID Which region the plot belongs to. (either 0 or 1)
    * @param plotID The index of the plot in plots3D.
    */
  def loadPlot(regionID: Int, plotID: Int): Unit = {
    if(active(regionID) != -1) {
      regions(regionID).remove( plots3D(regionID)(active(regionID)) ) // Remove previous plot
    }
    regions(regionID).add( plots3D(regionID)(plotID) ) // Add requested plot
    active(regionID) = plotID // Update active plot index
  }

  def render(): Unit = {
    //if (VR.isPresenting()) {
    vrEffect.render(scene, camera)
    //} else {
    renderer.render(scene, camera)
    //}
    mousePointSelection()
  }

  val raycaster: Raycaster = new THREE.Raycaster()
  raycaster.params.asInstanceOf[RaycasterParametersExt].Points.threshold = 0.01
  //val SELECTIONS: Array[Int] = Array(-1, -1)

  def mousePointSelection(): Unit = {
    raycaster.setFromCamera(Controls.getMouse, camera)
    /*var attr = Array(
      plots3D(0)(active(0)).getGeometry.getAttribute("size"),
      plots3D(1)(active(1)).getGeometry.getAttribute("size"))*/
    var intersects: Array[scalajs.js.Array[THREE.Intersection]] = new Array[scalajs.js.Array[THREE.Intersection]](2)
    intersects(0) = raycaster.intersectObject(plots3D(0)(active(0)).asInstanceOf[THREE.Points])
    intersects(1) = raycaster.intersectObject(plots3D(1)(active(1)).asInstanceOf[THREE.Points])
    //raycaster.intersectObject(plots3D(1)(active(1))).asInstanceOf[THREE.Points])

    for(i <- 0 to 1) {
      if(intersects(i).length > 0) {
        dom.console.log("Found intersection: ")
        //dom.console.log(intersects(i)(0).`object`)
        //intersects(i)(0).`object`.scale.set(3,3,3)
        val pointIndex = intersects(i)(0).asInstanceOf[IntersectionExt].index
        dom.console.log("Selected point index: "+ pointIndex +" in...")
        //dom.console.log(attr(i).array.asInstanceOf[Float32Array])
        var floats = plots3D(i)(active(i)).getGeometry.getAttribute("size").array.asInstanceOf[Float32Array]
        dom.console.log(floats)

        dom.console.log("Original size:")
        //dom.console.log(attr(i).array.asInstanceOf[Float32Array](pointIndex))
        dom.console.log(floats(pointIndex))

        //attr(i).array.asInstanceOf[Float32Array](pointIndex) = (Plot.PARTICLE_SIZE * 10.0).toFloat
        floats(pointIndex) = (Plot.PARTICLE_SIZE * 10.0).toFloat
        //attr(i).needsUpdate = true
        plots3D(i)(active(i)).getGeometry.getAttribute("size").needsUpdate = true
        dom.console.log("Updated size:")
        //dom.console.log(attr(i).array.asInstanceOf[Float32Array](pointIndex))
        dom.console.log(floats(pointIndex))

        floats.set(new Float32Array(pointIndex))
        dom.console.log("Newly updated size:")
        dom.console.log(floats(pointIndex))

        //attr(i)
        //SELECTIONS(i) =
        //attr(i).array(3*sel)
      }
    }
  }
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

    // Applies renderer to VR display (if available)
    val vrEffect = new VREffect(renderer)
    vrEffect.setSize(dom.window.innerWidth, dom.window.innerHeight)

    // Create Scene & populate it with plots and such!
    val scene = new THREE.Scene()
    //scene.background = new THREE.Color(0x333333)
    scene.add(camera)
    scene.add(makeLight())
    container.appendChild(renderer.domElement)

    val env: Environment = new Environment(scene, camera, renderer, vrEffect)
    env.regions(0).position.set(-1.1, 0, -2) // region on the left
    env.regions(1).position.set( 1.1, 0, -2) // region on the right

    // Add plots to the env
    val (sm1, ts1) = createPlots("SM1_timeSeries", 0x880000)//Color.RED_HUE_SHIFT)
    val (sm2, ts2) = createPlots("SM2_timeSeries", 0x000088)//Color.BLUE_HUE_SHIFT)
    env.plots3D(0) = sm1
    env.plots3D(1) = sm2
    env.loadPlot(regionID = 0, plotID = 0)
    env.loadPlot(regionID = 1, plotID = 0)

    // Add coordinate axes
    addAxes(env.regions(0), 1, centeredOrigin = false)
    addAxes(env.regions(1), 1, centeredOrigin = true)

    println("Environment complete.")
    env
  }


  def makeLight(): THREE.Light = {
    var light = new THREE.DirectionalLight(0xffffff)
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
  def createPlots(localStorageID: String, hue: Double): (Array[ShadowManifold], Array[TimeSeries]) = {
    val timeSeries = LocalStorage(localStorageID).map(CSVParser.parse)
    if(timeSeries.isEmpty) null
    else (ShadowManifold.createSet(timeSeries.get, hue), TimeSeries.createSet(timeSeries.get, hue)) // TODO: replace null with createTS(timeSeries)
  }

  def createPlots(localStorageID: String, hue: Double): (Array[ShadowManifold]) = {
    val timeSeries = LocalStorage(localStorageID).map(CSVParser.parse)
    if(timeSeries.isEmpty) null
    else {
      ()
    } // TODO: replace null with createTS(timeSeries)
  }

  def createTS(timeSeries: Option[String]): Array[TimeSeries] = ??? // TODO: Implement TimeSeries class ('2D' plot)

  implicit def convertScene(scene: THREE.Scene): SceneExt = scene.asInstanceOf[SceneExt]

}
