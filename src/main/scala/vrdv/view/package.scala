package vrdv

import facade.IFThree.WebGLRendererExt

/**
  * @author Dorian Thiessen | MaxInertia
  */
package object view {

  /**
    * Extending classes have access to a renderer instance
    * that can be passed as an argument to a given function.
    */
  trait SuppliesRenderer {
    def passRendererTo[T](f: WebGLRendererExt => T): T
  }

}
