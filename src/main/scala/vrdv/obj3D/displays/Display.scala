package vrdv.obj3D.displays

import org.scalajs.dom.document
import org.scalajs.threejs.{Mesh, MeshBasicMaterial}

/**
  * Created by Dorian Thiessen on 2018-05-09.
  */
trait Display {

  val object3D: Mesh
  var textSize: Int = 48

  private var updateFunction: UpdateFunction = _
  def setUpdateFunction(fn: UpdateFunction): Unit = updateFunction = fn
  def clearUpdateFunction(): Unit = updateFunction = _ => ()
  def update(): Unit = {
    updateFunction(this)
    object3D.material.asInstanceOf[MeshBasicMaterial].map.needsUpdate = true
  }

  protected def get2DGraphics: Graphics2D

  /** Writes text to the canvas at position. Can be centered on that position */
  def write(text: String, position: (Int, Int), center: Boolean = true, fontSizeInPixels: Int = 48): Unit = {
    textSize = fontSizeInPixels
    val graphics = get2DGraphics
    graphics.font = s"${fontSizeInPixels}px serif"
    graphics.fillStyle = "white"
    if(!center) graphics.fillText(text, position._1, position._2)
    else graphics.fillText(text, (position._1 - graphics.measureText(text).width)/2, position._2)
  }

  def clear(): Unit = {
    val graphics = get2DGraphics
    graphics.clearRect(0, 0, graphics.canvas.width, graphics.canvas.height)
  }

  /**
    * Used to create a new html Canvas for use in a texture.
    * @param width Width in CSS-Pixels
    * @param height Height in CSS-Pixels
    * @return Canvas
    */
  protected def createCanvas(width: Int, height: Int): CanvasEl = {
    val canvas = document.createElement(s"canvas").asInstanceOf[CanvasEl]
    canvas.id = s"canvas-${Display.numCreated}"
    canvas.width = width
    canvas.height = height
    Display.numCreated += 1
    canvas
  }
}

object Display {
  /** The number of canvases that have been created */
  private var numCreated: Int = 0
}
