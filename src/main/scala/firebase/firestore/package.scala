package firebase

import scala.scalajs.js
import scala.scalajs.js.Promise
import scala.scalajs.js.annotation.JSGlobal
import scala.scalajs.js.typedarray.Uint8Array

/**
  * Created by Dorian Thiessen on 2018-07-29.
  */
package object firestore {

  @js.native
  @JSGlobal("firebase.firestore.FireStore")
  class FireStore extends js.Object {
    val app: App = js.native
    def batch(): WriteBatch = js.native
    def collection(collectionPath: String): CollectionReference = js.native
    def disableNetwork(): Promise[Unit] = js.native
    def enableNetwork(): Promise[Unit] = js.native
    def doc(documentPath: String): DocumentReference = js.native
    def enablePersistence(): Promise[Unit] = js.native
    def runTransaction(updateFunction: Transaction => Unit): Promise[Unit] = js.native

    /**
      * Sets the verbosity of Cloud Firestore logs (debug, error, or silent).
      * @param logLevel The verbosity you set for activity and error logging.
      */
    def setLogLevel(logLevel: String): Unit = js.native

    def settings(settings: Settings): Unit = js.native
  }

  @js.native
  @JSGlobal("firebase.firestore.Blob")
  class Blob extends js.Object {
    def isEqual(other: GeoPoint): Boolean = js.native
    def toBase64(): String = js.native
    def toUint8Array(): Uint8Array = js.native
  }

  @js.native
  @JSGlobal("firebase.firestore.Blob")
  object Blob extends js.Object {
    def fromBase64String(base64: String): Blob = js.native
    def fromUint8Array(array: Uint8Array): Blob = js.native
  }


  @js.native
  @JSGlobal("firebase.firestore.CollectionReference")
  class CollectionReference extends js.Object {
    val firestore: FireStore = js.native
    val id: String = js.native
    val parent: DocumentReference = js.native
    def add(data: js.Object): DocumentReference = js.native
    def get(data: js.Object): DocumentReference = js.native
  }

  @js.native
  @JSGlobal("firebase.firestore.DocumentReference")
  class DocumentReference extends js.Object {}

  /**
    * An immutable object representing a geo point in Cloud Firestore.
    * The geo point is represented as latitude/longitude pair.
    *
    * @param latitude Latitude values are in the range of -90 to 90.
    * @param longitude Longitude values are in the range of -180 to 180.
    */
  @js.native
  @JSGlobal("firebase.firestore.GeoPoint")
  class GeoPoint(latitude: Double, longitude: Double) extends js.Object {
    def isEqual(other: GeoPoint): Boolean = js.native
  }

  @js.native
  @JSGlobal("firebase.firestore.SetOptions")
  class SetOptions extends js.Object {
    var merge: Boolean = js.native
    //var mergeFields:
  }

  @js.native
  @JSGlobal("firebase.firestore.Settings")
  class Settings extends js.Object {
    var timestampsInSnapshots: Boolean = js.native
  }

  @js.native
  @JSGlobal("firebase.firestore.Timestamp")
  class Timestamp(val seconds: Double, val nanoseconds: Double) extends js.Object {
    //def toDate(): Date = js.native
    def toMillis(): Double = js.native
  }

  @js.native
  @JSGlobal("firebase.firestore.Timestamp")
  object Timestamp extends js.Object {
    //def fromDate(date: Date): Timestamp = js.native
    def fromMillis(milliseconds: Double): Timestamp = js.native
    def now(): Timestamp = js.native

  }

  /**
    * A reference to a transaction.
    *
    * The Transaction object passed to a transaction's updateFunction provides the methods
    * to read and write data within the transaction context. See Firestore.runTransaction().
    *
    * https://firebase.google.com/docs/reference/js/firebase.firestore.Transaction?authuser=0
    */
  @js.native
  @JSGlobal("firebase.firestore.Transaction")
  class Transaction extends js.Object {
    def delete(documentRef: DocumentReference): Transaction = js.native
    def get(documentRef: DocumentReference): Transaction = js.native
    def set(documentRef: DocumentReference, data: js.Object, options: SetOptions): Transaction = js.native
    def update(documentRef: DocumentReference, var_args: Any*): Transaction = js.native
  }

  /**
    * A write batch, used to perform multiple writes as a single atomic unit.
    *
    * A WriteBatch object can be acquired by calling the Firestore.batch() function.
    * It provides methods for adding writes to the write batch. None of the writes are
    * committed (or visible locally) until WriteBatch.commit() is called.
    *
    * Unlike transactions, write batches are persisted offline and therefore are preferable
    * when you don't need to condition your writes on read data.
    *
    * https://firebase.google.com/docs/reference/js/firebase.firestore.WriteBatch?authuser=0
    */
  @js.native
  @JSGlobal("firebase.firestore.WriteBatch")
  class WriteBatch extends js.Object {
    def commit(): Unit = js.native
    def delete(documentRef: DocumentReference): WriteBatch = js.native
    def set(documentRef: DocumentReference, data: js.Object, options: SetOptions): WriteBatch = js.native
    def update(documentRef: DocumentReference, var_args: Any*): WriteBatch = js.native
  }




}
