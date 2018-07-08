package viewable.input

import facades.IFThree.Object3DR93
import org.scalajs.threejs._
import userinput.OculusControllers
import util.Log

import scala.scalajs.js

/**
  * Created by Dorian Thiessen on 2018-07-07.
  */
case class ActionPanel private(object3D: Mesh) {
  private var hover: Boolean = false
  private var active: Boolean = false

  def setHoverOn(): Unit = {
    hover = true
    object3D.scale.set(1.1, 1.1, 1.1)
    object3D.material.opacity = 0.8
    //obj.material.asInstanceOf[MeshBasicMaterial].color.setHex(Colors.Hex.WHITE)
  }

  def setHoverOff(): Unit = {
    hover = false
    object3D.scale.set(1.0, 1.0, 1.0)
    object3D.material.opacity = 0.4
    //obj.material.asInstanceOf[MeshBasicMaterial].color.setHex(Colors.Hex.WHITE)
  }

  def hoverActive(): Boolean = hover
}

object ActionPanel {
  def apply(size: Vector2, position: Vector3, color: Double): ActionPanel = {
    val object3D: Mesh = {
      val material = new MeshBasicMaterial()
      material.color.setHex(color)
      material.side = THREE.DoubleSide
      material.transparent = true
      material.opacity = 0.4
      val geo = new PlaneGeometry(size.x, size.y)
      val mesh = new Mesh(geo, material)
      //mesh.asInstanceOf[Object3DR93].onBeforeRender(beforeRender)
      mesh.position.set(position.x, position.y, position.z)
      Log.show("Mesh initialized")
      mesh
    }
    new ActionPanel(object3D)
  }
}