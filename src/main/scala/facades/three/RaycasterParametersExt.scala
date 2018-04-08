package facades.three

import org.scalajs.{threejs => THREE}

import scala.scalajs.js

/**
  * Created by Dorian Thiessen on 2018-02-10.
  */
@js.native
trait RaycasterParametersExt extends THREE.RaycasterParameters {
  var Points: RPE = js.native
}

@js.native
trait RPE extends js.Object {
  var threshold: Double = js.native
}
