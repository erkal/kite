module CssHelpers exposing (..)


unselectable : List ( String, String )
unselectable =
    [ ( "-webkit-user-select", "none" )
    , ( "-moz-user-select", "none" )
    , ( "-ms-user-select", "none" )
    , ( "user-select", "none" )
    ]
