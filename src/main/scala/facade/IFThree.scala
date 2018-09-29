package facade

import org.scalajs.dom.raw.{Element, Event}
import org.scalajs.threejs
import org.scalajs.threejs._

import scala.scalajs.js
import scala.scalajs.js.annotation.JSGlobal

/**
  * Supplementary ThreeJS Facades
  * Created by Dorian Thiessen on 2018-04-08.
  */
object IFThree {

  object ImplicitConversions {
    implicit def toSceneExt(scene: Scene): SceneExt = scene.asInstanceOf[SceneExt]
  }

  /**
    * Created by Dorian Thiessen on 2018-01-11.
    */
  @js.native
  @JSGlobal("THREE.FirstPersonVRControls")
  class FirstPersonVRControls extends js.Object {
    def this(camera: Camera, scene: Scene) = this()
    def update(timestamp: Double): Unit = js.native
  }
  @js.native
  @JSGlobal("THREE.VRControls")
  class VRControls extends js.Object {
    def this(camera: Camera) = this()
    var scale: Double = js.native
    var standing: Boolean = js.native
    var userHeight: Double = js.native
    def update(): Unit = js.native
    def getStandingMatrix(): Matrix4 = js.native
    def dispose(): Unit = js.native
  }

  /**
    * Created by Dorian Thiessen on 2018-01-13.
    */
  @js.native
  trait VRController extends Object3D {
    var primary: Double = js.native
    var standingMatrix: Matrix4 = js.native
    def update(): Unit = js.native
    def getAxes(): js.Array[Double] = js.native
  }
  @js.native
  @JSGlobal("THREE.VRController")
  object VRControllerManager extends js.Object {
    def update(): Unit = js.native
  }

  @js.native
  trait VRDisplay extends js.Any {
    def render(scene: threejs.Scene, camera: threejs.Camera): Unit = js.native
  }

  /**
    * Created by Dorian Thiessen on 2018-02-10.
    */
  @js.native
  @JSGlobal("THREE.Scene")
  class SceneExt extends Scene {
    var background: Color = js.native
  }
  @js.native
  trait RaycasterParametersExt extends RaycasterParameters {
    var Points: RPE = js.native
  }
  @js.native
  trait RPE extends js.Object {
    var threshold: Double = js.native
  }

  /**
    * Created by Dorian Thiessen on 2018-02-12.
    */
  @js.native
  @JSGlobal("THREE.Intersection")
  class IntersectionExt extends Intersection {
    var index: Int = js.native
  }

  /**
    * Created by Dorian Thiessen on 2018-04-07.
    */
  @js.native
  @JSGlobal("THREE.WireframeGeometry")
  class WireframeGeometry(geometry: Geometry) extends Geometry {
    var index: Int = js.native
  }
  @js.native
  @JSGlobal("THREE.LineSegments")
  class LineSegments(wireframe: WireframeGeometry) extends Line {
    val isLineSegments: Boolean = js.native
  }


  /**
    * Created by Dorian Thiessen on 2018-04-09.
    */
  @js.native
  @JSGlobal("THREE.WebGLRenderer")
  class WebGLRendererExt extends WebGLRenderer {
    var vr: WebVRManager = js.native
    var shadowMap: ShadowMap = js.native
    def setAnimationLoop(callback: js.Function0[Unit]): Unit = js.native
  }
  @js.native
  @JSGlobal("THREE.WebVRManager")
  class WebVRManager extends js.Any {
    def this(renderer: Renderer) = this()
    var enabled: Boolean = js.native
    def setAnimationLoop(callback: js.Function1[Double, Unit]): Unit = js.native
    def getStandingMatrix(): Matrix4 = js.native
  }
  @js.native
  @JSGlobal("WEBVR")
  object WEBVR extends js.Any {
    def createButton(renderer: WebGLRenderer): Element = js.native
  }
  @js.native
  trait SomeEvent extends js.Any {
    val detail: js.Dynamic = js.native
  }
  @js.native
  trait Uniform extends js.Any {
    val u_time: UTime = js.native
  }
  @js.native
  trait UTime extends js.Any {
    var value: Float = js.native
  }

