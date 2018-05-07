package facades

import org.scalajs.threejs.{Camera, Object3D, Scene}

import scala.scalajs.js
import scala.scalajs.js.annotation.JSGlobal

/**
  * Facades for DatGUIVR by the Google Data Arts Team!
  * Find it here: https://github.com/dataarts/dat.guiVR
  */
object Dat {

  /**
    * Created by Dorian Thiessen on 2018-05-07.
    */
  @js.native
  @JSGlobal("dat.GUIVR")
  object GUIVR extends js.Object {
    def create(title: String): GUIVR = js.native
    def addInputObject(obj: Object3D): Unit = js.native
    def addInputObject(obj: js.Any): Unit = js.native
    def enableMouse(camera: Camera): Unit = js.native
  }
  @js.native
  class GUIVR extends Object3D {
    def add(something: js.Object): Unit = js.native
    def add(something: js.Object, id: String): Unit = js.native
  }

}