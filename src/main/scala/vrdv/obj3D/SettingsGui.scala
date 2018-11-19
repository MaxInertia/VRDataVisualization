package vrdv.obj3D

import facade.Dat._
import util.Log
import vrdv.input._
import vrdv.model.Plotter
import vrdv.obj3D.plots._

import scala.scalajs.js

class SettingsGui(plot: Plot, axes: CoordinateAxes, plotter: Plotter)
  extends DatGuiW("Graph Settings", axes.position.x - 2.0, axes.position.y + 2.0, axes.position.z){

  var attachedPlot = plot

  override def setVisible(vis: Boolean): Unit = super.setVisible(vis)

  val rawTau: js.Object = js.Dynamic.literal(
    "TauOnes" -> 0,
    "TauTens" -> 0,
    "TauHundreds" -> 0)

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

  val graphTypeDropdown = addDropdown(plotType, "Graph Type", plotTypeOptions)
    .onChange(() => {Log.show("Graph type menu changed."); changeGraphType})

  def changeGraphType: Unit = {
    val gtString = plotType.asInstanceOf[js.Dynamic].selectDynamic("Graph Type").asInstanceOf[String]
    val plotIndex = plotter.getPlotIndex(attachedPlot)

    gtString match {
      case "3D Scatter" => {
        val xCol = axisTitles.indexOf(axisData.asInstanceOf[js.Dynamic].selectDynamic("xAxis"))
        val yCol = axisTitles.indexOf(axisData.asInstanceOf[js.Dynamic].selectDynamic("yAxis"))
        val zCol = axisTitles.indexOf(axisData.asInstanceOf[js.Dynamic].selectDynamic("zAxis"))
        plotter.replacePlot(attachedPlot, plotter.newPlot3DWithData(xCol, yCol, zCol))
        attachedPlot = plotter.getPlot(plotIndex)
        updateFoldersForGraphType("3D Scatter")
      }
      case "2D Scatter" => {
        val columnID = axisTitles.indexOf(axisData.asInstanceOf[js.Dynamic].selectDynamic("yAxis"))
        plotter.replacePlot(attachedPlot, plotter.newPlot2DWithData(columnID))
        attachedPlot = plotter.getPlot(plotIndex)
        updateFoldersForGraphType("2D Scatter")
      }
      case "Shadow Manifold" => {
        val columnID = axisTitles.indexOf(axisData.asInstanceOf[js.Dynamic].selectDynamic("xAxis"))
        val sm  = plotter.newShadowManifoldWithData(columnID, getTau)
        sm.asInstanceOf[ShadowManifold].updateEmbedding(getTau)
        plotter.replacePlot(attachedPlot, sm)
        attachedPlot = plotter.getPlot(plotIndex)
        updateFoldersForGraphType("Shadow Manifold")

        /*
        AXES(plotIndex) match {
          case a2D: CoordinateAxes2D ⇒ a2D.setAxesTitles(newSM.xVar, newSM.yVar)
          case a3D: CoordinateAxes3D ⇒ a3D.setAxesTitles(newSM.xVar, newSM.yVar, newSM.zVar)
        }
        */
      }
    }
  }

  def updateFoldersForGraphType(graphType: String = "3D Scatter"): Unit = {
    //Remove any folders currently in the Gui
    if(axesFolder.object3D.parent != null) {
      axesFolder.object3D.parent.remove(axesFolder.object3D)
    }
    if(axesFolderXOnly.object3D.parent != null) {
      axesFolderXOnly.object3D.parent.remove(axesFolderXOnly.object3D)
    }
    if(axesFolderYOnly.object3D.parent != null) {
      axesFolderYOnly.object3D.parent.remove(axesFolderYOnly.object3D)
    }
    if(embeddingFolder.object3D.parent != null) {
      embeddingFolder.object3D.parent.remove(embeddingFolder.object3D)
    }

    //setup correct folders for graph type
    graphType match {
      case "3D Scatter" =>
        object3D.addFolder(axesFolder.object3D)
        axesFolder.object3D.open()

      case "2D Scatter" =>
        object3D.addFolder(axesFolderYOnly.object3D)
        axesFolderYOnly.object3D.close()
        axesFolderYOnly.object3D.open()

      case "Shadow Manifold" => {
        object3D.addFolder(axesFolderXOnly.object3D)
        axesFolderXOnly.object3D.open()
        object3D.addFolder(embeddingFolder.object3D)
        embeddingFolder.object3D.open()
      }
    }

    object3D.close()
    object3D.open()


  }

  //Axes Folder XYZ
  val axesFolder = new DatGuiW("Select Data", 0,0,0)
  var axisTitles: js.Array[String] = js.Array()
  for(d <- plotter.getData.map(_.id)) axisTitles = axisTitles :+ d
  val xDropdown = axesFolder.addDropdown(axisData, "xAxis", axisTitles).onChange(() => callForAxisUpdate(0))
  val yDropdown = axesFolder.addDropdown(axisData, "yAxis", axisTitles).onChange(() => callForAxisUpdate(1))
  val zDropdown = axesFolder.addDropdown(axisData, "zAxis", axisTitles).onChange(() => callForAxisUpdate(2))
  object3D.addFolder(axesFolder.object3D)
  axesFolder.object3D.open()

  //Axes Folder X Only
  val axesFolderXOnly = new DatGuiW("Select Data", 0,0,0)
  axesFolderXOnly.addDropdown(axisData, "xAxis", axisTitles).onChange(() => callForAxisUpdate(0))
  //object3D.addFolder(axesFolderXOnly.object3D)
  axesFolderXOnly.object3D.open()

  //Axes Folder Y Only
  val axesFolderYOnly = new DatGuiW("Select Data", 0,0,0)
  axesFolderYOnly.addDropdown(axisData, "yAxis", axisTitles).onChange(() => callForAxisUpdate(1))
  //object3D.addFolder(axesFolderYOnly.object3D)
  axesFolderYOnly.object3D.open()

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

  //Embedding Folder
  val embeddingFolder = new DatGuiW("Embedding", 0,0,0)
  embeddingFolder.object3D.add(rawTau, "TauOnes", 0, 10).step(1).name("Tau Ones")
  embeddingFolder.object3D.add(rawTau, "TauTens", 0, 90).step(10).name("Tau Tens")
  embeddingFolder.object3D.add(rawTau, "TauHundreds", 0, 900).step(100).name("Tau Hundreds")
  embeddingFolder.addButton(() => updateEmbedding, "Embed!", "Embed Shadow Manifold")
  //object3D.addFolder(embeddingFolder.object3D)
  embeddingFolder.object3D.open()

  def updateEmbedding: Unit = {
    Log.show("[SettingsGui] Updating embedding...")
    val columnID = axisTitles.indexOf(axisData.asInstanceOf[js.Dynamic].selectDynamic("xAxis"))
    plotter.requestEmbeddingUpdate(attachedPlot, columnID, getTau)
  }



  //Reset button
  //TODO Reset Button
  //addButton(() => resetToDefaults, "Reset", "Reset to Defaults")

  /*
  def resetToDefaults = {
    //TODO needs work: controls don't reset display
    Log.show("Reset to Defaults Button pressed.")
    filterRange.asInstanceOf[js.Dynamic].updateDynamic("Start")(0)
    filterRange.asInstanceOf[js.Dynamic].updateDynamic("End")(attachedPlot.numPoints - 1)
    applyFilter

    val plotIndex = plotter.getPlotIndex(attachedPlot)
    Log.show("[SettingsGui] requesting axis change plotIndex = " + plotIndex)
    plotter.requestAxisChange(plotIndex, 0, 0)
    plotter.requestAxisChange(plotIndex, 1, 1)
    plotter.requestAxisChange(plotIndex, 2, 2)
  }
  */
}
