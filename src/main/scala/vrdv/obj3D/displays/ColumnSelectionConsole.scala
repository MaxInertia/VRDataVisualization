package vrdv.obj3D.displays

import org.scalajs.dom.document
import org.scalajs.threejs._
import util.Log
import vrdv.input.ActionLaser
import vrdv.model.Plotter
import vrdv.obj3D
import vrdv.obj3D.plots.{AxisID, Column, NOAxis, XAxis, YAxis, ZAxis}

/**
  * Created by Dorian Thiessen on 2018-07-31.
  */
class ColumnSelectionConsole(val columnNames: Array[String], val config: CSC_Config) {
  Log.show("CSC Constructor")
  import ColumnSelectionConsole._
  val object3D: Mesh = new Mesh()
  val columnOnAxis: Array[Column] = Array(0, 1, 2)

  val axisButtons: Array[AxisButton] = Array(
    new AxisButton("X", XAxis, config.fontSize, createCanvas(config.fontSize, config.fontSize), 0.08, 0.1),
    new AxisButton("Y", YAxis, config.fontSize, createCanvas(config.fontSize, config.fontSize), 0.08, 0.1),
    new AxisButton("Z", ZAxis, config.fontSize, createCanvas(config.fontSize, config.fontSize), 0.08, 0.1))

  Log.show("createColumnButtons()")
  val columnButtons: Array[Button] = createColumnButtons()
  private def createColumnButtons(): Array[Button] = {
    var inProgressButtons: Array[Button] = Array()
    for(cName <- columnNames) inProgressButtons = inProgressButtons :+ new Button(cName, config.fontSize, createCanvas(400/*1200*/, config.fontSize), 0.6/*1.0*/, 0.1)
    inProgressButtons
  }

  Log.show("positionColumnButtons()")
  ColumnSelectionConsole.positionColumnButtons(this, config.scatter)

  trait Hoverable {
    // Required
    def redraw(tc: String, wc: String): Unit
    def defaultColors: (String, String)
    def hoverColors: (String, String)

    // Provided
    var hoverActive: Boolean = false
    def hoverOn(draw: Boolean = true): Unit = {
      hoverActive = true
      redraw(hoverColors._1, hoverColors._2)
    }
    def hoverOff(draw: Boolean = true): Unit = {
      hoverActive = false
      redraw(defaultColors._1, defaultColors._2)
    }
  }

  trait Selectable {
    // Required
    def redraw(tc: String, wc: String): Unit
    def defaultColors: (String, String)

    // Provided
    var selected: Boolean = false
    val selectionColors: Array[String] = Array("blue", "green", "red")
    def selectOn(selectedAxis: AxisID, column: Int, draw: Boolean = true): Unit = {
      Log.show(s"Column Button $column selected. Axis $selectedAxis changing from ${columnOnAxis(selectedAxis)} -> $column")
      columnButtons(columnOnAxis(selectedAxis)).selectOff()
      selected = true
      columnOnAxis(selectedAxis) = column
      redraw(selectionColors(selectedAxis), "black")
      axisButtons(selectedAxis).object3D.position.setY(
        (columnButtons.length + 1 - column) * (columnButtons(column).height + config.margin)
      ) // TODO: For many data-columns may have to split columnId list into multiple columns, then the x will depend on the data-column changed to as well
    }

    def selectOff(draw: Boolean = true): Unit = {
      selected = false
      redraw(defaultColors._1, defaultColors._2)
    }
  }

  trait Hoverable_And_Selectable extends Selectable with Hoverable {
    override def hoverOn(draw: Boolean = true): Unit = super.hoverOn(draw = !selected)
    override def hoverOff(draw: Boolean = true): Unit = super.hoverOff(draw = !selected)
    //override def selectOn(axis: AxisID, column: Int, draw: Boolean = true): Unit = super.selectOn(axis, column, draw)
    //override def selectOff(draw: Boolean = true): Unit = super.selectOff(draw)
  }

  class Button(label: String, fontSize: Int, canvas: CanvasEl, val width: Double, val height: Double) extends Hoverable_And_Selectable {
    override def defaultColors: (String, String) = ("white", "black")
    override def hoverColors: (String, String) = ("gray", "black")
    def get2DGraphics: Graphics2D = canvas.getContext("2d").asInstanceOf[Graphics2D]
    val object3D: Mesh = {
      val cTexture: Texture = new Texture(canvas)
      cTexture.minFilter = THREE.LinearFilter // Alternative: LinearFilter
      cTexture.magFilter = THREE.NearestFilter
      val material = new MeshBasicMaterial() // MeshPhongMaterial
      material.side = THREE.DoubleSide
      material.map = cTexture
      material.map.needsUpdate = true
      material.transparent = true
      material.opacity = 0.99
      material.alphaTest = 0.1

      new Mesh(new PlaneGeometry(width, height), material)
    }

    def redraw(textColor: String, wallColor: String): Unit = write(label, textColor, wallColor, (0, config.fontSize*3/4))

    /** Writes text to the canvas at position. Can be centered on that position */
    def write(text: String, tc: String, wc: String, position: (Int, Int), center: Boolean = false): Unit = {
      val graphics = get2DGraphics
      //graphics.fillStyle = wc
      //graphics.fillRect(0, 0, canvas.width, canvas.height)
      graphics.clearRect(0, 0, canvas.width, canvas.height)
      graphics.font = s"${fontSize}px  Lucida Console"
      graphics.fillStyle = tc
      if(!center) graphics.fillText(text, position._1, position._2)
      else graphics.fillText(text, (position._1 - graphics.measureText(text).width)/2, position._2)
      object3D.material.asInstanceOf[MeshBasicMaterial].map.needsUpdate = true
    }
  }

