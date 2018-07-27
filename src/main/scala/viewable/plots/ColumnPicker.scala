package viewable.plots

import controls.{Laser, ModelController}
import org.scalajs.threejs.Intersection
import util.Log
import viewable.displays.{ListDisplay, RowSettings}

/**
  * Created by Dorian Thiessen on 2018-07-26.
  */
object ColumnPicker {
  var columnDisplay: Option[ListDisplay] = None
  var axesDisplays: Option[ListDisplay] = None
  var axisToSwap: AxisID = XAxis

  def init(columnNames: Array[String]): (ListDisplay, ListDisplay) = {
    val clist = new ListDisplay(columnNames)
    clist.group3D.position.setX(-1.0)
    clist.group3D.position.setZ(-0.2)
    clist.group3D.rotateY(3.14 / 2)
    columnDisplay = Some(clist)
    clist.disableRow(0)
    clist.disableRow(1)
    clist.disableRow(2)

    val settings = new RowSettings(width = 0.08, height = 0.08, margin = 0.02)
    val alist = new ListDisplay(Array("X", "Y", "Z"), settings, vertical = false)
    alist.group3D.position.setX(-1.0)
    alist.group3D.position.setZ(+0.2)
    alist.group3D.position.setY((clist.elements.length + 1) * (clist.RowHeight + clist.RowMargin))
    alist.group3D.rotateY(3.14 / 2)
    axesDisplays = Some(alist)

    (clist, alist)
  }

  def interactionCheck(laser: Laser): Boolean = {
    if(ColumnPicker.columnDisplay.isEmpty || ColumnPicker.axesDisplays.isEmpty) return false
    var hitFlag: Boolean = false

    val axisList = ColumnPicker.axesDisplays.get // might as well get these out of the way first, since there's only three
    val axisIntersections: scalajs.js.Array[Intersection] = laser.rayCaster.intersectObject(axisList.group3D, recursive = true)
    if (axisIntersections.nonEmpty) {
      val intersect = axisIntersections(0)
      laser.updateLengthScale(intersect.distance)
      for (i <- axisList.elements.indices) {
        val item = axisList.elements(i)
        if (intersect.`object` == item.object3D) {
          hitFlag = true
          if (!item.hovering) {
            item.onHover()
            axisToSwap = i
          }
        } else if (item.hovering) item.offHover()
      }
    }

    if(hitFlag) return true // Don't waste time with the next check if we already found an interaction

    val columnVariablesList = ColumnPicker.columnDisplay.get
    val columnIntersections: scalajs.js.Array[Intersection] = laser.rayCaster.intersectObject(columnVariablesList.group3D, recursive = true)
    if(columnIntersections.nonEmpty) {
      val intersect = columnIntersections(0)
      laser.updateLengthScale(intersect.distance)
      for(i <- columnVariablesList.elements.indices) {
        val target = columnVariablesList.elements(i)
        if(intersect.`object` == target.object3D) {
          hitFlag = true

          if(!target.hovering) target.onHover()
          else if(laser.active && !target.disabled)
            ModelController.requestAxisChange(ColumnPicker.axisToSwap, columnIndex = Some(i))

        } else if(target.hovering) target.offHover()
      }
    }

    hitFlag
  }

}
