# Toggle Quotes

This is similar to Atom's [toggle-quotes](https://github.com/atom/toggle-quotes) packages except it looks for the first quote to the left and the first same quote to the right and changes those rather than look for quotes around the current token. 

This can have different effects.

For example:

```
"Hello'| 'World"
```

Where `|` is the cursor, will produce

```
"Hello" "World"
```

If there is a selection it looks for the first quote befre the beginning of the selection and the next same quote after the end of the selection


"Hell<code><code>o" "W</code></code>orld"

will produce

```
'Hello" "World'
```
