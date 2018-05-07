package facades

import org.scalajs.dom.raw.Element
import org.scalajs.threejs._

import scala.scalajs.js
import scala.scalajs.js.annotation.JSGlobal

/**
  * Supplementary ThreeJS Facades
  * Created by Dorian Thiessen on 2018-04-08.
  */
object IFThree {

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
  //@JSGlobal("THREE.VRController")
  trait VRController extends Object3D {
    def update(): Unit = js.native
    //def addEventListener[T <: Event](`type`: String, listener: js.Function1[T, _]): Unit = js.native
  }

  @js.native
  @JSGlobal("THREE.VRController")
  object VRControllerManager extends js.Object {
    def update(): Unit = js.native
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
    def animate(callback: () => _): Unit = js.native
  }
  @js.native
  @JSGlobal("THREE.WebVRManager")
  class WebVRManager extends js.Any {
    def this(renderer: Renderer) = this()
    var enabled: Boolean = js.native
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
  @JSGlobal("THREE.GridHelper")
  class GridHelperExt(size: Double, step: Double, color1: Color, color2: Color) extends GridHelper(size, step) {}

  @js.native
  @JSGlobal("THREE.SceneUtils")
  object SceneUtils2 extends js.Object {
    def attach(child: Object3D, scene: Scene, parent: Object3D): Unit = js.native
    def detach(child: Object3D, parent: Object3D, scene: Scene): Unit = js.native
  }
}