  var selectedAxes: Set[AxisID] = Set()
  class AxisButton(axis: String, myAxis: AxisID, fontSize: Int, canvas: CanvasEl, width: Double, height: Double) extends Button(axis, fontSize, canvas, width, height) {
    override def defaultColors: (String, String) = axis match {
      case "X" => ("blue", "black")
      case "Y" => ("green", "black")
      case "Z" => ("red", "black")
    }

    override def hoverColors: (String, String) = axis match {
      case "X" => ("lightblue", "black")
      case "Y" => ("lightgreen", "black")
      case "Z" => ("pink", "black")
    }

    override def selectOn(selectedAxis: AxisID = NOAxis, column: Int = -42, draw: Boolean): Unit = {
      selected = true
      selectedAxes += myAxis
      redraw("white"/*selectionColors(selectedAxis)*/, "black")
    }
  }

  /**
    * Used to create a new html Canvas for use in a texture.
    * @param width Width in CSS-Pixels
    * @param height Height in CSS-Pixels
    * @return Canvas
    */
  protected def createCanvas(width: Int, height: Int): CanvasEl = {
    Log.show(s"createCanvas($width, $height)")
    val canvas = document.createElement(s"canvas").asInstanceOf[CanvasEl]
    canvas.id = s"canvas-$num"; num = num + 1
    canvas.width = width
    canvas.height = height
    //Display.numCreated += 1
    canvas
  }

  var num: Int = 0
  var intersectionsLastTime: Boolean = false

  // Overly complicated, could be more efficient, but the results look awesome!
  // Note: One controller can enter a terminal state wrt this interaction (it can no longer
  // be used to change axes) selects if each controller selects a column within the same frame.
  def interactionCheck(laser: ActionLaser, plotter: Plotter, userSelecting: Boolean): Boolean = {
    val intersections: scalajs.js.Array[Intersection] = laser.rayCaster.intersectObject(object3D, recursive = true)
    if(intersections.isEmpty) {
      if(intersectionsLastTime) {
        for(btn <- axisButtons if !btn.selected) btn.hoverOff()
        for(btn <- columnButtons if !btn.selected) btn.hoverOff()
        intersectionsLastTime = false
      }
      return false
    }

    intersectionsLastTime = true
    //Log.show("Intersections not null!")
    val intersected = intersections(0).`object`

    var interacted = false

    val axis = laser.loadedAxis
    val axisIsLoaded = axis != NOAxis

    for(b <- axisButtons.indices) {
      val btn = axisButtons(b)
      if(btn.object3D == intersected) {

        val selectable = !btn.selected && !axisIsLoaded
        if(selectable) {
          interacted = true
          laser.updateLengthScale(intersections(0).distance)

          if(userSelecting) {
            btn.selectOn()
            selectedAxes += laser.loadAxis(b, AxesColors(b))
          } else if(!btn.hoverActive) btn.hoverOn(!selectable)
        }
      }
    }

    if(selectedAxes.isEmpty) return interacted

    for(b <- columnButtons.indices) {
      val btn = columnButtons(b)
      if(!interacted && btn.object3D == intersected) {

        val selectable = !btn.selected && selectedAxes.nonEmpty && axisIsLoaded
        if(selectable) {
          interacted = true
          laser.updateLengthScale(intersections(0).distance)

          if(userSelecting) {
            btn.selectOn(axis, b)
            axisButtons(axis).selectOff()
            plotter.requestAxisChange(0, axis, b)
            selectedAxes -= laser.unloadAxis()
          } else if(!btn.hoverActive) btn.hoverOn(!selectable)
        }
      }
    }

    interacted
  } // end of interactionCheck()

}

object ColumnSelectionConsole {
  val AxesColors: Array[String] = Array("blue", "green", "red")
  private var instance: Option[ColumnSelectionConsole] = None
  def getInstance: Option[ColumnSelectionConsole] = instance
  def setInstance(csc: ColumnSelectionConsole): Unit = {
    csc.object3D.geometry.computeBoundingBox()
    csc.object3D.geometry.computeFaceNormals()
    obj3D.setMoveable(csc.object3D)
    instance = Some(csc)
  }

  //def apply(): ColumnSelectionConsole

  def positionColumnButtons(csc: ColumnSelectionConsole, scatter: Boolean): Unit = {
    val columnButtons = csc.columnButtons
    val axisButtons = csc.axisButtons
    val object3D = csc.object3D
    val config = csc.config
    val xShift = columnButtons(0).width/2 + 2*csc.config.margin

    for(i <- axisButtons.indices) {
      val color: (String, String) = axisButtons(i).defaultColors
      val btn = axisButtons(i).object3D
      object3D.add(btn)
      axisButtons(i).redraw(color._1, color._2)
      btn.position.setX(-xShift)
      btn.position.setY((columnButtons.length + 1 - i) * (columnButtons(i).height + config.margin))
    }

    for(i <- columnButtons.indices) {
      columnButtons(i).redraw("white", "black")
      object3D.add(columnButtons(i).object3D)
      columnButtons(i).object3D.position.setY((columnButtons.length + 1 - i) * (columnButtons(i).height + config.margin))
    }

    columnButtons(2).selectOn(ZAxis, 2)
    columnButtons(1).selectOn(YAxis, 1)
    columnButtons(0).selectOn(XAxis, 0)
    Log.show("positionColumnButtons() complete")
  }
}