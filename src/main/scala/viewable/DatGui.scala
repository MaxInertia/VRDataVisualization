package viewable

import facades.Dat
import facades.Dat.GuiSlider
import org.scalajs.threejs.Object3D
import util.Log
import viewable.Regions.getNonEmpties
import viewable.plots.ScatterPlot

import scala.scalajs.js

/**
  * Created by Dorian Thiessen on 2018-05-10.
  */
class DatGui {
  var object3D: Dat.GUI = DatGui()
  var details: js.Object = _
}

object DatGui {
  def apply(plot: ScatterPlot): DatGui = {
    val gui = new DatGui()
    gui.object3D.add(plot.highlightedDetails, s"${plot.xVar}", -0.5, 0.5).listen()
    gui.object3D.add(plot.highlightedDetails, s"${plot.yVar}", -0.5, 0.5).listen()
    gui.object3D.add(plot.highlightedDetails, s"${plot.zVar}", -0.5, 0.5).listen()
    gui
  }

  def apply(): Dat.GUI = {
    val gui = Dat.GUIVR.create("Settings")
    gui.position.set(0.5, 1, -1.5)
    gui.rotateY(-3.14/5) // slightly less than 45deg
    gui
  }

}
