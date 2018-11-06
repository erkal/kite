<img width="200" alt="kite-logo" src="https://cloud.githubusercontent.com/assets/2286325/24246365/471df478-0fc7-11e7-845e-0719dcc9adef.png" align="left" hspace="10" vspace="6">

# Kite

***An Interactive Visualization Tool for Graph Theory***

This is work in progress, still in **pre-alpha**.
See the [road map](https://github.com/erkal/kite/projects/1).

[A **demo** of the latest state can be found here](https://erkal.github.io/kite/).

[Here is a short video](https://youtu.be/LeTDfFwZv3s) showing the basic usage.

Kite is written in [Elm](http://elm-lang.org/).

## For Development

You should have the latest version of Elm installed.

```shell
git clone https://github.com/erkal/kite.git
cd kite
elm make src/Main.elm --output=elm.js
open index.html
```

## A little bit more about Kite

If you ever did something related to graph theory, let it be taking a course or just trying to solve a puzzle that involves graphs, you must have realized, that it would be great to have a software where you can easily draw graphs and manipulate them.

If you think that graph theorists must have solved this problem, you are mistaken. There is no such tool that works on the browser. Why? I think that the reason is that it is difficult to build graphical user interfaces. Especially so, if you use an imperative language.

Well, Elm solves this problem. It brings functional programming in all its purity to the browser. Elm does not restrict you in any way. The so called Elm Architecture makes it possible to use full capabilities of the browser while staying purely functional. If it were not Elm, Kite wouldn't make it here. Hence, the logo. I am sure that Elm is the best choice for a project like Kite. Thanks to Evan Czaplicki, the creator of this beautifully designed language. Are you interested in visualizing mathematical concepts? Then learn Elm and build your own tools!

