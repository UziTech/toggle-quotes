# Toggle Quotes

This is similar to Atom's [toggle-quotes](https://github.com/atom/toggle-quotes) packages except it looks for the first quote to the left and the first same quote to the right and changes those rather than look for quotes around the current token. 

This can have different affects.

For example:

```
"Hello'| 'World"
```

Where `|` is the cursor, will produce.

```
"Hello" "World"
```
