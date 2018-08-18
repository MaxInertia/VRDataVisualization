package vrdv.obj3D

import org.scalajs.dom.{CanvasRenderingContext2D, document, html}
import org.scalajs.threejs.Object3D
import vrdv.obj3D.displays.Display

/**
  * Created by Dorian Thiessen on 2018-05-08.
  */
package object displays {
  type CanvasEl = html.Canvas
  type Graphics2D = CanvasRenderingContext2D
  type UpdateFunction = Display => Unit
}
