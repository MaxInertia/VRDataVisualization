package data

import utest._

/**
  * Created by Dorian Thiessen on 2018-02-05.
  */
object PreProcessor_Tests extends TestSuite {
  val tests = Tests {
    // Tests for the method 'isNumber'
    'isNumberRegex - {
      'validCases - {
        'no_Decimal - {
          assert(PreProcessor.isNumber("1"))
          assert(PreProcessor.isNumber("-1"))
          assert(PreProcessor.isNumber("+1"))
          assert(PreProcessor.isNumber("123"))
          assert(PreProcessor.isNumber("-123"))
          assert(PreProcessor.isNumber("+123"))
        }

        'decimal_Of_Zero - {
          assert(PreProcessor.isNumber("1.0"))
          assert(PreProcessor.isNumber("-1.0"))
          assert(PreProcessor.isNumber("+1.0"))
        }

        'decimals - {
          assert(PreProcessor.isNumber("12345.6789"))
          assert(PreProcessor.isNumber("-12345.6789"))
          assert(PreProcessor.isNumber("+12345.6789"))
        }

        'decimal_With_No_Ones_Place - {
          assert(PreProcessor.isNumber(".6789"))
          assert(PreProcessor.isNumber("-.6789"))
          assert(PreProcessor.isNumber("+.6789"))
        }

        'integers_With_Decimal_Point - {
          assert(PreProcessor.isNumber("12345."))
          assert(PreProcessor.isNumber("-12345."))
          assert(PreProcessor.isNumber("+12345."))
        }
      }

      'invalidCases {
        'empty_String {
          assert(!PreProcessor.isNumber(""))
        }

        'sign_With_No_Digits {
          assert(!PreProcessor.isNumber("+"))
          assert(!PreProcessor.isNumber("-"))
        }

        'many_Decimal_Points {
          assert(!PreProcessor.isNumber("1.."))
          assert(!PreProcessor.isNumber("-1.."))
          assert(!PreProcessor.isNumber("+1.."))
          assert(!PreProcessor.isNumber("1.0.1"))
          assert(!PreProcessor.isNumber("-1.0.1"))
          assert(!PreProcessor.isNumber("+1.0.1"))
          assert(!PreProcessor.isNumber("12345.67.89.4"))
          assert(!PreProcessor.isNumber("-12345.67.89.4"))
          assert(!PreProcessor.isNumber("+12345.67.89.4"))
        }

        'no_Digits {
          assert(!PreProcessor.isNumber("A"))
          assert(!PreProcessor.isNumber("alpha"))
          assert(!PreProcessor.isNumber("#"))
        }

        'numbers_With_Characters {
          assert(!PreProcessor.isNumber("1a"))
          assert(!PreProcessor.isNumber("-1a"))
          assert(!PreProcessor.isNumber("+1a"))
          assert(!PreProcessor.isNumber("1.0a"))
          assert(!PreProcessor.isNumber("-1.0a"))
          assert(!PreProcessor.isNumber("+1.0a"))
          assert(!PreProcessor.isNumber("12345.6789a"))
          assert(!PreProcessor.isNumber("-12345.6789a"))
          assert(!PreProcessor.isNumber("+12345.6789a"))
          assert(!PreProcessor.isNumber("a1"))
          assert(!PreProcessor.isNumber("a-1"))
          assert(!PreProcessor.isNumber("a+1"))
          assert(!PreProcessor.isNumber("a1.0"))
          assert(!PreProcessor.isNumber("a-1.0"))
          assert(!PreProcessor.isNumber("a+1.0"))
          assert(!PreProcessor.isNumber("a12345.6789"))
          assert(!PreProcessor.isNumber("a-12345.6789"))
          assert(!PreProcessor.isNumber("a+12345.6789"))
        }
      }
    }
  }

}
