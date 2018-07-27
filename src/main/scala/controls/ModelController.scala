package controls

import viewable.DatGui
import viewable.displays.ColumnPicker
import viewable.plots._

/**
  * The ModelController is where any changes, especially those that involve many components,
  * should be requested. It will handle updating all relevant components.
  *
  * Motivation: Decrease coupling between pairs of components whose relationship to one
  * another is weak.
  *
  * Created by Dorian Thiessen on 2018-07-26.
  */
object ModelController {

  private var PLOT: ScatterPlot = _
  private var AXES: CoordinateAxes3D = _
  private var GUI: DatGui = _

  def setPlot(plot: ScatterPlot): Unit = this.PLOT = plot
  def setAxes(axes: CoordinateAxes3D): Unit = this.AXES = axes
  def setGUI(gui: DatGui): Unit = this.GUI = gui


  // Applies an axis change. Changes (1) plot point positions, (2) axes titles, and (3) gui labels
  def requestAxisChange(axisID: AxisID, plot: ScatterPlot = PLOT, axes: CoordinateAxes3D = AXES, gui: DatGui = GUI, columnIndex: Option[Int] = None): Unit =
    if(plot.plotType == ShadowManifold_Type) { // Currently viewing a shadow manifold, so we have to adjust each axis

      if(columnIndex.nonEmpty && axisID == XAxis) { // SM -> SM
        val col = columnIndex.get
        val axisNamesOrNothing = ShadowManifold.transform(plot)(col)
        axisNamesOrNothing match {
          case Left((xLabel, yLabel, zLabel)) =>
            plot.viewing(XAxis) = col
            plot.viewing(YAxis) = col
            plot.viewing(ZAxis) = col
            plot.fixScale(XAxis, XAxis, XAxis) // Use x-axis values for scaling in all dimensions
            plot.requestGeometryUpdate()

            axes.setAxesTitles(xLabel, yLabel, zLabel)
            gui.updateFolderLabels(x = xLabel, y = yLabel, z = zLabel)
            val columnPicker = ColumnPicker.columnDisplay.get
            columnPicker.disableRow(col)
            for(cs <- 0 until plot.columnCount if cs != col) columnPicker.enableRow(cs)
          case Right(_) =>
        }

      } else { // SM -> SP ... How should the user switch back to scatterplot mode?
        plot.plotType = ScatterPlot_Type
        plot.setVisiblePointRange(0, plot.numPoints)
        val shift =
          if(columnIndex.get > plot.viewing(axisID)) plot.viewing(axisID) - columnIndex.get
          else columnIndex.get - plot.viewing(axisID)

        axisID match {
          case XAxis => plot.shiftEachAxis(shift, 1, 1)
          case YAxis => plot.shiftEachAxis(1, shift, 1)
          case ZAxis => plot.shiftEachAxis(1, 1, shift)
        }

        axes.setAxesTitles(plot.xVar, plot.yVar, plot.zVar)
        gui.updateFolderLabels(x = plot.xVar, y = plot.yVar, z = plot.zVar)
        val columnPicker = ColumnPicker.columnDisplay.get
        for(cs <- 0 until plot.columnCount if !plot.viewing.contains(cs)) columnPicker.enableRow(cs)
        for(axi <- XAxis to ZAxis) columnPicker.disableRow(plot.viewing(axi))
      }

    } else { // SP -> SP
      if(columnIndex.nonEmpty) plot.switchAxis(axisID, shift = columnIndex.get, shiftIsColumnIndex = true)
      else plot.switchAxis(axisID)

      val columnPicker = ColumnPicker.columnDisplay.get
      for(cs <- 0 until plot.columnCount if !plot.viewing.contains(cs)) columnPicker.enableRow(cs)
      for(axi <- XAxis to ZAxis) columnPicker.disableRow(plot.viewing(axi))

      axisID match { // Currently viewing a scatter-plot, so we can settle with modifying a single axis
        case XAxis =>
          axes.setAxisTitle(plot.xVar, axisID)
          gui.updateFolderLabels(x = plot.xVar)
        case YAxis =>
          axes.setAxisTitle(plot.yVar, axisID)
          gui.updateFolderLabels(y = plot.yVar)
        case ZAxis =>
          axes.setAxisTitle(plot.zVar, axisID)
          gui.updateFolderLabels(z = plot.zVar)
      }
    }
}
