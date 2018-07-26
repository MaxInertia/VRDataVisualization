package viewable

import facades.Dat
import facades.Dat.{GuiButton, GuiSlider}
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

  var mode: Int = DatGui.Mode_ScatterPlot

  def addFolder(folder: Dat.GUI): Unit = {
    object3D.addFolder(folder)
    folders = folders :+ folder
  }

  def updateFolderLabels(x: String = "", y: String = "", z: String = ""): Unit = {
    if(x != "") {
      hs(XAxis).name(x)
      ss(XAxis).name(x)
    }
    if(y != "") {
      hs(YAxis).name(y)
      ss(YAxis).name(y)
    }
    if(z != "") {
      hs(ZAxis).name(z)
      ss(ZAxis).name(z)
    }

    for(h <- hs) h.matrixWorldNeedsUpdate = true
    for(s <- ss) s.matrixWorldNeedsUpdate = true
  }
}

object DatGui {

  val Mode_ScatterPlot:Int = 1
  val Mode_ShadowManifold: Int = 2

  def apply(plot: ScatterPlot, axes: CoordinateAxes3D): DatGui = {
    val gui = new DatGui()

    def updateMode(mode: Int, axesUpdated: Option[AxisID] = None): Unit = if(gui.mode != mode) {
      mode match {
        case Mode_ScatterPlot => // Restore...
          plot.getGeometry.asInstanceOf[js.Dynamic].setDrawRange(0, plot.column(0).length) // draw range,
          if(axesUpdated.nonEmpty) {
            val axisToSkip = axesUpdated.get
            if(axisToSkip != XAxis) {
              plot.switchAxis(XAxis)
              axes.setAxisTitle(plot.xVar, XAxis)
              gui.updateFolderLabels(x = plot.xVar)
            }
            if(axisToSkip != YAxis) {
              plot.switchAxis(YAxis, shift = 2)
              axes.setAxisTitle(plot.yVar, YAxis)
              gui.updateFolderLabels(y = plot.yVar)
            }
            if(axisToSkip != ZAxis) {
              plot.switchAxis(ZAxis, shift = 3)
              axes.setAxisTitle(plot.zVar, ZAxis)
              gui.updateFolderLabels(z = plot.zVar)
            }
          }
        case Mode_ShadowManifold =>
          // nothing fun yet
        case i =>
        // ...what?
      }
      gui.mode = mode
    }

    createHighlightedPointDataFolder(gui, plot)
    createSelectedPointsDataFolder(gui, plot)

    var settingsFolder = Dat.GUIVR.create("Settings")
    settingsFolder.addButton(() => {
      updateMode(Mode_ScatterPlot, Some(XAxis))
      plot.switchAxis(XAxis)
      axes.setAxisTitle(plot.xVar, XAxis)
      gui.updateFolderLabels(x = plot.xVar)
    })
    settingsFolder.addButton(() => {
      updateMode(Mode_ScatterPlot, Some(YAxis))
      plot.switchAxis(YAxis)
      axes.setAxisTitle(plot.yVar, YAxis)
      gui.updateFolderLabels(y = plot.yVar)
    })
    settingsFolder.addButton(() => {
      updateMode(Mode_ScatterPlot, Some(ZAxis))
      plot.switchAxis(ZAxis)
      axes.setAxisTitle(plot.zVar, ZAxis)
      gui.updateFolderLabels(z = plot.zVar)
    })

    Button(0, settingsFolder).setLabels("   X", "Change X Axis")
    Button(1, settingsFolder).setLabels("   Y", "Change Y Axis")
    Button(2, settingsFolder).setLabels("   Z", "Change Z Axis")
    gui.object3D.addFolder(settingsFolder)
    settingsFolder.open()

    val smFolder = Dat.GUIVR.create("Shadow Manifold")
    smFolder.addButton(() => {
      updateMode(Mode_ShadowManifold)
      val (xVar, yVar, zVar) = ShadowManifold.transform(plot)
      axes.setAxesTitles(xVar, yVar, zVar)
      gui.updateFolderLabels(x = xVar, y = yVar, z = zVar)
    })

    smFolder.add(ShadowManifold.settings, "TauOnes", 0, 10).step(1).name("Tau Ones")
    smFolder.add(ShadowManifold.settings, "TauTens", 0, 90).step(10).name("Tau Tens")
    smFolder.add(ShadowManifold.settings, "TauHundreds", 0, 900).step(100).name("Tau Hundreds")

    Button(0, smFolder).setLabels("Embed!", "Embed xVar")
    gui.object3D.addFolder(smFolder)
    smFolder.open()
    gui
  }

  def apply(): Dat.GUI = {
    val gui = Dat.GUIVR.create("Plot Details")
    gui.position.set(0.5, 1.6, -1.5)
    gui.rotateY(-3.14/4)
    gui
  }

  def createHighlightedPointDataFolder(gui: DatGui, plot: Plot): Unit = {
    val highlightFolder = Dat.GUIVR.create("Highlighted Point Values")
    // Rows that display the coordinates of the highlighted point
    gui.hs(XAxis) = highlightFolder.add(plot.highlightedDetails, "xVar", 0, 0).name(plot.xVar).listen()
    gui.hs(YAxis) = highlightFolder.add(plot.highlightedDetails, "yVar", 0, 0).name(plot.yVar).listen()
    gui.hs(ZAxis) = highlightFolder.add(plot.highlightedDetails, "zVar", 0, 0).name(plot.zVar).listen()
    // Add folder to gui object (and therefore the scene)
    gui.addFolder(highlightFolder)
    // Open the folder
    highlightFolder.open()
  }

  def createSelectedPointsDataFolder(gui: DatGui, plot: ScatterPlot): Unit = {
    val selectFolder = Dat.GUIVR.create("Selected Points Mean")
    // Rows that display the mean value of all selected points
    gui.ss(XAxis) = selectFolder.add(plot.selectedSummary, "xVar", 0, 0).name(plot.xVar).listen() // 0
    gui.ss(YAxis) = selectFolder.add(plot.selectedSummary, "yVar", 0, 0).name(plot.yVar).listen() // 1
    gui.ss(ZAxis) = selectFolder.add(plot.selectedSummary, "zVar", 0, 0).name(plot.zVar).listen() // 2
    // A button for clearing set of selected points
    selectFolder.addButton(() => {
      for(p <- plot.savedSelections) plot.ops.deselect(p)
      plot.savedSelections = plot.savedSelections.empty
      plot.updateSelectedSummary()
    })
    Button(3, selectFolder).setLabel_Description("Clear Selections") // 3 used b/c rows added above take up indices 0-2
    // Add folder to gui object (and therefore the scene)
    gui.addFolder(selectFolder)
    // Open the folder
    selectFolder.open()
  }

  object Button {
    case class Button(instance: GuiButton) {

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
    def apply(i: Int, folder: Dat.GUI): Button = Button(folder.children(0).children(i).asInstanceOf[GuiButton])
  }
}
