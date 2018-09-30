package vrdv

import facade.IFThree.VRController
import org.scalajs.threejs.{Object3D, Vector3}

/**
  * Created by Dorian Thiessen on 2018-07-28.
  */
package object input {

  // Am I going overboard with traits?
  trait Device {}

  // Input Actions

  trait Action {}

  case class Point(source: Option[Object3D], cid: Int) extends Action {
    //var source: Object3D = _
    var rc: InputDetails = _
    var persist: Boolean = false
    var magnitude: Double = 0.5
  }

  case class Press(source: Option[Object3D], cid: Int) extends Action {
    //var source: Object3D = _
    var rc: InputDetails = _
    var persist: Boolean = false
    var magnitude: Double = 0.99
  }

  case class Grab() extends Action {
    var source: Object3D = _
    var rc: InputDetails = _
    var sourcePosition: Vector3 = _
  }

  case class Drop() extends Action {
    var source: Object3D = _
    var rc: InputDetails = _
    var target: Object3D = _
  }

  case class Connect() extends Action {
    var vrc: VRController = _
  }

  // Input Results

  trait Result {
    val object3D: Object3D
  }

  object NothingHappened extends Result {
    override val object3D: Object3D = null
  }
}
