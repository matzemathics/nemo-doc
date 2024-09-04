---
title: Import Directives
---

Nemo allows importing external data files as predicates. The general syntax for this is as follows:
```
@import table :- csv{resource = "path/to/file.csv"} .
```

Here, `table` denotes the predicate that data is imported to, `csv` is the data format (comma-separated values),
and `path/to/file.csv` is the path to the file. Instead of a local path, it is also possible to define a URL from
which data should be downloaded, e.g., `resource = <https://example.org/file.csv>`.

The following formats are currently supported:
- Delimiter-separated values: `csv`, `tsv` (tab-separated), `dsv` (delimiter required as parameter, e.g., `delimiter=";"`)
- RDF triples: `ntriples` (NT), `turtle` (Turtle), `rdfxml` (RDF/XML); data is always imported in order "subject, predicate, object"
- RDF quads: `nquads` (NQuads), `trig` (TRiG); data is always imported in order "graphname, subject, predicate, object"
- General RDF: `rdf` can be used for RDF that is not further specified; the actual format will be guessed using the file name and predicate arity
- (experimental - not yet in 0.5) JSON objects: `json` deserializes json data into a table representation consisting of triples of the form "object-id, key, object-id" (see table below, how each json type is represented). The root object of the document always has object-id 0. Furthermore, for each object-id a triple of the form "object-id, `<type>`, type-id" is stored, where type-id is one of `"object"`, `"array"`, `"string"`, `"number"`, `"bool"` or `"null"`. Literal values will be assigned an object-id as well, with a triple of the form "object-id, `<value>`, literal-value"

```
JSON                              | nemo
----------------------------------------------------------------------------------------------
{"key1": value1, "key2": value2}  | (0, type, "object"),
                                  | (0, "key1", 1),
                                  | (0, "key2", 2),
                                  | (1, type, ...),
                                  | (2, type, ...)
                                  |
[value1, value2]                  | (0, type, "array"),
                                  | (0, 0, 1),
                                  | (0, 1, 2),
                                  | (1, type, ...),
                                  | (2, type, ...)
                                  |
"foobar"                          | (0, type, "string"),
                                  | (0, value, "foobar")
                                  |
42.1337                           | (0, type, "number"),
                                  | (0, value, 42.1337)
                                  |
true                              | (0, type, "bool"),
                                  | (0, value, "true"^^<http://www.w3.org/2001/XMLSchema#boolean>)
                                  |
null                              | (0, type, "null")
```

Some formats, such as CSV, do not specify how values in the file should be interpreted. By default, Nemo will heuristically interpret data.
For example, in CSV files, the string `123` will be interpreted as an integer, but the string `abc` as a constant name (relative IRI). To control this in more detail, the parameter `format` can be used. It takes a list of format strings, like in the following example:

```
@import data :- csv{resource="file.csv", format=(string,string,int,any)} .
```

This example imports from a CSV file that should have four columns: the first two will be read as literal strings, the third as an integer, and the final as "anything" that seems right (the default format, also good for IRIs). Lines that cannot be interpreted in this format will be skipped silently, e.g., if a line has something in the third field that does not look like an integer. Therefore, all imported data is guaranteed to have the chosen format. Currently, Nemo supports the following formats:

- `any`: the default best-effort parsing
- `string`: try to interpret all values as plain strings, fastest import option for CSV
- `int`: interpret values as integers, if possible
- `double`: interpret values as double precision floats (f64), if possible
- `skip`: special format to ignore a column entirely (if used, the imported data has smaller arity than the table in the file)

The same formats can be used in RDF imports as well. RDF has a more precise type system, where every value has an unambiguous type. The formats then mainly act as filters that will remove triples that do not fit (e.g., to load only triples with integer values). For converting values to other datatypes, e.g., from integers to strings, rules with built-in functions (in this case `STR`) can be used after import.

Import directives support various other optional parameters:
- `limit`: if specified, only at most this many tuples are imported (great for testing when working with large files)
- `compression`: used to define a compression format (`gzip` or `none`); this will normally be guessed correctly from the file extension, but can be useful for non-standard file names or URLs
- `delimiter`: only for import format `dsv`, specify a delimiter string (should be a single character)
- `base`: specify the base IRI to be used when importing RDF data; if given, relative IRIs will be made absolute based on this base; otherwise, relative IRIs remain relative in Nemo
