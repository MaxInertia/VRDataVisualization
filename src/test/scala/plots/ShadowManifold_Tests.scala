package plots

import utest._

/**
  * Created by Dorian Thiessen on 2018-02-08.
  */
object ShadowManifold_Tests extends TestSuite {
  val tests = Tests {

    'converting_TS_Values_To_SM_Points { // Tests for method 'lagzip3'

      'not_lazy {
        val run: Int => Unit = c(notLazy)
        'Ten - run(10)
        'One_Hundred - run(100)
        'One_Thousand - run(1000)
        'Ten_Thousand - run(10000)
        'One_Hundred_Thousand - run(100000)
      }

      'using_lazy {
        val run: Int => Unit = c(useLazy)
        'Ten - run(10)
        'One_Hundred - run(100)
        'One_Thousand - run(1000)
        'Ten_Thousand - run(10000)
        'One_Hundred_Thousand - run(100000)
      }

      /**
        * @param nums Array of numbers used to create the shadow manifold coordinates
        *             nums = [v0, v1, v2, v3, ..., vm, vn, vo, vp]
        * @param coords The coordinates of points in a shadow manifold constructed from nums
        *               coords = [(v2, v1, v0),
        *                         (v3, v2, v1),
        *                             ...     ,
        *                         (vm, vn, vo),
        *                         (vn, vo, vp)]
        */
      def verifyCoordinates(nums: Array[Double], coords: Seq[Coordinate]): Unit = {
        val l = nums.length - 3
        // The coord at index i should have...
        for (i <- 0 until l)
          assert(coords(i).z == nums(i)) // z = nums(i)
        for (i <- 0 until l)
          assert(coords(i).y == nums(i + 1)) // y = nums(i+1)
        for (i <- 0 until l)
          assert(coords(i).x == nums(i + 2)) // x = nums(i+2)
      }

      def c(fn: Int => Unit)(n: Int): Unit = fn(n)

      def notLazy(n: Int): Unit = {
        val nums = (1d until n.toDouble by 1d).toArray
        val coords = ShadowManifold.lagZip3(nums)
        verifyCoordinates(nums, coords)
      }

      def useLazy(n: Int): Unit = {
        lazy val nums = (1d until n.toDouble by 1d).toArray
        val coords = ShadowManifold.lagZip3(nums)
        verifyCoordinates(nums, coords)
      }

    } // end of 'lagzip3' tests
  }
}




