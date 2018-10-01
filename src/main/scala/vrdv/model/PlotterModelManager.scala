package vrdv.model

import facade.IFThree.SceneUtils2
import org.scalajs.threejs._
import util.Log
import vrdv.input.{Action, Result, mouse}
import vrdv.{input, obj3D}

/**
  * Created by Dorian Thiessen on 2018-07-28.
  */
class PlotterModelManager extends ModelManager[Action, Result] with Room  {
  Log.show("[PlotterModelManager - Constructor]")
  override protected val model: Model = new Model {}
  model.components = model.components :+ new Plotter(model.scene, model.camera)
  addRoom(model.scene)

  def plotter: Plotter = model.components(0).asInstanceOf[Plotter]

  /*var persistingInputs: List[input.Action] = List()
  def peel(inputs: List[input.Action]): Unit = {
    passInput(inputs.head)
    peel(inputs.tail)
  }*/

  val lastPoint: Array[input.Point] = Array(
    new input.Point(null, 0) { persist = false },
    new input.Point(null, 1) { persist = false })
  var lastPress: Array[input.Press] = Array(
    new input.Press(null, 0) { persist = false },
    new input.Press(null, 1) { persist = false })

  // add parser of request types (one example being AxisChangeRequest below)
  override def passInput(action: input.Action): input.Result = action match {
    case g: input.Grab => // ==============
      val ray = g.rc.updateRaycaster(g.source).rayCaster.ray
      val controllerPos = g.sourcePosition

      val sceneContents = model.scene.children
      for(c <- sceneContents if obj3D.isMoveable(c)) {
        val closeToControllerModel = c.position.distanceTo(controllerPos) < 0.25
        if(closeToControllerModel && c.parent == model.scene) { // In this case, that object can be grabbed
            SceneUtils2.attach(c, model.scene, g.source)
            return new input.Result {override val object3D: Object3D = c}
        }
      }

      for(c <- sceneContents if obj3D.isMoveable(c)) {
        val closestDistance = ray.closestPointToPoint(c.position).distanceTo(c.position)
        if(closestDistance < 0.25 && c.parent == model.scene) { // In this case, that object can be grabbed
          SceneUtils2.attach(c, model.scene, g.source)
          return new input.Result {override val object3D: Object3D = c}
        }
      }

      input.NothingHappened

    case r: input.Drop => // ==============
      val dropped = r.target
      if(r.target.parent == r.source) {
        SceneUtils2.detach(dropped, r.source, model.scene)
        new input.Result{override val object3D: Object3D = dropped}
      } else input.NothingHappened

    case p: input.Point => // ==============
      lastPoint(p.cid) = p
      lastPress(p.cid).persist = false
      if(p.persist) {
        if(p.source.nonEmpty) plotter.hoverAction(p.rc.updateRaycaster(p.source.get), select = false)
        else {
          val (_, camera) = getRenderables
          plotter.hoverAction(mouse.Instance.getUpdatedRaycaster(camera), select = false)
        }
      }
      afterRender()
      input.NothingHappened

    case p: input.Press => // ==============
      lastPress(p.cid) = p
      if(p.source.nonEmpty) plotter.hoverAction(p.rc.updateRaycaster(p.source.get), select = true)
      else {
        val (_, camera) = getRenderables
        plotter.hoverAction(mouse.Instance.getUpdatedRaycaster(camera), select = true)
      }
      afterRender()
      input.NothingHappened

    case c: input.Connect => // ==============
      addController(c.vrc)
      input.NothingHappened

    case _ =>
      Log.show(s"Unknown input entered: $action")
      input.NothingHappened
  }

  def addDatInput(obj: Object3D): Unit = model.scene.add(obj)

  override def afterRender(): Unit = {
    super.afterRender()
    plotter.update()
    for(cid <- 0 to 1) {
      if(lastPress(cid).persist) {
        if(lastPoint(cid).source.nonEmpty)
          plotter.hoverAction(lastPoint(cid).rc.updateRaycaster(lastPoint(cid).source.get), select = true)
        else {
          val (_, camera) = getRenderables
          plotter.hoverAction(mouse.Instance.getUpdatedRaycaster(camera), select = true)
        }
      }
      else if(lastPoint(cid).persist && lastPoint(cid).source.nonEmpty)
        if(lastPoint(cid).source.nonEmpty)
          plotter.hoverAction(lastPoint(cid).rc.updateRaycaster(lastPoint(cid).source.get), select = false)
        else {
          val (_, camera) = getRenderables
          plotter.hoverAction(mouse.Instance.getUpdatedRaycaster(camera), select = false)
        }
    }
  }

  Log.show("[PlotterModelManager - End]")
}
