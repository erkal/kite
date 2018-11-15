module Colors exposing
    ( black
    , darkGray
    , darkText
    , gray
    , highlightPink
    , icon
    , inputBackground
    , leftBarHeader
    , leftStripeIconSelected
    , lightGray
    , lightText
    , mainSvgBackground
    , menuBackground
    , menuBorder
    , menuBorderOnMouseOver
    , mouseOveredItem
    , orange
    , rectAroundSelectedVertices
    , red
    , rightBarHeader
    , selectBlue
    , selectedItem
    , selectorStroke
    , sliderThumb
    , svgLine
    , toString
    , vertexAndEdgeColors
    , white
    , yellow
    )

import Element as El exposing (Color, Element)


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
    El.rgb255 46 46 46


sliderThumb =
    El.rgb 0.5 0.5 0.5


highlightPink =
    El.rgb255 255 47 146


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


vertexAndEdgeColors =
    [ lightGray
    , gray
    , darkGray
    , black
    , El.rgb255 199 0 57
    , El.rgb255 144 12 63
    , El.rgb255 81 24 73
    , El.rgb255 61 61 106
    , El.rgb255 42 123 154
    , El.rgb255 0 187 173
    , El.rgb255 86 199 133
    , El.rgb255 173 213 91
    , El.rgb255 237 221 83
    , El.rgb255 255 195 0
    , El.rgb255 255 140 26
    , El.rgb255 255 87 51
    ]
