package vrdv.obj3D

import util.Log
import vrdv.model.Plotter

import scala.scalajs.js


/**
  * Created by Wade McDonald 2018-11-01
  */
class InitialMenu(plotter: Plotter)
  extends DatGuiW("Welcome", 0, 2, -3) {

  override def setVisible(vis: Boolean): Unit = super.setVisible(vis)

  var gob: js.Array[String] = js.Array("First", "Second", "Third")
  var gobValues: js.Array[String] = js.Array("1", "2", "3")
  var testBool = false
  var testString = "Initial value for testString."

  val checkValue: js.Object = js.Dynamic.literal(
    "Test" → false
  )
  def getCheckValue: Boolean = {
    checkValue.asInstanceOf[js.Dynamic].selectDynamic("Test").asInstanceOf[Boolean]
  }

  addButton(() => { plotter.newPlot3DWithData; setVisible(false) }, "Create", "Graph 1")
  addButton(() => { plotter.newPlot3DWithData }, "Create", "Graph 2")
  addButton(() => { Log.show(getCheckValue + " " + testString) }, "Create", "Graph 3")
  addCheckbox(this.checkValue, "Test", "Test Checkbox")
  addDropdown(gob,"Test Dropdown", gobValues)
}