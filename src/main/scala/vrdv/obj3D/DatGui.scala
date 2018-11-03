package vrdv.obj3D

import facade.Dat
import facade.Dat.{GuiButton, GuiSlider}
import vrdv.input.InputDetails
import vrdv.model.Plotter
import vrdv.obj3D.plots._

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

  val rawTau: js.Object = js.Dynamic.literal(
    "TauOnes" -> 0,
    "TauTens" -> 0,
    "TauHundreds" -> 0)

  val filterRange: js.Object = js.Dynamic.literal(
    "Start" → 0,
    "End" → 0
  )

  val raycasterThresholds: js.Object = js.Dynamic.literal(
    "Right" → 0.1,
    "Left" → 0.1
  )

  def getTau: Int =
    rawTau.asInstanceOf[js.Dynamic].selectDynamic("TauOnes").asInstanceOf[Int] +
    rawTau.asInstanceOf[js.Dynamic].selectDynamic("TauTens").asInstanceOf[Int] +
    rawTau.asInstanceOf[js.Dynamic].selectDynamic("TauHundreds").asInstanceOf[Int]

  def getRange: Range = {
    val start = filterRange.asInstanceOf[js.Dynamic].selectDynamic("Start").asInstanceOf[Int]
    val end = filterRange.asInstanceOf[js.Dynamic].selectDynamic("End").asInstanceOf[Int]
    start to end
  }

  def getLeftThreshold: Float = raycasterThresholds.asInstanceOf[js.Dynamic].selectDynamic("Left").asInstanceOf[Float]
  def getRightThreshold: Float = raycasterThresholds.asInstanceOf[js.Dynamic].selectDynamic("Right").asInstanceOf[Float]

}

object DatGui {

  def apply(plot: Plot3D, axes: CoordinateAxes, mc: Plotter): DatGui = {
    val gui = new DatGui()
    createHighlightedPointDataFolder(gui, plot)
    createSelectedPointsDataFolder(gui, plot, mc)

    val rcThresholdFolder = Dat.GUIVR.create("Selection Sensitivity")
    rcThresholdFolder.add(gui.raycasterThresholds, "Left", 0, 0.1).step(0.001).name("Left")
    rcThresholdFolder.add(gui.raycasterThresholds, "Right", 0, 0.1).step(0.001).name("Right")
    rcThresholdFolder.addButton(() => InputDetails.updateThresholds(gui.getLeftThreshold, gui.getRightThreshold))
    Button(2, rcThresholdFolder).setLabels("Update!", "Apply Threshold")
    gui.object3D.addFolder(rcThresholdFolder)

    val filterFolder = Dat.GUIVR.create("Time Filter")
    filterFolder.add(gui.filterRange, "Start", 0, plot.numPoints - 1).step(1).name("Start index")
    filterFolder.add(gui.filterRange, "End", 0, plot.numPoints - 1).step(1).name("End index")
    filterFolder.addButton(() => plot match {
      case sp: ScatterPlot ⇒
        val range = gui.getRange
        sp.setVisiblePointRange(range.start, range.end)
        mc.setVisiblePointRange(range.start, range.end)
      case sm: ShadowManifold ⇒
    })
    Button(2, filterFolder).setLabels("Filter!", "Apply Filter")
    gui.object3D.addFolder(filterFolder)

    val embeddingFolder = Dat.GUIVR.create("Shadow Manifold")
    embeddingFolder.add(gui.rawTau, "TauOnes", 0, 10).step(1).name("Tau Ones")
    embeddingFolder.add(gui.rawTau, "TauTens", 0, 90).step(10).name("Tau Tens")
    embeddingFolder.add(gui.rawTau, "TauHundreds", 0, 900).step(100).name("Tau Hundreds")
    embeddingFolder.addButton(() => plot match {
      case sm: ShadowManifold ⇒ mc.requestEmbedding(XAxis, sm.data.columnNumber, gui.getTau)//, 1)
      case sp: ScatterPlot ⇒ mc.requestEmbedding(XAxis, sp.viewing(XAxis), gui.getTau)//, 1)
    })
    Button(3, embeddingFolder).setLabels("Embed!", "Embed xVar")
    gui.object3D.addFolder(embeddingFolder)

    gui
  }

  def apply(): Dat.GUI = {
    val gui = Dat.GUIVR.create("Plot Details")
    gui.position.set(-0.8, 1.4, -2)
    //gui.rotateY(3.14/4 * 1.1)
    gui
  }

  def createHighlightedPointDataFolder(gui: DatGui, plot: Plot3D): Unit = {
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

  def createSelectedPointsDataFolder(gui: DatGui, plot: Plot3D, plotter: Plotter): Unit = {
    val selectFolder = Dat.GUIVR.create("Selected Points Mean")

    // Rows that display the mean value of all selected points
    gui.ss(XAxis) = selectFolder.add(plot.selectedSummary, "xVar", 0, 0).name(plot.xVar).listen() // 0
    gui.ss(YAxis) = selectFolder.add(plot.selectedSummary, "yVar", 0, 0).name(plot.yVar).listen() // 1
    gui.ss(ZAxis) = selectFolder.add(plot.selectedSummary, "zVar", 0, 0).name(plot.zVar).listen() // 2

    // A button for clearing set of selected points
    selectFolder.addButton(() => {
      plotter.clearSelections()
      //PointOperations.updateSelectedSummary(plot)
    })
    Button(3, selectFolder).setLabels("Clear", "Clear Selections") // 3 used b/c rows added above take up indices 0-2

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
