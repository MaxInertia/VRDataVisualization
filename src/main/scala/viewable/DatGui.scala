package viewable

import facades.Dat
import facades.Dat.{GuiButton, GuiSlider}
import util.Log
import viewable.plots._

import scala.scalajs.js

/**
  * Created by Dorian Thiessen on 2018-05-10.
  */
class DatGui {
  var object3D: Dat.GUI = DatGui()
  // Highlighted Point Details
  val hs: Array[GuiSlider] = Array(null, null, null)
  // Selected Points Summary
  val ss: Array[GuiSlider] = Array(null, null, null)
  // 0: HPD Folder, 1: SPS Folder
  var folders: Array[Dat.GUI] = Array()

  def updateFolderLabels(plot: ScatterPlot): Unit = {
    hs(XAxis).name(plot.xVar)
    hs(YAxis).name(plot.yVar)
    hs(ZAxis).name(plot.zVar)
    ss(XAxis).name(plot.xVar)
    ss(YAxis).name(plot.yVar)
    ss(ZAxis).name(plot.zVar)
    for(h <- hs) h.matrixWorldNeedsUpdate = true
    for(s <- ss) s.matrixWorldNeedsUpdate = true
  }

}

object DatGui {
  def apply(plot: ScatterPlot, axes: CoordinateAxes3D): DatGui = {
    val gui = new DatGui()

    val highlightFolder = Dat.GUIVR.create("Highlighted Point Values")
    gui.hs(XAxis) = highlightFolder.add(plot.highlightedDetails, "xVar", 0, 0).name(plot.xVar).listen()
    gui.hs(YAxis) = highlightFolder.add(plot.highlightedDetails, "yVar", 0, 0).name(plot.yVar).listen()
    gui.hs(ZAxis) = highlightFolder.add(plot.highlightedDetails, "zVar", 0, 0).name(plot.zVar).listen()
    gui.object3D.addFolder(highlightFolder)
    gui.folders = gui.folders :+ highlightFolder
    highlightFolder.open()

    val selectFolder = Dat.GUIVR.create("Selected Points Mean")
    gui.ss(XAxis) = selectFolder.add(plot.selectedSummary, "xVar", 0, 0).name(plot.xVar).listen()
    gui.ss(YAxis) = selectFolder.add(plot.selectedSummary, "yVar", 0, 0).name(plot.yVar).listen()
    gui.ss(ZAxis) = selectFolder.add(plot.selectedSummary, "zVar", 0, 0).name(plot.zVar).listen()
    selectFolder.addButton(() => {
      for(p <- plot.savedSelections) plot.ops.deselect(p)
      plot.savedSelections = plot.savedSelections.empty
      plot.updateSelectedSummary()
    }) // 3 here b/c 3 additions above take up indices 0-2
    Button(3, selectFolder).setLabel_Description("Clear Selections")

    gui.object3D.addFolder(selectFolder)
    gui.folders = gui.folders :+ selectFolder
    selectFolder.open()

    var settingsFolder = Dat.GUIVR.create("Settings")
    settingsFolder.addButton(() => {
      plot.switchAxis(XAxis)
      axes.setAxisTitle(plot.xVar, XAxis)
      gui.updateFolderLabels(plot)
    })
    settingsFolder.addButton(() => {
      plot.switchAxis(YAxis)
      axes.setAxisTitle(plot.yVar, YAxis)
      gui.updateFolderLabels(plot)
    })
    settingsFolder.addButton(() => {
      plot.switchAxis(ZAxis)
      axes.setAxisTitle(plot.zVar, ZAxis)
      gui.updateFolderLabels(plot)
    })

    Button(0, settingsFolder).setLabels("- X -", "Change X Axis")
    Button(1, settingsFolder).setLabels("- Y -", "Change Y Axis")
    Button(2, settingsFolder).setLabels("- Z -", "Change Z Axis")
    gui.object3D.addFolder(settingsFolder)
    settingsFolder.open()
    gui
  }

  def apply(): Dat.GUI = {
    val gui = Dat.GUIVR.create("Plot Details")
    gui.position.set(0.5, 1, -1.5)
    gui.rotateY(-3.14/5) // slightly less than 45deg
    gui
  }

  object Button {
    case class Button(instance: GuiButton) {
      def setLabels(onButton: String, onDesc: String): Unit = {
        setLabel_Button(onButton)
        setLabel_Description(onDesc)
      }
      def setLabel_Description(str: String): Unit = instance.name(str)
      def setLabel_Button(str: String): Unit = instance
        .children(0).children(1).children(0).children(0)
        .asInstanceOf[js.Dynamic].updateLabel(str)
    }

    // Assumes button is not nested in a sub-folder
    def apply(i: Int, folder: Dat.GUI): Button = Button(folder.children(0).children(i).asInstanceOf[GuiButton])
  }
}
