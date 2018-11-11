package vrdv.obj3D.plots

import resources.{Data, Res}
import util.{Log, ScaleCenterProperties, Stats}
import vrdv.obj3D.CustomColors

import scala.scalajs.js
import scala.scalajs.js.typedarray.Float32Array

/**
  * A reconstruction of an attractor manifold generated from data on a single variable.
  * Each point can be thought of as the history of the variable over some interval of time.
  *
  * Created by Dorian Thiessen on 2018-01-13.
  */
case class ShadowManifold(var data: Data, var tau: Int, var scp: ScaleCenterProperties, points: Points) extends Plot3D {
  var varName: String = data.id
  def varValues: Array[Double] = data.measurements

  override def stats(i: Int): Stats = data.getStats
  override def xVar: String = varName
  override def yVar: String = xVar + s" + $tau"
  override def zVar: String = xVar + s" + ${2 * tau}"
  override def getPoints: Points = points

  override def column(c: Int): Array[Double] = data.measurements

  override private[plots] def getGeometry: BufferGeometry = points.geometry.asInstanceOf[BufferGeometry]
  override def getProps: ScaleCenterProperties = scp
  override def updateProps(props: ScaleCenterProperties): Unit = scp = props
  def computeProps(): Unit = {
    val positionsAttr = getPositions
    val array = positionsAttr.array.asInstanceOf[Float32Array]

    var (minX, minY, minZ) = (Double.MaxValue, Double.MaxValue, Double.MaxValue)
    var (maxX, maxY, maxZ) = (Double.MinValue, Double.MinValue, Double.MinValue)

    var i = 0
    while(i < array.length) {
      if(array(i) > maxX) maxX = array(i)
      if(array(i) < minX) minX = array(i)
      i += 1
      if(array(i) > maxY) maxY = array(i)
      if(array(i) < minY) minY = array(i)
      i += 1
      if(array(i) > maxZ) maxZ = array(i)
      if(array(i) < minZ) minZ = array(i)
      i += 1
    }

    scp = PointOperations.confineToRegion3D(points, (minX, minY, minZ), (maxX, maxY, maxZ))
  }

  def switchAxis(axisID: AxisID, newColumn: Data, newTau: Int): Unit = {
    assert(axisID == XAxis, s"[ShadowManifold] [switchAxis] - Attempted switching invalid axis: $axisID")
    Log.show("[ShadowManifold] [switchAxis]")
    varName = newColumn.id
    data = newColumn

    tau = newTau

    updateEmbedding(tau)
  }

  def updateEmbedding(newTau: Int): Unit = {
    Log.show("[ShadowManifold] [updateEmbedding] tau = " + tau + ", newTau = " + newTau)
    val positionsAttr = PointsUtils.positions(getPoints)
    val positionsArr = positionsAttr.array.asInstanceOf[Float32Array]

    val firstIndex = 2 * newTau // (E - 1) * Tau
    if(firstIndex >= positionsArr.length*3) {
      Log.show("[ShadowManifold] [updateEmbedding] tau too high to generate shadow manifold")
      return
    } // Hard fail - tau too high to generate shadow manifold
    for(pointIndex <- firstIndex until varValues.length) {
      for(dimension <- 0 to 2) positionsArr((pointIndex - firstIndex)*3 + dimension) = varValues(pointIndex - newTau*dimension).toFloat
    }

    Log.show(s"[ShadowManifold] [updateEmbedding] Shadow Manifold made with variable[$varName] with newTau $newTau has ${varValues.length - firstIndex} points.")

    fixScale()

    getPositions.needsUpdate = true
    requestFullGeometryUpdate()
  }
}

object ShadowManifold {
  def apply(data: Data, tau: Int): ShadowManifold = {
    apply(data, Res.getLastLoadedTextureID, CustomColors.BLUE_HUE_SHIFT, tau)
  }

  def apply(data: Data, texture: Int, hue: Double, tau: Int = 1): ShadowManifold = {
    val (points, props, vStats): (Points, ScaleCenterProperties, Array[Stats]) = PointsBuilder()
      .withXS(data.measurements)
      .withYS(data.measurements)
      .withZS(data.measurements)
      .usingHue(Some(hue))
      .usingTexture(texture)
      .build3D()

    val sm = new ShadowManifold(data, tau, props, points)
    sm.hue = hue
    sm
  }

  /**
    * Creates a ShadowManifold from a ScatterPlot. The ScatterPlot is not modified.
    *
    * //@postCondition The ScatterPlot is not modified.
    * @param plot Some ScatterPlot
    * @param tau The embedding time-lag
    * @param axisID The column of data from the ScatterPlot to be used (XAxis, YAXis, or ZAxis)
    *               If unspecified this defaults to the XAxis and the ShadowManifold will be
    *               constructed from plot.columnData(XAxis)
    * @return A ShadowManifold instance containing a new set of THREE.Points
    */
  def fromScatterPlot(plot: ScatterPlot)(tau: Int, axisID: Int = plot.viewing(XAxis)): Option[ShadowManifold] = {
    Log.show("[ShadowManifold.fromScatterPlot()]")
    val embeddingVar = plot.getColumnData(axisID).id
    val embeddingValues = plot.column(axisID)

    val newPoints = plot.getPoints
    newPoints.geometry.asInstanceOf[js.Dynamic].setDrawRange(0, embeddingValues.length - 2*tau)

    val succeeded = embed(newPoints, embeddingValues, embeddingVar, tau)
    if(succeeded) {
      val positionsAttr = PointsUtils.positions(newPoints)
      positionsAttr.needsUpdate = true
      val sm = ShadowManifold(plot.getColumnData(axisID), tau, plot.props, newPoints)
      sm.data = plot.getColumnData(axisID)
      sm.varName = embeddingVar
      sm.hue = plot.hue
      sm.computeProps()
      Some(sm)
    } else None
  }

  def fromShadowManifold(plot: ShadowManifold)(tau: Int = plot.tau): Option[ShadowManifold] = {
    Log.show("[ShadowManifold.fromShadowManifold()]")
    val embeddingData = plot.data
    val succeeded = embed(plot.getPoints, embeddingData.measurements, embeddingData.id, tau)
    if(succeeded) {
      plot.varName = embeddingData.id
      plot.tau = tau
      val positionsAttr = PointsUtils.positions(plot.getPoints)
      positionsAttr.needsUpdate = true
      Some(plot)
    } else None
  }

  protected def embed(points: Points, embeddingValues: Array[Double], embeddingVar: String, tau: Int): Boolean = {
    Log.show("[ShadowManifold.embed()]")
    val positionsAttr = PointsUtils.positions(points)
    val positionsArr = positionsAttr.array.asInstanceOf[Float32Array]

    val firstIndex = 2 * tau // (E - 1) * Tau
    if(firstIndex >= positionsArr.length*3) return false // Hard fail - tau too high to generate shadow manifold
    for(pointIndex <- firstIndex until embeddingValues.length) {
      for(dimension <- 0 to 2) positionsArr((pointIndex - firstIndex)*3 + dimension) = embeddingValues(pointIndex - tau*dimension).toFloat
    }

    Log.show(s"Shadow Manifold made with variable[$embeddingVar] with Tau $tau has ${embeddingValues.length - firstIndex} points.")
    true
  }

}