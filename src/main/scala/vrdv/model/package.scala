package vrdv

import facade.IFThree.{GridHelperExt, Group, VRController, VRControllerManager}
import org.scalajs.threejs._
import util.Log
import vrdv.input.VRControllerM

/**
  * @author Dorian Thiessen | MaxInertia
  */
package object model {

  trait RenderRequirements {
    def getRenderables: (Scene, PerspectiveCamera)
    def afterRender(): Unit
  }

  trait UpdateWithInputs[Action, Result] {
    def passInput(action: Action): Result
  }

  /**
    * Model Manager
    * @author Dorian Thiessen | MaxInertia
    */
  trait ModelManager[Action, Result] extends UpdateWithInputs[Action, Result] with RenderRequirements {
    protected val model: Model
    def getRenderables: (Scene, PerspectiveCamera) = (model.scene, model.camera)

    def addController(vrc: VRController): Unit = {
      model.fakeOrigin.add(vrc)
      model.controllers = model.controllers :+ vrc
    }

    def afterRender(): Unit = {
      VRControllerManager.update()
      for(c <- model.controllers) c.update()
    }

    /**
      * A container for pretty much everything.
      */
    trait Model {
      Log.show("[Model - Constructor]")
      var components: Array[ModelComponent[Action]] = Array()
      val scene: Scene = new Scene()
      val camera: PerspectiveCamera = new PerspectiveCamera()
      camera.fov = 45
      scene.add(camera)

      var controllers: Array[VRController] = Array()
      // # This will be the parent of the controllers it fixes the controllers-in-floor issue.
      val fakeOrigin: Group = new Group
      fakeOrigin.position.set(0, 1.6, 0)
      scene.add(fakeOrigin)

      Log.show("[Model - End]")
    }
  }

  trait ModelComponent[Action] {
    def passEvent(input: Action): Unit
  }

  /*trait ModelTransformer[ModelA <: Model, ModelB <: Model] {
    def forward(a: ModelA): ModelB
    def reverse(b: ModelB): ModelA
  }*/

  //class FirebaseModel

  //abstract class ConnectDisconnect() extends ModelTransformer[LocalModel, FirebaseModel]{}
  // or also test modifications to a model by transforming a running model into it?

  trait Room {

    def addRoom(scene: Scene): Unit = {

      // # Create room
      val black: Color = new Color(0x000000)//ColorKeywords.black)
      val white: Color = new Color(0xffffff)//ColorKeywords.white)
      val floorMaterial: MeshLambertMaterial = new MeshLambertMaterial()
      floorMaterial.color = white
      val floorGeometry: PlaneGeometry = new PlaneGeometry( 1, 1 )
      val floor: Mesh = new Mesh(floorGeometry, floorMaterial)
      floor.receiveShadow = false
      floor.rotateX(-3.1415/2)

      // Add 6x6m Grid broken into 36 sections
      val floorGrid: GridHelper = new GridHelperExt(1, 2, black, black)
      floorGrid.position.setY(0.001)
      floorGrid.material.linewidth = 2.0
      scene.add(floorGrid)
      scene.add(floor)

      // Add Light
      val spotlight: SpotLight = new SpotLight(0xffffff, 0.5)
      spotlight.distance = 10
      spotlight.castShadow = true
      spotlight.position.set(0, 3, 0)
      scene.add(spotlight)
    }

  }

}
