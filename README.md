The Caternator of Strings
=========================

A frankly ridiculous alternating concatenator of strings that seemed like a good idea at the time.  I suppose the true value of this is that I got a lot of practice writing up a detailed specification before I wrote any code.  But hopefully it is useful somewhere.

About
-----

The Caternator of Strings is a simple random phrase builder that allows the use of variables and functions to construct hopefully grammatical looking strings.  Suitability of this for use outside of English hasn't been tested, but it should probably be fine for Germanic languages.  (Well, easy to modify.)  Finno-ugric would take more additional processing.  On the other hand, languages like Chinese would be hilariously simple.

The core concept is that of Alternation Sets, which each contain a set of Alternative Items.  These can do various sundry things like attach Metadata and act upon it.  From there, there are Variables, which are really just Alternation Sets addressable by name, and Functions, which process the Selected Results of an Alternation into something else.

The grammar is designed to be hopefully easy to understand, but honestly I'm a programmer, so can't make any guarantees on that.  It's understandable to me, which means that like Ruby it may not do what *you* expect, but *I* am fine.  (wait, that applies to... most programming languages.  Slight retracted.)

Dependencies
------------

- [https://github.com/lodash/lodash](Lodash), although Underscore may work too.  I endeavor to use _.chain to grant compatibility.
