package vrdv

import org.scalajs.threejs.Object3D
import util.Log

import scala.scalajs.js
import scala.scalajs.js.UndefOr

/**
  * Classes in this package (including all sub-packages) will either
  *   1) Extend class T,
  *   2) or contain an instance of type T
  * where T == Object3D or T <: Object3D
  * @author Dorian Thiessen | MaxInertia
  */
package object obj3D {
  def setMoveable(object3D: Object3D, option: Boolean = true): Unit =
    object3D.userData.asInstanceOf[js.Dynamic].moveable = true

  def isMoveable(object3D: Object3D): Boolean = {
    val x = object3D.userData.asInstanceOf[js.Dynamic].moveable
    if(js.isUndefined(x)) false
    else x.asInstanceOf[Boolean]
  }
}
