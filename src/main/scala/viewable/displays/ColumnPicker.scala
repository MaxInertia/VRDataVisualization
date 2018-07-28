package viewable.displays

import controls.{ActionLaser, ModelController}
import facades.IFThree.Group
import org.scalajs.threejs._
import viewable.plots.{AxisID, XAxis, YAxis, ZAxis}

/**
  * Created by Dorian Thiessen on 2018-07-26.
  */
object ColumnPicker {
  private val instance: Group = new Group()
  var columnDisplay: Option[ListDisplay] = None
  var axesDisplays: Option[ListDisplay] = None
  var axisToSwap: AxisID = XAxis
  var background: Option[Mesh] = None
  var holding: Boolean = true

  def init(columnNames: Array[String]): Group = {

    val clist = new ListDisplay(columnNames, canvasWidthConstant = 100) //, new RowSettings(width = 0.1))
    columnDisplay = Some(clist)
    clist.disableRow(0)
    clist.disableRow(1)
    clist.disableRow(2)

    val alist = new ListDisplay(Array("X", "Y", "Z"), new RowSettings(width = 0.08), canvasWidthConstant = 12)
    val aListXPos = -(clist.RowMargin * 3 + clist.RowWidth / 2)
    alist.group3D.position.setX(aListXPos)
    axesDisplays = Some(alist)
    alist.elements(0).onHover()

    instance.add(clist.group3D)
    instance.add(alist.group3D)

    def bg(): Mesh = {
      val width = clist.RowMargin * 3 + clist.RowWidth + clist.RowHeight
      val height = (clist.RowHeight + clist.RowMargin) * clist.elements.length + 2 * clist.RowMargin
      val geo = new PlaneGeometry(width, height)
      val material = new MeshBasicMaterial()
      material.color.setHex(0x222222)
      material.side = THREE.DoubleSide
      val mesh = new Mesh(new PlaneGeometry(width, height), material)
      mesh.position.set(-2.5 * clist.RowMargin, height / 2 + clist.RowMargin, -0.01)
      mesh.geometry.computeBoundingBox()
      mesh.geometry.computeFaceNormals()
      mesh
    }

    background = Some(bg())
    instance.add(background.get)

    instance.rotateY(3.14 / 2)
    instance.position.setX(-1.0)
    instance //(clist, alist)
  }

  def interactionCheck(laser: ActionLaser): Boolean = {
    if (background.isEmpty) return false
    var hitFlag: Boolean = false

    val bgBoard = background.get
    val axisList = axesDisplays.get
    val columnVariablesList = columnDisplay.get

    val intersections: scalajs.js.Array[Intersection] = laser.rayCaster.intersectObject(instance, recursive = true)
    if (intersections.nonEmpty) {
      val intersect = intersections(0)
      laser.updateLengthScale(intersect.distance)

      if(intersect.`object` == bgBoard && laser.isGrabbing) {
        holding = true
        laser.controller.grab(instance)
        return true
      }

      // Axis Buttons
      for (i <- XAxis to ZAxis) {
        val target = axisList.elements(i)
        if (intersect.`object` == target.object3D) {
          hitFlag = true
          if (!target.hovering) {
            target.onHover()
            axisToSwap = i
          } else if (laser.isClicking && !target.disabled) {
            // User selects item
            target.onHover()
            target.disabled = true
            for(other <- axisList.elements if other != target) other.disabled = false
          }
        } else if (target.hovering && !target.disabled) target.offHover()
      }
      if (hitFlag) return true

      // Column Variable Buttons
      for (i <- columnVariablesList.elements.indices) {
        val target = columnVariablesList.elements(i)
        if (intersect.`object` == target.object3D) {
          hitFlag = true

          if (!target.hovering) // User just started hovering over an item
            target.onHover()
          else if (laser.isClicking && !target.disabled) // User selected an item
            ModelController.requestAxisChange(axisToSwap, columnIndex = Some(i))

        } else if (target.hovering) target.offHover()
      }

      return hitFlag
    }

    false
  }

}
