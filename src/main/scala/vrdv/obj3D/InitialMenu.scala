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

  def addPlot: Unit = {
    if(object3D.visible) {
      plotter.newPlot3DWithData
      setVisible(false)
    }
  }

  addButton(() => { addPlot }, "Create", "Graph 1")
  addButton(() => { addPlot }, "Create", "Graph 2")
  addButton(() => { addPlot }, "Create", "Graph 3")

}