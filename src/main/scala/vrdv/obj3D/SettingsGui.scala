package vrdv.obj3D

import facade.Dat
import vrdv.input.InputDetails
import vrdv.model.Plotter
import vrdv.obj3D.plots.{CoordinateAxes, Plot3D}

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

  addDropdown(plotType, "Graph Type", plotTypeOptions)

  //Raycaster Thresholds Folder
  val rcThresholdFolder = new DatGuiW("Selection Sensitivity", 0, 0, 0)
  rcThresholdFolder.object3D.add(raycasterThresholds, "Left", 0, 0.1).step(0.001).name("Left")
  rcThresholdFolder.object3D.add(raycasterThresholds, "Right", 0, 0.1).step(0.001).name("Right")
  rcThresholdFolder.addButton(() => InputDetails.updateThresholds(getLeftThreshold, getRightThreshold),
    "Update!", "Apply Threshold")
  object3D.addFolder(rcThresholdFolder.object3D)
  rcThresholdFolder.object3D.open()

  //

  setDefaultPosition()

  def setDefaultPosition(): Unit = {
    val xPosDefault = axes.position.x - 2.0
    val yPosDefault = axes.position.y + 2.0
    val zPosDefault = axes.position.z

    object3D.position.set(xPosDefault, yPosDefault, zPosDefault)
    object3D.updateMatrix()
  }
}
