package vrdv.obj3D.plots

import scala.scalajs.js

/**
  * Created by Dorian Thiessen on 2018-07-31.
  */
object PointsUtils {

  /** Buffer Attribute for point colors as RGB values */
  def positions(points: Points): js.Dynamic = getGeometry(points).getAttribute("position")

  /** Buffer Attribute for point colors as RGB values */
  def colors(points: Points): js.Dynamic = getGeometry(points).getAttribute("customColor")

  /** Buffer Attribute for point sizes */
  def sizes(points: Points): js.Dynamic = getGeometry(points).getAttribute("size")

  /** Buffer Attribute for point alpha values */
  def alphas(points: Points): js.Dynamic = getGeometry(points).getAttribute("alpha")

  def getGeometry(points: Points): BufferGeometry = points.geometry.asInstanceOf[BufferGeometry]
}
