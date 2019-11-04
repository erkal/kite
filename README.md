<img width="200" alt="kite-logo" src="https://cloud.githubusercontent.com/assets/2286325/24246365/471df478-0fc7-11e7-845e-0719dcc9adef.png" align="left" hspace="10" vspace="6">

# Kite

***An Interactive Visualization Tool for Graph Theory***

[Click here to launch the app](https://erkal.github.io/kite/).
It works best in Chrome.

This is work in progress, still in **pre-alpha**.
See the [road map](https://github.com/erkal/kite/projects/1).

[Here is a short video](https://youtu.be/LeTDfFwZv3s) showing the basic usage in an old version of Kite.

[Here is another short video](https://youtu.be/b4sfzHJeHsI) showing how to use Kite to visualize the module dependency graph of your elm projects.

Kite is entirely written in [Elm](http://elm-lang.org/).

There is also an Elm Town episode about the story behind Kite, in case you are interested: [Elm Town 42 – It's Just Darth Vader](https://elmtown.simplecast.fm/its-just-darth-vader)

## For Development

You should have the latest version of Elm installed.

```shell
git clone https://github.com/erkal/kite.git
cd kite
elm make src/Main.elm --output=elm.js
open index.html
```

If you want to develop Kite, it may help to get an overview on the module dependencies. Thanks to @brandly, we have the following nicely drawn module dependency graph of Kite.

![dependencies](https://github.com/erkal/kite/blob/master/dependency-graph.svg)

## A little bit more about Kite

If you ever did something related to graph theory, let it be taking a course on graph theory or just trying to solve a puzzle that involves graphs, you must have realized, that it would be great to have an app with which you can easily draw graphs and manipulate them.

If you think that graph theorists must have solved this problem, you are mistaken. There is no such tool that works on the browser. Why? I believe that the reason is the inherent difficulty of building graphical user interfaces. Elm helps with that by bringing functional programming to the browser. If it were not Elm, Kite wouldn't make it here. Hence, the logo. I am sure that Elm is the best choice for a project like Kite. Many thanks to Evan Czaplicki, the creator of this beautifully designed language.
