module HtmlHelpers exposing (..)

import Html exposing (Html, button)
import Html.Events exposing (onClick)
import Html.Attributes exposing (style, title)
import Color exposing (Color)


unselectable : List ( String, String )
unselectable =
    [ ( "-webkit-user-select", "none" )
    , ( "-moz-user-select", "none" )
    , ( "-ms-user-select", "none" )
    , ( "user-select", "none" )
    ]


myMaterialButton : String -> (Color -> number -> Html msg) -> msg -> Html msg
myMaterialButton titleText icon msg =
    button
        [ title titleText
        , onClick msg
        , style
            [ ( "type", "button" )
            , ( "background-color", "#262626" )
            , ( "border-color", "gray" )
            , ( "border-radius", "4px" )
            , ( "border-width", "1px" )
            , ( "color", "white" )
            , ( "text-align", "center" )
            , ( "outline", "none" )
            , ( "text-decoration", "none" )
            , ( "display", "inline-block" )
            , ( "font-size", "16px" )
            , ( "cursor", "pointer" )
            , ( "padding", "8px 8px 4px 8px" )
            , ( "margin", "4px 4px 4px 4px" )
            ]
        ]
        [ icon (Color.rgb 232 232 232) 18 ]
