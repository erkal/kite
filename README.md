<img width="200" alt="kite-logo" src="https://cloud.githubusercontent.com/assets/2286325/24246365/471df478-0fc7-11e7-845e-0719dcc9adef.png" align="left" hspace="10" vspace="6">

# Kite

***An Interactive Visualization Tool for Graph Theory***

This is work in progress, still in **pre-alpha**.

[A **demo** of the latest state can be found here](https://erkal.github.io/kite/).

Kite is almost entirely written in [Elm](http://elm-lang.org/).

## For Development

You should have the latest version of Elm installed.

```shell
git clone https://github.com/erkal/kite.git
cd kite
elm make src/Main.elm --optimize --output=elm.js
open index.html
```

## A little bit more about Kite

If you ever did something related to graph theory, let it be taking a course or just trying to solve a puzzle that involves graphs, you must have realized, that it would be great to have a software where you can easily draw graphs and manipulate them.

If you think that graph theorists must have solved this problem, you are mistaken. There is no such tool that works on the browser. Why? I think that the reason is that it is difficult to build graphical user interfaces. Especially so, if you use an imperative language.

Well, Elm solves this problem. It brings functional programming in all its purity to the browser. Elm does not restrict you in any way. The so called Elm Architecture makes it possible to use full capabilities of the browser while staying purely functional. If it were not Elm, Kite wouldn't make it here. Hence, the logo. I am sure that Elm is the best choice for a project like Kite. Thanks to Evan Czaplicki, the creator of this beautifully designed language. Are you interested in visualizing mathematical concepts? Then learn Elm and build your own tools!

A graph editor without spring embedding would be flavorless. Thanks to Mike Bostock for implementing [d3-force](https://github.com/d3/d3/blob/master/API.md#forces-d3-force). The source code of Kite contains only few amount of javascript. All the javascript code is in `index.html`, and serves to interact with d3-force.

## Roadmap

This list is going to change in time depending on the feedback from users.

+ [ ] Zoom and Pan: Make Zoom In, Zoom Out, Fit to Screen and Hand Tool buttons.
+ [ ] Undo/redo.
+ [ ] Allow user defined string labels for vertices. The label input field should be visible only if a single vertex is selected.
+ [ ] Ctrl+C and Ctrl+V for copy and paste
+ [ ] Allow user defined labels for bags.
+ [ ] Allow user defined colors for bags.
+ [ ] In the left sidebar for Bag/Vertex/Edge lists,
  + [ ] show Bag/Vertex/Edge properties, in particular show user defined Labels,
  + [ ] allow sorting,
  + [ ] make multiple selection possible via brushing possible,
  + [ ] make multiple selection possible via holding the shift key.
+ [ ] In the mainsvg, make adding to selection possible via clicking while holding the shift key.
+ [ ] Make "copy on drag" when the Alt key is pressed.
+ [ ] More selector types:
  + [ ] adding to existing selection when holding down the shift key,
  + [ ] subtracting from existing selection when holding down the ctrl+shift,
  + [ ] Rectangle selector which selects edges on the boundary.
+ [ ] Scaling the selection-rectangle by keeping the vertex and edge sizes (with appropriate cursors).
+ [ ] Rotating the selection-rectangle
+ [ ] Alligning Vertices: Circular, Horizontal, Vertical and 45-Degree
+ [ ] Magnet Tool in order to snap by dragging: only for horizontal and vertical alignment of the vertex centers.
+ [ ] Server Side: Sharing graphs with a link (without logging in) like in Ellie
+ [ ] Some Graph Generators (like path, cycle, grid, torus, etc.) with given parameters
+ [ ] Some Random Graph Generators
+ [ ] Some Graph Operations (like Cartesian Product of two graphs)
+ [ ] Export Graph (as json file)
+ [ ] Import Graph (json with html5 file-drag-and-drop)
+ [ ] Export Graph in [.DOT](https://en.wikipedia.org/wiki/DOT_(graph_description_language)) format
+ [ ] Export Graph in [.TGF](https://en.wikipedia.org/wiki/Trivial_Graph_Format) format
+ [ ] Export [Tikz](http://www.texample.net/tikz/).
+ [ ] Export Svg
+ [ ] Special graphs (Contact the people who made [House of Graphs](https://hog.grinvin.org/))
+ [ ] Show grids (especially isometric grids)
+ [ ] Solve the Svg dragging problem in Firefox.
+ [ ] Make a favicon.
+ [ ] Allow different vertex shapes: rectangle, diamond, ellipse
+ [ ] Allow different edge shapes: curved, direct, orthogonal, with arrows, etc...
+ [ ] Zooming with mousewheel similar to [this](https://bl.ocks.org/mbostock/6226534)
+ [ ] Make this all work on tablets and phones.