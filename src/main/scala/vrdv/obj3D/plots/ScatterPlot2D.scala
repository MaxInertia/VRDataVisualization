package vrdv.obj3D.plots

import resources.{Data, Res}
import util.{ScaleCenterProperties, Stats}
import vrdv.obj3D.CustomColors

/**
 * Created by Dorian Thiessen on 2018-08-01.
 */
class ScatterPlot2D(points: Points, private var x: Data, private var y: Data, var props: ScaleCenterProperties) extends Plot2D {
  private var columnData = Array(x, y)
  override def xVar: String = x.id // 1st column ID
  override def yVar: String = y.id // 2nd column ID
  override def column(axisID: Int): Array[Double] = columnData(axisID).measurements
  points.geometry.computeBoundingBox()
  points.geometry.computeFaceNormals()

  def getColumnData: Array[Data] = columnData
  def columnCount: Int = columnData.length
  def getColumnNames: Array[String] = columnData.map(_.id)
  def viewing: Array[Int] = for(cd <- columnData) yield cd.columnNumber

  def switchAxis(axisID: AxisID, newColumn: Data, updateMetaData: Boolean = true): Unit = {
    if(axisID != YAxis) return
    updateAxis(axisID, newColumn.measurements, updateMetaData)

    y = newColumn
    columnData = Array(x, y)
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

object ScatterPlot2D {
  def apply(xs: Data, ys: Data): ScatterPlot2D = {
    val (points, props, vStats): (Points, ScaleCenterProperties, Array[Stats]) = PointsBuilder()
      .withXS(xs.measurements)
      .withYS(ys.measurements)
      .usingHue(Some(CustomColors.RED_HUE_SHIFT))
      .usingTexture(Res.getLastLoadedTextureID)
      .build2D()

    val ts = new ScatterPlot2D(points, xs, ys, props)
    ts.setVisiblePointRange(0,  ts.numPoints - 1)
    ts
  }
}
