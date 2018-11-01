package vrdv.obj3D

import util.Log


/**
  * Created by Wade McDonald 2018-11-01
  */
class InitialMenu() 
  extends DatGuiW("Welcome", 0, 2, -3) {

  addButton((() => { Log.show("Graph 1 button clicked!") }), "Create", "Graph 1")
  addButton((() => { Log.show("Graph 2 button clicked!") }), "Create", "Graph 2")
  addButton((() => { Log.show("Graph 3 button clicked!") }), "Create", "Graph 3")
}