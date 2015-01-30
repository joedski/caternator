Caternator Grammar
==================

Hopefully this is a useful guide on how to write for the Caternator of Strings.

The grammar that the Caternator uses is meant to be (mostly) regularized, and pretty easy to understand.  If you've ever used Inform 7, you might recognize a few things.  But it's mostly not like Inform at all, so I guess that doesn't really help.  (But if you're good at Inform, then this will be cake walk.)

As far as feeding it input from an app, really all you need to do is stick all your input together into one giant string (with items separated by new-lines) and feed it into the parser.



Detailed Reference
------------------

When writing out a set of statements, you're writing a tiny little program.  The program doesn't do much other than spit out random statements from what you put in, but it's still a program!

### Statements

To write the little Caternator program, you'll write out a series of Statements, with one Statement per line.  There are three different kinds, the simplest of which is the Output Statement, which tells the Caternator program that this Statement is one the many it can choose from when deciding what to spit out.  Any amount of text by itself can be an Output Statement.  For example,

    Hello!  I'm an Output Statement!
    I'm another Output Statement!
    Golly, there sure are a lot of Output Statements.

There are however two other kinds of Statements you can write, Variable Statements and Function Statements.  What they do will be covered in detail later, but in short, Variable Statements let you reuse a certain phrase over and over again through out the program, while Function Statements let you put things around other things that you don't write inside of the Function Statement.  Variable Statements are easy to understand, but Function Statements require a bit more thought, and are really pretty specialized.

### Alternation Sets and Alternation Items

#### Optional Sub-Alternations

#### Conditional Alternation Items

### Variables

### Functions

Always wrap what you're applying your function to in parentheses, like so:

    stuff (@funky (foo bar baz)) more stuff

If you don't, the parser will do it for you.  If you put in this:

    stuff (@funky foo bar baz) more stuff

Then you might not like what you get:

    stuff (@funky (foo) bar baz) more stuff



### Metadata
