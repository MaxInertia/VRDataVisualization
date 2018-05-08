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
import env.Regions.{Group, regions, reposition}
import facades.Dat
import userinput.Controls.RayCaster
import util.Log

import scala.scalajs.js
import js.JSConverters._
import scala.scalajs.js.annotation._

/**
  * Created by Dorian Thiessen on 2018-01-11.
  */
class Environment(val scene: Scene,
                  val camera: PerspectiveCamera,
                  val renderer: WebGLRenderer) {

  /** Used to group multiple objects in the environment
    * that should always move and rotate together */
  // This will be the parent of the controllers
  // Fixes the issue where the controllers are in the floor
  val fakeOrigin: Group = new Group
  fakeOrigin.position.set(0, 1.6, 0)
  scene.add(fakeOrigin)

  var datgui: Dat.GUIVR = _

  private val plots3D: Array[Option[Array[Plot]]] = Array(None, None)

  // ------ Plot stuff

  /*def getPlot(regionID: Int, plotID: Int): Plot = plots3D(regionID % 2).get(plotID)

  def nextPlot(regionID: Int) : Unit = {
    //if(active.length <= regionID) loadPlot(regionID, 0)
    //else loadPlot(regionID, (active(regionID) + 1) % plots3D(regionID % 2).get.length)
  }*/

  // ----- Rendering!

  def render(): Unit = {
    val maybeRC: Option[THREE.Raycaster] = Controls.getSelectionRayCaster(camera)
    if(maybeRC.nonEmpty) {
      // TODO: Still find a better way to ignore points while waiting for the texture to be loaded
      if (Regions.numOccupied() >= 2) {
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
    for(region <- Regions.getNonEmpties) {
      if(region.plot.nonEmpty) {
        // Get the active plot in this )
        val plot = region.plot.get
        // Retrieve intersections on an available ray caster
        val intersects: scalajs.js.Array[THREE.Intersection] = rayCaster.intersectObject(plot.getPoints)
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
  type Scene = THREE.Scene
  type WebGLRenderer = THREE.WebGLRenderer
  type PerspectiveCamera = THREE.PerspectiveCamera

  var instance: Environment = _

  type Column = (String, Array[Double])

  /**
    * Prepares raw data for being turned into points then plotted
    * @param localStorageID ID of data in browser storage // TODO: This should be generalized to DataSource
    * @return Preprocessed data, ready to be turned into points and plotted!
    */
  def prepareData(localStorageID: String): Array[Column] = {
    val timeSeries = BrowserStorage.timeSeriesFromCSV(localStorageID)
    if (timeSeries.isEmpty) Array()
    else timeSeries.get.map{ case (id, vs) => (id, Stats.standardize(vs)) }
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

    // Load texture for plots
    val loadTexture = Res.loadPointTexture(1)
    import scala.concurrent.ExecutionContext.Implicits.global
    loadTexture andThen {
      case Success(texture) =>
        Log.show("ColumnSet 1")
        val columnSet1 = prepareData("SM1_timeSeries")
        if (columnSet1.nonEmpty) {
          val sm: Array[Plot] = ShadowManifold.many(columnSet1, Colors.RED_HUE_SHIFT, 1)
          if (sm.nonEmpty) {
            val plotNum: Int = 0
            env.plots3D(plotNum) = Some(sm)
            val maybeNewRegion = Regions.add(env.plots3D(plotNum).get(0))
            if(maybeNewRegion.nonEmpty) scene.add(maybeNewRegion.get.object3D)
          }
        } // <-- Do spots like this really bother anyone else? (p.s. I fixed it with this comment)
        Log.show("ColumnSet 2")
        val columnSet2 = prepareData("SM2_timeSeries")
        if (columnSet2.nonEmpty) {
          val plotNum: Int = 1
          val scatterPlot: Plot = ScatterPlot(columnSet2(0), columnSet2(0), columnSet2(0), 1, Colors.BLUE_HUE_SHIFT).asInstanceOf[Plot]
          env.plots3D(plotNum) = Some(Array(scatterPlot)) // Currently we assume we're only generating one.
          val maybeNewRegion = Regions.add(env.plots3D(plotNum).get(0))
          if(maybeNewRegion.nonEmpty) scene.add(maybeNewRegion.get.object3D)
        }

      case Failure(err) =>
        Log.show("Failed to load the texture!")
        err.printStackTrace()
    }

    // Create in-vr-gui
    val gui = makeDatGUI()
    gui.position.set(0, 1, 0)
    env.datgui = gui
    scene.add(gui)
    env
  }

  def makeDatGUI(): Dat.GUIVR = {
    Log.show("Creating DATGUI!")
    val gui = Dat.GUIVR.create("Empty Gui")
    gui
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
    import facades.IFThree.ImplicitConversions._
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
}
