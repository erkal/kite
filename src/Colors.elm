module Colors exposing (Color, colorHighlightForSelection, highlightColorForMouseOver, vertexAndEdgeColors)


type alias Color =
    String


highlightColorForMouseOver =
    "rgb(255, 47, 146)"


colorHighlightForSelection =
    "rgb(0, 150, 255)"


vertexAndEdgeColors =
    [ "black"
    , "white"
    , "lightgray"
    , "darkgray"
    , "gray"
    , "rgb(199, 0, 57)"
    , "rgb(144, 12, 63)"
    , "rgb(81, 24, 73)"
    , "rgb(61, 61, 106)"
    , "rgb(42, 123, 154)"
    , "rgb(0, 187, 173)"
    , "rgb(86, 199, 133)"
    , "rgb(173, 213, 91)"
    , "rgb(237, 221, 83)"
    , "rgb(255, 195, 0)"
    , "rgb(255, 140, 26)"
    , "rgb(255, 87, 51)"
    ]
