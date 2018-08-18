package firebase

import scala.scalajs.js
import scala.scalajs.js.Promise
import scala.scalajs.js.annotation.JSGlobal

/**
  * Created by Dorian Thiessen on 2018-07-29.
  */
package object auth {

  val ArgumentError: Code = "auth/argument-error"
  val AuthDomainConfigRequired: Code = "auth/auth-domain-config-required"
  val CredentialAlreadyInUse: Code = "auth/credential-already-in-use"
  val EmailAlreadyInUse: Code = "auth/email-already-in-use"
  val ExpiredActionCode: Code = "auth/expired-action-code"
  val InvalidActionCode: Code = "auth/invalid-action-code"
  val InvalidContinueUri: Code = "auth/invalid-continue-uri"
  val InvalidEmail: Code = "auth/invalid-email"
  val InvalidPersistenceType: Code = "auth/invalid-persistence-type"
  val InvalidVerificationCode: Code = "auth/invalid-verification-code"
  val InvalidVerificationId: Code = "auth/invalid-verification-id"
  val MissingContinueUri: Code = "auth/missing-continue-uri"
  val OperationNotAllowed: Code = "auth/operation-not-allowed"
  val OperationNotSupportedInThisEnvironment: Code = "auth/operation-not-supported-in-this-environment"
  val RequiresRecentLogin: String = "auth/requires-recent-login"
  val Timeout: Code = "auth/timeout"
  val UserDisabled: Code = "auth/user-disabled"
  val UserNotFound: Code = "auth/user-not-found"
  val UnauthorizedContinueUri: Code = "auth/unauthorized-continue-uri"
  val UnsupportedPersistenceType: Code = "auth/unsupported-persistence-type"
  val WeakPassword: Code = "auth/weak-password"
  val WrongPassword: Code = "auth/wrong-password"

  @js.native //https://firebase.google.com/docs/reference/js/firebase.auth?authuser=0
  @JSGlobal("firebase.auth.Auth")
  class Auth extends js.Object {
    val app: App = js.native
    val currentUser: User = js.native
    val languageCode: String = js.native
    val settings: AuthSettings = js.native

    /**
      * Applies a verification code sent to the user by email or other out-of-band mechanism.
      * @param code A verification code sent to the user.
      * @return non-null firebase.Promise containing void
      */
    def applyActionCode(code: String): Promise[Unit] = js.native // Promise contains void

    /*
      * Checks a verification code sent to the user by email or other out-of-band mechanism.
      * @param code A verification code sent to the user.
      * @return non-null firebase.Promise containing non-null firebase.auth.ActionCodeInfo
      */
    //def checkActionCode(code: String): Promise[ActionCodeInfo] = js.native // Promise contains firebase.auth.ActionCodeInfo

    /**
      * Completes the password reset process, given a confirmation code and new password.
      * @return non-null firebase.Promise containing void
      */
    def confirmPasswordReset(code: String, newPassword: String): Promise[Unit] = js.native

    /**
      * Creates a new user account associated with the specified email address and password.
      *
      * On successful creation of the user account, this user will also be signed in to your application.
      * User account creation can fail if the account already exists or the password is invalid.
      *
      * Note: The email address acts as a unique identifier for the user and enables an email-based password reset.
      * This function will create a new user account and set the initial user password.
      *
      * @param email The user's email address
      * @param password The user's chosen password
      * @return non-null firebase.Promise containing non-null firebase.auth.UserCredential
      */
    def createUserWithEmailAndPassword(email: String, password: String): Promise[UserCredential] = js.native

    /**
      * Authenticates a Firebase client using a popup-based OAuth authentication flow.
      *
      * If succeeds, returns the signed in user along with the provider's credential.
      * If sign in was unsuccessful, returns an error object containing additional information about the error.
      *
      * @param provider The provider to authenticate. The provider has to be an OAuth provider.
      *                 Non-OAuth providers like firebase.auth.EmailAuthProvider will throw an error.
      *                 Value must not be null.
      * @return
      */
    def signInWithPopup(provider: AuthProvider): Promise[UserCredential] = js.native
  }


  @js.native
  @JSGlobal("firebase.auth.Auth")
  class AdditionalUserInfo extends js.Object {
    val providerId: String = js.native
    val profile: js.Object = js.native
    val username: String = js.native
    val isNewUser: Boolean = js.native
  }

  @js.native
  @JSGlobal("firebase.auth.Auth")
  class AuthCredential extends js.Object {
    val providerId: String = js.native
    val accessToken: String = js.native
    val signInMethod: String = js.native
  }

  @js.native
  trait AuthProvider extends js.Object {
    def addScope(scope: String): Unit = js.native
  }

  @js.native // https://firebase.google.com/docs/reference/js/firebase.auth.AuthSettings?authuser=0
  @JSGlobal("firebase.auth.AuthSettings")
  class AuthSettings extends js.Object {}

  @js.native
  @JSGlobal("firebase.auth.GoogleAuthProvider")
  class GoogleAuthProvider extends AuthProvider {}

  @js.native
  @JSGlobal("firebase.auth.Auth")
  class User extends js.Object {
    val displayName: String = js.native
    val email: String = js.native
    val emailVerified: Boolean = js.native
    val isAnonymous: Boolean = js.native
    //val metadata: UserMetaData
    val phoneNumber: String = js.native
    val photoURL: String = js.native
    //val providerData: Array[UserInfo]
    val providerID: String = js.native
    val refreshToken: String = js.native
    val uid: String = js.native

    /**
      * Deletes and signs out the user.
      *
      * Important: this is a security sensitive operation that requires the user to have recently
      * signed in. If this requirement isn't met, ask the user to authenticate again and then call
      * firebase.User#reauthenticateWithCredential.
      *
      * @return non-null firebase.Promise containing void
      */
    def delete(): Promise[Unit] = js.native

    /**
      * Returns a JWT token used to identify the user to a Firebase service.
      *
      * Returns the current token if it has not expired, otherwise this will refresh the token and return a new one.
      *
      * @param foreceRefresh Force refresh regardless of token expiration.
      * @return non-null firebase.Promise containing string
      */
    def getIdToken(foreceRefresh: Boolean): Promise[String] = js.native

    //def getIdTokenResult(forceRefresh: Boolean): Promise[IdTokenResult] = js.native


  }

  @js.native
  @JSGlobal("firebase.auth.Auth")
  class UserCredential extends js.Object {
    val user: User = js.native
    val credential: AuthCredential = js.native
    val operationType: String = js.native
    val additionalUserInfo: AdditionalUserInfo = js.native
  }

}
