---
title: Export Directives
---

For example, the following export writes a CSV file that contains two columns, with the first formatted as plain string and the second as an integer. The third parameter of the exported predicate `result` is skipped and will not be in the file:

```
@export result :- csv{resource="out.csv.gz", format=(string,int,skip)} .
```

The output will be gzipped (guessed from file name). Tuples that contain anything other than a string in the first component and an integer in the second will not be exported and ignored silently. Instead of writing data to a file, one can also return it in the standard output (on the command line). For this, an empty string should be given as a resource, as in this example that prints the first 10 triples in RDF format:

```
@export triples :- turtle{resource="", limit=10} .
```

In exports, it is also possible to omit the `resource` parameter altogether. In this case, a default file name will be chosen based on the exported predicate, file format, and compression. For example, the following will export to `triples.nt.gz`:

```
@export triples :- ntriples{compression="gzip"} .
```

When using the [Nemo command-line client](/nemo-doc/guides/cli), some options are available to override the export directives in the program, to set the output (base) directory, and to control if existing files should be overwritten.
