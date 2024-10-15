---
title: Builtin Functions
---


### General-purpose functions

The following functions can be meaningfully used on data of arbitrary types:
- `DATATYPE` returns the datatype of the value. For IRIs (and constant), the type is reported as `http://www.w3.org/2001/XMLSchema#anyURI`. For language-tagged strings, the type is `http://www.w3.org/1999/02/22-rdf-syntax-ns#langString`. As of Nemo v0.5.0, named nulls (blank nodes) have no defined type and `DATATYPE` does not return a valid result for such value. Moreover, the datatype is currently returned as a string, but will be an IRI in future versions ([#463](https://github.com/knowsys/nemo/issues/463)).
- `STR` returns the value as a string. For IRIs, this is the IRI string itself. For all other datatypes, this is the canonical form of the lexical value (without any datatype).
- `fullStr` returns the value as a string that is formatted as in RDF. Such stings would also be correct ways of writing the value in a Nemo rules file (though there might be shorter ways due to Nemo's abbreviations).

Further, it is possible to compare any values using `=` or `!=`.

### Functions for strings

Nemo supports the following functions on strings.
- `STRLEN`: computes the (integer) length of a string
- `UCASE` and `LCASE`: convert a string to upper case and lower case, respectively
- `CONCAT`: creates a new string by concatenating the input strings
- `SUBSTR`: this function requires the following parameters: a string and an integer index. The function returns the substring
that starts at the given index and extends to the end of the string. Optionally, the length of the substring can be supplied via a third parameter.
- `STRAFTER`: takes two string parameters A and B, and returns the substring of A that follows the first occurrence of B in A. For example, `STRAFTER("3.14",".")` is `"14"`.
- `STRBEFORE`: takes two string parameters A and B, and returns the substring of A that ends before the first occurrence of B in A. For example, `STRBEFORE("3.14",".")` is `"3"`.
- `STRREV`: returns the input string with its characters in reverse order.
- `COMPARE`: compares two strings alphabetically. The result is `-1` if the first string is alphabetically before the second, `1` if it is after, and `0` if they are equal.
- `STRSTARTS`: checks if the string given as the first parameter starts with the string given as second parameter
- `STRENDS`: checks if the string given as the first parameter ends with the string given as the second parameter
- `CONTAINS`: checks if the string given as the first parameter contains the string given as the second parameter
- `REGEX`: check if the string given as the first parameter matches the regular expression given as second the parameter

### Functions for language tagged strings

A language-tagged string is a value like `"Hello world"@en`. The function `LANG` can be used to extract the language tag (`en` in the example), whereas `STR` can be used to obtain the lexical value (`"Hello world"`).

### Functions for numbers

All standard arithmetic operations, including addition (`+`), subtraction (`-`), multiplication (`*`), and division (`/`), are fully supported. Numeric values can also be compared via the operators `<`, `<=`, `=>`, and `>`.   

In addition, Nemo provides many useful arithmetic functions. Currently, these include the following functions on single input parameters:
`ABS` (absolute), `SQRT` (square root), `SIN` (sine), `COS` (cosine), `TAN` (tangent), `ROUND` (rounding up or down), `CEIL` (rounding up), `FLOOR` (rounding down). Moreover, the following functions require two parameters:
- `LOG(x,y)`: computes the logarithm of x to base y
- `POW(x,y)`: computes the power of x to the y.
- `REM(x,y)`: computes the remainder of dividing x by y.

And finally, the following functions can be called with arbitrary many input parameters:
- `SUM(x_1, ..., x_n)`: computes the sum of the given arguments
- `PRODUCT(x_1, ..., x_n)`: computes the product of the given arguments
- `MIN(x_1, ..., x_n)`: returns the minimum of the given arguments
- `MAX(x_1, ..., x_n)`: returns the maximum of the given arguments
- `LUKA(x_1, ..., x_n)`: computes the Łukasiewicz t-norm for the given arguments
- `BITAND(x_1, ..., x_n)`: computes the bitwise "and" of the given arguments
- `BITOR(x_1, ..., x_n)`: computes the bitwise "or" of the given arguments
- `BITXOR(x_1, ..., x_n)`: computes the bitwise "xor" of the given arguments

Nemo supports the following conversion functions:
- `INT`: Convert the given value to an integer. This works for various datatypes (not just numbers), but only for data that already corresponds to an integer. The following all evaluate to `42`: `INT(42)`, `INT(42.0)`, `INT("42")`, `INT("42"^^<http://www.w3.org/2001/XMLSchema#gYear>)`, `INT(ROUND(42.1))`. However, `INT(42.1)` does not return a result.
- `DOUBLE`: Convert a given value to a double. This function works for various datatypes (not just numbers). For example, the following evaluate to `42.0`: `DOUBLE(42)`, `DOUBLE("42.0")`, `DOUBLE("42").`
- `FLOAT`: Convert a given value to a float. This is analogous to `DOUBLE` but for 32bit floating point numbers.

It is also possible to mix numeric types, which implicitly converts them to 64-bit floating point numbers. For example, `SUM(3 * 4.0, 5, 1.0)` returns the 64-bit floating point number `18.0`.

### Boolean Functions

Nemo supports the usual Boolean functions (`AND`, `OR`, and `NOT`), but requires them to be written in prefix-notation like other functions, e.g., `OR(?X,?Y)` rather than `?X OR ?Y`. 

### Checking the datatype

Nemo provides built-in functions to check whether a value is of a certain type:

- `isInteger`: tests if the argument is an integer number
- `isFloat`: tests if the argument is a 32bit floating point number (float)
- `isDouble`: tests if the argument is a 64bit floating point number (double)
- `isIri`: tests if the argument is an IRI, including a "plain constant", which Nemo considers to be relative IRIs
- `isNumeric`: tests if the argument is of any numeric type
- `isNull`: tests if the argument is a named null (blank node)
- `isString`: tests if the argument is a plain string (without a language tag)

For example, the following program computes `result("true"^^<http://www.w3.org/2001/XMLSchema#boolean>)`:

```
data("1.0") .
result(isString(?x)) :- data(?x) .
```

### Nesting functions

Built-in functions can be nested arbitrarily. For example, the following is a valid expression:

```
result(?s) :- temp(?t), ?s = CONCAT(UCASE("temp: "), STR(?t)) .
```

***Known restriction in version 0.6.0:***
Currently, infix operators are not allowed within nested terms. As a workaround, it is possible to use the prefix-notation for such functions.

| Infix    | Name          |
| -------- | --------------|
| `=`      | `EQUALITY`    |
| `!=`     | `INEQUALITY`  |
| `>`      | `NUMGREATER`  |
| `>=`     | `NUMGREATEREQ`|
| `<`      | `NUMLESS`     |
| `<=`     | `NUMLESSEQ`   |
| `+`      | `SUM`         |
| `-`      | `SUBTRACTION` |
| `*`      | `PRODUCT`     |
| `/`      | `DIVISION`    |

As an example, consider the following rule:

```
r(1, 0).
r(1, 1).
r(2, 2).
r(3, 1).

% Valid rule
result(?x, ?y) :- r(?x, ?y), OR(NUMGREATER(?x, 2), EQUALITY(?y, 0)).

% Invalid rule
% result(?x, ?y) :- r(?x, ?y), OR(?x > 2, ?y = 0).
```