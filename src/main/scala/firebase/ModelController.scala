package firebase

/**
  * Created by Dorian Thiessen on 2018-07-29.
  */
case class ModelController(config: Config) {
  val app: App = Firebase.initializeApp(config)
}

