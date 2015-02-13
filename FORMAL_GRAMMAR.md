Formal Grammar
==============

This is the formal grammar for parsing the Caternator DSL, presented in more or less EBNF.  This might be what you expected when you opened _GRAMMAR.MD_.



Tokens
------

    line-end = /^\r?\n/
    fan-arg = /^\.\.\./
    group-begin = /^\(/
    group-end = /^\)/
    var = /^\$[a-z0-9-_]+/i
    fun = /^@[a-z0-9-_]+/i
    meta = /^#[a-z0-9-_]+/i
    assign = /^=/
    word = /^[^\s\(\)\$#@=]+/
    whitespace = /^\s+/ (ignored for now.)



Rules
-----

### Entry Point

    program = statement-seq, [ line-end ];
    statement-seq = statement, { line-end, statement };
    statement = var-statement | fun-statement | out-statement;

    var-statement = var, { meta-group }, assign, plain-group-item-seq;
    fun-statement = fun, { meta-group }, assign, plain-group-item-seq;
    out-statement = plain-group-item-seq;

### Important Stuff

    meta-group = meta-seq | group-begin, ( meta-seq | meta-assign-group ), group-end;
    meta-seq = meta, { meta };
    meta-assign-group = meta, assign, item-seq;

    plain-group = group-begin, item-seq, group-end;

    item-delimiter = group-begin, item-delim-item-seq, group-end;
    item-delim-item-seq = "or", [ condition ] | condition;
    item-seq = item, { item };
    item = var | fun-call | fun-arg | meta-group | item-delimiter | plain-group

    condition = "if", var, condition-predicate;
    condition-predicate = "is", [ item-seq ] | "has", metadata-group, { metadata-group }
    fun-call = fun, ( fun-call | item );

In later versions, the `item` rule will include white space, as significant whitespace is the only way to intuitively handle certain cases in a regular manner.
