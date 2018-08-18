import scala.scalajs.js
import scala.scalajs.js.Promise
import scala.scalajs.js.annotation.JSGlobal

/**
  * Firebase WebAPI Reference: https://firebase.google.com/docs/reference/js/index-all?authuser=0
  *
  * Created by Dorian Thiessen on 2018-07-29.
  */
package object firebase {
  import auth._
  import firestore._

  type Code = String

  @js.native
  @JSGlobal("firebase")
  object Firebase extends js.Object {

    /* Initialize and return a FirebaseApp */
    def initializeApp(config: Config): App = js.native

    /* Return a named FirebaseApp */
    def app(name: String): App = js.native

    /* Return the default FirebaseApp */
    def app(): App = js.native

    /* Get the Auth service for the default app */
    def auth(): Auth = js.native
  }

  @js.native
  trait App extends js.Object {
    //def storage(): Storage = js.native
    //def database(): Database = js.native
    def firestore(): FireStore = js.native
    def auth(): Auth = js.native
  }

  @js.native
  trait Config extends js.Object {
    var apiKey: String = js.native
    var authDomain: String = js.native
    var databaseURL: String = js.native
    var projectId: String = js.native
    var storageBucket: String = js.native
    var messagingSenderId: String = js.native
  }
}
