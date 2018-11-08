package vrdv.obj3D

import facade.Dat
import util.Log
import vrdv.input.InputDetails
import vrdv.model.Plotter
import vrdv.obj3D.plots.{CoordinateAxes, Plot3D, ScatterPlot, ShadowManifold}

import scala.scalajs.js

class SettingsGui(plot: Plot3D, axes: CoordinateAxes,plotter: Plotter)
  extends DatGuiW("Graph Settings", axes.position.x - 2.0, axes.position.y + 2.0, axes.position.z){

  override def setVisible(vis: Boolean): Unit = super.setVisible(vis)

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

  val axisData: js.Object = js.Dynamic.literal(
    "xAxis" → plot.xVar,
    "yAxis" → plot.yVar,
    "zAxis" → plot.zVar
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

  //def getAxisDataValue(axis: )

  val graphTypeDropdown = addDropdown(plotType, "Graph Type", plotTypeOptions)
  graphTypeDropdown.onChange(() => {Log.show("Graph type menu changed.")})

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
  axesFolder.object3D.add(axisData, "xAxis", axisTitles)
  axesFolder.object3D.add(axisData, "yAxis", axisTitles)
  axesFolder.object3D.add(axisData, "zAxis", axisTitles)
  object3D.addFolder(axesFolder.object3D)
  axesFolder.object3D.open()

  //Filter Folder
  val filterFolder = new DatGuiW("Time Filter", 0, 0, 0)
  filterFolder.object3D.add(filterRange, "Start", 0, plot.numPoints - 1).step(1).name("Start index")
  filterFolder.object3D.add(filterRange, "End", 0, plot.numPoints - 1).step(1).name("End index")
  filterFolder.addButton(() => plot match {
    case sp: ScatterPlot ⇒
      val range = getRange
      sp.setVisiblePointRange(range.start, range.end)
      plotter.setVisiblePointRange(range.start, range.end)
    case sm: ShadowManifold ⇒
  }, "Filter", "Time Filter")
  object3D.addFolder(filterFolder.object3D)
  filterFolder.object3D.open()

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
