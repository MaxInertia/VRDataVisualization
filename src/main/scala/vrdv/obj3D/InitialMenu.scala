package vrdv.obj3D

import facade.Dat.{GuiComponent, GuiDropdown}
import util.Log
import vrdv.model.Plotter

import scala.scalajs.js


/**
  * Created by Wade McDonald 2018-11-01
  */
class InitialMenu(plotter: Plotter)
  extends DatGuiW("Welcome", 0, 2, -3) {

  override def setVisible(vis: Boolean): Unit = super.setVisible(vis)

  var dropDownOptions: js.Array[String] = js.Array("First", "Second", "Third")
  var dropDownOptionsNum: js.Array[String] = js.Array("1", "2", "3")
  var testBool = false
  var testString = "Initial value for testString."

  val checkValue: js.Object = js.Dynamic.literal(
    "Test" → false,
    "String" → "Default stringValue"
  )

  val stringValue: js.Object = js.Dynamic.literal(
    "String" → "First"
  )

  def getCheckValue(name: String): String = {
    checkValue.asInstanceOf[js.Dynamic].selectDynamic(name).toString()
  }

  def getStringValue(name: String): String = {
    stringValue.asInstanceOf[js.Dynamic].selectDynamic(name).toString()
  }

  var dropdown = addDropdown(stringValue,"String", dropDownOptions, "Test Dropdown")

  def getDropDownString: String = {
    dropdown.asInstanceOf[GuiDropdown].valueOf().toString()
  }

  addButton(() => { plotter.newPlot3DWithData; setVisible(false) }, "Create", "Graph 1")
  addButton(() => { plotter.newPlot3DWithData }, "Create", "Graph 2")
  addButton(() => { Log.show(getCheckValue("Test") + " " + getDropDownString) },
    "Create", "Graph 3")
  addCheckbox(this.checkValue, "Test", "Test Checkbox")

}