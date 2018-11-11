package vrdv.obj3D

import facade.Dat.GuiSlider
import vrdv.model.Plotter
import vrdv.input.InputDetails

import scala.scalajs.js


/**
  * Created by Wade McDonald 2018-11-01
  */
class GlobalMenu(plotter: Plotter)
  extends DatGuiW("Global Menu", 2, 1, 0) {

  object3D.rotation.y = -3.14 / 2.0

  override def setVisible(vis: Boolean): Unit = super.setVisible(vis)

  def addPlot: Unit = {
    if(object3D.visible) {
      plotter.initPlot3DWithData
      //setVisible(false)
      //object3D.position.set(2, 1, 0)
      //object3D.rotation.y = -3.14 / 2.0
    }
  }

  //addButton(() => { addPlot }, "Create", "Graph 1")
  //addButton(() => { addPlot }, "Create", "Graph 2")
  //addButton(() => { addPlot }, "Create", "Graph 3")

  //Filter Folder
  val filterRange: js.Object = js.Dynamic.literal(
    "Start" → 0,
    "End" → 0,
    "Snap 10" → false,
    "Snap 100" → false
  )

  def getRange: Range = {
    val start = filterRange.asInstanceOf[js.Dynamic].selectDynamic("Start").asInstanceOf[Int]
    val end = filterRange.asInstanceOf[js.Dynamic].selectDynamic("End").asInstanceOf[Int]
    start to end
  }

  val filterFolder = new DatGuiW("Time Filter", 0, 0, 0)
  filterFolder.addCheckbox(filterRange, "Snap 10", "Snap to 10").onChange(() => setFilterStep)
  filterFolder.addCheckbox(filterRange, "Snap 100", "Snap to 100").onChange(() => setFilterStep)
  val numPoints = plotter.getPlot(0).numPoints
  val filterLowSlider: GuiSlider = filterFolder.object3D.add(filterRange, "Start", 0, numPoints - 1)
    .step(getFilterStep).name("Start index").asInstanceOf[GuiSlider]
  val filterHighSlider: GuiSlider = filterFolder.object3D.add(filterRange, "End", 0, numPoints - 1)
    .step(getFilterStep).name("End index").asInstanceOf[GuiSlider]
  filterFolder.addButton(() => applyFilter, "Filter", "Time Filter")
  object3D.addFolder(filterFolder.object3D)
  filterFolder.object3D.open()

  def setFilterStep: Unit = {
    filterLowSlider.step(getFilterStep)
    filterHighSlider.step(getFilterStep)
  }

  def getFilterStep: Int = {
    if(filterRange.asInstanceOf[js.Dynamic].selectDynamic("Snap 100").asInstanceOf[Boolean]) 100
    else if(filterRange.asInstanceOf[js.Dynamic].selectDynamic("Snap 10").asInstanceOf[Boolean]) 10
    else 1
  }

  def applyFilter = {
    val range = getRange
    plotter.setVisiblePointRange(range.start, range.end)
  }

  //Raycaster Thresholds Folder

  val raycasterThresholds: js.Object = js.Dynamic.literal(
    "Right" → 0.1,
    "Left" → 0.1
  )

  def getLeftThreshold: Float = raycasterThresholds.asInstanceOf[js.Dynamic].selectDynamic("Left").asInstanceOf[Float]
  def getRightThreshold: Float = raycasterThresholds.asInstanceOf[js.Dynamic].selectDynamic("Right").asInstanceOf[Float]

  val rcThresholdFolder = new DatGuiW("Selection Sensitivity", 0, 0, 0)
  rcThresholdFolder.object3D.add(raycasterThresholds, "Left", 0, 0.1).step(0.001).name("Left")
  rcThresholdFolder.object3D.add(raycasterThresholds, "Right", 0, 0.1).step(0.001).name("Right")
  rcThresholdFolder.addButton(() => InputDetails.updateThresholds(getLeftThreshold, getRightThreshold),
    "Update!", "Apply Threshold")
  object3D.addFolder(rcThresholdFolder.object3D)
  //rcThresholdFolder.object3D.open()

  //Hide Gui Button
  addButton(() => {plotter.toggleGuiVisibility}, "Hide", "Hide GUI")

}