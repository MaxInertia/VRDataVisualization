package vrdv.obj3D.displays

/**
  * Created by Dorian Thiessen on 2018-07-31.
  */
case class CSC_Config(margin: Double, fontSize: Int, var scatter: Boolean)

object CSC_DefaultConfig extends CSC_Config(
  margin = 0.02,
  fontSize = 32,
  scatter = true
)