package vrdv.obj3D.plots

import scala.scalajs.js
import resources.Data
import util._

/**
  * Container of a simple scatter-plot.
  *
  * Created by Dorian Thiessen on 2018-04-05.
  */
class ScatterPlot(points: Points, private var x: Data, private var y: Data, private var z: Data, var props: ScaleCenterProperties) extends Plot3D {
  private var columnData = Array(x, y, z)
  override def xVar: String = x.id // 1st column ID
  override def yVar: String = y.id // 2nd column ID
  override def zVar: String = z.id // 3rd column ID
  override def column(axisID: Int): Array[Double] = columnData(axisID).measurements

  def getColumnData: Array[Data] = columnData
  def columnCount: Int = columnData.length
  def getColumnNames: Array[String] = columnData.map(_.id)
  def viewing: Array[Int] = for(cd <- columnData) yield cd.columnNumber

  def switchAxis(axisID: AxisID, newColumn: Data, updateMetaData: Boolean = true): Unit = {
    assert(axisID >= XAxis && axisID <= ZAxis, s"[rawAxisShift] - Attempted switching invalid axis: $axisID")
    updateAxis(axisID, newColumn.measurements, updateMetaData)
    axisID match {
      case XAxis => x = newColumn
      case YAxis => y = newColumn
      case ZAxis => z = newColumn
    }
    columnData = Array(x, y, z)
    fixScale()

    getPositions.needsUpdate = true
    requestFullGeometryUpdate()
  }

  override def getPoints: Points = points
  override def stats(i: Int): Stats = columnData(i).getStats
  override def getProps: ScaleCenterProperties = props
  def updateProps(newProps: ScaleCenterProperties): Unit = props = newProps

  def getGeometry: BufferGeometry = points.geometry.asInstanceOf[BufferGeometry]
}

object ScatterPlot {
  type CoordinateAxisIDs = String

  def apply(data: Array[Data], texture: Int, hue: Double): ScatterPlot = {
    val viewing = Array(0, 0, 0)
    if(data.length > 1) { // make a 2D plot?
      Log("Columns > 1")
      viewing(YAxis) = 1
    }
    if(data.length > 2) {
      Log("Columns > 2")
      viewing(ZAxis) = 2
    }

    val (points, props, vStats): (Points, ScaleCenterProperties, Array[Stats]) = PointsBuilder()
      .withXS(data(viewing(XAxis)).measurements)
      .withYS(data(viewing(YAxis)).measurements)
      .withZS(data(viewing(ZAxis)).measurements)
      .usingHue(Some(hue))
      .usingTexture(texture)
      .build3D()

    for(i <- vStats.indices) { // This is happening on a certain CSV for column 1...
      if(vStats(i).min != data(i).getStats.min) {
        Log.show(s"\n\nWHOOPS... vStats($i).min:${vStats(i).min} != stats($i).min${data(i).getStats.min}\n")
        // vStats is more reliable (Why?)
        data(i).updateStats(Stats.cloneWith(data(i).getStats)(min = vStats(i).min, max = vStats(i).max)) // <- Terrible temporary fix
      }
      if(vStats(i).max != data(i).getStats.max) {
        Log.show(s"\n\nWHOOPS... vStats($i).max:${vStats(i).min} != stats($i).max${data(i).getStats.min}\n")
        data(i).updateStats(Stats.cloneWith(data(i).getStats)(min = vStats(i).min, max = vStats(i).max)) // <- Terrible temporary fix
      }
    }

    val scatterPlot = new ScatterPlot(points, data(viewing(XAxis)), data(viewing(YAxis)), data(viewing(ZAxis)), props)
    scatterPlot.hue = hue
    scatterPlot
  }

  def fromShadowManifold(sm: ShadowManifold): ScatterPlot = {
    val scatterPlot = new ScatterPlot(sm.points, sm.data, sm.data, sm.data, sm.getProps)
    scatterPlot.setVisiblePointRange(0,  scatterPlot.numPoints)
    scatterPlot.hue = sm.hue
    scatterPlot
  }
}