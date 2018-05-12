package viewable

import facades.Dat
import facades.Dat.GuiSlider
import util.Log
import viewable.plots.ScatterPlot

import scala.scalajs.js

/**
  * Created by Dorian Thiessen on 2018-05-10.
  */
class DatGui {
  var object3D: Dat.GUI = DatGui()
  /*var hFolder: Dat.GUI = _
  var sFolder: Dat.GUI = _*/
  val hs: Array[GuiSlider] = Array(null, null, null)
  val ss: Array[GuiSlider] = Array(null, null, null)

  def updateFolderLabels(plot: ScatterPlot): Unit = {
    hs(0).name(plot.xVar)
    hs(1).name(plot.yVar)
    hs(2).name(plot.zVar)
    ss(0).name(plot.xVar)
    ss(1).name(plot.yVar)
    ss(2).name(plot.zVar)
    for(h <- hs) h.matrixWorldNeedsUpdate = true
    for(s <- ss) s.matrixWorldNeedsUpdate = true
  }
}

object DatGui {
  def apply(plot: ScatterPlot): DatGui = {
    val gui = new DatGui()
    val highlightFolder = Dat.GUIVR.create("Highlighted Point Details")
    gui.hs(0) = highlightFolder.add(plot.highlightedDetails, s"${plot.xVar}", 0, 0).listen()
    gui.hs(1) = highlightFolder.add(plot.highlightedDetails, s"${plot.yVar}", 0, 0).listen()
    gui.hs(2) = highlightFolder.add(plot.highlightedDetails, s"${plot.zVar}", 0, 0).listen()
    gui.object3D.addFolder(highlightFolder)
    highlightFolder.open()

    val selectFolder = Dat.GUIVR.create("Selected Points Mean")
    gui.ss(0) = selectFolder.add(plot.selectedSummary, s"${plot.xVar}", 0, 0).listen()
    gui.ss(1) = selectFolder.add(plot.selectedSummary, s"${plot.yVar}", 0, 0).listen()
    gui.ss(2) = selectFolder.add(plot.selectedSummary, s"${plot.zVar}", 0, 0).listen()
    gui.object3D.addFolder(selectFolder)
    selectFolder.open()

    selectFolder.addButton(()=>{
      for(p <- plot.savedSelections) plot.ops.deselect(p)
      plot.savedSelections = plot.savedSelections.empty
      plot.updateSelectedSummary()
    }, "clearSelected")

    var settingsFolder = Dat.GUIVR.create("Settings")

    import js.JSConverters._
    settingsFolder.addButton(()=> {
      plot.switchAxis(0)
      gui.updateFolderLabels(plot)
    }, "Change Axis 1")

    settingsFolder.addButton(()=> {
      plot.switchAxis(1)
      gui.updateFolderLabels(plot)
    }, "Change Axis 2")

    settingsFolder.addButton(()=> {
      plot.switchAxis(2)
      gui.updateFolderLabels(plot)
    }, "Change Axis 3")

    gui.object3D.addFolder(settingsFolder)
    Log.show(gui.object3D)
    gui
  }

  def apply(): Dat.GUI = {
    val gui = Dat.GUIVR.create("Plot Details")
    gui.position.set(0.5, 1, -1.5)
    gui.rotateY(-3.14/5) // slightly less than 45deg
    gui
  }
}
