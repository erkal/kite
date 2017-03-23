module WelcomeWindow exposing (..)

import Html exposing (Html, div)
import Html.Attributes exposing (style)
import Svg
import Markdown
import Markdown
import KiteLogo


mdAsString : String
mdAsString =
    """

# Welcome to Kite!

This is a demo of pre-alpha version.

Kite is a visualization tool for graph theorists. If you are not into graph theory, just playing with graphs in Kite is also fun.

Mathematicians, in particular combinatorists, lack web-based tools with which they can create interactive pictures of their ideas. Kite is born out of the need of such a tool. The first step, which was building an editor for graphs, is more or less complete, at least the basis. This is the demo of the current version.

[Kite's source code](https://github.com/erkal/kite.git) is open. It is written in [Elm](http://elm-lang.org/) and uses [d3-force](https://github.com/d3/d3/blob/master/API.md#forces-d3-force) for spring embedding.

#### Keyboard Shortcuts:

  + `p` : Toggle this welcome window

  + `f` : Start D3Force

  + `z` : Undo

  + `y` : Redo

  + `v` : Toggle file system

"""


view : List ( String, String ) -> Html msg
view styleForPositionAndSize =
    div
        [ style <|
            styleForPositionAndSize
                ++ [ ( "background-color", "#ede7c5" )
                   , ( "overflow", "scroll" )
                   , ( "border-radius", "8px" )
                   ]
        ]
        [ Svg.svg
            [ style
                [ ( "position", "absolute" )
                , ( "width", "300px" )
                , ( "height", "300px" )
                , ( "margin-left", "250px" )
                , ( "margin-top", "200px" )
                ]
            ]
            [ Svg.g [ style [ ( "opacity", "0.5" ) ] ] [ KiteLogo.view ] ]
        , Markdown.toHtml
            [ style
                [ ( "margin", "30px" )
                , ( "position", "absolute" )
                ]
            ]
            mdAsString
        ]
