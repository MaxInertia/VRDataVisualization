package vrdv.obj3D

import facade.Dat
//import facade.Dat.{GuiButton, GuiSlider}
import facade.Dat._
import util.Log
import vrdv.input.InputDetails
import vrdv.model.Plotter
import vrdv.obj3D.DatGuiW.WButton
import vrdv.obj3D.plots._

import scala.scalajs.js

/**
  * Created by Dorian Thiessen on 2018-05-10.
  * Modified by Wade MCDonald 2018-11-01
  */
class DatGuiW(title: String, xInit: Double, yInit: Double, zInit: Double) {
  val object3D: Dat.GUI = DatGuiW(title, xInit, yInit, zInit)

  var folders: Array[Dat.GUI] = Array()

  def addFolder(folder: Dat.GUI): Unit = {
    object3D.addFolder(folder)
    folders = folders :+ folder
  }

  def addButton(function: () => Unit, name: String, description: String): Unit = {
    val idx = object3D.children(0).children.length
    object3D.addButton(function)
    WButton(idx, object3D).setLabels(name, description)
  }

  def addCheckbox(something: js.Object, id: String, description: String): Unit = {
    object3D.add(something, id).name(description)
  }

  def addDropdown(something: js.Object, id: String, options: js.Array[String]): GuiComponent = {
    //object3D.addDropdown(something, id, options)
    object3D.add(something, id, options)
  }

  def setVisible(vis: Boolean): Unit = {
    object3D.visible = vis
  }
}

/*
  def sample: DatGui = {
    val gui = new DatGui()
    // # Checkbox sample
    gui.object3D.add(gui.samples, "someBoolean")

    // # Drop-down sample
    // NOTE: Position of selected value is lower than it should be.
    val dropDownOptions = js.Array("a", "b", "c")
    gui.object3D.add(gui.samples, "someValue", dropDownOptions)

    gui
  }
 */

object DatGuiW {

  def apply(title: String, xInit: Double, yInit: Double, zInit: Double): Dat.GUI = {
    val gui = Dat.GUIVR.create(title)
    gui.position.set(xInit, yInit, zInit)
    //gui.rotateY(3.14/4 * 1.1)
    gui
  }

  object WButton {
    case class WButton(instance: GuiButton) {

      def setLabel_Description(str: String): Unit = instance.name(str)

      def setLabel_Button(str: String): Unit = instance
        .children(0).children(1).children(0).children(0)
        .asInstanceOf[js.Dynamic].updateLabel(str)

      def setLabels(onButton: String, onDesc: String): Unit = {
        setLabel_Button(onButton)
        setLabel_Description(onDesc)
      }
    }

    // Assumes button is not nested in a sub-folder
    def apply(i: Int, folder: Dat.GUI): WButton = WButton(folder.children(0).children(i).asInstanceOf[GuiButton])
  }
}
