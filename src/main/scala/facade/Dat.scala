package facade

import org.scalajs.threejs.{Camera, Object3D, Renderer}

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
    def create(title: String): GUI = js.native
    def addInputObject(obj: Object3D): Object3D = js.native
    def addInputObject(obj: js.Any): Unit = js.native
    def enableMouse(camera: Camera, renderer: Renderer): Unit = js.native
  }
  @js.native
  trait GUI extends Object3D {
    def add(something: js.Object): Unit = js.native
    def add(something: js.Object, id: String): Unit = js.native
    def add(something: js.Object, id: String, min: Double, max: Double): GuiSlider = js.native
    def addFolder(folder: GUI): GUI = js.native
    def addButton(fn: js.Function, id: String = "Button"): Unit = js.native
    def addButton(id: String, fn: js.Function): Unit = js.native
    def open(): Unit = js.native
    def close(): Unit = js.native
    def removeFolder(gui: GUI): Unit = js.native
  }

  @js.native
  trait GuiSlider extends GuiComponent {
    def listen(): GuiSlider = js.native
    def min(n: Double): GuiSlider = js.native
    def max(n: Double): GuiSlider = js.native
    def step(n: Double): GuiSlider = js.native
    def updateValueLabel(label: String): Unit = js.native
    def updateObject(obj: js.Any): Unit = js.native
  }

  @js.native
  trait GuiButton extends GuiComponent {}

  @js.native
  trait GuiComponent extends Object3D {
    def name(name: String): GuiSlider = js.native
  }

  @js.native
  trait InputDevice extends Object3D {
    def pressed(flag: Boolean): Unit = js.native
    def gripped(flag: Boolean): Unit = js.native
  }
}