# Scroll With Page

A basic extension that fixes an element to the top of the window once scrolled past.  It's constrained by the bottom edge of the parent element, passed as the first parameter.

An optional second parameter can be used if an additional vertical height must be taken into account (such as with fixed site headers).

Finally, on windows where the scrolling element is taller than the viewport, the viewport will scroll organically, attaching it to the top or bottom edge based on whichever way the user is scrolling.

## To use

Include the script (and jQuery).

```
$({element}).scrollWithPage({parentElement}, {optionalOffsetElement})
```
