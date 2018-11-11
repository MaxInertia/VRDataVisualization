package vrdv.obj3D

import facade.Dat.{GuiComponent, GuiDropdown, GuiSlider}
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
      plotter.initPlot3DWithData
      if(plotter.getPlots.length == 3) setVisible(false)
      //object3D.position.set(2, 1, 0)
      //object3D.rotation.y = -3.14 / 2.0
      plotter.showGlobalMenu
    }
  }

  addButton(() => { addPlot }, "Create", "Graph 1")
  addButton(() => { addPlot }, "Create", "Graph 2")
  addButton(() => { addPlot }, "Create", "Graph 3")

  //addButton(() => {plotter.toggleGuiVisibility}, "Hide", "Hide GUI")

}