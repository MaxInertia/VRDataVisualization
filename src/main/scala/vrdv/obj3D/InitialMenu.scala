package vrdv.obj3D

import util.Log
import vrdv.model.Plotter


/**
  * Created by Wade McDonald 2018-11-01
  */
class InitialMenu(plotter: Plotter)
  extends DatGuiW("Welcome", 0, 2, -3) {

  override def setVisible(vis: Boolean): Unit = super.setVisible(vis)

  addButton(() => { plotter.newPlot3DWithData; setVisible(false) }, "Create", "Graph 1")
  addButton(() => { plotter.newPlot3DWithData }, "Create", "Graph 2")
  addButton(() => { plotter.newPlot3DWithData }, "Create", "Graph 3")
}