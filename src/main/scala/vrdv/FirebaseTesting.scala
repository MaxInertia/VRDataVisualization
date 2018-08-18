package vrdv

import util.Log

import scala.scalajs.js
import scala.util.{Failure, Success}

/**
  * Created by Dorian Thiessen on 2018-07-29.
  */
object FirebaseTesting {
  import firebase._
  import firestore._
  import auth._

  def start(): Unit = {


    val config: Config = new js.Object {
      val apiKey: String = "AIzaSyCe0ZWJmkPqYRYJNBRa8MmP2QmCWxN-vEM"
      val authDomain: String = "vrdv-if.firebaseapp.com"
      val databaseURL: String = "https://vrdv-if.firebaseio.com"
      val projectId: String = "vrdv-if"
      val storageBucket: String = ""
      val messagingSenderId: String = "285009854039"
    }.asInstanceOf[Config]

    Log.show("\nconfig"); Log.show(config)

    val app: App = Firebase.initializeApp(config)
    Log.show("\napp"); Log.show(app)

    /*val database: FireStore = app.firestore()
    Log.show("\ndatabase"); Log.show(database)

    val users = database.collection("users")
    Log.show("\nusers")
    Log.show(users)

    users.add(new js.Object {
      val name: String = "Ichigo"
      val rank: String = "Captain"
    })*/

    val auth = app.auth()
    Log.show("auth"); Log.show(auth)

    val provider: GoogleAuthProvider = new GoogleAuthProvider()
    provider.addScope("profile")
    provider.addScope("email")

    import scala.concurrent.ExecutionContext.Implicits.global
    auth.signInWithPopup(provider).toFuture andThen {
      case Success(result) =>
        val token = result.credential.accessToken
        Log.show("Received an access token!")
        Log.show(token)
      case Failure(err) =>
        Log.show("Sign in appears to have failed!")
    }

  }
}
