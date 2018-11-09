package vrdv.obj3D

import facade.Dat
import util.Log
import vrdv.input.InputDetails
import vrdv.model.Plotter
import vrdv.obj3D.plots.{CoordinateAxes, Plot3D, Plot, ScatterPlot, ShadowManifold}

import scala.scalajs.js

class SettingsGui(plot: Plot, axes: CoordinateAxes,plotter: Plotter)
  extends DatGuiW("Graph Settings", axes.position.x - 2.0, axes.position.y + 2.0, axes.position.z){

  var attachedPlot = plot

  override def setVisible(vis: Boolean): Unit = super.setVisible(vis)

  val rawTau: js.Object = js.Dynamic.literal(
    "TauOnes" -> 0,
    "TauTens" -> 0,
    "TauHundreds" -> 0)

  val filterRange: js.Object = js.Dynamic.literal(
    "Start" → 0,
    "End" → 0,
    "Snap 10" → false,
    "Snap 100" → false
  )

  val raycasterThresholds: js.Object = js.Dynamic.literal(
    "Right" → 0.1,
    "Left" → 0.1
  )

  val axisData: js.Object = js.Dynamic.literal(
    "xAxis" → attachedPlot.xVar,
    "yAxis" → attachedPlot.yVar,
    "zAxis" → attachedPlot.asInstanceOf[Plot3D].zVar
  )

  val plotType: js.Object = js.Dynamic.literal(
    "Graph Type" → "3D Scatter"
  )
  val plotTypeOptions = js.Array("3D Scatter", "2D Scatter", "Shadow Manifold")

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

  val graphTypeDropdown = addDropdown(plotType, "Graph Type", plotTypeOptions)
    .onChange(() => {Log.show("Graph type menu changed."); changeGraphType})

  def changeGraphType: Unit = {
    val gtString = plotType.asInstanceOf[js.Dynamic].selectDynamic("Graph Type").asInstanceOf[String]
    val plotIndex = plotter.getPlotIndex(attachedPlot)

    gtString match {
      case "3D Scatter" => {

      }
      case "2D Scatter" => {
        val columnID = axisTitles.indexOf(axisData.asInstanceOf[js.Dynamic].selectDynamic("xAxis"))
        plotter.replacePlot(attachedPlot, plotter.newPlot2DWithData(columnID))
        attachedPlot = plotter.getPlot(plotIndex)
      }
    }
  }

  /*
  //Raycaster Thresholds Folder
  val rcThresholdFolder = new DatGuiW("Selection Sensitivity", 0, 0, 0)
  rcThresholdFolder.object3D.add(raycasterThresholds, "Left", 0, 0.1).step(0.001).name("Left")
  rcThresholdFolder.object3D.add(raycasterThresholds, "Right", 0, 0.1).step(0.001).name("Right")
  rcThresholdFolder.addButton(() => InputDetails.updateThresholds(getLeftThreshold, getRightThreshold),
    "Update!", "Apply Threshold")
  object3D.addFolder(rcThresholdFolder.object3D)
  //rcThresholdFolder.object3D.open()
  */

  //Axes Folder
  val axesFolder = new DatGuiW("Select Data", 0,0,0)
  var axisTitles: js.Array[String] = js.Array()
  for(d <- plotter.getData.map(_.id)) axisTitles = axisTitles :+ d
  axesFolder.addDropdown(axisData, "xAxis", axisTitles).onChange(() => callForAxisUpdate(0))
  axesFolder.addDropdown(axisData, "yAxis", axisTitles).onChange(() => callForAxisUpdate(1))
  axesFolder.addDropdown(axisData, "zAxis", axisTitles).onChange(() => callForAxisUpdate(2))
  object3D.addFolder(axesFolder.object3D)

  axesFolder.object3D.open()

  def callForAxisUpdate(id: Int): Unit = {
    val axisString = id match {
      case 0 => "xAxis"
      case 1 => "yAxis"
      case 2 => "zAxis"
    }
    val columnID = axisTitles.indexOf(axisData.asInstanceOf[js.Dynamic].selectDynamic(axisString))
    val plotIndex = plotter.getPlotIndex(attachedPlot)
    Log.show("[SettingsGui] requesting axis change plotIndex = " + plotIndex)
    plotter.requestAxisChange(plotIndex, id, columnID)
  }

  //Filter Folder
  val filterFolder = new DatGuiW("Time Filter", 0, 0, 0)
  filterFolder.addCheckbox(filterRange, "Snap 10", "Snap to 10").onChange(() => setFilterStep)
  filterFolder.addCheckbox(filterRange, "Snap 100", "Snap to 100").onChange(() => setFilterStep)
  val filterLowSlider = filterFolder.object3D.add(filterRange, "Start", 0, attachedPlot.numPoints - 1)
    .step(getFilterStep).name("Start index")
  val filterHighSlider = filterFolder.object3D.add(filterRange, "End", 0, attachedPlot.numPoints - 1)
    .step(getFilterStep).name("End index")
  filterFolder.addButton(() => attachedPlot match {
    case sp: ScatterPlot ⇒
      val range = getRange
      sp.setVisiblePointRange(range.start, range.end)
      plotter.setVisiblePointRange(range.start, range.end)
    case sm: ShadowManifold ⇒
  }, "Filter", "Time Filter")
  object3D.addFolder(filterFolder.object3D)
  filterFolder.object3D.open()

  def setFilterStep: Unit = {
    filterLowSlider.step(getFilterStep)
    filterHighSlider.step(getFilterStep)
  }

  def getFilterStep: Int = {
    if(filterRange.asInstanceOf[js.Dynamic].selectDynamic("Snap 100").asInstanceOf[Boolean]) 100 else
      if(filterRange.asInstanceOf[js.Dynamic].selectDynamic("Snap 10").asInstanceOf[Boolean]) 10 else 1
  }


  //Positioning

  setDefaultPosition()

  def setDefaultPosition(): Unit = {
    val xPosDefault: Double = axes.position.x - 2.0
    val yPosDefault: Double = axes.position.y + 2.0
    val zPosDefault: Double = axes.position.z

    Log.show("Setting GUI position to: (" + xPosDefault + ", " + yPosDefault + ", " + zPosDefault + ")")

    //object3D.position.set(xPosDefault, yPosDefault, zPosDefault)
    object3D.position.x = xPosDefault
    object3D.position.y = yPosDefault
    object3D.position.z = zPosDefault
  }
}
