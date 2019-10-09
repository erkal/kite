module Colors exposing
    ( black
    , blue
    , darkGray
    , darkText
    , decoder
    , editedFileName
    , encode
    , fromHexRGBA
    , gray
    , highlightPink
    , icon
    , inputBackground
    , leftBarHeader
    , leftStripeIconSelected
    , lightBlue
    , lightGray
    , lightText
    , linearTransition
    , linkBlue
    , mainSvgBackground
    , menuBackground
    , menuBorder
    , menuBorderOnMouseOver
    , mouseOveredItem
    , orange
    , purple
    , rectAroundSelectedVertices
    , red
    , rightBarHeader
    , selectBlue
    , selectedItem
    , selectorStroke
    , sliderThumb
    , svgLine
    , toHexRGBA
    , toString
    , turquoise
    , vertexAndEdgeColors
    , white
    , yellow
    )

import Element as El exposing (Color)
import Hex
import Json.Decode as JD exposing (Decoder, Value)
import Json.Encode as JE exposing (Value)


toString : Color -> String
toString color =
    let
        o =
            El.toRgb color
    in
    "rgba("
        ++ String.fromInt (round (o.red * 255))
        ++ ("," ++ String.fromInt (round (o.green * 255)))
        ++ ("," ++ String.fromInt (round (o.blue * 255)))
        ++ ("," ++ String.fromFloat o.alpha)
        ++ ")"



-------------
-- Encoder --
-------------


encode : Color -> Value
encode color =
    let
        o =
            El.toRgb color
    in
    JE.object
        [ ( "red", JE.float o.red )
        , ( "green", JE.float o.green )
        , ( "blue", JE.float o.blue )
        , ( "alpha", JE.float o.alpha )
        ]


toHexRGBA : Color -> String
toHexRGBA color =
    --  See https://www.graphviz.org/doc/info/attrs.html#k:color
    let
        o =
            El.toRgb color

        hex num =
            Hex.toString (round (num * 255))
    in
    "#" ++ hex o.red ++ hex o.green ++ hex o.blue ++ hex o.alpha



-------------
-- Decoder --
-------------


decoder : Decoder Color
decoder =
    JD.map4 El.rgba
        (JD.field "red" JD.float)
        (JD.field "green" JD.float)
        (JD.field "blue" JD.float)
        (JD.field "alpha" JD.float)


fromHexRGBA : String -> Color
fromHexRGBA hexRGBA =
    let
        r =
            hexRGBA |> String.slice 1 3 |> Hex.fromString |> Result.withDefault 0

        g =
            hexRGBA |> String.slice 3 5 |> Hex.fromString |> Result.withDefault 0

        b =
            hexRGBA |> String.slice 5 7 |> Hex.fromString |> Result.withDefault 0

        a =
            hexRGBA |> String.slice 7 9 |> Hex.fromString |> Result.withDefault 255 |> toFloat |> (/) 255
    in
    El.rgba255 r g b a



--


linearTransition : Float -> Color -> Color -> Color
linearTransition k start end =
    let
        ( s, e ) =
            ( El.toRgb start, El.toRgb end )

        tr s_ e_ =
            s_ + k * (e_ - s_)
    in
    El.rgba
        (tr s.red e.red)
        (tr s.green e.green)
        (tr s.blue e.blue)
        (tr s.alpha e.alpha)



--


linkBlue =
    El.rgb255 18 133 206


rectAroundSelectedVertices =
    El.rgb255 40 127 230


svgLine =
    El.rgb255 83 83 83


yellow =
    El.rgb255 255 255 2


orange =
    El.rgb255 242 142 1


red =
    El.rgb255 255 2 2


mainSvgBackground =
    --El.rgb255 250 243 237
    El.rgb255 46 46 46


sliderThumb =
    El.rgb 0.5 0.5 0.5


highlightPink =
    El.rgb255 255 47 146


lightBlue =
    El.rgb255 134 204 247


selectBlue =
    El.rgb255 0 150 255


selectorStroke =
    El.rgb255 127 127 127


white =
    El.rgb255 255 255 255


lightGray =
    El.rgb255 220 220 220


gray =
    El.rgb255 180 180 180


darkGray =
    El.rgb255 140 140 140


black =
    El.rgb255 0 0 0


icon =
    El.rgb255 195 195 195


menuBackground =
    El.rgb255 83 83 83


leftStripeIconSelected =
    El.rgb255 48 48 48


menuBorder =
    El.rgba255 56 56 56 0.25


menuBorderOnMouseOver =
    El.rgba255 255 255 255 0.6


selectedItem =
    El.rgb255 48 48 48


mouseOveredItem =
    El.rgb255 56 56 56


lightText =
    El.rgb255 195 195 195


darkText =
    El.rgb255 23 23 23


leftBarHeader =
    El.rgb255 66 66 66


rightBarHeader =
    El.rgb255 66 66 66


inputBackground =
    El.rgb255 69 69 69


blue =
    El.rgb255 42 123 154


turquoise =
    El.rgb255 0 187 173


purple =
    El.rgb255 61 61 106


editedFileName =
    El.rgb255 202 118 40


vertexAndEdgeColors =
    [ lightGray
    , gray
    , darkGray
    , black
    , El.rgb255 199 0 57
    , El.rgb255 144 12 63
    , El.rgb255 81 24 73
    , purple
    , blue
    , turquoise
    , El.rgb255 86 199 133
    , El.rgb255 173 213 91
    , El.rgb255 237 221 83
    , El.rgb255 255 195 0
    , El.rgb255 255 140 26
    , El.rgb255 255 87 51
    ]