  @js.native
  trait MaterialExt extends Material {
    var shadowSide: Int = js.native
  }

  @js.native
  trait ShadowMap extends js.Any {
    var enabled: Boolean = js.native
  }

  @js.native
  trait LightExt extends Light {
    var shadow: Shadow = js.native
  }
  @js.native
  trait Shadow extends js.Any {
    var camera: ShadowCamera = js.native
    var mapSize: MapSize = js.native
  }
  @js.native
  trait ShadowCamera extends Camera {
    var near: Double = js.native
    var far: Double = js.native
    var fov: Double = js.native
  }

  @js.native
  trait MapSize extends js.Any {
    var height: Double = js.native
    var width: Double = js.native
  }

  @js.native
  @JSGlobal("THREE.Color")
  class ColorExt extends Color {
    def this(color: String) = this()
  }

  @js.native
  @JSGlobal("THREE.GridHelper")
  class GridHelperExt(size: Double, step: Double, color1: Color, color2: Color) extends GridHelper(size, step) {}

  @js.native
  @JSGlobal("THREE.SceneUtils")
  object SceneUtils2 extends js.Object {
    def attach(child: Object3D, scene: Scene, parent: Object3D): Unit = js.native
    def detach(child: Object3D, parent: Object3D, scene: Scene): Unit = js.native
  }

  @js.native
  @JSGlobal("THREE.Group")
  class Group extends Object3D {
    def computeBoundingBox(): Unit = js.native
  }

  @js.native
  @JSGlobal("THREE.Points")
  class PointsR93(geometry: Geometry, material: PointsMaterial) extends org.scalajs.threejs.Points(geometry, material) {
    def onBeforeRender(fn: js.Function6[Renderer, Scene, Camera, Geometry, Material, Group, Unit]): Unit = js.native
    def onAfterRender(fn: js.Function6[Renderer, Scene, Camera, Geometry, Material, Group, Unit]): Unit = js.native
  }


  @js.native
  @JSGlobal("THREE.AxesHelper")
  class AxesHelper() extends Object3D {
    def this(size: Double) = this()
  }

  @js.native
  @JSGlobal("THREE.Object3D")
  class Object3DR93 extends org.scalajs.threejs.Object3D {
    def onBeforeRender(fn: js.Function3[Renderer, Scene, Camera, Unit]): Unit = js.native
    def onAfterRender(fn: js.Function3[Renderer, Scene, Camera, Unit]): Unit = js.native
  }

  @js.native
  trait DomElementExt extends js.Object {
    var requestFullscreen: Boolean = js.native
    var mozRequestFullScreen: Boolean = js.native
    var webkitRequestFullscreen: Boolean = js.native
    var msRequestFullscreen: Boolean = js.native
  }

  @js.native
  trait DomElementExt2 extends js.Object {
    def requestFullscreen(): Unit = js.native
    def mozRequestFullScreen(): Unit = js.native
    def webkitRequestFullscreen(): Unit = js.native
    def msRequestFullscreen(): Unit = js.native
  }

  @js.native
  @JSGlobal("THREE.FontLoader")
  class FontLoader extends js.Object {
    def load(fontFile: String, fn: js.Function1[js.Dynamic, Unit]): Unit = js.native
    def load(fontFile: String,
             onLoadFn: js.Function1[js.Dynamic, Unit],
             progressFn: js.Function1[js.Dynamic, Unit],
             errorFn: js.Function1[js.Dynamic, Unit]): Unit = js.native
  }

  @js.native
  @JSGlobal("THREE.Font")
  class Font extends org.scalajs.threejs.Object3D {
    def generateShapes(message: String, size: Int): Shape = js.native
  }

  @js.native
  trait Shape extends js.Object {}

  @js.native
  @JSGlobal("THREE.ShapeGeometry")
  class ShapeGeometryExt() extends ShapeGeometry {
    def this(shape: Shape) = this()
  }

  @js.native
  trait AxesChangedEvent extends Event {
    val axes: Array[Double] = js.native
  }

}
