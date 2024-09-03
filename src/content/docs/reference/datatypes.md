---
title: Supported Datatypes
---

In general, most values can be written in the long RDF syntax format `"lexical value"^^<datatype IRI>` and IRIs can always be written with surrounding `<...>`. Prefixes can be declared to abbreviate the IRIs, so the following defines the same facts as in the previous example:

```
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
mydata(<a>,<b>) .
mydata("hello"^^xsd:string, "42"^^xsd:integer) .
mydata("3.14"^^xsd:double, "2023-06-19"^^xsd:date) .
```

However, it is often nicer to use the shortcuts:
- *Strings* can be written in `"double quotes"` or in `'single quotes'`, and multi-line strings also can be delimited in `"""` and `'''`.
- *Integers* can be written as plain numerals with an optional sign: `42`, `-23`, `+911` all work.
- *Double precision floats* can be written with decimal point and optional exponent: `3.14`, `.05`, `10.345E6` all work.
- *Language-tagged strings* are written like in RDF, e.g., `"Dresden"@de` or `ドレスデン@ja`.

For other datatypes, the long form is needed.

### Datatype support and possible pitfalls

Nemo let's you mix and match data of different types in a single predicate, but it will be very exact when distinguishing
values of different datatypes. This is generally desired but can be a source of errors, in particular:

- *Strings are not constants*: the value `a` is short for the IRI `<a>` and different from the string `"a"`.
- *Doubles are not floats*: Nemo supports 64bit and 32 bit floating point numbers (aka "double" and "float"). As in XML Schema, the values of these two encoding systems are always different, so `23.4` is short for `"23.4"^^<http://www.w3.org/2001/XMLSchema#double>` and not the same as `"23.4"^^<http://www.w3.org/2001/XMLSchema#float>`.
- *Double and float are not integers*: Just like no double ever equals a float, neither doubles nor floats can ever equal an integer. For example, `42` is different from `42.0` for this reason.

Nemo offers a number of built-in functions to explicitly convert between datatypes in order to bridge such discrepancies. For example, `STR` converts values to strings, and `DOUBLE` converts numbers to doubles.

However, Nemo does understand all XML Schema integer types and knows that they have overlapping value spaces. For example, the values `"42"^^<http://www.w3.org/2001/XMLSchema#integer>`, `"42"^^<http://www.w3.org/2001/XMLSchema#long>`, `"42"^^<http://www.w3.org/2001/XMLSchema#unsignedInt>`, and `"42"^^<http://www.w3.org/2001/XMLSchema#byte>`  in Nemo all denote the same number that can be written as `42`. In general, Nemo *normalizes* values of known types so that it does not matter which of several equivalent writings was used. This also means that Nemo has no way of preserving syntactic details across the computation: results will always be formatted in a normalized form.

It is possible to use arbitrary datatypes, including those that Nemo does not know about. Values of such types are treated verbatim (no normalization). Generic built-in functions like `DATATYPE` (retrieving the datatype of a literal) can still be used in such cases.

### Blank nodes and nulls

Nemo supports *nulls*, a kind of value mostly used for anonymous placeholder values. In RDF, such values are known as *blank nodes* (or *bnodes*), whereas in relational databases they correspond to *named nulls*. The attribute *named* hints at the fact that there can be many distinct nulls (as opposed to the single `NULL` value of SQL, which is further overloaded to mean either "some unspecified value" or "no value", depending on context). However, the name of a null is only relevant to distinguish them from other nulls, it is not guaranteed to be stable (in fact, Nemo may rename nulls internally), and it can therefore not be used to refer to the null "globally" (e.g., you cannot have several files that all speak about the same named null).

For computational purposes, Nemo treats named nulls just like any other type of data. In particular, the possibility of them being equal to other values does not influence how rules are applied, since Nemo is only interested in cases where values are certainly equal.

To write named nulls in rule and data files, we use a syntax introduced by RDF: `_:nullId`, where the `nullId` is any alphanumeric identifier. Often, one just uses some number, as in `_:234`, and this is what Nemo will do when returning or storing bnodes in files. As stated above, the identifier (name) only serves to distinguish nulls and can change during processing. Nemo merely guarantees that two distinctly named nulls will not be renamed to become the same null.

Due to the difficulty of referring to them globally (or locally in queries), the use of blank nodes is often not practical. However, they play important roles in some file formats (e.g., as auxiliary nodes in W3C OWL/RDF files) and for representing newly invented values in *existential rules*.
