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
}

object ShadowManifold {

  def apply(data: Data, texture: Int, hue: Double, tau: Int = 1): ShadowManifold = {
    val (points, props, vStats): (Points, ScaleCenterProperties, Array[Stats]) = PointsBuilder()
      .withXS(data.measurements)
      .withYS(data.measurements)
      .withZS(data.measurements)
      .usingHue(Some(hue))
      .usingTexture(texture)
      .build3D()

    /*//for(i <- vStats.indices) { // This is happening on a certain CSV for column 1...
      if(vStats(0).min != data.getStats.min) {
        Log.show(s"\n\nWHOOPS... vStats(0).min:${vStats(0).min} != stats(0).min${data.getStats.min}\n")
        // vStats is more reliable (Why?)
        data.updateStats(Stats.cloneWith(data.getStats)(min = vStats(0).min, max = vStats(0).max)) // <- Terrible temporary fix
      }
      if(vStats(0).max != data.getStats.max) {
        Log.show(s"\n\nWHOOPS... vStats(0).max:${vStats(0).min} != stats(0).max${data.getStats.min}\n")
        data.updateStats(Stats.cloneWith(data.getStats)(min = vStats(0).min, max = vStats(0).max)) // <- Terrible temporary fix
      }
    //}*/

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

    /*val (newPoints, scp, stats) = PointsBuilder() // `stats` can be compared to value in `plot.columnData(column)getStats`, should be the same
      .withXS(embeddingValues.drop(2*tau) ++ Array.fill(2*tau)(embeddingValues(0)))
      .withYS(embeddingValues.slice(tau, embeddingValues.length - tau) ++ Array.fill(2*tau)(embeddingValues(0)))
      .withZS(embeddingValues.take(embeddingValues.length - 2*tau) ++ Array.fill(2*tau)(embeddingValues(0)))
      .usingTexture(Res.getLastLoadedTextureID)
      .usingHue(Some(CustomColors.RED_HUE_SHIFT))
      .build3D()*/

    val newPoints = plot.getPoints
    newPoints.geometry.asInstanceOf[js.Dynamic].setDrawRange(0, embeddingValues.length - 2*tau)
    ShadowManifold.embed(newPoints, embeddingValues, embeddingVar, tau)
    /*newPoints.geometry.buffersNeedUpdate = true
    newPoints.geometry.computeBoundingSphere()
    newPoints.geometry.computeBoundingBox()*/

    val succeeded = embed(newPoints, embeddingValues, embeddingVar, tau)
    if(succeeded) {
      //plot.setVisiblePointRange(0, embeddingValues.length - 2*tau)
      val positionsAttr = PointsUtils.positions(newPoints)
      positionsAttr.needsUpdate = true
      val sm = ShadowManifold(plot.getColumnData(axisID), tau, plot.props, newPoints)
      sm.hue = plot.hue
      sm.computeProps()
      //sm.requestFullGeometryUpdate()
      Some(sm)
    } else None
  }

  def fromShadowManifold(plot: ShadowManifold)(embeddingData: Data, tau: Int = plot.tau): Option[ShadowManifold] = {
    Log.show("[ShadowManifold.fromShadowManifold()]")
    val succeeded = embed(plot.getPoints, embeddingData.measurements, embeddingData.id, tau)
    if(succeeded) {
      //plot.setVisiblePointRange(0, embeddingData.measurements.length - 2*tau)
      plot.data = embeddingData
      plot.varName = embeddingData.id
      plot.tau = tau
      val positionsAttr = PointsUtils.positions(plot.getPoints)
      positionsAttr.needsUpdate = true
      //plot.requestFullGeometryUpdate()
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