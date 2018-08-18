package firebase

import scala.scalajs.js
import scala.scalajs.js.annotation.JSGlobal

/*
<script src="https://www.gstatic.com/firebasejs/5.3.0/firebase.js"></script>
<script>
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCe0ZWJmkPqYRYJNBRa8MmP2QmCWxN-vEM",
    authDomain: "vrdv-if.firebaseapp.com",
    databaseURL: "https://vrdv-if.firebaseio.com",
    projectId: "vrdv-if",
    storageBucket: "",
    messagingSenderId: "285009854039"
  };
  firebase.initializeApp(config);
</script>
 */

/**
  * Created by Dorian Thiessen on 2018-07-29.
  */
case class ModelController(config: Config) {
  val app: App = Firebase.initializeApp(config)
}

