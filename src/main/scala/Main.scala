import js.Stats
import js.three.VREffect
import org.scalajs.{threejs => THREE}
import org.scalajs.dom
import org.scalajs.dom.ext.LocalStorage
import plots.{ShadowManifold, TimeSeries}

import scala.scalajs.js.annotation.JSExportTopLevel

/**
  * Created by Dorian Thiessen on 2018-01-05.
  */
object Main {

  @JSExportTopLevel("CCMVR.init")
  def init(): Unit = {
    println("init called.")

    // create Shadow Manifolds and Time Series
    val (sm1, ts1) = createPlots("SM1_timeSeries")
    val (sm2, ts2) = createPlots("SM2_timeSeries")

    // Setup the Environment (Scene, Camera, Renderer) and the Controls (Mouse, Oculus Controllers and Headset)
    val container = dom.document.getElementById("scene-container")
    val env = Environment.setup(container)
    Window.setupEventListeners(env.camera, env.renderer) // Setup event listeners on the Window
    val controls = Controls.setup(env)

    // Add FPS stats to the Window
    val stats = new Stats()
    container.appendChild(stats.dom)

    def animate(timeStamp: Double): Unit = {
      dom.window.requestAnimationFrame(animate)
      controls.update(timeStamp)
      env.render()
      stats.update()
    }

    animate(0) // Trigger the animation cycle
  }

  /**
    * Creates a Shadow Manifold and Time Series for every column of both input CSV files.
    * Accesses the required data from localStorage.
    * @return A 2Tuple of 2Tuples, each containing the Array of SM's and TS's produced from the input CSVs.
    *         Each inner-2Tuple corresponds to a
    */
  def createPlots(localStorageID: String): (Array[ShadowManifold], Array[TimeSeries]) = {
    val timeSeries = LocalStorage(localStorageID)

    if(timeSeries.isEmpty)
      println(s"WARNING: Time series not defined: $localStorageID")

    lazy val ots = timeSeries.map(data.PreProcessor.process)
    val sm = ots.map(ts => ts.map{ case (id, values) => ShadowManifold.create(id, values) })
    (sm.orNull ,null)
  }
}
