<img width="180" alt="kite-logo" src="https://cloud.githubusercontent.com/assets/2286325/24246365/471df478-0fc7-11e7-845e-0719dcc9adef.png" align="left" hspace="10" vspace="6">

This is the source code for [Kite](https://erkal.github.io/kite/).
Kite is work in progress. It is **pre-alpha**.

Kite is a graph editor for graph theoretical purposes.

Kite is almost entirely written in [Elm](http://elm-lang.org/).
The source code contains only a little amount of javascript. 
All the javascript code is in `index.html`, and serves to interact with [d3-force](https://github.com/d3/d3/blob/master/API.md#forces-d3-force).

#### How to build locally (for development):
You should have the last version of Elm installed.
```
git clone https://github.com/erkal/kite.git
cd kite
elm-make src/Main.elm --yes --output=build/Main.js
open src/index.html
```

#### A little bit more about Kite:
If you ever did something related to graph theory, let it be taking a course or just trying to solve a puzzle that involves graphs, you must have realized, that it would be great to have a software where you can easily draw graphs and manipulate them.

If you think that graph theorists must have solved this problem, you are mistaken. There is no such tool that works on the browser. Why? I think that the reason is that it is difficult to build GUI's. Especially so, if you use an imperative language.

Well, Elm solves this problem. It brings functional programming in all its purity to the browser. Elm does not restrict you in any way. The so called Elm Architecture makes it possible to use full capabilities of the browser while staying purely functional. If it were not Elm, Kite wouldn't make it here. Hence, the logo. I am sure that Elm is the best choice for a project like Kite. Thanks to Evan Czaplicki, the creator of this beautifully designed language. Are you interested in visualizing mathematical concepts? Then learn Elm and build your own tools!

A graph editor without spring embedding would be flavorless. Thanks to Mike Bostock for implementing d3-force. This is the only javascript library that Kite uses.
